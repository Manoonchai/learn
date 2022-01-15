export default class Stats {
  private keystrokes: string[] = []
  private timestamps: number[] = []
  private wpmBySecond: number[] = []
  private startTimestamp = 0

  constructor() {}

  public start(startTimestamp: number) {
    this.startTimestamp = startTimestamp
  }

  // Add keystroke & timestamp array
  public addKeystroke(keystroke, timestamp) {
    this.keystrokes.push(keystroke)
    this.timestamps.push(timestamp - this.startTimestamp)
  }

  public calculateRawWpmBySecond() {
    if (!this.timestamps.length) {
      return 0
    }

    const seconds = Math.ceil(this.timestamps.slice(-1)[0] / 1000)
    const wpmBySecond: number[] = new Array(seconds).fill(0)

    this.timestamps.forEach((timestamp) => {
      // 0 - 999 > index 0
      // 1000 - 1999 > index 1
      // and so on...
      const secondIdx = Math.floor(timestamp / 1000)
      wpmBySecond[secondIdx] += 1
    })

    return wpmBySecond.map((k) => (k * 60) / 5)
  }

  public data() {
    return {
      keystrokes: this.keystrokes,
      timestamps: this.timestamps,
      wpmBySecond: this.calculateRawWpmBySecond(),
    }
  }
}

// export default Stats
