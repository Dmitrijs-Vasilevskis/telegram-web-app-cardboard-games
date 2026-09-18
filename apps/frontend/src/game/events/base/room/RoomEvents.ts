import { GameType, RoomStatus } from '@uno/shared';
import { useGameStore } from '../../../../store/gameStore';
import type { GameRoom, StateCallbacks } from '../../types';

export function RegisterRoomEvents(
    room: GameRoom,
    $: StateCallbacks
) {
    const store = useGameStore.getState();

    $(room.state).listen(
        "currentTurn",
        (currentTurn: string) => {
            store.setCurrentTurn(currentTurn);
        }
    );

    $(room.state).listen(
        "hostId",
        (hostId: string) => {
            store.setHostId(hostId);
        }
    );

    $(room.state).listen(
        "roomCode",
        (roomCode: string) => {
            store.setRoomCode(roomCode);
        }
    );

    $(room.state).listen(
        "isPaused",
        (isPaused: boolean) => {
            if (!isPaused) {
                store.setPaused(
                    false,
                    undefined,
                    undefined
                );
            }
        }
    );

    $(room.state).listen(
        "pausedPlayerId",
        (pausedPlayerId: string) => {
            const curr = useGameStore.getState();

            curr.setPaused(
                room.state.isPaused,
                pausedPlayerId,
                curr.reconnectRemaining ?? undefined
            );
        }
    );

    $(room.state).listen(
        "status",
        (status: RoomStatus) => {
            store.setStatus(status);
        }
    );

    $(room.state).listen(
        "gameType",
        (gameType: GameType) => {
            store.setGameType(gameType);
        }
    );
}