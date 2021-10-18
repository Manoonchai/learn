<script lang="ts">
  import { calculateWpm } from '$lib/wpm'

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

  reset()

  function start() {
    if (started) {
      return
    }

    interval = setInterval(() => {
      elapsed = (new Date().getTime() - startTime) / 1000
    }, 1000)

    started = true
  }

  function onType(e) {
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
  }

  function end() {
    ended = true
    clearInterval(interval)
    alert('Good job!')
  }
</script>

<main class="container min-h-screen mx-auto flex flex-col gap-2 justify-center items-center">
  <h1 class="text-6xl text-green-400 flex flex-col">Hello {name}</h1>

  <!-- <p>Started : {started}</p>
  <p>Ended : {ended}</p> -->

  <p>{calculateWpm(correctWords, elapsed).toFixed(1)} wpm</p>
  <p>
    {#each sentence as word, idx}
      <span
        class="mx-1
        {idx === currentWordIdx ? 'bg-green-300' : ''}
        {result[idx] === true ? 'text-green-400' : ''}
        {result[idx] === false ? 'text-red-600' : ''}">{word}</span
      >
    {/each}
  </p>
  <input class="border w-2/6" bind:value={input} on:keypress={onType} data-testid="input" />
  <button class="border px-4 py-1 rounded hover:bg-gray-200" on:click={reset}>Reset</button>
</main>
