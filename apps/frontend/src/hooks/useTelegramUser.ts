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

    setIsFullscreen(tg.isFullscreen ?? false);
    setReady(true);

    const handleFullscreenChanged = () => {
      setIsFullscreen(tg.isFullscreen ?? false);
    }

    tg.onEvent?.(
      "fullscreenChanged",
      handleFullscreenChanged
    );

    return () => {
      tg.offEvent?.(
        "fullscreenChanged",
        handleFullscreenChanged
      );
    }
  }, []);

  const requestFullscreen = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg?.requestFullscreen) {
      console.warn("Telegram fullscreen mode is not supported");
      return;
    }

    tg.requestFullscreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg?.exitFullscreen) {
      console.warn("Telegram fullscreen mode is not supported");
      return;
    }

    tg.exitFullscreen();
  }, []);

  return { initData, username, user, setUsername, ready, error, isFullscreen, requestFullscreen, exitFullscreen };
}
