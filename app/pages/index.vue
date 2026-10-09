<script setup lang="ts">
import type { Group, User } from '~/types/admin';

definePageMeta({ middleware: 'admin' });

const groups = ref<Group[]>([]);
const users = ref<User[]>([]);
const loading = ref(true);
const { showError } = useErrorAlert();

const cards = computed(() => [
	{ label: 'home.groups', value: groups.value.length, to: '/groups' },
	{ label: 'home.users', value: users.value.length, to: '/users' },
]);

onMounted(async () => {
	try {
		[groups.value, users.value] = await Promise.all([
			useAdminApi<Group[]>('groups'),
			useAdminApi<User[]>('users'),
		]);
	} catch (e: any) {
		showError(e, 'home.loadError');
	} finally {
		loading.value = false;
	}
});
</script>

<template>
	<Spinner v-if="loading" />

	<template v-else>
		<div class="grid grid-cols-2 gap-6">
			<NuxtLink
				v-for="card in cards"
				:key="card.label"
				:to="$localePath(card.to)"
				class="md:px-6 max-md:px-4 py-4 border rounded-xl space-y-1"
			>
				<p class="text-sm font-medium text-muted-foreground">
					{{ $t(card.label) }}
				</p>
				<p class="text-3xl font-bold">
					{{ card.value }}
				</p>
			</NuxtLink>
		</div>
	</template>
</template>
