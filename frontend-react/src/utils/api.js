const getApi = () => localStorage.getItem('jk_api') || '';

export async function apiFetch(path, opts = {}) {
  const api = getApi();
  if (!api) throw new Error('No API configured');
  const r = await fetch(api + path, opts);
  if (!r.ok) throw new Error(r.statusText);
  return r.json();
}

export async function apiPost(path, body) {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export async function apiPatch(path, body) {
  return apiFetch(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export async function apiDelete(path) {
  return apiFetch(path, { method: 'DELETE' });
}

export function getExcelUrl(params) {
  const api = getApi();
  if (!api) return null;
  const q = new URLSearchParams(params).toString();
  return `${api}/export/excel?${q}`;
}
