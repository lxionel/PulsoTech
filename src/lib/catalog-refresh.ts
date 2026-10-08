interface RefreshDependencies {
  refresh: () => Promise<unknown>;
  isActive: () => boolean;
  now: () => number;
  random: () => number;
  schedule: (callback: () => void, delay: number) => () => void;
}

/** Refresh visible tabs, spread requests over time, and coalesce change bursts. */
export function createCatalogRefresh(dependencies: RefreshDependencies) {
  let stopped = false;
  let running: Promise<void> | null = null;
  let cancelTimer: (() => void) | undefined;
  let lastStarted = -Infinity;
  let dirty = false;
  const pause = () => { cancelTimer?.(); cancelTimer = undefined; };
  const interval = () => 60_000 + Math.floor(dependencies.random() * 15_000);
  const schedule = (delay: number) => {
    pause();
    if (!stopped && dependencies.isActive()) cancelTimer = dependencies.schedule(() => { void run(true); }, delay);
  };
  const run = (force = false): Promise<void> => {
    if (stopped || !dependencies.isActive()) return Promise.resolve();
    if (running) return running;
    if (!force && !dirty && dependencies.now() - lastStarted < 15_000) {
      schedule(interval());
      return Promise.resolve();
    }
    pause();
    lastStarted = dependencies.now();
    dirty = false;
    running = Promise.resolve().then(dependencies.refresh).then(() => undefined, () => undefined).finally(() => {
      running = null;
      schedule(dirty ? 250 : interval());
    });
    return running;
  };
  return {
    start: () => run(true),
    resume: () => run(),
    pause,
    changed: () => {
      if (stopped) return;
      dirty = true;
      if (!running) schedule(250);
    },
    stop: () => { stopped = true; pause(); },
  };
}
