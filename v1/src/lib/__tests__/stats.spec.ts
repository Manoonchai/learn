import Stats from '../stats'

function bySecondToArray(hash: Record<number, number>) {
  const len = Math.max(...Object.keys(hash).map((a) => +a)) + 1

  return new Array(len).fill(0).map((_, i) => hash[i] || 0)
}

it('works', () => {
  expect(Stats).toBeDefined()
})

it('receives keystroke & timestamp', () => {
  const stats = new Stats()
  stats.addKeystroke('a', 1)
  expect(stats.data().keystrokes).toEqual(['a'])
  expect(stats.data().timestamps).toEqual([1])
})

describe('wpmBySecond', () => {
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
    expect(data.wpmBySecond).toEqual({ 0: 60, 1: 12, 3: 120 })
    expect(bySecondToArray(data.wpmBySecond)).toEqual([60, 12, 0, 120])
  })

  it('calculates with startTimestamp as offset', () => {
    const stats = new Stats()

    const offset = 1234

    stats.start(offset)

    // 0: 1 wps -> 60 wpm
    stats.addKeystroke('a', 0 + offset)
    stats.addKeystroke('b', 100 + offset)
    stats.addKeystroke('c', 500 + offset)
    stats.addKeystroke('d', 998 + offset)
    stats.addKeystroke('e', 999 + offset)

    // 1: 0.2 wps -> 12 wpm
    stats.addKeystroke('f', 1000 + offset)

    // 3: 2 wps -> 120 wpm
    new Array(10).fill(3500).forEach((ms) => {
      stats.addKeystroke('f', ms + offset)
    })

    const data = stats.data()
    expect(data.wpmBySecond).toEqual({ 0: 60, 1: 12, 3: 120 })
    expect(bySecondToArray(data.wpmBySecond)).toEqual([60, 12, 0, 120])
  })

  it('can be added up', () => {
    const stats = new Stats()

    stats.addKeystroke('a', 0)

    expect(stats.data().wpmBySecond).toEqual({ 0: 12 })

    stats.addKeystroke('b', 1)

    expect(stats.data().wpmBySecond).toEqual({ 0: 24 })

    stats.addKeystroke('c', 1000)

    expect(stats.data().wpmBySecond).toEqual({ 0: 24, 1: 12 })

    stats.addKeystroke('d', 1001)

    expect(stats.data().wpmBySecond).toEqual({ 0: 24, 1: 24 })
  })
})

describe('wpmStats', () => {
  it('is calculated from accumulating wpmBySecond', () => {
    const stats = new Stats()

    stats.addKeystroke('a', 0)
    expect(stats.data().wpmStats).toEqual([12])

    stats.addKeystroke('b', 1)
    expect(stats.data().wpmStats).toEqual([24])

    stats.addKeystroke('c', 1000)
    expect(stats.data().wpmStats).toEqual([24, (24 + 12) / 2])

    stats.addKeystroke('d', 1001)
    expect(stats.data().wpmStats).toEqual([24, (24 + 24) / 2])

    stats.addKeystroke('e', 1002)
    expect(stats.data().wpmStats).toEqual([24, (24 + 36) / 2])

    stats.addKeystroke('f', 2000)
    expect(stats.data().wpmStats).toEqual([24, (24 + 36) / 2, (24 + 36 + 12) / 3])

    stats.addKeystroke(' ', 2022)
    expect(stats.data().wpmStats).toEqual([24, (24 + 36) / 2, (24 + 36 + 24) / 3])

    stats.addKeystroke(' ', 4000)
    expect(stats.data().wpmStats).toEqual([
      24,
      (24 + 36) / 2,
      (24 + 36 + 24) / 3,
      (24 + 36 + 24 + 0) / 4,
      (24 + 36 + 24 + 0 + 12) / 5,
    ])
  })
})
