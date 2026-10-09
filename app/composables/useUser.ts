import { defineStore } from 'pinia';
import { StoreKeys } from '~/constants/store-keys';
import type { User } from '../interfaces/user.interface';

export const useUser = defineStore('user', () => {
	const localePath = useLocalePath();
	const user = ref<User | null>(null);
	const loading = ref<boolean>(false);

	const setUser = (value: User | null) => {
		user.value = value;
	};

	const getUserByToken = async () => {
		if (
			loading.value ||
			user.value ||
			(!localStorage.getItem(StoreKeys.AccessToken) &&
				!localStorage.getItem(StoreKeys.RefreshToken))
		)
			return;

		try {
			loading.value = true;
			user.value = await useApiFetch<User>('auth/me');
		} catch {
			logout();
		} finally {
			loading.value = false;
		}
	};

	const logout = () => {
		localStorage.removeItem(StoreKeys.AccessToken);
		localStorage.removeItem(StoreKeys.RefreshToken);
		user.value = null;
		navigateTo(localePath('/sign-in'));
	};

	return {
		user,
		loading,
		setUser,
		getUserByToken,
		logout,
	};
});
