<script setup lang="ts">
import CommonFooter from '~/components/layout/common/CommonFooter.vue';
import { useAppStore } from '~/stores/app.store';
import {
  storeToRefs,
} from 'pinia';
import {
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';

const appStore = useAppStore();
const { isSidebarOpen, } = storeToRefs(appStore);
const { onSetSidebarOpen, } = appStore;
const isMobile = ref(false);

let mobileMediaQuery: MediaQueryList | undefined;

function onChangeMobileViewport(
  event: MediaQueryListEvent,
) {
  isMobile.value = event.matches;

  if (!event.matches) {
    onSetSidebarOpen(false);
  }
}

onMounted(() => {
  mobileMediaQuery = window.matchMedia('(max-width: 767px)');
  isMobile.value = mobileMediaQuery.matches;
  mobileMediaQuery.addEventListener(
    'change',
    onChangeMobileViewport,
  );
});

onBeforeUnmount(() => {
  mobileMediaQuery?.removeEventListener(
    'change',
    onChangeMobileViewport,
  );
});
</script>

<template>
  <ElContainer
    class="h-dvh overflow-hidden"
    direction="vertical"
  >
    <CommonHeader
      :is-mobile="isMobile"
      @open-sidebar="onSetSidebarOpen(true)"
    />

    <CommonContent @navigate="onSetSidebarOpen(false)">
      <slot />
    </CommonContent>

    <CommonFooter />

    <ElDrawer
      v-if="isMobile"
      v-model="isSidebarOpen"
      class="md:hidden"
      body-class="p-2!"
      header-class="mb-2!"
      direction="ltr"
      size="300px"
      title="메뉴"
    >
      <CommonSidebar @navigate="onSetSidebarOpen(false)" />
    </ElDrawer>
  </ElContainer>
</template>

<style scoped>

</style>
