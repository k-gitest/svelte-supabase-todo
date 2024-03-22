import { writable } from 'svelte/store';

export const member_roomId = writable<string | null>(null);

export const member_roomName = writable<string | null>(null);