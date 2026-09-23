import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";
import type { BjDealerCardDTO, BjDealerDTO } from "../../../../store/slices/bjSlice";
import { ClassicCard } from "../../../../components/games/bj/card/BjCard";

interface Props {
  dealer: BjDealerDTO | null;
}

const OVERLAP = 64;
const CARD_SCALE = 0.6;

const AnimatedDealerCard = memo(function AnimatedDealerCard({
  card,
  index,
  centerIndex,
}: {
  card: BjDealerCardDTO;
  index: number;
  centerIndex: number;
}) {
  const x = (index - centerIndex) * OVERLAP;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -120,
        scale: 0.45,
      }}
      animate={{
        opacity: 1,
        x,
        y: 0,
        scale: CARD_SCALE,
      }}
      exit={{
        opacity: 0,
        y: 60,
        scale: 0.45,
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

export function DealerHand({ dealer }: Props) {
  if (!dealer || dealer.hand.length === 0) {
    return null;
  }

  const centerIndex = (dealer.hand.length - 1) / 2;

  return (
    <div className="absolute top-[max(10rem,env(safe-area-inset-top))] landscape:top-[max(6rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className="relative flex items-center justify-center">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={{
            opacity: 0.9,
            scale: 1,
          }}
          transition={{
            duration: 0.15,
            ease: "easeOut",
          }}
          className="relative z-30 pointer-events-auto flex items-center justify-center"
        >
          <div
            className="w-8 h-8 rounded-full border bg-[#120a1f]/95 shadow-lg flex items-center justify-center font-black
           text-sm tracking-tight border-indigo-400/80 text-white"
          >
            {dealer.handValue}
          </div>
        </motion.div>

        <AnimatePresence>
          {dealer.hand.map((card, index) => (
            <AnimatedDealerCard
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
