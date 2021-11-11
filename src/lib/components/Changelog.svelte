<script lang="ts">
  export let closeModal: () => void
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
    <div class="fixed inset-0 fadein bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" on:click={() => closeModal()} />

    <!-- This element is to trick the browser into centering the modal contents. -->
    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true" 
      >&#8203;</span
    >
    <div
      class="popin inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
    >
    <div class="bg-white dark:bg-black px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div class="flex flex-col gap-6 text-center sm:text-left">
        <div>
          <h3
            class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
            id="modal-title"
          >
            v1.1.0
          </h3>
          <div class="flex flex-col mt-4 w-full justify-between">
            <p class="text-sm text-gray-500 dark:text-white" />
            <div class="text-sm text-gray-500 dark:text-white">
              <ul class="list-disc pl-4">
                <li>Dark Mode</li>
                <li>Show Previous or Next word</li>
                <li>Press Tab to Restart</li>
                <li>Enable Dark mode</li>
                <li>Glowing keys</li>
              </ul>
            </div>
            <p class="text-sm text-gray-500 dark:text-white">
              Thanks <a
                href="https://github.com/tinvv"
                target="_blank"
                rel="noreferrer"
                class="underline">@tinvv</a
              >!
            </p>
          </div>
        </div>
        <div>
          <h3
            class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
            id="modal-title"
          >
            v1.0.0
          </h3>
          <div class="flex flex-col mt-4 w-full justify-between">
            <p class="text-sm text-gray-500 dark:text-white">First version ever! 🎉</p>
            <div class="text-sm text-gray-500 dark:text-white">
              <ul class="list-disc pl-4">
                <li>Add basic Manoonchai lessons.</li>
                <li>Show / hide Manoonchai keymap with next character highlight.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-400 text-base font-medium text-white hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-black focus:ring-green-300 sm:ml-3 sm:w-auto sm:text-sm"
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
