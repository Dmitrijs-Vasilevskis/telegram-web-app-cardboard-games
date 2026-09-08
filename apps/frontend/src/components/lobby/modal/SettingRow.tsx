interface SettingsRowProps {
  icon: string;
  label: string;
  value: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function SettingsRow({
  icon,
  label,
  value,
  disabled = false,
  onClick,
}: SettingsRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={` w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition
          ${
            disabled
              ? "bg-white/5 border-white/5 opacity-60 cursor-default"
              : "bg-white/5 border-white/10 hover:border-white/20 active:scale-[0.99]"
          }
        `}
    >
      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-xl shrink-0">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-white">{label}</div>

        <div className="text-xs text-gray-400 truncate">{value}</div>
      </div>

      <div className="text-gray-500 text-lg shrink-0">
        {disabled ? "🔒" : "›"}
      </div>
    </button>
  );
}
