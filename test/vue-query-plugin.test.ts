import { ref } from 'vue';

import type { QueryClient } from '@tanstack/vue-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockUse = vi.fn();
const mockUseState = vi.fn(() => ref(null));

vi.stubGlobal('defineNuxtPlugin', <TPlugin>(plugin: TPlugin) => plugin);
vi.stubGlobal('useState', mockUseState);

describe('vue-query plugin', () => {
  afterEach(() => {
    mockUse.mockReset();
    mockUseState.mockClear();
    vi.resetModules();
  });

  it('registers a QueryClient with the Nuxt Vue app', async () => {
    const plugin = (await import('../app/plugins/vue-query')).default;

    plugin({
      vueApp: {
        use: mockUse,
      },
    } as never);

    expect(mockUse).toHaveBeenCalledOnce();
    expect(mockUseState).toHaveBeenCalledWith(
      'vue-query',
      expect.any(Function),
    );

    const options = mockUse.mock.calls[0]?.[1];
    const queryClient = options?.queryClient as QueryClient;

    expect(queryClient.getDefaultOptions().queries?.retry).toBe(false);
    expect(queryClient.getDefaultOptions().queries?.retryOnMount).toBe(false);
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
  });
});
