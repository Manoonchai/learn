const config = {
  mode: 'jit',
  purge: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      width: {
        50: '12.5rem',
        70: '17.5rem',
        100: '25rem',
      },
    },
  },

  plugins: [],
}

module.exports = config
