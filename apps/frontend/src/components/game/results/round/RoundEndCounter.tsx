import { useEffect, useRef, useState } from "react";

interface Props {
  durationSeconds?: number;
}

export function RoundEndCounter({ durationSeconds = 5 }: Props) {
  const [displayTime, setDisplayTime] = useState(durationSeconds);

  const animationRef = useRef<number | null>(null);
  const lastUpdatedRef = useRef<number>(Date.now());
  const remainingMsRef = useRef<number>(durationSeconds * 1000);

  useEffect(() => {
    remainingMsRef.current = durationSeconds * 1000;
    lastUpdatedRef.current = Date.now();
    setDisplayTime(durationSeconds);

    const tick = () => {
      const now = Date.now();
      const delta = now - lastUpdatedRef.current;

      lastUpdatedRef.current = now;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - delta);

      setDisplayTime(Math.ceil(remainingMsRef.current / 1000));

      if (remainingMsRef.current > 0) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [durationSeconds]);

  const progressPercentage = Math.min(
    100,
    Math.max(0, (displayTime / durationSeconds) * 100)
  );
  return (
    <div className="relative z-10 w-full px-4 pb-4 mt-4">
      <div className="mx-auto w-full max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
          Next round starting in
        </p>

        <p className="mt-1 text-2xl font-black tabular-nums text-white">
          {displayTime}s
        </p>

        <div className="relative mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-yellow-400 transition-all duration-150 ease-linear"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
