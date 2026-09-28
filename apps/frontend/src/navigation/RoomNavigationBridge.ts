import { useLocation, useNavigate } from "react-router-dom";
import { useGameStore } from '../store/gameStore';
import { useEffect } from "react";
import { RoomStatus } from "@uno/shared";

export function RoomNavigationBridge() {
    const navigate = useNavigate();
    const location = useLocation();

    const roomStatus = useGameStore((state) => state.status);
    const roomCode = useGameStore((state) => state.roomCode);

    useEffect(() => {
        if (!roomCode) {
            if (location.pathname === '/room' || location.pathname === '/game') {
                navigate("/", { replace: true });
            }

            return;
        };

        switch (roomStatus) {
            case RoomStatus.LOBBY:
                if (location.pathname !== `/room`) {
                    navigate(`/room`, { replace: true });
                }
                break;
            case RoomStatus.PLAYING:
            case RoomStatus.FINISHED:
                if (location.pathname !== `/game`) {
                    navigate(`/game`, { replace: true });
                }
                break;
        }
    }, [roomStatus, roomCode, location.pathname, navigate]);

    return null;
}