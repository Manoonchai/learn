<script lang="ts">
  export let closeModal: () => void
  import { fade, slide } from "svelte/transition";
  import { lessons } from '$lib/lessons'
  import { currentLessonName } from '$lib/store'
</script>

<div
  class="fixed z-10 inset-0 overflow-y-auto"
  aria-labelledby="modal-title"
  role="dialog"
  aria-modal="true"
>
  <div
    class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
  >
    <div
      aria-hidden="true"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
      transition:fade
      on:click={() => closeModal()}
    />

    <!-- This element is to trick the browser into centering the modal contents. -->
    <span aria-hidden="true" class="hidden sm:inline-block sm:align-middle sm:h-screen"
    >&#8203;</span
    >
    <div
      class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      transition:slide
    >
      <div class="bg-white dark:bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="text-center sm:text-left">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
            Lessons
          </h3>
          <h3
            class="absolute top-0 right-0 m-6 text-lg leading-6 text-white font-bold bg-red-500 px-3 py-1 cursor-pointer rounded-lg hover:bg-red-700"
            on:click={() => closeModal()}
          >
            x
          </h3>
          <div class="flex flex-col mt-4 max-h-screen justify-between overflow-scroll">
            <div class="text-sm text-gray-500">
              {#each lessons as lesson, idx}
                <p
                  class="text-center dark:text-white border-b py-2 hover:bg-gray-200 dark:hover:bg-gray-500 active:bg-gray-400 border-gray-400 dark:active:bg-gray-800 rounded-md cursor-pointer"
                  on:click={() => {
                    $currentLessonName = lesson.name
                    closeModal()
                  }}
                >
                  {lesson.name}
                </p>
              {/each}
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-400 text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 dark:ring-offset-black sm:ml-3 sm:w-auto sm:text-sm"
          on:click={() => {
            closeModal()
          }}
        >
          Done
        </button>
      </div>
    </div>
  </div>
</div>
