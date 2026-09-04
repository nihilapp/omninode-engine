<script setup lang="ts">
import { useSetMeta } from '~/composables/useSetMeta.ts';
import Home from '~/components/index/Home.vue';

useSetMeta({
  title: '홈',
  url: '/',
});
</script>

<template>
  <Home />
</template>

<style scoped>

</style>
