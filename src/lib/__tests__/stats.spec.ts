import Stats from '../stats'

it('works', () => {
  expect(Stats).toBeDefined()
})

it('receives keystroke & timestamp', () => {
  const stats = new Stats()
  stats.addKeystroke('a', 1)
  expect(stats.data().keystrokes).toEqual(['a'])
  expect(stats.data().timestamps).toEqual([1])
})

it('calculates wpm history for each second of typing', () => {
  // 0-999 milliseconds, 5 characters -> 1 wpm
  const stats = new Stats()

  // 0: 1 wps -> 60 wpm
  stats.addKeystroke('a', 0)
  stats.addKeystroke('b', 100)
  stats.addKeystroke('c', 500)
  stats.addKeystroke('d', 998)
  stats.addKeystroke('e', 999)

  // 1: 0.2 wps -> 12 wpm
  stats.addKeystroke('f', 1000)

  // 3: 2 wps -> 120 wpm
  new Array(10).fill(3500).forEach((ms) => {
    stats.addKeystroke('f', ms)
  })

  const data = stats.data()
  expect(data.wpmBySecond).toEqual([60, 12, 0, 120])
})
