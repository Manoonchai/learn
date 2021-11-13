import { writable } from 'svelte/store'
import { browser } from '$app/env'

const storage = browser ? window.localStorage : ({} as Record<string, unknown>)

export const showKeymap = writable<boolean>(storage.showKeymap !== 'false')
export const showPrevOrNextWord = writable<boolean>(storage.showPrevOrNextWord !== 'false')
export const TabToRestart = writable<boolean>(storage.TabToRestart === 'true')
export const DarkMode = writable<boolean>(storage.DarkMode === 'true')
export const GlowKey = writable<boolean>(storage.GlowKey === 'true')
export const currentLessonName = writable(storage.currentLessonName)

showKeymap.subscribe((value) => (storage.showKeymap = String(value)))
showPrevOrNextWord.subscribe((value) => (storage.showPrevOrNextWord = String(value)))
TabToRestart.subscribe((value) => (storage.TabToRestart = String(value)))
DarkMode.subscribe((value) => (storage.DarkMode = String(value)))
GlowKey.subscribe((value) => (storage.GlowKey = String(value)))
currentLessonName.subscribe((value) => (storage.currentLessonName = value))
