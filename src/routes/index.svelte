<script lang="ts">
  import { onMount } from 'svelte'
  import { calculateWpm } from '$lib/wpm'
  import { spellcheck } from '$lib/spellcheck'
  import { nextchar } from '$lib/nextchar'
  import { lessons } from '$lib/lesson'
  import Manoonchai from '$lib/manoonchai'
  import Keymap from '$lib/components/Keymap.svelte'
  import Kofi from '$lib/components/Kofi.svelte'

  let name = 'Manoonchai'
  let input
  let typingInput: HTMLInputElement

  export let words = []
  export let testMode = false

  let currentLesson = lessons[0]
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

  function changeLesson(lesson) {
    words = lesson.words || []
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
    if (!testMode) {
      words = currentLesson.words
    }

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

  <Keymap {nextChar} />

  <button class="btn hover:bg-gray-200 rounded-lg transition duration-300" on:click={reset}>
    Reset
  </button>

  <div class="lesson font-sarabun">
    Lesson:
    <select
      class="input mt-4 border font-sarabun appearance-none border-gray-400 rounded-lg focus:ring-2
      ring-offset-2 ring-gray-400 transition duration-200"
    >
      on:change={(e) => changeLesson(e.currentTarget.value)}
      > >
      {#each lessons as lesson, idx}
        <option value={lesson} class="text-center" selected={!idx}>{lesson.name}</option>
      {/each}
    </select>
  </div>
</main>

<Kofi name="narze" />
