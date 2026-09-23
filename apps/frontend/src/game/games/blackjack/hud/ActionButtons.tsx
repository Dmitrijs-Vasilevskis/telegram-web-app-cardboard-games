import { HitButton } from "../../../../components/games/bj/HitButton";
import { StandButton } from "../../../../components/games/bj/StandButton";

interface Props {
  onHit: () => void;
  onStand: () => void;
  isPlayerTurn: boolean;
  canHit: boolean;
}

export function ActionButtons({ onHit, onStand, isPlayerTurn, canHit }: Props) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 gap-4 landscape:contents">
      <div className="flex gap-4 landscape:fixed landscape:right-6 landscape:bottom-1/4 landscape:flex-col landscape:gap-8">
        <div className="w-28 landscape:w-auto">
          <HitButton isAvailable={canHit} onClick={onHit} />
        </div>

        <div className="w-28 landscape:w-auto">
          <StandButton isAvailable={isPlayerTurn} onClick={onStand} />
        </div>
      </div>
    </div>
  );
}
