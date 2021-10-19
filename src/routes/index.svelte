<script lang="ts">
  import { calculateWpm } from '$lib/wpm'
  import { spellcheck } from '$lib/spellcheck'

  let name = 'Manoonchai'
  let input
  export let words = [
    'นม',
    'อา',
    'นานา',
    'นา',
    'มา',
    'นอ',
    'อม',
    'มน',
    'มอ',
    'นอน',
    'ออม',
    'มอม',
    'อาม',
  ]
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

  $: wpm = calculateWpm(correctWords, elapsed).toFixed(1)
  $: {
    const currentWord = sentence[currentWordIdx]
    const currentInput = input

    currentWordSpellCheck = spellcheck(currentWord, currentInput)
  }

  reset()

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
    start()

    if (ended) {
      return e.preventDefault()
    }

    if (e.key === ' ') {
      e.preventDefault()

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
    started = false
    ended = false
    result = []
    currentWordIdx = 0
    sentence = Array(15)
      .fill(null)
      .map(() => words[Math.floor(Math.random() * words.length)])
    startTime = new Date().getTime()
    correctWords = []
    input = ''
  }

  function end() {
    ended = true
    clearInterval(interval)
    alert(`Good job! Your speed is ${wpm} wpm`)
  }
</script>

<main class="container min-h-screen mx-auto flex flex-col gap-2 justify-center items-center">
  <h1 class="title text-green-400 flex flex-col">
    Learn {name}
  </h1>

  <p class="stat">{wpm} wpm</p>
  <p class="sentence">
    {#each sentence as word, idx}
      <span
        class="sentence-gap
        {idx === currentWordIdx ? 'bg-green-300' : ''}
        {result[idx] === true ? 'text-green-400' : ''}
        {result[idx] === false ? 'text-red-600' : ''}">{word}</span
      >
    {/each}
  </p>
  <input
    class="input border w-2/6 {!currentWordSpellCheck ? 'bg-red-400' : ''}"
    bind:value={input}
    on:keydown={onType}
    data-testid="input"
  />
  <button class="btn hover:bg-gray-200" on:click={reset}>Reset</button>
</main>
