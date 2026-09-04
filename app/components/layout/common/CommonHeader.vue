<script lang="ts" setup>
import { cva } from 'class-variance-authority';
import { cn } from '~/utils/cn.ts';

const props = withDefaults(defineProps<{
  class?: string;
  isMobile?: boolean;
}>(), {
  class: '',
  isMobile: false,
});

const emit = defineEmits<{
  'open-sidebar': [];
}>();

const cssVariants = cva(
  [
    'bg-stone-800 text-white p-2 flex flex-row items-center justify-between',
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
  <header
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  >
    <ElButton
      v-if="props.isMobile"
      class="md:hidden! bg-stone-700! border-0! text-white! p-2! rounded-1! hover:bg-stone-600!"
      aria-label="메뉴 열기"
      @click="emit('open-sidebar')"
    >
      <UiIcon icon-name="lucide:menu" />
    </ElButton>

    <h1>
      <UiImage
        :src="siteConfig.images.logo.dark"
        :alt="siteConfig.images.logo.alt"
        height="30"
      />
      <span class="sr-only">
        {{ siteConfig.images.logo.alt }}
      </span>
    </h1>
  </header>
</template>
