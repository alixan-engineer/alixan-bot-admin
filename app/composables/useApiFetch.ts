import { StoreKeys } from '~/constants/store-keys';

type AdminRefreshResponse = {
	accessToken: string;
	refreshToken: string;
};

let refreshRequest: Promise<boolean> | null = null;

const getAdminApiBaseUrl = (): string => {
	if (!import.meta.client) {
		return 'http://api:5102/api/admin';
	}

	const url = new URL(window.location.origin);
	const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(
		url.hostname,
	);

	if (!isLocalhost) {
		return 'https://kaspibot-api.alixan.kz/api/admin';
	}

	url.port = '5102';
	return `${url.origin}/api/admin`;
};

const refreshAccessToken = async (): Promise<boolean> => {
	if (refreshRequest) return await refreshRequest;

	refreshRequest = (async () => {
		const refreshToken = localStorage.getItem(StoreKeys.RefreshToken);
		if (!refreshToken) return false;

		try {
			const data = await $fetch<AdminRefreshResponse>(
				`${getAdminApiBaseUrl()}/auth/refresh`,
				{
					method: 'POST',
					body: { refreshToken },
				},
			);
			setAdminToken(data.accessToken);
			localStorage.setItem(StoreKeys.RefreshToken, data.refreshToken);
			return true;
		} catch {
			setAdminToken('');
			localStorage.removeItem(StoreKeys.RefreshToken);
			return false;
		}
	})();

	try {
		return await refreshRequest;
	} finally {
		refreshRequest = null;
	}
};

export const useApiFetch = async <T>(
	path: string,
	params: Record<string, any> = {},
): Promise<T> => {
	const request = () => {
		const token = useAdminToken();

		return $fetch<T>(`${getAdminApiBaseUrl()}/${path}`, {
			...params,
			headers: {
				...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
				...(params.headers ?? {}),
			},
		});
	};

	try {
		return await request();
	} catch (error: any) {
		const status = error?.response?.status ?? error?.status;
		if (status === 401 && !['auth/sign-in', 'auth/refresh'].includes(path)) {
			if (await refreshAccessToken()) {
				return await request();
			}

			setAdminToken('');
			localStorage.removeItem(StoreKeys.RefreshToken);
			await navigateTo(useLocalePath()('/sign-in'));
		}

		throw error;
	}
};
