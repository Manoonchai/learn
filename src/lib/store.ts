import { writable } from 'svelte/store'

const stored = localStorage.showKeymap

export const enabled = writable<boolean>(localStorage.enabled === 'true')

export const showKeymap = writable<boolean>(stored === 'true')

showKeymap.subscribe((value) => (localStorage.showKeymap = String(value)))
