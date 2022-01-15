export default class Stats {
  private keystrokes: string[] = []
  private timestamps: number[] = []
  private wpmBySecond: Record<number, number> = {}
  private wpmStats: number[] = []
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

  private calculateRawWpmBySecond() {
    if (!this.timestamps.length) {
      return
    }

    const startSecond = Object.keys(this.wpmBySecond).length - 1

    const calculatingTimestamps = []

    for (let i = this.timestamps.length - 1; i >= 0; i--) {
      const timestamp = this.timestamps[i]

      if (timestamp >= startSecond * 1000) {
        const secondIdx = Math.floor(timestamp / 1000)
        delete this.wpmBySecond[secondIdx]

        calculatingTimestamps.push(timestamp)
      } else {
        break
      }
    }

    calculatingTimestamps.forEach((timestamp) => {
      const secondIdx = Math.floor(timestamp / 1000)
      this.wpmBySecond[secondIdx] ||= 0
      this.wpmBySecond[secondIdx] += 12 // c * 60 / 5
    })

    return this.wpmBySecond
  }

  private calculateWpmStats() {
    if (!this.timestamps.length) {
      return
    }

    let i = Math.max(this.wpmStats.length - 1, 0)
    const end = Math.floor(this.timestamps.slice(-1)[0] / 1000)

    for (; i <= end; i++) {
      const wpmUntilLastSecond = this.wpmStats[i - 1] || 0
      const wpmCurrentSecond = this.wpmBySecond[i] || 0

      this.wpmStats[i] = (wpmUntilLastSecond * i + wpmCurrentSecond) / (i + 1)
    }
  }

  public data() {
    this.calculateRawWpmBySecond()
    this.calculateWpmStats()

    return {
      keystrokes: this.keystrokes,
      timestamps: this.timestamps,
      wpmBySecond: this.wpmBySecond,
      wpmStats: this.wpmStats,
    }
  }
}

// export default Stats
