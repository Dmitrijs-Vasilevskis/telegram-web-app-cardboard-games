import type { AvatarId } from "@uno/shared";
import { AVATARS } from "../../../../game/avatar/avatar.config";

interface AvatarSelectorProps {
  selectedAvatar: AvatarId;
  onSelect: (avatarId: AvatarId) => void;
}

export function AvatarSelector({
  selectedAvatar,
  onSelect,
}: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(AVATARS).map(([id, avatar]) => {
        const avatarId = id as AvatarId;
        const isSelected = selectedAvatar === avatarId;

        return (
          <button
            key={avatarId}
            type="button"
            onClick={() => onSelect(avatarId)}
            className={`
                relative
                p-3
                rounded-2xl
                border
                text-left
                transition-all
                active:scale-[0.97]
  
                ${
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-400 shadow-lg shadow-emerald-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }
              `}
          >
            <div className="h-28 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center mb-3 overflow-hidden">
              <span className="text-4xl">
                {avatarId === "astronaut" ? "🧑‍🚀" : "💪"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white capitalize">
                {avatar.id.replace("_", " ")}
              </span>

              {isSelected && (
                <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="w-4 h-4 text-white"
                  >
                    <path
                      d="M5 10.5L8.5 14L15 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
