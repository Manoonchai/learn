<script lang="ts">
  export let closeModal: () => void
  export let showKeymap: boolean
  export let showPrevOrNextWord: boolean
  export let showLogo: boolean
  export let TabToRestart: boolean
  export let DarkMode: boolean
  export let GlowKey: boolean
  export let EscToSetting: boolean
  export let wordCount: number
</script>

<div
  aria-labelledby="modal-title"
  aria-modal="true"
  class="fixed z-10 inset-0 overflow-y-auto"
  role="dialog"
>
  <div
    class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
  >
    <div
      aria-hidden="true"
      class="fixed fadein inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      on:click={() => closeModal()}
    />

    <!-- This element is to trick the browser into centering the modal contents. -->
    <span aria-hidden="true" class="hidden sm:inline-block sm:align-middle sm:h-screen"
      >&#8203;</span
    >
    <div
      class="popin inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
    >
      <div class="bg-white dark:bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="text-center sm:text-left">
          <h3
            class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100"
            id="modal-title"
          >
            ⚙Settings
          </h3>
          <div class="flex flex-col gap-3 mt-4 w-full justify-between">
            <h1
              class="dark:text-white tracking-wider text-center border-b border-gray-300 pb-2 text-3xl"
            >
              Style
            </h1>
            <div class="text-sm text-gray-500 dark:text-white">
              <span class="text-sm text-gray-500 dark:text-white">Show Keymap</span>
              <input
                bind:checked={showKeymap}
                class="scale-150 absolute right-4 checked:bg-blue-600 ml-2 checked:border-transparent"
                type="checkbox"
              />
            </div>
            <div class="text-sm text-gray-500">
              <span class="text-sm text-gray-500 dark:text-white">Show Previous or Next word</span>
              <input
                bind:checked={showPrevOrNextWord}
                class="scale-150 absolute right-4 checked:bg-blue-600 ml-2 checked:border-transparent"
                type="checkbox"
              />
            </div>
            <div class="text-sm text-gray-500">
              <span class="text-sm text-gray-500 dark:text-white">Show Manoonchai Logo</span>
              <input
                type="checkbox"
                class="scale-150 absolute right-4 checked:bg-blue-600 ml-2 checked:border-transparent"
                bind:checked={showLogo}
              >
            </div>
           <div class="text-sm text-gray-500">
              <span class="text-sm text-gray-500 dark:text-white">Press Esc to show setting</span>
              <input
                bind:checked={showLogo}
                class="scale-150 absolute right-4 checked:bg-blue-600 ml-2 checked:border-transparent"
                type="checkbox"
              />
            </div>
            <div class="text-sm text-gray-500">
              <span class="text-sm text-gray-500 dark:text-white">Enable Dark mode</span>
              <input
                bind:checked={DarkMode}
                class="scale-150 absolute right-4 checked:bg-blue-600 ml-2 checked:border-transparent"
                type="checkbox"
              />
            </div>
            <div class="text-sm text-gray-500">
              <span class="text-sm text-gray-500 dark:text-white"
                >Glowing keys (Better with dark mode)</span
              >
              <input
                bind:checked={GlowKey}
                class="scale-150 absolute right-4 checked:bg-blue-600 ml-2 checked:border-transparent"
                type="checkbox"
              />
            </div>
            <h1
              class="dark:text-white tracking-wider text-center border-b border-gray-300 pb-2 text-3xl"
            >
              Features
            </h1>
            <div class="text-sm text-gray-500">
              <span class="text-sm text-gray-500 dark:text-white">Press Esc to show setting</span>
              <input
                bind:checked={EscToSetting}
                class="scale-150 absolute right-4 checked:bg-blue-600 ml-2 checked:border-transparent"
                type="checkbox"
              />
            </div>
            <div class="text-sm text-gray-500">
              <span class="text-sm text-gray-500 dark:text-white">Press Tab to Restart</span>
              <input
                bind:checked={TabToRestart}
                class="scale-150 absolute right-4 checked:bg-blue-600 ml-2 checked:border-transparent"
                type="checkbox"
              />
            </div>
            <div class="text-sm text-gray-500">
              <span class="text-sm text-gray-500 dark:text-white">Word Count</span>
              <input
                bind:value={wordCount}
                class="absolute right-4 ml-2"
                max="100"
                min="0"
                type="range"
              />
              ({wordCount} words)
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-400 text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-black focus:ring-green-300 sm:ml-3 sm:w-auto sm:text-sm"
          on:click={() => {
            closeModal()
          }}
          type="button"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</div>
