import type { WebAppUser } from "../../types/TelegramWebApp";
import { ProfileAvatar } from "./ProfileAvatar";

interface Props {
  user: WebAppUser | null;
  displayName: string;
  imageError: boolean;
  setImageError: (value: React.SetStateAction<boolean>) => void;
}

export function ProfileInformationPanel({
  user,
  displayName,
  imageError,
  setImageError,
}: Props) {
  return (
    <div className="w-full flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 landscape:mt-0 rounded-2xl shadow-lg mt-2">
      <ProfileAvatar
        photo_url={user?.photo_url ?? null}
        displayName={displayName}
        imageError={imageError}
        setImageError={setImageError}
      />

      <div className="flex flex-col min-w-0">
        <span className="text-xs text-white/40 font-medium tracking-wide uppercase">
          Logged in as
        </span>
        <span className="text-base font-bold text-white/90 truncate max-w-40">
          {user?.username ? `@${user.username}` : displayName}
        </span>
      </div>

      <div className="ml-auto bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-500/30 flex items-center gap-1 shrink-0">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        Verified
      </div>
    </div>
  );
}
