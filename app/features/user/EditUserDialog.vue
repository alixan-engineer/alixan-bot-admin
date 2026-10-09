<script setup lang="ts">
import type { User } from '~/types/admin';

const props = defineProps<{
	data?: {
		user?: User;
		onUpdated?: () => Promise<void> | void;
	};
	close: () => void;
}>();

const name = useXControl(props.data?.user?.name ?? '');
const phone = useXControl(props.data?.user?.phone ?? '');
const password = useXControl('');
const loader = useGlobalLoader();
const { showError } = useErrorAlert();

const updateUser = async () => {
	const user = props.data?.user;
	const nameValid = name.validate();
	const passwordValid = password.validate();
	phone.markAsTouched();

	if (!user || !nameValid || !phone.value.trim() || !passwordValid) return;

	loader.show();
	try {
		await useAdminApi(`groups/${user.groupId}/users/${user._id}`, {
			method: 'PATCH',
			body: {
				name: name.value.trim(),
				phone: phone.value.trim(),
				...(password.value ? { password: password.value } : {}),
			},
		});
		await props.data?.onUpdated?.();
		props.close();
	} catch (error: any) {
		showError(error, 'users.updateError');
	} finally {
		loader.hide();
	}
};
</script>

<template>
	<form class="grid gap-4 p-5" @submit.prevent="updateUser">
		<Input :control="name" label="groups.userName" required />
		<PhoneInput :control="phone" />
		<PasswordInput
			:control="password"
			label="users.newPassword"
			:min="8"
		/>
		<Button type="submit" color="primary" class="w-full">
			{{ $t('common.save') }}
		</Button>
	</form>
</template>
