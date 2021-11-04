import { writable } from 'svelte/store'

export const showKeymap = writable<boolean>(localStorage.showKeymap === 'true')

showKeymap.subscribe((value) => (localStorage.showKeymap = String(value)))

export const currentLessonName = writable<string>(localStorage.currentLessonName)

currentLessonName.subscribe((value) => (localStorage.currentLessonName = value))
