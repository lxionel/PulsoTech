type ScrollableBody = { style: { overflow: string } };
const locks = new WeakMap<ScrollableBody, { count: number; previousOverflow: string }>();

// A panel only releases its own lock, including when another panel mounts or unmounts.
export function lockBodyScroll(body: ScrollableBody): () => void {
  const state = locks.get(body) || { count: 0, previousOverflow: body.style.overflow };
  state.count += 1;
  locks.set(body, state);
  body.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    state.count -= 1;
    if (state.count === 0) {
      body.style.overflow = state.previousOverflow;
      locks.delete(body);
    }
  };
}
