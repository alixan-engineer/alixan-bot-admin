<script setup lang="ts">
import { Copy, Plus, Trash2, UserRound } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import AddGroupUserDialog from '~/features/group/AddGroupUserDialog.vue';
import type { CreatedUser, Group, User } from '~/types/admin';
import { phonePipe } from '~/utils/phone-pipe';

const props = defineProps<{
	data?: {
		group?: Group;
		onUpdated?: () => Promise<void> | void;
	};
	close: () => void;
}>();

const users = ref<User[]>([]);
const deletingUser = ref<User | null>(null);
const createdUser = ref<CreatedUser | null>(null);
const dialog = useDialog();
const loader = useGlobalLoader();
const { t } = useI18n();
const { showError } = useErrorAlert();
const group = computed(() => props.data?.group);

const loadUsers = async () => {
	try {
		users.value = group.value
			? await useAdminApi<User[]>(`groups/${group.value._id}/users`)
			: [];
	} catch (error: any) {
		showError(error, 'users.loadError');
	}
};

const handleUserCreated = async (user: CreatedUser) => {
	createdUser.value = user;
	await Promise.all([loadUsers(), props.data?.onUpdated?.()]);
};

const openAddUser = () => {
	if (!group.value) return;
	dialog.open(AddGroupUserDialog, {
		title: t('groups.addUser'),
		width: '480px',
		height: '600px',
		data: {
			groupId: group.value._id,
			onCreated: handleUserCreated,
		},
	});
};

const deleteUser = async () => {
	if (!group.value || !deletingUser.value) return;
	loader.show();
	try {
		await useAdminApi(
			`groups/${group.value._id}/users/${deletingUser.value._id}`,
			{ method: 'DELETE' },
		);
		deletingUser.value = null;
		await Promise.all([loadUsers(), props.data?.onUpdated?.()]);
	} catch (error: any) {
		showError(error, 'users.deleteError');
	} finally {
		loader.hide();
	}
};

const askDeleteUser = (user: User) => {
	deletingUser.value = user;
	dialog.open(ConfirmDialog, {
		width: '440px',
		height: '260px',
		data: {
			title: t('groups.deleteUserTitle'),
			description: t('groups.deleteUserDescription', { phone: user.phone }),
			cancelLabel: t('common.cancel'),
			submitLabel: t('common.delete'),
			submitColor: 'destructive',
			onSubmit: deleteUser,
		},
	});
};

const copyCredentials = () =>
	createdUser.value &&
	navigator.clipboard.writeText(
		`${t('common.login')}: ${createdUser.value.phone}\n${t(
			'common.password',
		)}: ${createdUser.value.password}`,
	);

onMounted(loadUsers);
</script>

<template>
	<div class="size-full flex flex-col divide-y">
		<div class="flex-1 relative">
			<div class="p-4 absolute inset-0 overflow-y-auto space-y-6">
				<div class="flex items-center justify-between">
					<p class="text-lg font-semibold">
						{{ group?.usersCount + ' ' + $t('groups.usersCount') }}
					</p>
					<Button
						class="w-fit"
						color="secondary"
						size="sm"
						@click="openAddUser"
					>
						<template #leading>
							<Plus />
						</template>
						{{ $t('groups.addUser') }}
					</Button>
				</div>

				<div
					v-if="createdUser"
					class="flex flex-wrap items-center gap-3 rounded-xl bg-secondary p-4"
				>
					<p class="min-w-0 flex-1">
						<b class="block">{{ $t('groups.copyNow') }}</b>
						<span>{{ createdUser.phone }} / {{ createdUser.password }}</span>
					</p>
					<IconButton
						:tooltip="$t('common.copy')"
						variant="outlined"
						@click="copyCredentials"
					>
						<Copy />
					</IconButton>
				</div>

				<Island>
					<List divider="inset">
						<ListTile
							v-for="user in users"
							:key="user._id"
							:title="user.name"
							:description="phonePipe(user.phone)"
						>
							<template #leading>
								<div class="bg-secondary p-2 rounded-xl">
									<UserRound />
								</div>
							</template>
							<template #trailing>
								<IconButton
									variant="filled"
									color="secondary"
									size="sm"
									@click="askDeleteUser(user)"
								>
									<Trash2 />
								</IconButton>
							</template>
						</ListTile>
					</List>
				</Island>
			</div>
		</div>
	</div>
</template>
