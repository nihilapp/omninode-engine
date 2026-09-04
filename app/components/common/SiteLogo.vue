<script lang="ts" setup>
const props = defineProps<{
  class?: string;
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
  <div
    :class="cn([
      cssVariants({}),
      props.class,
    ])"
  />
</template>

<style scoped>

</style>
