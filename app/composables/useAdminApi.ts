const tokenKey = 'kaspi-owner-admin-token';

export const useAdminToken = () => useState<string>('admin-token', () => import.meta.client ? localStorage.getItem(tokenKey) ?? '' : '');

export const setAdminToken = (token: string) => {
  useAdminToken().value = token;
  if (token) localStorage.setItem(tokenKey, token);
  else localStorage.removeItem(tokenKey);
};

export const useAdminApi = async <T>(
  path: string,
  options: Record<string, unknown> = {},
) => useApiFetch<T>(path, options);
