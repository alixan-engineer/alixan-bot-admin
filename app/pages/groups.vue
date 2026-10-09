<script setup lang="ts">
import { Ellipsis, Eye, Pencil, Plus, Trash2 } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import CreateGroupDialog from '~/features/group/CreateGroupDialog.vue';
import EditGroupDialog from '~/features/group/EditGroupDialog.vue';
import GroupDetailsDialog from '~/features/group/GroupDetailsDialog.vue';
import type { Group } from '~/types/admin';

definePageMeta({ middleware: 'admin' });

const groups = ref<Group[]>([]);
const searchQuery = ref('');
const initialLoading = ref(true);
const menuGroupId = ref<string | null>(null);
const dialog = useDialog();
const { locale, t } = useI18n();
const { showError } = useErrorAlert();

const dateFormatter = computed(
	() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }),
);

const formatCreatedAt = (createdAt?: string) => {
	if (!createdAt) return '—';
	const date = new Date(createdAt);
	return Number.isNaN(date.getTime()) ? '—' : dateFormatter.value.format(date);
};

const filteredGroups = computed(() => {
	const query = searchQuery.value.trim().toLocaleLowerCase();
	if (!query) return groups.value;

	return groups.value.filter(group =>
		group.name.toLocaleLowerCase().includes(query),
	);
});

const loadGroups = async () => {
	groups.value = await useAdminApi<Group[]>('groups');
};

const openCreateGroup = () =>
	dialog.open(CreateGroupDialog, {
		title: t('groups.new'),
		width: '480px',
		height: '260px',
		data: { onCreated: loadGroups },
	});

const openGroup = (group: Group) =>
	dialog.open(GroupDetailsDialog, {
		title: group.name,
		width: '680px',
		height: '720px',
		data: { group, onUpdated: loadGroups },
	});

const openEditGroup = (group: Group) => {
	menuGroupId.value = null;
	dialog.open(EditGroupDialog, {
		title: t('groups.edit'),
		width: '480px',
		height: '260px',
		data: { group, onUpdated: loadGroups },
	});
};

const deleteGroup = async (group: Group) => {
	try {
		await useAdminApi(`groups/${group._id}`, { method: 'DELETE' });
		await loadGroups();
	} catch (error: any) {
		showError(error, 'groups.deleteError');
	}
};

const askDeleteGroup = (group: Group) => {
	menuGroupId.value = null;
	dialog.open(ConfirmDialog, {
		width: '440px',
		height: '280px',
		data: {
			title: t('groups.deleteTitle'),
			description: t('groups.deleteDescription', { name: group.name }),
			cancelLabel: t('common.cancel'),
			submitLabel: t('common.delete'),
			submitColor: 'destructive',
			onSubmit: () => deleteGroup(group),
		},
	});
};

const openGroupFromMenu = (group: Group) => {
	menuGroupId.value = null;
	openGroup(group);
};

onMounted(async () => {
	try {
		await loadGroups();
	} catch (error: any) {
		showError(error, 'groups.loadError');
	} finally {
		initialLoading.value = false;
	}
});
</script>

<template>
	<div class="flex items-center gap-6">
		<Search
			v-model="searchQuery"
			class="flex-1 flex items-center"
			placeholder="Поиск по названию группы"
		/>
		<IconButton variant="filled" color="primary" @click="openCreateGroup">
			<Plus />
		</IconButton>
	</div>

	<Spinner v-if="initialLoading" />

	<section
		v-else
		class="grid grid-cols-[repeat(auto-fill,minmax(230px,320px))] gap-6"
	>
		<div
			v-for="group in filteredGroups"
			:key="group._id"
			class="flex items-center justify-between cursor-pointer gap-3 rounded-3xl border bg-background pl-6 pr-2 py-4 transition hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			role="button"
			tabindex="0"
			@click="openGroup(group)"
			@keydown.enter="openGroup(group)"
		>
			<div class="flex-1">
				<p class="text-lg text-muted-foreground">
					{{ group.usersCount }} {{ $t('groups.usersCount') }}
				</p>
				<h2 class="text-2xl font-semibold mb-2">{{ group.name }}</h2>
				<p class="text-md text-muted-foreground">
					{{ formatCreatedAt(group.createdAt) }}
				</p>
			</div>
			<div @click.stop @keydown.stop>
				<DropdownMenu
					:open="menuGroupId === group._id"
					width="220px"
					position="bottomRight"
					@update:open="menuGroupId = $event ? group._id : null"
				>
					<template #trigger>
						<IconButton
							variant="ghost"
							:tooltip="$t('groups.actions')"
							:aria-label="$t('groups.actions')"
						>
							<Ellipsis />
						</IconButton>
					</template>
					<div class="p-1">
						<Button
							class="w-full justify-start"
							variant="ghost"
							@click="openGroupFromMenu(group)"
						>
							<template #leading><Eye class="size-5" /></template>
							{{ $t('common.open') }}
						</Button>
						<Button
							class="w-full justify-start"
							variant="ghost"
							@click="openEditGroup(group)"
						>
							<template #leading><Pencil class="size-5" /></template>
							{{ $t('common.edit') }}
						</Button>
						<Button
							class="w-full justify-start"
							variant="ghost"
							color="destructive"
							@click="askDeleteGroup(group)"
						>
							<template #leading><Trash2 class="size-5" /></template>
							{{ $t('common.delete') }}
						</Button>
					</div>
				</DropdownMenu>
			</div>
		</div>
	</section>
</template>
