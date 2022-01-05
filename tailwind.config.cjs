const config = {
  content: ['./src/**/*.{html,js,svelte,ts,css}'],
  darkMode: 'class',
  theme: {
    extend: {
      width: {
        50: '12.5rem',
        70: '17.5rem',
        100: '25rem',
      },
      ringWidth: ['hover', 'active'],
    },
  },

  plugins: [],
}

module.exports = config
