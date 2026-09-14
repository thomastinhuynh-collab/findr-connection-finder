import { createClient } from "npm:@supabase/supabase-js@2";

export type ContentType = "search" | "proposal";
export type SupportedLanguage = "fr" | "en";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const sha256 = async (value: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const readResponseStream = async (response: Response) => {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("La réponse de traduction est vide.");
  const decoder = new TextDecoder();
  let buffer = "";
  let output = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === "response.output_text.delta") output += event.delta ?? "";
      } catch {
        // Ignore partial or non-JSON SSE events.
      }
    }
  }
  return output;
};

export const translateWithLovableAI = async (
  apiKey: string,
  sourceLang: SupportedLanguage,
  targetLang: SupportedLanguage,
  title: string,
  description: string | null,
) => {
  const languageName = targetLang === "en" ? "natural British English" : "natural French using informal 'tu' where relevant";
  const input = `Translate the following marketplace listing into ${languageName}. Preserve brands, model names, proper nouns, sizes, measurements, references, SKUs, currencies and numbers exactly. Do not add information. Return only the requested JSON.\n\nSource language: ${sourceLang}\nTitle: ${title}\nDescription: ${description ?? ""}`;
  const body = {
    model: "openai/gpt-6-astra",
    input,
    stream: true,
    reasoning: { effort: "low", summary: "concise" },
    text: {
      format: {
        type: "json_schema",
        name: "content_translation",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            title: { type: "string" },
            description: { type: ["string", "null"] },
          },
          required: ["title", "description"],
        },
      },
    },
  };

  let response: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify(body),
    });
    if (response.ok) break;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 2) {
      const payload = await response.text();
      throw Object.assign(new Error(payload || "La traduction automatique est momentanément indisponible."), { status: response.status });
    }
    const retryAfter = Number(response.headers.get("Retry-After"));
    await wait(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 700 * 2 ** attempt);
  }
  if (!response?.ok) throw new Error("La traduction automatique est momentanément indisponible.");
  const text = await readResponseStream(response);
  if (!text) throw new Error("La traduction automatique n'a renvoyé aucun texte.");
  return JSON.parse(text) as { title: string; description: string | null };
};

export const serviceClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Configuration backend manquante.");
  return createClient(url, key, { auth: { persistSession: false } });
};