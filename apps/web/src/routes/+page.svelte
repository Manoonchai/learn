<script lang="ts">
  import {
    StatsTracker,
    buildDrill,
    buildTimeAttack,
    lessonByName,
    nextKey,
    resolveKey,
    TIME_ATTACK_SECONDS,
    TIME_ATTACK_BATCH,
    TIME_ATTACK_REFILL_AT,
    type DrillResult,
  } from "$lib/engine";
  import { settings, type Mode } from "$lib/state/settings.svelte";
  import Logo from "$lib/components/Logo.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import LiveReadout from "$lib/components/LiveReadout.svelte";
  import TypingFlow from "$lib/components/TypingFlow.svelte";
  import DrillTrack from "$lib/components/DrillTrack.svelte";
  import Keymap from "$lib/components/Keymap.svelte";
  import DrillSummary from "$lib/components/DrillSummary.svelte";
  import SettingsPanel from "$lib/components/SettingsPanel.svelte";
  import LessonPicker from "$lib/components/LessonPicker.svelte";
  import ModeSwitch from "$lib/components/ModeSwitch.svelte";

  // --- Drill state ---
  let drill = $state<string[]>([]);
  let wordIdx = $state(0);
  let input = $state("");
  let statuses = $state<(boolean | null)[]>([]);
  let started = $state(false);
  let finished = $state(false);
  let result = $state<DrillResult | null>(null);
  let liveWpm = $state(0);
  let liveAcc = $state(100);
  let liveRemaining = $state<number | null>(null);
  let deadline = 0;

  let stats = new StatsTracker();
  let tick: ReturnType<typeof setInterval> | undefined;
  let inputEl = $state<HTMLInputElement>();

  // --- UI state ---
  let showSettings = $state(false);
  let showLesson = $state(false);
  const dialogsOpen = $derived(showSettings || showLesson);

  // --- Derived view model ---
  const lesson = $derived(lessonByName(settings.currentLessonName));
  const timeAttack = $derived(settings.mode === "timeAttack");
  const target = $derived(drill[wordIdx] ?? "");
  const nextChar = $derived(nextKey(target, input));

  function newDrill() {
    stopTick();
    drill = timeAttack ? buildTimeAttack(TIME_ATTACK_BATCH) : buildDrill(lesson.words, settings.drillLength);
    wordIdx = 0;
    input = "";
    statuses = [];
    started = false;
    finished = false;
    result = null;
    liveWpm = 0;
    liveAcc = 100;
    liveRemaining = timeAttack ? TIME_ATTACK_SECONDS : null;
    deadline = 0;
    stats = new StatsTracker();
    queueMicrotask(() => inputEl?.focus());
  }

  function startTick() {
    stopTick();
    tick = setInterval(() => {
      const now = performance.now();
      const r = stats.build(now);
      liveWpm = r.netWpm;
      liveAcc = r.accuracy;
      if (timeAttack) {
        liveRemaining = Math.max(0, Math.ceil((deadline - now) / 1000));
        if (now >= deadline) finish();
      }
    }, 250);
  }
  function stopTick() {
    if (tick) clearInterval(tick);
    tick = undefined;
  }

  function start() {
    if (started) return;
    started = true;
    const now = performance.now();
    stats.start(now);
    if (timeAttack) deadline = now + TIME_ATTACK_SECONDS * 1000;
    startTick();
  }

  function commitWord() {
    const correct = input === target;
    statuses[wordIdx] = correct;
    stats.recordWord(target, correct, performance.now());
    wordIdx += 1;
    input = "";
    if (timeAttack) {
      if (drill.length - wordIdx <= TIME_ATTACK_REFILL_AT) {
        drill = [...drill, ...buildTimeAttack(TIME_ATTACK_BATCH)];
      }
      return; // Time Attack ends on the clock, never on a word count.
    }
    if (wordIdx >= drill.length) finish();
  }

  function finish() {
    stopTick();
    result = stats.build(performance.now());
    liveWpm = result.netWpm;
    liveAcc = result.accuracy;
    liveRemaining = timeAttack ? 0 : null;
    finished = true;
  }

  function onInputKeydown(e: KeyboardEvent) {
    if (e.metaKey || e.ctrlKey || e.altKey) return; // leave browser shortcuts alone
    if (finished) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (input.length) input = input.slice(0, -1);
      return;
    }
    if (e.key === " ") {
      e.preventDefault();
      if (!input.length) return; // ignore a leading space
      start();
      commitWord();
      return;
    }

    const char = resolveKey(e.code, e.shiftKey);
    if (!char) return; // unmapped key (arrows, F-keys, …)

    e.preventDefault();
    start();
    const correct = target[input.length] === char;
    stats.recordChar(correct, performance.now());
    input = input + char;
  }

  function onWindowKey(e: KeyboardEvent) {
    if (dialogsOpen || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") {
      e.preventDefault();
      showSettings = true;
      return;
    }
    if (finished) {
      // Tab (or Enter) restarts. Space is deliberately ignored so stray
      // keystrokes while the typist is still going don't dismiss the result.
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        newDrill();
      }
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      newDrill();
    }
  }

  function pickLesson(name: string) {
    settings.currentLessonName = name;
    newDrill();
  }

  function setMode(mode: Mode) {
    if (settings.mode === mode) return;
    settings.mode = mode;
    newDrill();
  }

  // Keep the typing surface focused whenever a drill is live and no dialog is up.
  $effect(() => {
    if (!finished && !dialogsOpen && inputEl) inputEl.focus();
  });

  // Build the first drill on mount.
  $effect(() => {
    if (drill.length === 0 && !finished) newDrill();
  });

  // Clean up the live ticker when the page unmounts.
  $effect(() => () => stopTick());
