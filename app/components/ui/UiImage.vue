<script lang="ts" setup>
import { cva } from 'class-variance-authority';
import { cn } from '~/utils/cn.ts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  class?: string;

  src: string;
  alt: string;

  width?: number | string;
  height?: number | string;

  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
  fetchpriority?: 'high' | 'low' | 'auto';

  sizes?: string;
  densities?: string;

  format?: string;
  quality?: number | string;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;

  placeholder?:
    | boolean
    | string
    | number
    | [w: number, h: number, q?: number, b?: number];
  preload?: boolean;
}>(), {
  loading: 'lazy',
  decoding: 'async',
  fetchpriority: 'auto',
});

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
  <NuxtImg
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
    v-bind="$attrs"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    :loading="loading"
    :decoding="decoding"
    :fetchpriority="fetchpriority"
    :sizes="sizes"
    :densities="densities"
    :format="format"
    :quality="quality"
    :fit="fit"
    :position="position"
    :placeholder="placeholder"
    :preload="preload"
  />
</template>

<style scoped>

</style>
