import { writable } from 'svelte/store';

export const roomId = writable<string | null>(null);

export const roomName = writable<string | null>(null);