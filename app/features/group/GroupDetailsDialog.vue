<script setup lang="ts">
import { Copy, Plus, Trash2, UserRound } from '@lucide/vue';
import ConfirmDialog from '~/components/ui/confirm-dialog/ConfirmDialog.vue';
import AddGroupUserDialog from '~/features/group/AddGroupUserDialog.vue';
import type {
	CreatedUser,
	Group,
	GroupStore,
	User,
} from '~/types/admin';
import { phonePipe } from '~/utils/phone-pipe';

const props = defineProps<{
	data?: {
		group?: Group;
		onUpdated?: () => Promise<void> | void;
	};
	close: () => void;
}>();

const users = ref<User[]>([]);
const selectedTab = ref(0);
const stores = ref<GroupStore[]>([]);
const loading = ref(true);
const loadFailed = ref(false);
const storesLoaded = ref(false);
const deletingUser = ref<User | null>(null);
const createdUser = ref<CreatedUser | null>(null);
const dialog = useDialog();
const loader = useGlobalLoader();
const { t, locale } = useI18n();
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

const money = (amount: number) =>
	new Intl.NumberFormat(locale.value, {
		style: 'currency',
		currency: 'KZT',
		maximumFractionDigits: 0,
	}).format(amount);
const storeStatus = (status: string) =>
	['enable', 'disable', 'pending'].includes(status) ? status : 'authError';

const loadDetails = async () => {
	if (!group.value) return;
	loading.value = true;
	loadFailed.value = false;
	const id = group.value._id;
	try {
		const [loadedStores, loadedUsers] = await Promise.all([
			useAdminApi<GroupStore[]>(`groups/${id}/stores`),
			useAdminApi<User[]>(`groups/${id}/users`),
		]);
		stores.value = loadedStores;
		users.value = loadedUsers;
		storesLoaded.value = true;
	} catch (error: any) {
		loadFailed.value = true;
		showError(error, 'groupDetails.loadError');
	} finally {
		loading.value = false;
	}
};
onMounted(loadDetails);
</script>

<template>
	<div class="size-full flex flex-col divide-y">
		<div class="shrink-0">
			<Tabs
				v-model="selectedTab"
				:tabs="['groupDetails.stores', 'groupDetails.users']"
				design="material"
				full
			/>
		</div>
		<div class="flex-1 relative">
			<div class="p-4 absolute inset-0 overflow-y-auto space-y-6">
				<Spinner v-if="loading" />
				<div v-else-if="loadFailed" class="space-y-4 text-center">
					<p>{{ $t('groupDetails.loadError') }}</p>
					<Button @click="loadDetails">{{ $t('groupDetails.retry') }}</Button>
				</div>
				<template v-else-if="selectedTab === 0">
					<p v-if="!stores.length" class="text-muted-foreground">
						{{ $t('groupDetails.noStores') }}
					</p>
					<article
						v-for="store in stores"
						:key="store._id"
						class="flex items-center gap-3 rounded-xl border p-4"
					>
						<span
							class="size-3 shrink-0 rounded-full"
							:class="
								store.status === 'enable'
									? 'bg-emerald-500'
									: store.status === 'pending'
									? 'bg-amber-500'
									: 'bg-red-500'
							"
							:title="$t(`groupDetails.status.${storeStatus(store.status)}`)"
						/>
						<div class="min-w-0 flex-1">
							<p class="font-semibold break-words">{{ store.name || '—' }}</p>
							<p class="text-sm text-muted-foreground break-all">
								ID: {{ store.storeId || store._id }}
							</p>
							<p class="text-sm text-muted-foreground">
								{{ $t(`groupDetails.status.${storeStatus(store.status)}`) }}
							</p>
						</div>
						<Status
							v-if="store.isMain"
							status="success"
							:text="$t('groupDetails.mainStore')"
						/>
					</article>
				</template>
				<template v-else>
					<div class="flex items-center justify-between">
						<p class="text-lg font-semibold">
							{{ users.length + ' ' + $t('groups.usersCount') }}
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

					<p v-if="!users.length" class="text-muted-foreground">
						{{ $t('groupDetails.noUsers') }}
					</p>
					<Island v-else>
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
				</template>
			</div>
		</div>
		<div class="shrink-0 p-4 space-y-1">
			<p class="font-semibold">
				{{ $t('groupDetails.monthlyPayment') }}:
				{{ storesLoaded ? money(20_000 * stores.length) : '—' }}
			</p>
			<p v-if="storesLoaded" class="text-sm text-muted-foreground">
				{{ $t('groupDetails.paymentFormula', { count: stores.length }) }}
			</p>
		</div>
	</div>
</template>
