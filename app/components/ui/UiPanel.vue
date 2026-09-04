<script lang="ts" setup>
import { cva } from 'class-variance-authority';
import { cn } from '~/utils/cn';

const props = withDefaults(defineProps<{
  class?: string;
  as?: 'div' | 'main' | 'aside' | 'section' | 'article';
}>(), {
  class: '',
  as: 'div',
});

const cssVariants = cva(
  [
    'bg-white border border-black-200 rounded-1 p-2',
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
  <div
    v-if="as === 'div'"
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  >
    <slot />
  </div>
  <main
    v-else-if="as === 'main'"
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  >
    <slot />
  </main>
  <aside
    v-else-if="as === 'aside'"
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  >
    <slot />
  </aside>
  <section
    v-else-if="as === 'section'"
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  >
    <slot />
  </section>
  <article
    v-else-if="as === 'article'"
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  >
    <slot />
  </article>
</template>
