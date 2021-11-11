<script lang="ts">
  import { onMount } from 'svelte'
  import { calculateWpm } from '$lib/wpm'
  import { spellcheck } from '$lib/spellcheck'
  import { nextchar } from '$lib/nextchar'
  import { lessons } from '$lib/lesson'
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
    currentLessonName,
    TabToRestart,
    DarkMode,
    GlowKey,
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
    reset()
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
    e.preventDefault()

    if (ended) {
      return
    }

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
    e.preventDefault()
    if (e.key === 'Tab') {
      if ($TabToRestart === true) {
        reset()
      } else {
        return
      }
    }
  }

  function end() {
    ended = true
    clearInterval(interval)
    alert(`Good job! Your speed is ${wpm} wpm`)
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

<body class={$DarkMode ? 'dark' : ''}>
  <main
    class="main container min-h-screen mx-auto flex dark:bg-black flex-col gap-2 justify-center items-center py-20"
  >
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
      class="btn hover:bg-gray-600 rounded-lg transition duration-300 m-2 dark:text-white"
      on:click={reset}
    >
      Reset
    </button>

    <div class="lesson dark:text-white font-sarabun">
      Lesson: <span
        class="p-2 cursor-pointer border border-gray-400 dark:text-white rounded-lg"
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
    <Footer bind:showMenu bind:showChangelog />

    {#if showMenu}
      <Modal
        closeModal={() => (showMenu = false)}
        bind:showKeymap={$showKeymap}
        bind:showPrevOrNextWord={$showPrevOrNextWord}
        bind:TabToRestart={$TabToRestart}
        bind:DarkMode={$DarkMode}
        bind:GlowKey={$GlowKey}
      />
    {/if}

    {#if showChangelog}
      <Changelog closeModal={() => (showChangelog = false)} />
    {/if}
  </main>
</body>

<Kofi name="narze" />
