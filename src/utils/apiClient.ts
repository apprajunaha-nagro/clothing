export function getAdminAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem('pgmart_admin_token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = sessionStorage.getItem('pgmart_admin_token') || '';
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, {
    ...options,
    headers,
  });
}
