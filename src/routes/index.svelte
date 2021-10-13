<script lang="ts">
	let name = 'Manoonchai';
	let input;
	const words = ['นม', 'อา', 'นานา', 'นา', 'มา', 'นอ', 'อม', 'มน', 'มอ', 'นอน', 'ออม', 'มอม', "อาม"];
  let result = []
  let currentWordIdx = 0

	const sentence = Array(30)
		.fill(null)
		.map(() => words[Math.floor(Math.random() * words.length)]);

  function onType(e) {
    // console.log(e)

    if (e.key === " ") {
      e.preventDefault();

      if (input) {
        if (sentence[currentWordIdx] === input) {
          result = result.concat(true)
        } else {
          result = result.concat(false)
        }

        currentWordIdx += 1
        input = ""
      }
    }
  }
</script>

<main class="container min-h-screen mx-auto flex flex-col gap-2 justify-center items-center">
	<h1 class="text-6xl text-green-400 flex flex-col">Hello {name}</h1>
  <p>
    {#each sentence as word, idx}
      <span class="mx-1
        {idx === currentWordIdx ? "bg-green-300" : ""}
        {result[idx] === true ? "text-green-400": ""}
        {result[idx] === false ? "text-red-600": ""}">{word}</span>
    {/each}
  </p>
	<input class="border w-2/6" bind:value={input} on:keypress={onType} />
</main>
