import type { Component } from 'vue';
import { markRaw, shallowRef } from 'vue';
export type DrawerPosition = 'top' | 'right' | 'bottom' | 'left';
export interface DrawerOpenOptions { width?: string | number; height?: string | number; title?: string; position?: DrawerPosition; data?: unknown }
const drawerState = shallowRef<{ component: Component; options: DrawerOpenOptions } | null>(null);
export const useDrawer = () => ({
  open: (component: Component, options: DrawerOpenOptions = {}) => { drawerState.value = { component: markRaw(component), options }; },
  close: () => { drawerState.value = null; },
  state: drawerState,
});
