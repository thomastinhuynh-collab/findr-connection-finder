/** Traduit les messages d'erreur Supabase Auth les plus courants en français clair. */
export const translateAuthError = (message?: string | null): string => {
  const raw = (message ?? "").trim();
  const m = raw.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (m.includes("user already registered") || m.includes("already been registered")) {
    return "Un compte existe déjà avec cet email. Connecte-toi ou réinitialise ton mot de passe.";
  }
  if (m.includes("password should be at least")) {
    return "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (m.includes("email not confirmed")) {
    return "Ton email n'a pas encore été confirmé. Vérifie ta boîte mail.";
  }
  if (m.includes("email rate limit") || m.includes("over_email_send_rate_limit")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  if (m.includes("unable to validate email address") || m.includes("invalid email")) {
    return "L'adresse email saisie n'est pas valide.";
  }
  if (m.includes("token has expired") || m.includes("expired")) {
    return "Ce lien a expiré. Demande un nouvel email.";
  }
  if (m.includes("new password should be different")) {
    return "Le nouveau mot de passe doit être différent de l'ancien.";
  }

  return raw || "Une erreur est survenue. Réessaie.";
};
