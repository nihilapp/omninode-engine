import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import UiPanel from '../app/components/ui/UiPanel.vue';
import UiPanelDivider from '../app/components/ui/UiPanelDivider.vue';

describe('UiPanel', () => {
  it('기본 시각 클래스와 슬롯 및 외부 클래스를 렌더링한다', () => {
    const wrapper = mount(UiPanel, {
      props: {
        class: 'custom-panel',
      },
      slots: {
        default: '<p>패널 내용</p>',
      },
    });

    expect(wrapper.classes()).toEqual(expect.arrayContaining([
      'bg-white',
      'border',
      'border-black-200',
      'rounded-1',
      'p-2',
      'custom-panel',
    ]));
    expect(wrapper.text()).toContain('패널 내용');
  });
});

describe('UiPanelDivider', () => {
  it('row 축만 적용하고 시각 클래스가 없다', () => {
    const wrapper = mount(UiPanelDivider, {
      props: {
        direction: 'row',
      },
    });

    expect(wrapper.classes()).toContain('flex');
    expect(wrapper.classes()).toContain('flex-row');
    expect(wrapper.classes()).not.toContain('bg-white');
    expect(wrapper.classes()).not.toContain('border');
    expect(wrapper.classes()).not.toContain('shadow');
    expect(wrapper.classes()).not.toContain('gap');
  });

  it('기본 column 축에서 슬롯과 외부 클래스를 렌더링한다', () => {
    const wrapper = mount(UiPanelDivider, {
      props: {
        class: 'custom-divider',
      },
      slots: {
        default: '<p>분할 내용</p>',
      },
    });

    expect(wrapper.classes()).toEqual(expect.arrayContaining([
      'flex',
      'flex-col',
      'custom-divider',
    ]));
    expect(wrapper.text()).toContain('분할 내용');
  });
});
