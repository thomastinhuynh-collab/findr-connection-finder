/** Digest inputs contain only the first 80 characters, never photos or full message bodies. */
export interface DigestMessage {
  id: string;
  receiver_id: string;
  sender_id: string;
  search_id: string;
  created_at: string;
  content: string;
  partner_name: string;
  partner_role: "buyr" | "findr";
  search_title: string;
}

export interface DigestExchange {
  searchId: string;
  partnerId: string;
  name: string;
  role: "buyr" | "findr";
  title: string;
  preview: string;
  count: number;
  lastAt: string;
}

export function groupMessageDigest(messages: DigestMessage[]) {
  const groups = new Map<string, DigestExchange>();
  const unique = new Map(messages.map((m) => [m.id, m]));
  for (const m of unique.values()) {
    const key = `${m.search_id}:${m.sender_id}`;
    const prior = groups.get(key);
    const latest = !prior || m.created_at >= prior.lastAt;
    groups.set(key, {
      searchId: m.search_id, partnerId: m.sender_id,
      name: latest ? m.partner_name : prior.name,
      role: latest ? m.partner_role : prior.role,
      title: latest ? m.search_title : prior.title,
      preview: latest ? Array.from(m.content).slice(0, 80).join("") : prior.preview,
      count: (prior?.count ?? 0) + 1,
      lastAt: latest ? m.created_at : prior.lastAt,
    });
  }
  const exchanges = [...groups.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt) || a.partnerId.localeCompare(b.partnerId));
  return {
    count: unique.size,
    exchanges: exchanges.slice(0, 5),
    otherCount: Math.max(0, exchanges.length - 5),
    messageIds: [...unique.keys()].sort(),
  };
}

export interface DigestDependencies {
  snapshot: (recipient: string) => Promise<DigestMessage[]>;
  send: (recipient: string, digest: ReturnType<typeof groupMessageDigest>) => Promise<boolean>;
  mark: (ids: string[]) => Promise<void>;
}

export async function messageDigestKey(ids: string[]): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode([...ids].sort().join(",")));
  const bytes = new Uint8Array(hash).slice(0, 16);
  // Brevo requires a UUID-shaped key. The same snapshot must produce the same key.
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Re-read immediately before sending; only acknowledge the exact successfully sent snapshot. */
export async function deliverMessageDigest(recipient: string, deps: DigestDependencies, dryRun = true) {
  const initial = await deps.snapshot(recipient);
  if (!initial.length) return { sent: false, count: 0 };
  const current = dryRun ? initial : await deps.snapshot(recipient);
  const digest = groupMessageDigest(current);
  if (!digest.count || dryRun) return { sent: false, count: digest.count };
  if (!await deps.send(recipient, digest)) return { sent: false, count: digest.count };
  await deps.mark(digest.messageIds);
  return { sent: true, count: digest.count };
}

/** No live sends until explicitly enabled after the owner's approval. */
export const MESSAGE_DIGEST_SEND_ENABLED = false;