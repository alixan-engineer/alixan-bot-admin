<script setup lang="ts">
import { Plus } from '@lucide/vue';
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';
import type { CreatedUser, UserRole } from '~/types/admin';

const props = defineProps<{
	data?: {
		groupId?: string;
		onCreated?: (user: CreatedUser) => Promise<void> | void;
	};
	close: () => void;
}>();

const name = useXControl('');
const phone = useXControl('');
const password = useXControl('');
const role = ref<UserRole>('admin');
const loader = useGlobalLoader();
const dialog = useDialog();
const { t } = useI18n();
const { showError } = useErrorAlert();

const openValidationAlert = () => {
	dialog.open(AlertDialog, {
		width: '360px',
		height: '280px',
		data: {
			title: t('validation.formTitle'),
			description: t('validation.formDescription'),
			buttonLabel: t('common.ok'),
			buttonColor: 'destructive',
			mediaComponent: 'Lottie',
			mediaProps: {
				name: 'error',
				loop: false,
				width: '80px',
				height: '80px',
			},
		},
	});
};

const createUser = async () => {
	const groupId = props.data?.groupId;
	const nameValid = name.validate();
	const passwordValid = password.validate();
	phone.markAsTouched();
	const phoneValid = Boolean(phone.value.trim());

	if (
		!groupId ||
		!nameValid ||
		!phoneValid ||
		!passwordValid
	) {
		openValidationAlert();
		return;
	}

	loader.show();
	try {
		const user = await useAdminApi<CreatedUser>(`groups/${groupId}/users`, {
			method: 'POST',
			body: {
				name: name.value.trim(),
				phone: phone.value.trim(),
				password: password.value,
				role: role.value,
			},
		});
		name.reset('');
		phone.reset('');
		password.reset('');
		await props.data?.onCreated?.(user);
		props.close();
	} catch (error: any) {
		showError(error, 'users.createError');
	} finally {
		loader.hide();
	}
};
</script>

<template>
	<form class="size-full flex flex-col divide-y" @submit.prevent="createUser">
		<div class="flex-1 px-4 py-6">
			<Input :control="name" label="groups.userName" required />
			<PhoneInput :control="phone" />
			<PasswordInput
				:control="password"
				label="auth.password"
				required
				:min="8"
			/>
			<div class="flex gap-2">
				<Chip :selected="role === 'admin'" @click="role = 'admin'">
					{{ $t('common.admin') }}
				</Chip>
				<Chip :selected="role === 'worker'" @click="role = 'worker'">
					{{ $t('common.worker') }}
				</Chip>
			</div>
		</div>

		<div class="p-4">
			<Button class="w-full" type="submit" color="primary">
				<template #leading>
					<Plus />
				</template>
				{{ $t('common.add') }}
			</Button>
		</div>
	</form>
</template>
