<script lang="ts">
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
    ShowLogo,
    currentLessonName,
    DarkMode,
    GlowKey,
    showKeymap,
    EscToSetting,
    showPrevOrNextWord,
    TabToRestart,
    wordCount,
  } from '$lib/store'
  import Chart from 'chart.js/auto/auto.esm'

  let name = 'Manoonchai'
  let input

  let result
  let nextChar
  let currentWordIdx
  let currentCharIdx
  let currentLesson
  let sentence
  let ended
  let started
  let elapsed
  let startTime
  let interval
  let typeInterval
  let chart
  let ctx
  let chartCanvas: HTMLCanvasElement
  let keyGraph = {}
  let correctWords = []
  let userType = []
  let userCharInput = []
  let words = []
  let currentWordSpellCheck = true
  let showMenu = false
  let showLesson = false
  let showChangelog = false
  let showWpm = false

  reset()

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
    } else {
      startTime = new Date().getTime()
    }

    if (interval) {
      clearInterval(interval)
    }

    interval = setInterval(() => {
      elapsed = (new Date().getTime() - startTime) / 1000
    }, 500)

    typeInterval = setInterval(() => {
      keyGraph[Math.trunc(elapsed).toString() + ` second${elapsed <= 2 ? '' : 's'}`] = {
        input: userCharInput,
        wpm: wpm,
      }
      userCharInput = []
    }, 1000)

    started = true
  }

  function onType(e: KeyboardEvent) {
    !result[currentWordIdx] ? (result[currentWordIdx] = []) : ''

    if (!e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
    }

    if (ended) return

    const manoonchaiKey = Manoonchai[e.code]?.[e.shiftKey ? 1 : 0] || ''

    start()

    if (e.key === 'Backspace' || e.key === 'Delete') {
      userType.pop()
      currentCharIdx -= 1
      result[currentWordIdx].pop()
    } else if (manoonchaiKey.length === 1) {
      userType.push(manoonchaiKey)
    }

    input = userType.join('').trimEnd()

    if (currentCharIdx < sentence[currentWordIdx].length && currentCharIdx < input.length) {
      currentCharIdx += 1
    }

    userCharInput.push(e.key)

    if (
      sentence[currentWordIdx][currentCharIdx - 1] === input[currentCharIdx - 1] &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== ' '
    ) {
      result[currentWordIdx].push(true)
    } else if (
      sentence[currentWordIdx][currentCharIdx - 1] !== input[currentCharIdx - 1] &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      e.key !== ' '
    ) {
      result[currentWordIdx].push(false)
    }

    if (e.key === ' ') {
      userType = []
      userCharInput = []

      if (input) {
        if (sentence[currentWordIdx] === input) {
          correctWords = correctWords.concat(input)
        } else {
          correctWords = correctWords.concat('')
        }
        if (currentWordIdx + 1 < sentence.length) {
          document.getElementById((currentWordIdx + 1).toString()).scrollIntoView()
        }

        currentWordIdx += 1
        currentCharIdx = 0
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
    showWpm = false
    userType = []
    result = []
    currentWordIdx = 0
    currentCharIdx = 0

    sentence = Array($wordCount)
      .fill(null)
      .map(() => words[Math.floor(Math.random() * words.length)] || '')
    startTime = new Date().getTime()
    correctWords = []
    input = ''
    clearInterval(typeInterval)
  }

  window.onkeydown = (e) => {
    onType(e)

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
    clearInterval(typeInterval)
  }

  function createCanvas(node) {
    chartCanvas = node
    ctx = chartCanvas.getContext('2d')
    chart = {
      type: 'line',
      data: {
        labels: [...Object.keys(keyGraph)],
        datasets: [
          {
            label: 'Wpm',
            data: [...Object.values(keyGraph).map((v) => Number(v.wpm))],
            lineTension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: 'blue',
            backgroundColor: '',
            borderColor: 'blue',
            yAxisID: 'wpm',
            order: 2,
            radius: 2,
          },
        ],
      },
      options: {
        interaction: {
          intersect: false,
          mode: 'index',
        },
      },
    }
    new Chart(ctx, chart)
    return
  }
</script>

<svelte:head>
  <title>Learn Manoonchai</title>
  <meta content="width=device-width, initial-scale=1.0" name="viewport" />

  <meta content="https:/learn.manoonchai.com/" property="og:url" />
  <meta content="website" property="og:type" />
  <meta content="Learn manoonchai" property="og:title" />
  <meta content="เรียนรู้แป้นพิมพ์มนูญชัยแบบง่ายๆ" property="og:description" />
  <meta content="Learn manoonchai" name="twitter:title" />
  <meta content="summary_large_image" name="twitter:card" />
  <meta content="#607D8B" id="metaThemeColor" name="theme-color" />
  <meta
    content="manoonchai , learn-manoonchai , learn manoonchai , manoonchai layout , manoonchai keyboard layout , thai manoonchai layout , th manoonchai layout , มนูญชัย , แป้นพิมพ์มนูญชัย , เรียนมนูญชัย , ฝึกมนูญชัย , ฝึกพิมพ์มนูญชัย"
    name="keywords"
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

    {#if !showWpm}
      <p class="stat">{wpm} wpm</p>
      <p class="sentence overflow-y-scroll max-h-64">
        {#each sentence as word, wordIdx}
          <span
            class="sentence-gap font-sarabun dark:text-white transition duration-200 break-word {currentWordIdx +
              1 <=
              sentence.length &&
            userType[userType.length - 1] !== sentence[currentWordIdx][userType.length - 1]
              ? 'text-red-500'
              : ''}"
            id={wordIdx}
          >
            {#each word.split('') as letter, idx (idx)}
              <span
                class="
            {idx === currentCharIdx && wordIdx === currentWordIdx
                  ? 'underline underline-offset-4 decoration-2'
                  : ''}
            {result[wordIdx] && currentWordIdx + 1 <= sentence.length
                  ? result[wordIdx][idx] === true
                    ? 'text-green-500'
                    : ''
                  : ''}
            {result[wordIdx] && currentWordIdx + 1 <= sentence.length
                  ? result[wordIdx][idx] === false
                    ? 'text-red-500'
                    : ''
                  : ''}
            "
              >
                {letter}
              </span>
            {/each}
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
    {:else if showWpm}
      <div class="flex flex-row gap-x-4">
        <div class="flex-col self-center">
          <h3 class="text-gray-500 dark:text-gray-400 text-md">WPM:</h3>
          <h1 class="text-3xl dark:text-white text-black">{wpm}</h1>
        </div>
        <div class="relative">
          <canvas use:createCanvas height="400" width="400" />
        </div>
      </div>
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
    <Footer bind:showChangelog bind:showMenu />

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
        bind:wordCount={$wordCount}
      />
    {/if}

    {#if showChangelog}
      <Changelog closeModal={() => (showChangelog = false)} />
    {/if}
  </main>
</body>

<Kofi name="narze" />
