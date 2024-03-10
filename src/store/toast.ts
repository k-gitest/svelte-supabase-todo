import { writable, derived } from 'svelte/store';

const defaultToaster = {
  isActive: false,
  message: '',
  class: 'info'
};

export const toaster = writable<{ isActive?: boolean; message?: string; class?: string; }>(defaultToaster);

export const fullToaster = derived(toaster, ($toaster, set) => {
  const updatedToaster = { ...defaultToaster, ...$toaster };
  set(updatedToaster);
});