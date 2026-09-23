import { AnimatePresence, motion } from "framer-motion";
import type { CardDTO } from "../../../../types/game";
import { useAnimationStore } from "../../../../store/animationStore";
import { usePlayerAnimationStore } from "../../../../store/playerAnimationStore";
import { unoService } from "../../../../services/colyseus";
import { Card } from "../../../../components/card/Card";

type Props = {
  playerId: string;
  cards: CardDTO[];
  isPlayable: (card: CardDTO) => boolean;
  onWildCard: (card: CardDTO) => void;
  selectedCardId: string | null;
  setSelectedCardId: React.Dispatch<React.SetStateAction<string | null>>;
};

export function HandCards({
  playerId,
  cards,
  isPlayable,
  onWildCard,
  selectedCardId,
  setSelectedCardId,
}: Props) {
  const addFlyingCard = useAnimationStore((s) => s.addFlyingCard);

  const handlePlayCard = (card: CardDTO) => {
    if (!isPlayable(card)) return;

    if (selectedCardId !== card.id) {
      setSelectedCardId(card.id);
      return;
    }

    const isWild = card.value === "wild" || card.value === "wildDrawFour";

    if (isWild) {
      onWildCard(card);
      return;
    }

    addFlyingCard({
      id: crypto.randomUUID(),
      card,
      from: {
        x: window.innerWidth / 2,
        y: window.innerHeight - 180,
      },
      to: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2 + 80,
      },
    });

    const actionId = crypto.randomUUID();

    usePlayerAnimationStore
      .getState()
      .triggerOptimisticAnimation(playerId, "Hit", actionId);

    unoService.playCard(actionId, card.id);
    setSelectedCardId(null);
  };

  const center = (cards.length - 1) / 1.8;
  const spacing = Math.max(18, 68 - cards.length * 1.8);
  const cardScale = Math.max(0.72, 1 - cards.length * 0.018);
  const curveStrength = Math.min(38, 16 + cards.length * 0.9);
  const maxRotation = Math.min(14, 6 + cards.length * 0.35);

  return (
    <div className="absolute bottom-[max(3rem,env(safe-area-inset-bottom))] left-0 right-0 z-20 pointer-events-none overflow-visible">
      <AnimatePresence mode="popLayout">
        {cards.map((card, index) => {
          const selected = selectedCardId === card.id;
          const offset = index - center;
          const normalized = center === 0 ? 0 : offset / center;
          const x = offset * spacing;
          const rotate = normalized * maxRotation;
          const curve = Math.pow(Math.abs(normalized), 1.7) * curveStrength;

          return (
            <motion.div
              key={card.id}
              initial={{
                opacity: 0,
                y: 200,
                scale: 0.5,
              }}
              animate={{
                opacity: 1,
                x,
                y: selected ? curve - 90 : curve,
                rotate: selected ? 0 : rotate,
                scale: selected ? cardScale * 1.2 : cardScale,
              }}
              exit={{
                opacity: 0,
                y: -200,
                scale: 0.5,
                rotate: rotate * 2,
              }}
              whileHover={{
                y: selected ? curve - 120 : curve - 45,
                scale: selected ? cardScale * 1.35 : cardScale * 1.25,
                rotate: 0,
                zIndex: 999,
                transition: {
                  type: "spring",
                  stiffness: 500,
                  damping: 22,
                },
              }}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 28,
                mass: 0.4,
              }}
              className={`absolute left-1/2 bottom-0 -translate-x-1/2 origin-bottom pointer-events-auto
              ${
                selected
                  ? `drop-shadow-[0_0_40px_rgba(255,255,255,0.9)]`
                  : `drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]`
              }
            `}
              style={{
                zIndex: selected ? 999 : index,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handlePlayCard(card);
              }}
            >
              <Card card={card} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
