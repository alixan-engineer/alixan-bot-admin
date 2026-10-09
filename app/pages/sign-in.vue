<script setup lang="ts">
import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';
import { StoreKeys } from '~/constants/store-keys';
import type {
	SignInPayload,
	SignInResponse,
} from '~/interfaces/auth.interface';

definePageMeta({
	layout: 'auth',
});

const phone = useXControl('');
const password = useXControl('');

const dialog = useDialog();
const localePath = useLocalePath();
const { t } = useI18n();
const { showError } = useErrorAlert();

const openAlert = () => {
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
const signIn = async () => {
	if (!phone.value || !password.validate()) {
		openAlert();
		return;
	}

	const { show, hide } = useGlobalLoader();
	try {
		show();
		const data = await useApiFetch<SignInResponse>('auth/sign-in', {
			method: 'POST',
			body: {
				phone: phone.value,
				password: password.value,
			} satisfies SignInPayload,
		});
		setAdminToken(data.accessToken);
		localStorage.setItem(StoreKeys.RefreshToken, data.refreshToken);
		await navigateTo(localePath('/'));
	} catch (error: any) {
		showError(error, 'auth.failed');
	} finally {
		hide();
	}
};
</script>

<template>
	<form class="contents" @submit.prevent="signIn">
		<div class="text-center">
			<h1
				class="text-2xl font-bold tracking-tight sm:text-3xl sm:tracking-normal"
			>
				{{ $t('auth.signIn') }}
			</h1>
			<p class="mt-2 text-sm text-muted-foreground sm:mt-4 sm:text-base">
				{{ $t('auth.signInDescription') }}
			</p>
		</div>

		<div class="space-y-3">
			<PhoneInput :control="phone" />
			<PasswordInput :control="password" required :min="8" :max="32" />
		</div>

		<Button
			type="submit"
			color="primary"
			size="lg"
			:label="$t('auth.submitSignIn')"
		/>
	</form>
</template>
