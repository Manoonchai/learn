<script lang="ts">
  import { onMount } from 'svelte'
  import { calculateWpm } from '$lib/wpm'
  import { spellcheck } from '$lib/spellcheck'
  import { nextchar } from '$lib/nextchar'
  import { lessons } from '$lib/lessons'
  import Manoonchai from '$lib/manoonchai'
  import Keymap from '$lib/components/Keymap.svelte'
  import Kofi from '$lib/components/Kofi.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Modal from '$lib/components/Modal.svelte'
  import LessonModal from '$lib/components/LessonModal.svelte'
  import Changelog from '$lib/components/Changelog.svelte'
  import {
    showKeymap,
    showPrevOrNextWord,
    ShowLogo,
    currentLessonName,
    TabToRestart,
    DarkMode,
    GlowKey,
    EscToSetting,
  } from '$lib/store'

  let name = 'Manoonchai'
  let input
  let typingInput: HTMLInputElement

  let words = []
  let result
  let currentWordIdx
  let currentLesson
  let sentence
  let ended
  let started
  let elapsed
  let startTime = new Date().getTime()
  let correctWords = []
  let interval
  let currentWordSpellCheck = true
  let userType = []
  let nextChar
  let showMenu = false
  let showLesson = false
  let showChangelog = false
  let showWpm = false

  reset()

  onMount(() => {
    typingInput.focus()
  })

  $: wpm = calculateWpm(correctWords, elapsed).toFixed(1)
  $: if (sentence) {
    const currentWord = sentence[currentWordIdx]
    const currentInput = input

    currentWordSpellCheck = spellcheck(currentWord, currentInput)
    nextChar = nextchar(currentWord, currentInput)
  }
  $: {
    words = currentLesson?.words || []
    $currentLessonName = currentLesson?.name || ''
  }

  function start() {
    if (started) {
      return
    }

    if (interval) {
      clearInterval(interval)
    }

    interval = setInterval(() => {
      elapsed = (new Date().getTime() - startTime) / 1000
    }, 500)

    started = true
  }

  function onType(e: KeyboardEvent) {
    if (!e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
    }

    if (ended) return;

    const manoonchaiKey = Manoonchai[e.code]?.[e.shiftKey ? 1 : 0] || ''

    start()

    if (e.key === 'Backspace' || e.key === 'Delete') {
      userType.pop()
    } else if (manoonchaiKey.length === 1) {
      userType.push(manoonchaiKey)
    }

    input = userType.join('').trimEnd()

    if (e.key === ' ') {
      userType = []

      if (input) {
        if (sentence[currentWordIdx] === input) {
          correctWords = correctWords.concat(input)
          result = result.concat(true)
        } else {
          correctWords = correctWords.concat('')
          result = result.concat(false)
        }

        currentWordIdx += 1
        input = ''

        if (currentWordIdx >= sentence.length) {
          end()
        }
      }
    }
  }

  function reset() {
    if ($currentLessonName) {
      currentLesson = lessons.find((l) => l.name === $currentLessonName) || lessons[0]
    } else {
      currentLesson = lessons[0]
    }

    words = currentLesson.words

    started = false
    ended = false
    userType = []
    result = []
    currentWordIdx = 0

    sentence = Array(30)
      .fill(null)
      .map(() => words[Math.floor(Math.random() * words.length)] || '')
    startTime = new Date().getTime()
    correctWords = []
    input = ''
    typingInput?.focus()
  }

  window.onkeydown = (e) => {
    if (e.key === 'Tab') {
      if ($TabToRestart === true) {
        reset()
      } else {
        return
      }
    }
    if ($EscToSetting === true) {
      if (e.which == 27) {
        showMenu = true
      }
    }
    if (e.key === 'Tab') {
      if (showWpm === true){
        showWpm = false
        reset()
      }
    }
  }

  function end() {
    ended = true
    showWpm = true
    clearInterval(interval)
  }

  function close() {
    showWpm = false
    reset()
  }
</script>

<svelte:head>
  <title>Learn Manoonchai</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <meta property="og:url" content="https:/learn.manoonchai.com/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Learn manoonchai" />
  <meta property="og:description" content="เรียนรู้แป้นพิมพ์มนูญชัยแบบง่ายๆ" />
  <meta name="twitter:title" content="Learn manoonchai" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#607D8B" id="metaThemeColor" />
  <meta
    name="keywords"
    content="manoonchai , learn-manoonchai , learn manoonchai , manoonchai layout , manoonchai keyboard layout , thai manoonchai layout , th manoonchai layout , มนูญชัย , แป้นพิมพ์มนูญชัย , เรียนมนูญชัย , ฝึกมนูญชัย , ฝึกพิมพ์มนูญชัย"
  />
</svelte:head>

