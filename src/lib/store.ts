import { writable } from 'svelte/store'
import { browser } from '$app/env'

interface ISetting {
  showKeymap: boolean
  showPrevOrNextWord: boolean
  EscToSetting: boolean
  TabToRestart: boolean
  DarkMode: boolean
  GlowKey: boolean
  currentLessonName?: string
}

const DEFAULT: ISetting = {
  showKeymap: true,
  showPrevOrNextWord: true,
  EscToSetting: true,
  TabToRestart: true,
  DarkMode: false,
  GlowKey: false,
  currentLessonName: undefined,
}

const storage: ISetting = browser
  ? JSON.parse(window.localStorage['learn-manoonchai-settings'] || '{}') || {}
  : {}

function storeSettings() {
  if (browser) {
    window.localStorage['learn-manoonchai-settings'] = JSON.stringify(storage)
  }
}

export const showKeymap = writable<boolean>(storage.showKeymap ?? DEFAULT['showKeymap'])
export const showPrevOrNextWord = writable<boolean>(
  storage.showPrevOrNextWord ?? DEFAULT['showPrevOrNextWord'],
)
export const EscToSetting = writable<boolean>(storage.EscToSetting ?? DEFAULT['EscToSetting'])
export const TabToRestart = writable<boolean>(storage.TabToRestart ?? DEFAULT['TabToRestart'])
export const DarkMode = writable<boolean>(storage.DarkMode ?? DEFAULT['DarkMode'])
export const GlowKey = writable<boolean>(storage.GlowKey ?? DEFAULT['GlowKey'])
export const currentLessonName = writable(storage.currentLessonName ?? DEFAULT['currentLessonName'])

showKeymap.subscribe((value) => {
  storage.showKeymap = value
  storeSettings()
})

EscToSetting.subscribe((value) => {
  storage.EscToSetting = value
  storeSettings()
})

showPrevOrNextWord.subscribe((value) => {
  storage.showPrevOrNextWord = value
  storeSettings()
})

TabToRestart.subscribe((value) => {
  storage.TabToRestart = value
  storeSettings()
})

DarkMode.subscribe((value) => {
  storage.DarkMode = value
  storeSettings()
})

GlowKey.subscribe((value) => {
  storage.GlowKey = value
  storeSettings()
})

currentLessonName.subscribe((value) => {
  storage.currentLessonName = value
  storeSettings()
})

export default {
  showKeymap,
  showPrevOrNextWord,
  EscToSetting,
  TabToRestart,
  DarkMode,
  GlowKey,
  currentLessonName,
}
