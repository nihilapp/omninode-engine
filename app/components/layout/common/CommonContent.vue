<script lang="ts" setup>
import { cva } from 'class-variance-authority';
import type { NavigationItem } from '~/types/common.types';
import { cn } from '~/utils/cn.ts';

const props = withDefaults(defineProps<{
  class?: string;
  size?: number | string;
}>(), {
  size: 300,
});

const emit = defineEmits<{
  navigate: [item: NavigationItem];
}>();

const cssVariants = cva(
  [
    'flex-1 min-h-0',
  ],
  {
    variants: {},
    compoundVariants: [
    ],
    defaultVariants: {},
  },
);
</script>

<template>
  <ElContainer
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  >
    <ElAside
      class="hidden min-h-0 overflow-y-auto p-2! md:block pr-0!"
      :width="typeof size === 'number' ? `${size}px` : size"
    >
      <UiPanel class="h-full">
        <CommonSidebar @navigate="emit('navigate', $event)" />
      </UiPanel>
    </ElAside>
    <ElMain class="min-w-0 min-h-0 overflow-y-auto p-2!">
      <UiPanel class="min-h-full">
        <slot />
      </UiPanel>
    </ElMain>
  </ElContainer>
</template>

<style scoped>

</style>
