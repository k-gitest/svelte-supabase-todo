import { writable } from 'svelte/store';

export const noReadTotalState = writable<number>(0);

export const noReadCountState = writable<{ [key: string]: number }>({});