function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((v) => charset[v % charset.length])
    .join('');
}

async function sha256Base64Url(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const VERIFIER_KEY = 'gitlab_pkce_verifier';
const RETURN_URL_KEY = 'gitlab_auth_return_url';

export async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = generateRandomString(128);
  const challenge = await sha256Base64Url(verifier);
  return { verifier, challenge };
}

export function storeVerifier(verifier: string): void {
  localStorage.setItem(VERIFIER_KEY, verifier);
}

export function retrieveVerifier(): string | null {
  return localStorage.getItem(VERIFIER_KEY);
}

export function clearVerifier(): void {
  localStorage.removeItem(VERIFIER_KEY);
}

export function storeReturnUrl(url: string): void {
  localStorage.setItem(RETURN_URL_KEY, url);
}

export function retrieveReturnUrl(): string | null {
  return localStorage.getItem(RETURN_URL_KEY);
}

export function clearReturnUrl(): void {
  localStorage.removeItem(RETURN_URL_KEY);
}
