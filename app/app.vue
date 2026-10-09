<script setup lang="ts">
const { locale } = useI18n();
useHead({ htmlAttrs: { lang: computed(() => locale.value) } });
</script>

<template>
  <NuxtLayout><NuxtPage /></NuxtLayout>
  <DialogHost />
  <DrawerHost />
</template>