<body class={$DarkMode === true ? 'dark' : ''}>
  <main
    class="main container min-h-screen mx-auto flex dark:bg-black flex-col gap-2 justify-center items-center py-20"
  >
  {#if $ShowLogo}
    <div class="title dark:text-white font-sarabun text-black flex flex-row font-bold">
      <img
        src="https://manoonchai.com/_next/image?url=%2Fmanoonchai.png&w=64&q=75"
        class="align-middle"
        width={64}
        height={64}
        alt="logo"
      />
      <h1>Learn {name}</h1>
    </div>
    {/if}

    <p class="stat">{wpm} wpm</p>
    <p class="sentence">
      {#each sentence as word, idx (idx)}
        <span
          class="sentence-gap font-sarabun dark:text-white transition duration-200 break-word {idx ===
          currentWordIdx
            ? 'bg-green-300 dark:bg-green-500'
            : ''}
        {result[idx] === true ? 'text-green-400 dark:text-green-600' : ''}
        {result[idx] === false ? 'text-red-600 dark:text-red-600' : ''}
        {sentence[currentWordIdx] &&
          userType.join('') !== sentence[currentWordIdx].slice(0, userType.length) &&
          input &&
          idx === currentWordIdx
            ? 'bg-red-400 dark:bg-red-600'
            : ''}
        "
        >
          {word}
        </span>
      {/each}
    </p>

    <div class="flex items-center">
      {#if $showPrevOrNextWord}
        <p
          class="flex-none word-next text-gray-200 dark:text-gray-600 w-32 text-xl pt-4 pl-6 font-sarabun"
        >
          {sentence[currentWordIdx - 1] ?? ''}
        </p>
      {/if}
      <input
        class="input shadow-white dark:ring-offset-black border w-full font-sarabun shadow-lg rounded-lg border-gray-400 dark:border-gray-600 focus:ring-2
    ring-offset-2 ring-green-400 transition duration-200 {!currentWordSpellCheck
          ? 'bg-red-400 ring-red-400'
          : ''}"
        value={input}
        on:keydown={onType}
        placeholder={sentence[currentWordIdx]}
        data-testid="input"
        bind:this={typingInput}
      />
      {#if $showPrevOrNextWord}
        <p
          class="flex-none word-next text-gray-400 dark:text-gray-200 w-32 text-xl pt-4 pl-6 font-sarabun"
        >
          {sentence[currentWordIdx + 1] ?? ''}
        </p>
      {/if}
    </div>

    {#if $showKeymap}
      <Keymap {nextChar} />
    {/if}

    <button
      class="btn hover:bg-gray-300 active:bg-gray-400 ring-offset-white ring-gray-300 dark:hover:bg-gray-600 hover:ring-2 dark:ring-white ring-offset-2 dark:ring-offset-black rounded-lg transition duration-300 m-2 dark:text-white"
      on:click={reset}
    >
      Reset
    </button>

    <div class="lesson dark:text-white font-sarabun">
      Lesson: <span
        class="transition duration-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:ring-2 ring-offset-2 ring-offset-white ring-gray-300 dark:ring-white dark:ring-offset-black  p-2 cursor-pointer border border-gray-400 dark:text-white rounded-lg"
        on:click={() => (showLesson = true)}>{$currentLessonName}</span
      >
      {#if showLesson}
        <LessonModal
          closeModal={() => {
            showLesson = false
            reset()
          }}
        />
      {/if}
    </div>
    {#if showWpm}
      <div
        class="fixed z-10 inset-0 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-"
        >
          <div
            class="fixed fadein inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            on:click={close}
          >
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true"
              >&#8203;</span
            >
            <div
              class="popin inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div class="bg-white dark:bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="text-center sm:text-left">
                  <h1
                    class="text-4xl leading-6 font-medium text-gray-900 dark:text-gray-100 text-center"
                    id="modal-title"
                  >
                    You get {wpm} wpm
                  </h1>
                  <p class="mt-4 dark:text-gray-100">Lesson : {$currentLessonName}</p>
                  <div class="bg-white dark:bg-black px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-400 text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-black focus:ring-green-300 sm:ml-3 sm:w-auto sm:text-sm"
                      on:click={close}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
    <Footer bind:showMenu bind:showChangelog />

    {#if showMenu}
      <Modal
        closeModal={() => (showMenu = false)}
        bind:showKeymap={$showKeymap}
        bind:showPrevOrNextWord={$showPrevOrNextWord}
        bind:TabToRestart={$TabToRestart}
        bind:DarkMode={$DarkMode}
        bind:GlowKey={$GlowKey}
        bind:showLogo={$ShowLogo}
        bind:EscToSetting={$EscToSetting}
      />
    {/if}

    {#if showChangelog}
      <Changelog closeModal={() => (showChangelog = false)} />
    {/if}
  </main>
</body>

<Kofi name="narze" />
