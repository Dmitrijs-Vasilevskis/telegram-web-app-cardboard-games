import { createContext, useContext, useEffect, useState } from "react";
import { useTelegramUser } from "../../hooks/useTelegramUser";
import { useGameStore } from "../../store/gameStore";
import { GameEvents } from "../../game/GameEvents";
import { getErrorMessage } from "../../utils/errors";
import type { WebAppUser } from "../../types/TelegramWebApp";
import { colyseusService } from "../../services/colyseus/";

interface GameContextInterface {
  joining: boolean;
  roomCode: string;
  joinError: string | null;
  isLandscape: boolean;
  username: string;
  user: WebAppUser | null;
  isFullscreen: boolean;
  setRoomCode: React.Dispatch<React.SetStateAction<string>>;
  setUsername: (username: string) => void;
  createRoom: () => Promise<void>;
  joinRoom: () => Promise<void>;
  leaveRoom: () => Promise<void>;
}

export const GameContext = createContext<GameContextInterface | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const {
    initData,
    username,
    user,
    setUsername,
    ready,
    isFullscreen,
    requestFullscreen,
    exitFullscreen,
  } = useTelegramUser();

  const [roomCode, setRoomCode] = useState<string>("");
  const [joining, setJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  useEffect(() => {
    if (!ready || !initData) return;

    const attemptRecovery = async () => {
      setJoining(true);
      try {
        const activeRoom = await colyseusService.trySessionRecovery();
        if (activeRoom) {
          activeRoom.onStateChange.once(() => {
            GameEvents.initialize(activeRoom);
          });
        }
      } catch (error) {
        console.error("[AUTO RECOVERY FAILED]:", error);
      } finally {
        setJoining(false);
      }
    };

    attemptRecovery();
  }, [ready, initData]);

  const createRoom = async () => {
    if (joining) return;

    setJoinError(null);
    useGameStore.getState().setRoomError(null);

    if (!ready || !initData) {
      setJoinError(
        "Telegram authentication is not available. Open the app from Telegram and try again."
      );
      return;
    }

    setJoining(true);

    try {
      const room = await colyseusService.createRoom(initData);

      room.onStateChange.once(() => {
        GameEvents.initialize(room);
      });
    } catch (err) {
      console.error(err);
      setJoinError(getErrorMessage(err));
    } finally {
      setJoining(false);
    }
  };

  const joinRoom = async () => {
    if (joining) return;

    if (!roomCode.trim()) {
      setJoinError("Room code is required.");
      return;
    }

    setJoinError(null);
    useGameStore.getState().setRoomError(null);

    if (!ready || !initData) {
      setJoinError(
        "Telegram authentication is not available. Open the app from Telegram and try again."
      );
      return;
    }

    setJoining(true);

    try {
      const room = await colyseusService.joinRoomByCode(roomCode, initData);

      room.onStateChange.once(() => {
        GameEvents.initialize(room);
      });
    } catch (err) {
      console.error(err);
      setJoinError(getErrorMessage(err));
    } finally {
      setJoining(false);
    }
  };

  const leaveRoom = async () => {
    try {
      GameEvents.destroy();
      await colyseusService.leave();

      useGameStore.getState().reset();
      setJoinError(null);
    } catch (error) {
      console.error("Failed to leave room", error);
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(orientation: landscape)");

    setIsLandscape(mediaQuery.matches);

    const handleOrientationChange = (e: MediaQueryListEvent) => {
      setIsLandscape(e.matches);
    };

    mediaQuery.addEventListener("change", handleOrientationChange);

    return () => {
      mediaQuery.removeEventListener("change", handleOrientationChange);
      GameEvents.destroy();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (isLandscape && !isFullscreen) {
      requestFullscreen();
    }

    if (!isLandscape && isFullscreen) {
      exitFullscreen();
    }
  }, [ready, isLandscape, isFullscreen, requestFullscreen, exitFullscreen]);

  return (
    <GameContext.Provider
      value={{
        joining,
        roomCode,
        joinError,
        isLandscape,
        username,
        user,
        isFullscreen,
        setRoomCode,
        setUsername,
        createRoom,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
};
