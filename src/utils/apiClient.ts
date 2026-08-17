export function getAdminAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('pgmart_admin_token') || sessionStorage.getItem('pgmart_admin_token') || localStorage.getItem('terra_admin_token') || 'pgmart123';
  return { Authorization: `Bearer ${token}` };
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('pgmart_admin_token') || sessionStorage.getItem('pgmart_admin_token') || localStorage.getItem('terra_admin_token') || 'pgmart123';
  const headers = new Headers(options.headers || {});
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(url, {
    ...options,
    headers,
  });
}
