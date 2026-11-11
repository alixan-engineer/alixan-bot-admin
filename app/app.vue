<script setup lang="ts">
const { locale, t } = useI18n();
const route = useRoute();
const pageTitle = computed(() => {
	const page =
		route.path.replace(/^\/(en|kk)(?=\/|$)/, '').replace(/\/$/, '') || '/';
	const titles: Record<string, string> = {
		'/': 'nav.home',
		'/groups': 'nav.groups',
		'/users': 'nav.users',
		'/sign-in': 'auth.signIn',
	};
	return `${t(titles[page] ?? 'app.name')} | ${t('app.name')}`;
});
useHead({
	title: pageTitle,
	link: [
		{ rel: 'icon', href: '/favicon.ico', sizes: 'any' },
		{ rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
		{ rel: 'manifest', href: '/site.webmanifest' },
	],
	meta: [
		{ name: 'theme-color', content: '#050505' },
		{ name: 'mobile-web-app-capable', content: 'yes' },
		{ name: 'apple-mobile-web-app-capable', content: 'yes' },
		{ name: 'apple-mobile-web-app-title', content: 'Admin' },
		{ name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
	],
	htmlAttrs: { lang: computed(() => locale.value) },
});
</script>

<template>
	<NuxtLayout><NuxtPage /></NuxtLayout>
	<DialogHost />
	<DrawerHost />
</template>
