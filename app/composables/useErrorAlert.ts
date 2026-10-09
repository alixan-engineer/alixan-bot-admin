import AlertDialog from '~/components/ui/alert-dialog/AlertDialog.vue';

export const useErrorAlert = () => {
	const dialog = useDialog();
	const { t } = useI18n();

	const showError = (error: any, fallbackKey: string): void => {
		const rawMessage = error?.response?._data?.message ?? error?.data?.message;
		const message = Array.isArray(rawMessage)
			? rawMessage.join(', ')
			: rawMessage || t(fallbackKey);

		dialog.open(AlertDialog, {
			width: '360px',
			height: '280px',
			data: {
				title: message,
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

	return { showError };
};
