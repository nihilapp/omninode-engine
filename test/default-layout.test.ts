import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import {
  defineComponent,
  nextTick,
} from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { navConfig } from '../app/config/nav.config';
import { siteConfig } from '../app/config/site.config';
import CommonContent from '../app/components/layout/common/CommonContent.vue';
import CommonHeader from '../app/components/layout/common/CommonHeader.vue';
import CommonSidebar from '../app/components/layout/common/CommonSidebar.vue';
import UiPanel from '../app/components/ui/UiPanel.vue';
import DefaultLayout from '../app/layouts/default.vue';
import { useAppStore } from '../app/stores/app.store';

const ElementContainerStub = defineComponent({
  template: '<section><slot /></section>',
});

const ElementAsideStub = defineComponent({
  template: '<aside><slot /></aside>',
});

const ElementMainStub = defineComponent({
  template: '<main><slot /></main>',
});

const ElementDrawerStub = defineComponent({
  name: 'ElDrawer',
  props: {
    bodyClass: {
      default: '',
      type: String,
    },
  },
  template: '<div :data-body-class="bodyClass" data-testid="drawer-overlay"><slot /></div>',
});

const elementStubs = {
  ElAside: ElementAsideStub,
  ElButton: defineComponent({
    emits: [
      'click',
    ],
    template: '<button @click="$emit(\'click\')"><slot /></button>',
  }),
  ElContainer: ElementContainerStub,
  ElDrawer: ElementDrawerStub,
  ElMain: ElementMainStub,
  ElMenu: defineComponent({
    template: '<ul><slot /></ul>',
  }),
  ElMenuItem: defineComponent({
    template: '<li><slot /></li>',
  }),
  NuxtLink: defineComponent({
    props: {
      to: {
        required: true,
        type: String,
      },
    },
    template: '<a :href="to"><slot /></a>',
  }),
  UiIcon: true,
  UiImage: true,
};

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

let onChangeMediaQuery: ((event: MediaQueryListEvent) => void) | undefined;
let onRegisteredMediaQuery: ((event: MediaQueryListEvent) => void) | undefined;
let onRemoveMediaQuery = vi.fn();

function onSetMobileViewport(matches: boolean) {
  onRemoveMediaQuery = vi.fn();

  vi.mocked(window.matchMedia).mockReturnValue({
    addEventListener: (
      eventName: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      if (eventName === 'change') {
        onChangeMediaQuery = listener;
        onRegisteredMediaQuery = listener;
      }
    },
    matches,
    media: '(max-width: 767px)',
    onchange: null,
    removeEventListener: onRemoveMediaQuery,
  } as unknown as MediaQueryList);
}

async function onChangeViewport(matches: boolean) {
  onChangeMediaQuery?.(
    { matches, } as MediaQueryListEvent,
  );
  await nextTick();
}

describe('default layout', () => {
  beforeEach(async () => {
    onChangeMediaQuery = undefined;
    onRegisteredMediaQuery = undefined;
    onRemoveMediaQuery = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(),
      writable: true,
    });
    await router.push('/');
    await router.isReady();
  });

  it('모바일 메뉴 버튼은 Drawer를 열고 Drawer sidebar navigate는 닫는다', async () => {
    onSetMobileViewport(true);
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(DefaultLayout, {
      global: {
        components: {
          CommonContent,
          CommonHeader,
          CommonSidebar,
        },
        config: {
          globalProperties: {
            siteConfig,
          },
        },
        plugins: [
          pinia,
          router,
        ],
        stubs: {
          ...elementStubs,
          CommonFooter: true,
        },
      },
      slots: {
        default: '<p>본문</p>',
      },
    });
    const store = useAppStore();
    await nextTick();

    await wrapper.get('[aria-label="메뉴 열기"]').trigger('click');

    expect(store.isSidebarOpen).toBe(true);

    const drawer = wrapper.getComponent(ElementDrawerStub);

    expect(drawer.attributes('data-body-class')).toBe('p-2!');

    await drawer.getComponent(CommonSidebar).vm.$emit(
      'navigate',
      navConfig[0],
    );

    expect(store.isSidebarOpen).toBe(false);
  });

  it('모바일 Drawer를 연 뒤 데스크톱으로 전환하면 모바일 UI와 상태를 닫는다', async () => {
    onSetMobileViewport(true);
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(DefaultLayout, {
      global: {
        components: {
          CommonContent,
          CommonHeader,
          CommonSidebar,
        },
        config: {
          globalProperties: {
            siteConfig,
          },
        },
        plugins: [
          pinia,
          router,
        ],
        stubs: {
          ...elementStubs,
          CommonFooter: true,
        },
      },
      slots: {
        default: '<p>본문</p>',
      },
    });
    const store = useAppStore();
    await nextTick();

    await wrapper.get('[aria-label="메뉴 열기"]').trigger('click');

    expect(store.isSidebarOpen).toBe(true);
    expect(wrapper.findComponent(ElementDrawerStub).exists()).toBe(true);
    expect(wrapper.find('[data-testid="drawer-overlay"]').exists()).toBe(true);

    await onChangeViewport(false);

    expect(store.isSidebarOpen).toBe(false);
    expect(wrapper.find('[aria-label="메뉴 열기"]').exists()).toBe(false);
    expect(wrapper.findComponent(ElementDrawerStub).exists()).toBe(false);
    expect(wrapper.find('[data-testid="drawer-overlay"]').exists()).toBe(false);
  });

  it('뷰포트 리스너는 layout 해제 시 정리한다', () => {
    onSetMobileViewport(true);
    const pinia = createPinia();
    setActivePinia(pinia);

    const wrapper = mount(DefaultLayout, {
      global: {
        components: {
          CommonContent,
          CommonHeader,
          CommonSidebar,
        },
        config: {
          globalProperties: {
            siteConfig,
          },
        },
        plugins: [
          pinia,
          router,
        ],
        stubs: {
          ...elementStubs,
          CommonFooter: true,
        },
      },
      slots: {
        default: '<p>본문</p>',
      },
    });

    wrapper.unmount();

    expect(onRemoveMediaQuery).toHaveBeenCalledWith(
      'change',
      onRegisteredMediaQuery,
    );
  });

  it('CommonContent는 aside와 main에 독립 스크롤 클래스를 적용한다', async () => {
    const wrapper = mount(CommonContent, {
      global: {
        components: {
          CommonSidebar,
          UiPanel,
        },
        plugins: [
          router,
        ],
        stubs: elementStubs,
      },
      slots: {
        default: '<article>본문</article>',
      },
    });

    expect(wrapper.get('aside').classes()).toContain('overflow-y-auto');
    expect(wrapper.get('main').classes()).toContain('overflow-y-auto');
    expect(wrapper.get('aside').classes()).toContain('p-2!');
    expect(wrapper.get('main').classes()).toContain('p-2!');
    expect(wrapper.findAllComponents(UiPanel)).toHaveLength(2);
  });
});
