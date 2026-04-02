export const ANIM_FILL_MS   = 150;
export const ANIM_TRAVEL_MS = 180;
export const ANIM_LAND_MS   = 70;
export const ANIM_BUDGET_MS = ANIM_FILL_MS + ANIM_TRAVEL_MS + ANIM_LAND_MS; // 400ms

export async function animateCompletion(
  taskEl: HTMLElement,
  wallEl: HTMLElement
): Promise<void> {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Instant state change for reduced-motion
    taskEl.style.display = "none";
    return;
  }
  const t0 = performance.now();
  const wallRect = wallEl.getBoundingClientRect();
  const taskRect = taskEl.getBoundingClientRect();
  const targetX = wallRect.left + wallRect.width / 2 - (taskRect.left + taskRect.width / 2);
  const targetY = wallRect.top - taskRect.top;

  return new Promise<void>((resolve) => {
    // Phase 1: checkbox fill (CSS class, 150ms)
    taskEl.classList.add("completing");
    taskEl.style.setProperty("--travel-x", `${targetX}px`);
    taskEl.style.setProperty("--travel-y", `${targetY}px`);

    setTimeout(() => {
      // Phase 2: travel (180ms)
      taskEl.classList.add("traveling");
      taskEl.style.opacity = "0.5";

      setTimeout(() => {
        // Phase 3: land tile (70ms)
        taskEl.style.display = "none";
        taskEl.classList.remove("completing", "traveling");
        taskEl.style.opacity = "";

        // Dispatch event for DoneWall to pick up
        wallEl.dispatchEvent(new CustomEvent("tile-land", {
          detail: { taskId: taskEl.dataset.taskId, title: taskEl.dataset.title }
        }));

        setTimeout(() => {
          const elapsed = performance.now() - t0;
          // K-06: Budget assertion
          if (elapsed > ANIM_BUDGET_MS + 10) {
            if (process.env.NODE_ENV === "test") throw new Error(`KLM K-06: Animation ${elapsed.toFixed(0)}ms > ${ANIM_BUDGET_MS}ms`);
            if (process.env.NODE_ENV === "development") console.error(`KLM K-06: ${elapsed.toFixed(0)}ms`);
          }
          resolve();
        }, ANIM_LAND_MS);
      }, ANIM_TRAVEL_MS);
    }, ANIM_FILL_MS);
  });
}