</script>

<svelte:head>
  <title>Learn Manoonchai — ฝึกพิมพ์แป้นมนูญชัย</title>
  <meta property="og:title" content="Learn Manoonchai" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://learn.manoonchai.com/" />
  <meta property="og:description" content="เรียนรู้แป้นพิมพ์มนูญชัยแบบง่ายๆ ทีละบท" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta
    name="keywords"
    content="manoonchai, learn manoonchai, มนูญชัย, แป้นพิมพ์มนูญชัย, ฝึกพิมพ์มนูญชัย, เรียนมนูญชัย"
  />
</svelte:head>

<svelte:window onkeydown={onWindowKey} />

<div class="flex min-h-svh flex-col">
  <header class="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
    <Logo />
    <div class="flex items-center gap-2">
      <ModeSwitch onchange={setMode} />
      {#if !timeAttack}
        <button
          type="button"
          onclick={() => (showLesson = true)}
          class="font-thai max-w-[42vw] truncate rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-ink sm:max-w-xs"
          title="เลือกบทเรียน"
        >
          <span class="text-faint">บท:</span>
          {lesson.name}
        </button>
      {/if}
      <ThemeToggle />
      <button
        type="button"
        onclick={() => (showSettings = true)}
        class="grid size-9 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-border-strong hover:text-ink"
        aria-label="ตั้งค่า"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.7" />
          <path
            d="M12 2.8v2M12 19.2v2M21.2 12h-2M4.8 12h-2M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4M18.5 18.5l-1.4-1.4M6.9 6.9 5.5 5.5"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </header>

  <main class="flex flex-1 flex-col items-center justify-center gap-10 px-4 pb-16 sm:px-6">
    {#if finished && result}
      <DrillSummary
        {result}
        {timeAttack}
        lessonName={lesson.name}
        onRestart={newDrill}
        onChangeLesson={() => (showLesson = true)}
      />
    {:else}
      <LiveReadout wpm={liveWpm} accuracy={liveAcc} remaining={liveRemaining} dim={!started} />

      <div class="relative w-full max-w-3xl">
        <!-- Transparent overlay captures focus + physical key codes; we draw our
             own caret in the lens. -->
        <input
          bind:this={inputEl}
          onkeydown={onInputKeydown}
          data-testid="typing-input"
          class="absolute inset-0 z-10 w-full cursor-text rounded-2xl opacity-0"
          style="caret-color: transparent"
          aria-label="พื้นที่พิมพ์ — เริ่มพิมพ์ตามคำที่แสดง"
          autocomplete="off"
          autocapitalize="off"
          autocorrect="off"
          spellcheck="false"
        />
        <div class="flex flex-col gap-6">
          <TypingFlow
            words={drill}
            {statuses}
            currentIdx={wordIdx}
            {input}
            caretStyle={settings.caretStyle}
          />
          {#if !timeAttack}
            <DrillTrack {statuses} currentIdx={wordIdx} total={drill.length} />
          {/if}
        </div>
      </div>

      {#if settings.showKeymap}
        <Keymap {nextChar} glow={settings.glow && !timeAttack} />
      {/if}

      <p class="text-xs text-faint">
        <kbd class="font-mono">Tab</kbd> เริ่มใหม่ · <kbd class="font-mono">Esc</kbd> ตั้งค่า
      </p>
    {/if}
  </main>

  <footer class="px-4 py-4 text-center text-xs text-faint sm:px-6">
    <a
      href="https://www.manoonchai.com/"
      target="_blank"
      rel="noopener noreferrer"
      class="transition-colors hover:text-muted">แป้นพิมพ์มนูญชัย</a
    >
    ·
    <a
      href="https://github.com/Manoonchai/learn"
      target="_blank"
      rel="noopener noreferrer"
      class="transition-colors hover:text-muted">GitHub</a
    >
  </footer>
</div>

<SettingsPanel bind:open={showSettings} />
<LessonPicker bind:open={showLesson} onpick={pickLesson} />
