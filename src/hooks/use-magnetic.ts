import { useCallback, useRef } from "react";

/**
 * Tiny pointer-follow: the wrapped element drifts a few px toward the cursor
 * and eases back on leave. Hero CTAs only — never data cards or controls.
 * Disabled when the user prefers reduced motion.
 */
export function useMagnetic(strength = 6) {
  const ref = useRef<HTMLDivElement>(null);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      el.style.transform = `translate(${clamp(dx) * strength}px, ${clamp(dy) * strength}px)`;
    },
    [strength],
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "";
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
