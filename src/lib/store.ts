import { writable } from 'svelte/store'
import { browser } from '$app/env'

const storage = browser ? window.localStorage : ({} as Record<string, unknown>)

export const showKeymap = writable<boolean>(storage.showKeymap !== 'false')
export const currentLessonName = writable(storage.currentLessonName)

showKeymap.subscribe((value) => (storage.showKeymap = String(value)))
currentLessonName.subscribe((value) => (storage.currentLessonName = value))
