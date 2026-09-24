import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { AvatarId } from "./avatar/playerAvatar";

export enum GameType {
  UNO = "uno",
  BLACKJACK = "blackjack"
}

export class BasePlayerData extends Schema {

}

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") connectionId: string = "";
  @type("string") name: string = "";
  @type("string") photoUrl: string = "";
  @type("string") avatarId: AvatarId = "astronaut";
  @type("number") score: number = 0;
  @type("boolean") isConnected: boolean = true;
  @type("number") disconnectedAt: number = 0;
  @type("boolean") isReady: boolean = false;
  @type("boolean") isTurn: boolean = false;
  @type("int8") seatIndex: number = -1;
  @type("string") telegramId?: string;
  @type("string") playerId?: string;

  @type(BasePlayerData) gameData: BasePlayerData | null = null;
}

export class BaseGameState extends Schema {

}

export class GameState extends Schema {
  @type("string") hostId: string = "";
  @type("string") roomCode: string = "";
  @type("string") status: RoomStatus = RoomStatus.LOBBY;
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("string") gameType: GameType = GameType.UNO;

  @type(["string"]) playerOrder = new ArraySchema<string>();
  @type("string") currentTurn: string = "";
  @type("uint16") roundNumber: number = 1;

  @type("number") roundStartAt: number = 0;
  @type("string") roundWinnerId?: string = "";
  @type("string") matchWinnerId?: string = "";
  @type("boolean") gameEnded: boolean = false;

  @type("boolean") isPaused: boolean = false;
  @type("string") pausedPlayerId: string = "";
  @type("uint32") pausedReconnectRemainingMs: number = 0;

  @type(BaseGameState) gameState: BaseGameState | null = null;
}

export interface LobbyMetadata {
  gameType: GameType;
  status: RoomStatus;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  roomCode: string;
}

export interface RoomOptions {
  state: GameState;
  metadata: LobbyMetadata;
}

export enum RoomStatus {
  LOBBY = "lobby",
  PLAYING = "playing",
  FINISHED = "finished"
}