import { writable, derived } from 'svelte/store';

type Toaster = {
  isActive?: boolean;
  message?: string;
  class?: string;
}

const defaultToaster: Toaster = {
  isActive: false,
  message: '',
  class: 'info'
};

export const toaster = writable<Toaster>(defaultToaster);

export const fullToaster = derived(toaster, ($toaster, set) => {
  const updatedToaster = { ...defaultToaster, ...$toaster };
  set(updatedToaster);
});