<script lang="ts" setup>
import { cva } from 'class-variance-authority';
import { cn } from '~/utils/cn';

const props = withDefaults(defineProps<{
  class?: string;
  direction?: 'row' | 'column';
}>(), {
  class: '',
  direction: 'column',
});

const cssVariants = cva(
  '',
  {
    variants: {
      direction: {
        row: 'flex flex-row min-h-0 min-w-0',
        column: 'flex flex-col min-h-0 min-w-0',
      },
    },
    compoundVariants: [
    ],
    defaultVariants: {
      direction: 'column',
    },
  },
);
</script>

<template>
  <div
    :class="cn([
      cssVariants({
        direction: props.direction,
      }),
      props.class,
    ])"
  >
    <slot />
  </div>
</template>
