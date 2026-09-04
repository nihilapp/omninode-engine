import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it } from 'vitest';

import { useAppStore } from '../app/stores/app.store';

describe('useAppStore', () => {
  it('starts with the sidebar closed', () => {
    setActivePinia(createPinia());
    const store = useAppStore();

    expect(store.isSidebarOpen).toBe(false);
  });

  it('updates the common sidebar UI state', () => {
    setActivePinia(createPinia());
    const store = useAppStore();

    store.onSetSidebarOpen(true);

    expect(store.isSidebarOpen).toBe(true);
  });

  it('resets common app UI state', () => {
    setActivePinia(createPinia());
    const store = useAppStore();

    store.isSidebarOpen = true;
    store.reset();

    expect(store.isSidebarOpen).toBe(false);
  });
});
