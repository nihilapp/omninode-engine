import { ElMenu, ElMenuItem } from 'element-plus';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { navConfig } from '../app/config/nav.config';
import CommonSidebar from '../app/components/layout/common/CommonSidebar.vue';

describe('CommonSidebar', () => {
  it('navConfig의 항목을 nav에 렌더링하고 선택 항목을 emit한다', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          component: {
            template: '<div />',
          },
          path: '/',
        },
      ],
    });

    await router.push('/');
    await router.isReady();

    const wrapper = mount(CommonSidebar, {
      global: {
        components: {
          ElMenu,
          ElMenuItem,
        },
        stubs: {
          NuxtLink: {
            props: {
              to: {
                required: true,
                type: String,
              },
            },
            template: '<a :href="to"><slot /></a>',
          },
          UiIcon: {
            props: {
              iconName: {
                required: true,
                type: String,
              },
            },
            template: '<span data-testid="sidebar-icon" />',
          },
        },
        plugins: [
          router,
        ],
      },
    });

    const item = navConfig[0]!;

    expect(wrapper.element.tagName).toBe('NAV');
    expect(wrapper.attributes('aria-label')).toBe('주요 메뉴');
    expect(wrapper.findComponent(ElMenu).classes()).toContain('border-r-0!');
    expect(wrapper.findAll('[data-testid="sidebar-icon"]')).toHaveLength(
      navConfig.length,
    );

    for (const navigationItem of navConfig) {
      expect(wrapper.get(`a[href="${navigationItem.to}"]`).text()).toContain(
        navigationItem.label,
      );
    }

    await wrapper.get(`a[href="${item.to}"]`).trigger('click');

    expect(wrapper.emitted('navigate')).toEqual([
      [
        item,
      ],
    ]);
  });
});
