import {
  focusManager,
  onlineManager,
  QueryClient,
  VueQueryPlugin,
} from '@tanstack/vue-query';
import {
  flushPromises,
  mount,
} from '@vue/test-utils';
import { defineComponent } from 'vue';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { useGetQuery } from '../app/composables/query/useGetQuery';
import { useDeleteMutation } from '../app/composables/query/useDeleteMutation';
import { usePostMutation } from '../app/composables/query/usePostMutation';

const mockFetch = vi.fn();
const itemQueryKeys = {
  create: [
    'items',
    'create',
  ] as const,
  detail: (
    itemId: string,
  ) => [
    'items',
    'detail',
    itemId,
  ] as const,
  remove: [
    'items',
    'remove',
  ] as const,
};

vi.stubGlobal('$fetch', mockFetch);

const activeQueryClients: QueryClient[] = [
];

function onTrackQueryClient(
  queryClient: QueryClient,
) {
  activeQueryClients.push(queryClient);

  return queryClient;
}

describe('useGetQuery', () => {
  beforeEach(() => {
    focusManager.setFocused(true);
    onlineManager.setOnline(true);
  });

  afterEach(() => {
    activeQueryClients.splice(0).forEach(
      (queryClient) => {
        queryClient.unmount();
        queryClient.clear();
      },
    );
    focusManager.setFocused(true);
    mockFetch.mockReset();
    onlineManager.setOnline(true);
  });

  it('does not fetch automatically and fetches when refetch is called', async () => {
    mockFetch.mockResolvedValue({
      code: 'OK',
      data: {
        id: 'item-1',
      },
      details: null,
      error: false,
      message: '',
    });
    const queryClient = onTrackQueryClient(new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }));
    let query: ReturnType<typeof useGetQuery<{ id: string }>> | undefined;

    mount(defineComponent({
      setup() {
        query = useGetQuery<{ id: string }>({
          key: itemQueryKeys.detail('item-1'),
          queryOptions: {
            enabled: false,
          },
          url: '/api/items/item-1',
        });

        return () => null;
      },
    }), {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    });

    expect(mockFetch).not.toHaveBeenCalled();

    await query?.refetch();

    expect(mockFetch).toHaveBeenCalledWith('/api/items/item-1', {
      body: undefined,
      headers: undefined,
      method: 'GET',
      query: undefined,
      retry: 0,
      signal: expect.any(AbortSignal),
    });
  });

  it('treats an HTTP 200 business failure as a query error without retrying', async () => {
    mockFetch.mockResolvedValue({
      code: 'PERMISSION_DENIED',
      data: null,
      details: null,
      error: true,
      message: '권한이 없습니다.',
    });
    const queryClient = onTrackQueryClient(new QueryClient());
    let query: ReturnType<typeof useGetQuery<{ id: string }>> | undefined;

    mount(defineComponent({
      setup() {
        query = useGetQuery<{ id: string }>({
          key: itemQueryKeys.detail('item-1'),
          queryOptions: {
            enabled: false,
          },
          url: '/api/items/item-1',
        });

        return () => null;
      },
    }), {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    });

    const result = await query?.refetch();

    expect(result?.status).toBe('error');
    expect(query?.data.value).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('does not retry a failed query when a new observer mounts', async () => {
    mockFetch.mockResolvedValue({
      code: 'PERMISSION_DENIED',
      data: null,
      details: null,
      error: true,
      message: '권한이 없습니다.',
    });
    const queryClient = onTrackQueryClient(new QueryClient());
    const component = defineComponent({
      setup() {
        useGetQuery<{ id: string }>({
          key: itemQueryKeys.detail('item-1'),
          url: '/api/items/item-1',
        });

        return () => null;
      },
    });
    const options = {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    };

    const firstWrapper = mount(
      component,
      options,
    );

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(queryClient.getQueryState(itemQueryKeys.detail('item-1'))?.status).toBe('error');
    });

    firstWrapper.unmount();

    const secondWrapper = mount(
      component,
      options,
    );

    await flushPromises();

    expect(mockFetch).toHaveBeenCalledOnce();
    secondWrapper.unmount();
  });

  it('does not refetch on mount after cached data fails a manual refetch', async () => {
    mockFetch
      .mockResolvedValueOnce({
        code: 'OK',
        data: {
          id: 'item-1',
        },
        details: null,
        error: false,
        message: '',
      })
      .mockResolvedValue({
        code: 'PERMISSION_DENIED',
        data: null,
        details: null,
        error: true,
        message: '권한이 없습니다.',
      });
    const queryClient = onTrackQueryClient(new QueryClient());
    let query: ReturnType<typeof useGetQuery<{ id: string }>> | undefined;
    const component = defineComponent({
      setup() {
        query = useGetQuery<{ id: string }>({
          key: itemQueryKeys.detail('item-1'),
          url: '/api/items/item-1',
        });

        return () => null;
      },
    });
    const options = {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    };
    const firstWrapper = mount(
      component,
      options,
    );

    await vi.waitFor(() => {
      expect(queryClient.getQueryState(itemQueryKeys.detail('item-1'))?.status).toBe('success');
    });

    await query?.refetch();

    expect(queryClient.getQueryState(itemQueryKeys.detail('item-1'))).toMatchObject({
      data: {
        id: 'item-1',
      },
      status: 'error',
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);

    firstWrapper.unmount();

    const secondWrapper = mount(
      component,
      options,
    );

    await flushPromises();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    secondWrapper.unmount();
  });

  it('keeps mount refetching for a successful stale query', async () => {
    mockFetch.mockResolvedValue({
      code: 'OK',
      data: {
        id: 'item-1',
      },
      details: null,
      error: false,
      message: '',
    });
    const queryClient = onTrackQueryClient(new QueryClient());
    const component = defineComponent({
      setup() {
        useGetQuery<{ id: string }>({
          key: itemQueryKeys.detail('item-1'),
          url: '/api/items/item-1',
        });

        return () => null;
      },
    });
    const options = {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    };
    const firstWrapper = mount(
      component,
      options,
    );

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(queryClient.getQueryState(itemQueryKeys.detail('item-1'))?.status).toBe('success');
    });

    firstWrapper.unmount();

    const secondWrapper = mount(
      component,
      options,
    );

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
    secondWrapper.unmount();
  });

  it('does not refetch a failed query on window focus', async () => {
    focusManager.setFocused(false);
    mockFetch.mockResolvedValue({
      code: 'PERMISSION_DENIED',
      data: null,
      details: null,
      error: true,
      message: '권한이 없습니다.',
    });
    const queryClient = onTrackQueryClient(new QueryClient());
    const wrapper = mount(defineComponent({
      setup() {
        useGetQuery<{ id: string }>({
          key: itemQueryKeys.detail('item-1'),
          url: '/api/items/item-1',
        });

        return () => null;
      },
    }), {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(queryClient.getQueryState(itemQueryKeys.detail('item-1'))?.status).toBe('error');
    });

    focusManager.setFocused(true);
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it('does not refetch a failed query on reconnect', async () => {
    onlineManager.setOnline(false);
    mockFetch.mockResolvedValue({
      code: 'PERMISSION_DENIED',
      data: null,
      details: null,
      error: true,
      message: '권한이 없습니다.',
    });
    const queryClient = onTrackQueryClient(new QueryClient());
    const wrapper = mount(defineComponent({
      setup() {
        useGetQuery<{ id: string }>({
          key: itemQueryKeys.detail('item-1'),
          url: '/api/items/item-1',
        });

        return () => null;
      },
    }), {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    });

    onlineManager.setOnline(true);
    await vi.waitFor(() => {
      expect(queryClient.getQueryState(itemQueryKeys.detail('item-1'))?.status).toBe('error');
    });

    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledOnce();
    wrapper.unmount();
  });

  it('keeps normal stale-data refetching on window focus', async () => {
    focusManager.setFocused(false);
    mockFetch.mockResolvedValue({
      code: 'OK',
      data: {
        id: 'item-1',
      },
      details: null,
      error: false,
      message: '',
    });
    const queryClient = onTrackQueryClient(new QueryClient());
    const wrapper = mount(defineComponent({
      setup() {
        useGetQuery<{ id: string }>({
          key: itemQueryKeys.detail('item-1'),
          url: '/api/items/item-1',
        });

        return () => null;
      },
    }), {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    });

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledOnce();
      expect(queryClient.getQueryState(itemQueryKeys.detail('item-1'))?.status).toBe('success');
    });

    focusManager.setFocused(true);

    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
    wrapper.unmount();
  });

  it('passes mutation variables to an internal POST fetcher', async () => {
    const onSuccess = vi.fn();
    const queryClient = onTrackQueryClient(new QueryClient());
    let mutation: ReturnType<
      typeof usePostMutation<
        { id: string },
        { title: string }
      >
    > | undefined;

    mockFetch.mockResolvedValue({
      code: 'OK',
      data: {
        id: 'document-1',
      },
      details: null,
      error: false,
      message: '',
    });

    mount(defineComponent({
      setup() {
        mutation = usePostMutation<
          { id: string },
          { title: string }
        >({
          key: itemQueryKeys.create,
          mutationOptions: {
            onSuccess,
          },
          params: {
            projectId: 'project-1',
          },
          url: '/api/documents',
        });

        return () => null;
      },
    }), {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    });

    await mutation?.mutateAsync({
      title: '새 문서',
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/documents', {
      body: {
        title: '새 문서',
      },
      headers: undefined,
      method: 'POST',
      query: {
        projectId: 'project-1',
      },
      retry: 0,
    });
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it('preserves a cached query when a mutation has an HTTP 200 business failure without retrying', async () => {
    mockFetch.mockResolvedValue({
      code: 'PERMISSION_DENIED',
      data: null,
      details: null,
      error: true,
      message: '권한이 없습니다.',
    });
    const queryClient = onTrackQueryClient(new QueryClient());
    const cachedItem = {
      id: 'item-1',
      title: '기존 문서',
    };
    const queryKey = itemQueryKeys.detail('item-1');

    queryClient.setQueryData(
      queryKey,
      cachedItem,
    );

    let mutation: ReturnType<
      typeof usePostMutation<
        { id: string },
        { title: string }
      >
    > | undefined;

    mount(defineComponent({
      setup() {
        mutation = usePostMutation<
          { id: string },
          { title: string }
        >({
          key: itemQueryKeys.create,
          url: '/api/documents',
        });

        return () => null;
      },
    }), {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    });

    await expect(mutation?.mutateAsync({
      title: '변경 문서',
    })).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
      kind: 'api',
    });

    expect(queryClient.getQueryData(queryKey)).toEqual(cachedItem);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it('allows DELETE requests to carry a batch body', async () => {
    const queryClient = onTrackQueryClient(new QueryClient());
    let mutation: ReturnType<
      typeof useDeleteMutation<
        undefined,
        { ids: string[] }
      >
    > | undefined;

    mockFetch.mockResolvedValue({
      code: 'OK',
      data: null,
      details: null,
      error: false,
      message: '',
    });

    mount(defineComponent({
      setup() {
        mutation = useDeleteMutation<
          undefined,
          { ids: string[] }
        >({
          key: itemQueryKeys.remove,
          url: '/api/documents',
        });

        return () => null;
      },
    }), {
      global: {
        plugins: [
          [
            VueQueryPlugin,
            {
              queryClient,
            },
          ],
        ],
      },
    });

    await mutation?.mutateAsync({
      ids: [
        'document-1',
        'document-2',
      ],
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/documents', {
      body: {
        ids: [
          'document-1',
          'document-2',
        ],
      },
      headers: undefined,
      method: 'DELETE',
      query: undefined,
      retry: 0,
    });
  });
});
