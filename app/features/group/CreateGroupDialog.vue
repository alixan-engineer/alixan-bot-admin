<script setup lang="ts">
import { Plus } from '@lucide/vue';

const props = defineProps<{
	data?: { onCreated?: () => Promise<void> | void };
	close: () => void;
}>();

const groupName = useXControl('');
const loader = useGlobalLoader();
const { showError } = useErrorAlert();

const createGroup = async () => {
	if (!groupName.validate()) return;

	loader.show();
	try {
		await useAdminApi('groups', {
			method: 'POST',
			body: { name: groupName.value.trim() },
		});
		await props.data?.onCreated?.();
		props.close();
	} catch (error: any) {
		showError(error, 'groups.createError');
	} finally {
		loader.hide();
	}
};
</script>

<template>
	<form class="grid gap-5 p-5" @submit.prevent="createGroup">
		<Input :control="groupName" label="groups.name" required />
		<Button type="submit" color="primary">
			<template #leading><Plus class="size-5" /></template>
			{{ $t('common.create') }}
		</Button>
	</form>
</template>
