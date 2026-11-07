import { site } from "@/content/site";

interface MailtoOptions {
  subject?: string;
  body?: string;
}

/** Builds an RFC 6068 mailto: URL with an encoded subject and body. */
export function buildMailto({ subject, body }: MailtoOptions = {}): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  // URLSearchParams encodes spaces as "+", which most mail clients show literally.
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${site.email}${query ? `?${query}` : ""}`;
}

export const defaultMailto = buildMailto({
  subject: "Freelance DevOps project inquiry",
  body: [
    "Hi Praduman,",
    "",
    "Company / project:",
    "Current stack (cloud, language, CI):",
    "What I need help with:",
    "Timeline:",
    "Budget range:",
    "",
    "Thanks!",
  ].join("\n"),
});
