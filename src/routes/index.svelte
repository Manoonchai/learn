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
  let selectedLesson
  let lessons = [
    {
      name: '1. น ม อ า',
      words: ['นม', 'อา', 'นานา', 'นา', 'มา', 'นอ', 'อม', 'มน', 'มอ', 'นอน', 'ออม', 'มอม', 'อาม'],
    },
    {
      name: '2. ร',
      words: ['รอ', 'รา', 'ราม', 'อร', 'มาร', 'รม', 'รอน'],
    },
    {
      name: '3. เ- (สระเอ)',
      words: ['เรา', 'เอา', 'เอ', 'เร', 'เม', 'เน', 'เออ', 'เมา', 'เรน', 'เอน', 'เมน'],
    },
    {
      name: '4. ง',
      words: [
        'งาน',
        'มอง',
        'เอง',
        'นาง',
        'รอง',
        'งาม',
        'งง',
        'เงา',
        'งา',
        'ราง',
        'อง',
        'งอ',
        'งอน',
      ],
    },
    {
      name: '5. -่ (ไม้เอก)',
      words: [
        'น่า',
        'อ่าน',
        'ร่าง',
        'อ่อน',
        'เร่ง',
        'เอ่อ',
        'ร่า',
        'เน่า',
        'ร่ม',
        'ม่าน',
        'อ่าง',
        'ม่า',
        'น่าน',
        'ร่อง',
      ],
    },
    {
      name: '6. -้ (ไม้โท)',
      words: [
        'ร้าน',
        'น้อง',
        'ร้อน',
        'เน้น',
        'ร้อง',
        'อ้าง',
        'ม้า',
        'น้า',
        'อ้อม',
        'อ้อ',
        'อ้า',
        'เร้า',
        'เอ้า',
        'อ้น',
        'ร้าง',
        'เอ้อ',
      ],
    },
    {
      name: '7. ว',
      words: [
        'ว่า',
        'ร่วม',
        'รวม',
        'วาง',
        'วง',
        'ราว',
        'วา',
        'ว่าง',
        'อ้าว',
        'อ้วน',
        'ร่วง',
        'วร',
        'วน',
        'วาน',
        'เว้น',
        'ม่วง',
        'เวร',
        'เอว',
        'เว',
        'ว่างงาน',
        'ม้วน',
        'ง่วง',
        'วอน',
        'อ่าว',
        'เวน',
        'วรา',
      ],
    },
    {
      name: '8. -ื (สระอือ)',
      words: [
        'เรื่อง',
        'เมื่อ',
        'อื่น',
        'เมือง',
        'มือ',
        'เรือ',
        'เนื้อ',
        'เรื่องราว',
        'เรือน',
        'ร่วมมือ',
        'มื้อ',
        'เนื่อง',
        'อืม',
        'เอื้อ',
        'เอื้อม',
        'รื้อ',
        'เอาเรื่อง',
        'อือ',
        'เรือง',
        'เนื้อเรื่อง',
      ],
    },
  ]

  $: if (selectedLesson?.words) {
    words = selectedLesson.words
    reset()
  }
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

  <div class="sentence">
    Lesson:
    <select class="input mt-4 border" bind:value={selectedLesson}>
      {#each lessons as lesson, idx}
        <option value={lesson} selected={!idx}>
          {lesson.name}
        </option>
      {/each}
    </select>
  </div>
</main>
