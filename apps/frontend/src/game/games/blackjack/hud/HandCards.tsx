import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import type { BjCardDTO } from "../../../../store/slices/bjSlice";
import { ClassicCard } from "../../../../components/games/bj/card/BjCard";

interface Props {
  cards: BjCardDTO[];
  handValue: number;
}

const overlap = 48;

const AnimatedCard = memo(function AnimatedCard({
  card,
  index,
  centerIndex,
}: {
  card: BjCardDTO;
  index: number;
  centerIndex: number;
}) {
  const x = (index - centerIndex) * overlap;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -120,
        scale: 0.85,
      }}
      animate={{
        opacity: 1,
        x,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: 60,
        scale: 0.85,
      }}
      transition={{
        duration: 0.18,
        ease: "easeOut",
      }}
      className="absolute pointer-events-auto"
      style={{
        zIndex: index,
        willChange: "transform, opacity",
      }}
    >
      <ClassicCard card={card} />
    </motion.div>
  );
});

export function HandCards({ cards, handValue }: Props) {
  if (!cards || cards.length === 0) return null;

  const centerIndex = (cards.length - 1) / 2;

  return (
    <div className="absolute bottom-[max(12rem,env(safe-area-inset-bottom))] landscape:bottom-[max(4rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className="relative flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 0.9, scale: 1, y: 0 }}
          className="relative z-30 pointer-events-auto flex items-center justify-center"
        >
          <div
            className="w-8 h-8 rounded-full border bg-[#120a1f]/95 shadow-lg flex items-center justify-center
            font-black text-sm tracking-tight transition-all
             border-indigo-400/80 text-white shadow-indigo-500/20"
          >
            {handValue}
          </div>
        </motion.div>
        <AnimatePresence>
          {cards.map((card, index) => (
            <AnimatedCard
              key={card.id}
              card={card}
              index={index}
              centerIndex={centerIndex}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
