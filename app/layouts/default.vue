<script setup lang="ts">
import { House, Layers3, LogOut, Menu, Users } from '@lucide/vue';
import { StoreKeys } from '~/constants/store-keys';

const sidebar = useSidebar();
const route = useRoute();
const localePath = useLocalePath();
const sections = [
	{
		label: 'nav.homeSection',
		pages: [{ id: '/', title: 'nav.home', icon: House }],
	},
	{
		label: 'nav.pagesSection',
		pages: [
			{ id: '/groups', title: 'nav.groups', icon: Layers3 },
			{ id: '/users', title: 'nav.users', icon: Users },
		],
	},
];

const selected = computed(() =>
	sections
		.flatMap(section => section.pages)
		.find(page => localePath(page.id) === route.path),
);

const selectPage = (id: string) => navigateTo(localePath(id));

const logout = () => {
	setAdminToken('');
	localStorage.removeItem(StoreKeys.RefreshToken);
	navigateTo(localePath('/sign-in'));
};
</script>

<template>
	<Layout>
		<template #sidebar>
			<Sidebar
				:sections="sections"
				:selected="selected?.id"
				@select="selectPage"
			>
				<template #logo>
					<Logo />
				</template>
				<template #sidebarFooter>
					<Button
						variant="ghost"
						class="w-full justify-start px-3"
						@click="logout"
					>
						<template #leading>
							<LogOut class="size-5" />
						</template>
						{{ $t('nav.logout') }}
					</Button>
				</template>
			</Sidebar>
		</template>

		<template #scaffold>
			<Scaffold>
				<template #app-bar>
					<AppBar :title="selected?.title ?? 'app.name'">
						<template #leading>
							<IconButton variant="ghost" @click="sidebar.toggle()">
								<Menu />
							</IconButton>
						</template>
						<template #trailing>
							<AppearanceControls />
						</template>
					</AppBar>
				</template>
				<template #body>
					<NuxtPage />
				</template>
			</Scaffold>
		</template>
	</Layout>
</template>
