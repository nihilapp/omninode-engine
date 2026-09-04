<script lang="ts" setup>
import type { IconifyIconBuildResult } from '@iconify/utils';

import {
  getIconData,
  iconToSVG,
  replaceIDs,
} from '@iconify/utils';

import { cva } from 'class-variance-authority';

import {
  iconSets,
} from '~/data/icons.data';

import type {
  IconPrefix,
  UiIconName,
} from '~/types/icon.generated';

import { cn } from '~/utils/cn';

defineOptions({
  inheritAttrs: false,
});

const passedAttrs = useAttrs();

const svgAttrs = computed<Record<string, unknown>>(() => ({
  ...passedAttrs,
  ...renderData.value?.attributes,
}));

const props = withDefaults(defineProps<{
  class?: string;
  iconName: UiIconName;
}>(), {
  class: '',
});

const renderData = computed<IconifyIconBuildResult | null>(() => {
  const separatorIndex = props.iconName.indexOf(':');

  if (separatorIndex === -1) {
    if (import.meta.dev) {
      console.warn(
        `[UiIcon] 잘못된 아이콘 이름입니다: ${props.iconName}`,
      );
    }

    return null;
  }

  const prefix = props.iconName.slice(
    0,
    separatorIndex,
  );

  const iconName = props.iconName.slice(
    separatorIndex + 1,
  );

  if (!isIconPrefix(prefix)) {
    if (import.meta.dev) {
      console.warn(
        `[UiIcon] 지원하지 않는 아이콘 세트입니다: ${prefix}`,
      );
    }

    return null;
  }

  const iconData = getIconData(
    iconSets[prefix],
    iconName,
  );

  if (!iconData) {
    if (import.meta.dev) {
      console.warn(
        `[UiIcon] 아이콘을 찾을 수 없습니다: ${props.iconName}`,
      );
    }

    return null;
  }

  const result = iconToSVG(iconData, {
    width: '1em',
    height: '1em',
  });

  return {
    ...result,
    body: replaceIDs(result.body),
  };
});

function isIconPrefix(
  value: string,
): value is IconPrefix {
  return Object.hasOwn(iconSets, value);
}

const cssVariants = cva([
  'inline-block shrink-0 size-6',
]);
</script>

<template>
  <!-- eslint-disable -->
  <svg
    v-if="renderData"
    v-bind="svgAttrs"
    :class="cn(
      cssVariants(),
      props.class,
    )"
    aria-hidden="true"
    focusable="false"
    v-html="renderData.body"
  />
</template>
