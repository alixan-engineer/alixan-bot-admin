<script setup lang="ts">
import type { Group } from '~/types/admin';

const props = defineProps<{
	data?: {
		group?: Group;
		onUpdated?: () => Promise<void> | void;
	};
	close: () => void;
}>();

const name = useXControl(props.data?.group?.name ?? '');
const orderBotEnabled = ref(props.data?.group?.orderBotEnabled ?? true);
const loader = useGlobalLoader();
const { showError } = useErrorAlert();

const updateGroup = async () => {
	const group = props.data?.group;
	if (!group || !name.validate()) return;

	loader.show();
	try {
		await useAdminApi(`groups/${group._id}`, {
			method: 'PATCH',
			body: {
				name: name.value.trim(),
				orderBotEnabled: orderBotEnabled.value,
			},
		});
		await props.data?.onUpdated?.();
		props.close();
	} catch (error: any) {
		showError(error, 'groups.updateError');
	} finally {
		loader.hide();
	}
};
</script>

<template>
	<form class="grid gap-5 p-5" @submit.prevent="updateGroup">
		<Input :control="name" label="groups.name" required />
		<Switch v-model="orderBotEnabled" label="Order Bot подключён" />
		<Button type="submit" color="primary">
			{{ $t('common.save') }}
		</Button>
	</form>
</template>
