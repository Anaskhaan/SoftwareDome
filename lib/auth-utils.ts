/**
 * List of common personal/free email provider domains to block.
 * For a production app, you might want to use a larger list or a dedicated API.
 */
export const PERSONAL_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "msn.com",
  "live.com",
  "protonmail.com",
  "mail.com",
  "gmx.com",
  "yandex.com",
  "zoho.com",
  "mailinator.com",
  "temp-mail.org",
  "guerrillamail.com",
  "sharklasers.com",
];

/**
 * Validates if an email address belongs to a business domain.
 * Returns true if it's a business email, false otherwise.
 */
export function isBusinessEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;

  const domain = email.split("@")[1].toLowerCase();
  
  // Check against our blocklist
  if (PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return false;
  }

  // Check if it's a generic domain like .gov or .edu (optional, depends on your business model)
  // For SoftwareDome, we probably want to allow .gov and .edu if they are registered as organizations.

  return true;
}

/**
 * Extracts the domain from an email address.
 */
export function getEmailDomain(email: string): string {
  return email.split("@")[1].toLowerCase();
}
