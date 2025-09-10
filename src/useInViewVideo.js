import { useEffect, useRef } from "react";

export default function useInViewVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          el.play?.().catch(() => {});
        } else {
          el.pause?.();
        }
      },
      { threshold: 0.6 } // play when ~60% visible
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
