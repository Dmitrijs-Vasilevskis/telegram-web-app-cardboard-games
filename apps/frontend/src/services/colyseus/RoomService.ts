import type { AvatarId, GameType } from "@uno/shared";
import { ColyseusService } from "./ColyseusService";

export class RoomService {
    private readonly colyseus: ColyseusService;

    constructor(colyseus: ColyseusService) {
        this.colyseus = colyseus;
    }

    toggleReady() {
        this.colyseus.send("toggleReady");
    }

    startGame() {
        this.colyseus.send("startGame");
    }

    restartGame(){
        this.colyseus.send("restartGame");
    }

    backToLobby() {
        this.colyseus.send("backToLobby");
    }

    selectGame(gameType: GameType) {
        this.colyseus.send("selectGame", { gameType });
    }

    sendEmote(emoteId: string) {
        this.colyseus.send("sendEmote", { emoteId });
    }

    changeAvatar(avatarId: AvatarId) {
        this.colyseus.send("changeAvatar", { avatarId });
    }
}