import { useCallback, useEffect, useRef, useState } from "react";
import type { WebAppUser } from "../types/TelegramWebApp";

export interface UseTelegramUserInterface {
  initData: string;
  username: string;
  user: WebAppUser | null;
  setUsername: (username: string) => void;
  ready: boolean;
  error: boolean;
  isFullscreen: boolean;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
}

export function useTelegramUser(): UseTelegramUserInterface {
  const [initData, setInitData] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [user, setUser] = useState<WebAppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const initialized = useRef<boolean>(false);

  useEffect(() => {

    if (initialized.current) return;
    initialized.current = true;

    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      console.warn("No telegram user was found");
      setError(true);
      return;
    }
    tg.ready();
    tg.expand();

    const telegramInitData = tg.initData as string;
    const telegramUser = tg.initDataUnsafe?.user as WebAppUser | undefined;

    setInitData(telegramInitData);
    setUser(telegramUser ?? null);
    setUsername(telegramUser?.username || telegramUser?.first_name || "Anonymous Player");

    const fullscreen = tg.isFullscreen ?? false;
    setIsFullscreen(fullscreen);

    if (tg.isVersionAtLeast?.("8.0")) {
      tg.requestSafeArea?.();
      tg.requestContentSafeArea?.();
    }

    const handleFullscreenChanged = () => {
      const fullscreen = tg.isFullscreen ?? false;

      setIsFullscreen(fullscreen);

      if (tg.isVersionAtLeast?.("8.0")) {
        tg.requestSafeArea?.();
        tg.requestContentSafeArea?.();
      }
    }

    tg.onEvent?.(
      "fullscreenChanged",
      handleFullscreenChanged
    );

    setReady(true);

    return () => {
      tg.offEvent?.(
        "fullscreenChanged",
        handleFullscreenChanged
      );
    }
  }, []);

  const requestFullscreen = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg?.requestFullscreen || !tg?.isVersionAtLeast("8.0")) {
      console.warn("Telegram fullscreen mode is not supported");
      return;
    }

    tg.requestFullscreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg?.exitFullscreen || !tg.isVersionAtLeast("8.0")) {
      console.warn("Telegram fullscreen mode is not supported");
      return;
    }

    if (!tg.isFullscreen) {
      return;
    }

    tg.exitFullscreen();
  }, []);

  return { initData, username, user, setUsername, ready, error, isFullscreen, requestFullscreen, exitFullscreen };
}
