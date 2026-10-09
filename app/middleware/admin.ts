export default defineNuxtRouteMiddleware(() => {
  if (!useAdminToken().value) return navigateTo(useLocalePath()('/sign-in'));
});
