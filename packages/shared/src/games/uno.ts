import { ArraySchema, Schema, type, view } from "@colyseus/schema";
import { BaseGameState, BasePlayerData } from "../types";

export type Color = 'red' | 'green' | 'blue' | 'yellow';
export type UnoCardValue =
    | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
    | 'skip' | 'reverse' | 'drawTwo' | 'wild' | 'wildDrawFour';

export class Card extends Schema {
    @type("string") id: string = "";
    @type("string") color: Color | null = null;
    @type("string") value: UnoCardValue = "0";
}

export class UnoPlayerData extends BasePlayerData {
    @view() @type([Card]) hand = new ArraySchema<Card>();
    @type("int8") handCount: number = 0;
    @type("boolean") saidUno: boolean = false;
}

export class UnoGameState extends BaseGameState {
  @type("string") activeColor: Color = "red";
  @type("int8") direction: 1 | -1 = 1;
  @type(Card) topDiscardCard: Card | null = null;
  @type("string") unoPendingPlayerId: string = "";
}