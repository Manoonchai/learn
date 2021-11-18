import store from '../store'

describe('store', () => {
  it('is an object with multiple stores', () => {
    expect(store).toBeInstanceOf(Object)

    expect(store.showKeymap).toBeDefined()
    expect(store.showPrevOrNextWord).toBeDefined()
    expect(store.EscToSetting).toBeDefined()
    expect(store.TabToRestart).toBeDefined()
    expect(store.DarkMode).toBeDefined()
    expect(store.GlowKey).toBeDefined()
    expect(store.currentLessonName).toBeDefined()
  })

  describe('showKeymap', () => {
    it('has default value', (done) => {
      store.showKeymap.subscribe((value) => {
        expect(value).toEqual(true)
        done()
      })
    })
  })

  describe('showPrevOrNextWord', () => {
    it('has default value', (done) => {
      store.showPrevOrNextWord.subscribe((value) => {
        expect(value).toEqual(true)
        done()
      })
    })
  })

  describe('EscToSetting', () => {
    it('has default value', (done) => {
      store.EscToSetting.subscribe((value) => {
        expect(value).toEqual(true)
        done()
      })
    })
  })

  describe('TabToRestart', () => {
    it('has default value', (done) => {
      store.TabToRestart.subscribe((value) => {
        expect(value).toEqual(true)
        done()
      })
    })
  })

  describe('DarkMode', () => {
    it('has default value', (done) => {
      store.DarkMode.subscribe((value) => {
        expect(value).toEqual(false)
        done()
      })
    })
  })
  describe('GlowKey', () => {
    it('has default value', (done) => {
      store.GlowKey.subscribe((value) => {
        expect(value).toEqual(false)
        done()
      })
    })
  })

  describe('currentLessonName', () => {
    it('has default value', (done) => {
      store.currentLessonName.subscribe((value) => {
        expect(value).toEqual(undefined)
        done()
      })
    })
  })
})
