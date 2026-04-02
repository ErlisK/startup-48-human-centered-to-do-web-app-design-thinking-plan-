"use client";
// Skip navigation — first focusable element on every page.
// Visually hidden until focused.
export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="skip-nav"
      onFocus={(e) => { (e.currentTarget as HTMLElement).style.top = "8px"; }}
      onBlur={(e)  => { (e.currentTarget as HTMLElement).style.top = "-100px"; }}
    >
      Skip to main content
    </a>
  );
}
