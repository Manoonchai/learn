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
  import Changelog from '$lib/components/Changelog.svelte'
  import { showKeymap, currentLessonName } from '$lib/store'

  let name = 'Manoonchai'
  let input
  let typingInput: HTMLInputElement

  let words = []
  let currentLesson
  let result
  let currentWordIdx
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
    if (!currentLesson) {
      if ($currentLessonName) {
        currentLesson = lessons.find((l) => l.name === $currentLessonName) || lessons[0]
      } else {
        currentLesson = lessons[0]
      }
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

<main class="container min-h-screen mx-auto flex flex-col gap-2 justify-center items-center py-20">
  <h1 class="title font-sarabun text-green-400 flex flex-col">Learn {name}</h1>

  <p class="stat">{wpm} wpm</p>
  <p class="sentence">
    {#each sentence as word, idx (idx)}
      <span
        class="sentence-gap font-sarabun transition duration-200 break-word {idx === currentWordIdx
          ? 'bg-green-300'
          : ''}
        {result[idx] === true ? 'text-green-400' : ''}
        {result[idx] === false ? 'text-red-600' : ''}
        {sentence[currentWordIdx] &&
        userType.join('') !== sentence[currentWordIdx].slice(0, userType.length) &&
        input &&
        idx === currentWordIdx
          ? 'bg-red-300'
          : ''}
        "
      >
        {word}
      </span>
    {/each}
  </p>

  <input
    class="input border w-32 font-sarabun shadow-lg rounded-lg border-gray-400 focus:ring-2
    ring-offset-2 ring-green-400 transition duration-200 {!currentWordSpellCheck
      ? 'bg-red-400 ring-red-400'
      : ''}"
    value={input}
    on:keydown={onType}
    placeholder={sentence[currentWordIdx]}
    data-testid="input"
    bind:this={typingInput}
  />

  {#if $showKeymap}
    <Keymap {nextChar} />
  {/if}

  <button class="btn hover:bg-gray-200 rounded-lg transition duration-300" on:click={reset}>
    Reset
  </button>

  <div class="lesson font-sarabun">
    Lesson:
    <select
      class="input mt-4 border font-sarabun appearance-none border-gray-400 rounded-lg focus:ring-2
      ring-offset-2 ring-gray-400 transition duration-200"
      bind:value={currentLesson}
    >
      {#each lessons as lesson, idx}
        <option value={lesson} class="text-center" selected={lesson.name === $currentLessonName}
          >{lesson.name}</option
        >
      {/each}
    </select>
  </div>
  <Footer bind:showMenu bind:showChangelog />

  {#if showMenu}
    <Modal closeModal={() => (showMenu = false)} bind:showKeymap={$showKeymap} />
  {/if}

  {#if showChangelog}
    <Changelog closeModal={() => (showChangelog = false)} />
  {/if}
</main>

<Kofi name="narze" />
