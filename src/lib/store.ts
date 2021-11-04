import { writable } from 'svelte/store'
import { browser } from '$app/env'

export const showKeymap = writable<boolean>((browser && localStorage.showKeymap) === 'true')
export const currentLessonName = writable(browser && localStorage.currentLessonName)

if (browser) {
  showKeymap.subscribe((value) => (localStorage.showKeymap = String(value)))
  currentLessonName.subscribe((value) => (localStorage.currentLessonName = value))
}
