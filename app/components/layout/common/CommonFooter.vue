<script lang="ts" setup>
import { cva } from 'class-variance-authority';
import { cn } from '~/utils/cn.ts';

const props = defineProps<{
  class?: string;
}>();

const cssVariants = cva(
  [
    'bg-stone-800 text-white p-2',
  ],
  {
    variants: {},
    compoundVariants: [
    ],
    defaultVariants: {},
  },
);

const currentYear = DateTime.now().year;

const copyrightYears = currentYear === siteConfig.site.startedYear
  ? String(siteConfig.site.startedYear)
  : `${siteConfig.site.startedYear}–${currentYear}`;
</script>

<template>
  <footer
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  >
    <div class="flex flex-row items-center justify-center gap-1">
      <UiIcon icon-name="lucide:copyright" class="size-5" />
      <span>{{ copyrightYears }}.</span>
      <a :href="siteConfig.author.url">
        {{siteConfig.author.name}}
      </a>
    </div>
  </footer>
</template>

<style scoped>

</style>
