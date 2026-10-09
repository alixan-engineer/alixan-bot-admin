<script setup lang="ts">
import { Ellipsis, Pencil, Trash2 } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import EditUserDialog from '~/features/user/EditUserDialog.vue';
import type { User } from '~/types/admin';
import { phonePipe } from '~/utils/phone-pipe';

definePageMeta({ middleware: 'admin' });

const users = ref<User[]>([]);
const query = ref('');
const searchQuery = ref('');
const deletingUser = ref<User | null>(null);
const menuUserId = ref<string | null>(null);
const initialLoading = ref(true);
const dialog = useDialog();
const loader = useGlobalLoader();
const { t } = useI18n();
const { showError } = useErrorAlert();

const filteredUsers = computed(() => {
	const value = searchQuery.value.trim().toLowerCase();
	return value
		? users.value.filter(user => {
				const roleLabel = t(
					user.role === 'admin' ? 'common.admin' : 'common.worker',
				).toLowerCase();
				return (
					user.name.toLowerCase().includes(value) ||
					user.phone.includes(value) ||
					user.groupName?.toLowerCase().includes(value) ||
					roleLabel.includes(value)
				);
		  })
		: users.value;
});

const loadUsers = async () => {
	try {
		users.value = await useAdminApi<User[]>('users');
	} catch (e: any) {
		showError(e, 'users.loadError');
	} finally {
		initialLoading.value = false;
	}
};

const openEditUser = (user: User) => {
	menuUserId.value = null;
	dialog.open(EditUserDialog, {
		width: '440px',
		height: '540px',
		title: t('users.editTitle'),
		data: {
			user,
			onUpdated: loadUsers,
		},
	});
};

const askDelete = (user: User) => {
	deletingUser.value = user;
	dialog.open(ConfirmDialog, {
		width: '440px',
		height: '260px',
		data: {
			title: t('users.deleteTitle'),
			description: t('users.deleteDescription', {
				phone: user.phone,
				group: user.groupName ?? '',
			}),
			cancelLabel: t('common.cancel'),
			submitLabel: t('common.delete'),
			submitColor: 'destructive',
			onSubmit: deleteUser,
		},
	});
};

const deleteUser = async () => {
	if (!deletingUser.value) return;
	loader.show();
	try {
		await useAdminApi(
			`groups/${deletingUser.value.groupId}/users/${deletingUser.value._id}`,
			{ method: 'DELETE' },
		);
		deletingUser.value = null;
		await loadUsers();
	} catch (e: any) {
		showError(e, 'users.deleteError');
	} finally {
		loader.hide();
	}
};

onMounted(loadUsers);
</script>

<template>
	<div class="grid gap-6">
		<Search
			v-model="query"
			:placeholder="$t('users.search')"
			@search="searchQuery = $event"
		/>
		<Spinner v-if="initialLoading" />
		<section
			v-else
			class="grid grid-cols-[repeat(auto-fill,minmax(260px,380px))] gap-4"
		>
			<div
				v-for="user in filteredUsers"
				:key="user._id"
				class="flex items-start gap-4 rounded-3xl border bg-background p-5 transition hover:border-primary/30 hover:shadow-sm"
			>
				<Avatar :name="user.name" size="lg" />
				<div class="min-w-0 flex-1">
					<h2 class="truncate text-lg font-semibold">{{ user.name }}</h2>
					<p class="truncate text-sm text-muted-foreground">
						{{ phonePipe(user.phone) }}
					</p>
					<p class="mt-3 truncate text-sm">
						{{ user.groupName }}
						<span class="mx-1 text-muted-foreground">|</span>
						{{ user.role }}
					</p>
				</div>
				<DropdownMenu
					:open="menuUserId === user._id"
					width="200px"
					position="bottomRight"
					@update:open="menuUserId = $event ? user._id : null"
				>
					<template #trigger>
						<IconButton variant="ghost" :aria-label="$t('users.actions')">
							<Ellipsis />
						</IconButton>
					</template>
					<div class="p-1">
						<Button
							class="w-full justify-start"
							variant="ghost"
							@click="openEditUser(user)"
						>
							<template #leading><Pencil class="size-5" /></template>
							{{ $t('common.edit') }}
						</Button>
						<Button
							class="w-full justify-start"
							variant="ghost"
							color="destructive"
							@click="askDelete(user)"
						>
							<template #leading><Trash2 class="size-5" /></template>
							{{ $t('common.delete') }}
						</Button>
					</div>
				</DropdownMenu>
			</div>
			<p
				v-if="!filteredUsers.length"
				class="col-span-full p-10 text-center text-muted-foreground"
			>
				{{ $t('users.empty') }}
			</p>
		</section>
	</div>
</template>
