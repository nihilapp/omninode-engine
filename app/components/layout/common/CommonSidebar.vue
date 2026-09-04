<script lang="ts" setup>
import { cva } from 'class-variance-authority';
import { useRoute } from 'vue-router';
import { navConfig } from '~/config/nav.config';
import type { NavigationItem } from '~/types/common.types';
import { cn } from '~/utils/cn';

const route = useRoute();

const props = withDefaults(defineProps<{
  class?: string;
}>(), {
  class: '',
});

const emit = defineEmits<{
  navigate: [item: NavigationItem];
}>();

const cssVariants = cva(
  [
    '',
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
  <nav
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
    aria-label="주요 메뉴"
  >
    <ElMenu
      :default-active="route.path"
      class="border-r-0!"
    >
      <ElMenuItem
        v-for="item in navConfig"
        :key="item.to"
        :index="item.to"
        class="h-10!"
      >
        <NuxtLink
          :to="item.to"
          class="flex items-center gap-1"
          @click="emit('navigate', item)"
        >
          <UiIcon
            v-if="item.icon"
            :icon-name="item.icon"
            class="size-5"
          />
          {{ item.label }}
        </NuxtLink>
      </ElMenuItem>
    </ElMenu>
  </nav>
</template>
