interface Props {
  photo_url: string | null;
  displayName: string;
  imageError: boolean;
  setImageError: (value: React.SetStateAction<boolean>) => void;
}

export function ProfileAvatar({
  photo_url,
  displayName,
  imageError,
  setImageError,
}: Props) {
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="w-12 h-12 landscape:w-10 landscape:h-10 rounded-full overflow-hidden bg-linear-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-lg text-white shadow-md border border-white/20 shrink-0">
      {photo_url && !imageError ? (
        <img
          src={photo_url}
          alt={displayName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{userInitial}</span>
      )}
    </div>
  );
}
