import { afterEach, describe, expect, it, vi } from 'vitest';

import { useSetMeta } from '../app/composables/useSetMeta';

vi.mock('~/config/site.config', async () => import('../app/config/site.config'));

describe('useSetMeta', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the configured normal cover image and shared alt text by default', () => {
    const useHead = vi.fn();

    vi.stubGlobal('useHead', useHead);

    useSetMeta({
      title: '홈',
      url: '/',
    });

    const [
      head,
    ] = useHead.mock.calls[0] as [
      {
        meta: Array<Record<string, string>>;
      },
    ];

    expect(head.meta.find((item) => item.property === 'og:image')).toEqual({
      property: 'og:image',
      content: 'http://localhost:3000/images/nihil-web-logo.png',
    });
    expect(head.meta.find((item) => item.property === 'og:image:alt')).toEqual({
      property: 'og:image:alt',
      content: '옴니노드',
    });
  });
});
