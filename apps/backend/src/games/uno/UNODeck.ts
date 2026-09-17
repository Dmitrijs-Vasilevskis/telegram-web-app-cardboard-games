import { Card, Color, UnoCardValue } from '@uno/shared';
import { v4 as uuidv4 } from 'uuid';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const colors: Color[] = ['red', 'green', 'blue', 'yellow'];
  const numbers: UnoCardValue[] = ['0','1','2','3','4','5','6','7','8','9'];
  const actions: UnoCardValue[] = ['skip', 'reverse', 'drawTwo'];

  for (const color of colors) {
    // one '0' per color
    const card0 = new Card();
    card0.id = uuidv4();
    card0.color = color;
    card0.value = '0';
    deck.push(card0);

    // two of each 1-9
    for (let i = 1; i <= 9; i++) {
      const val = i.toString() as UnoCardValue;
      const card1 = new Card();
      card1.id = uuidv4();
      card1.color = color;
      card1.value = val;
      const card2 = new Card();
      card2.id = uuidv4();
      card2.color = color;
      card2.value = val;
      deck.push(card1, card2);
    }

    // two of each action card
    for (const action of actions) {
      const card1 = new Card();
      card1.id = uuidv4();
      card1.color = color;
      card1.value = action;
      const card2 = new Card();
      card2.id = uuidv4();
      card2.color = color;
      card2.value = action;
      deck.push(card1, card2);
    }
  }

  // wild cards (4 each)
  for (let i = 0; i < 4; i++) {
    const wild = new Card();
    wild.id = uuidv4();
    wild.color = null;
    wild.value = 'wild';
    const wildDrawFour = new Card();
    wildDrawFour.id = uuidv4();
    wildDrawFour.color = null;
    wildDrawFour.value = 'wildDrawFour';
    deck.push(wild, wildDrawFour);
  }

  return shuffle(deck);
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // temporary variable to avoid TypeScript destructuring issues
    const temp = array[i];
    array[i] = array[j]!;
    array[j] = temp!;
  }
  return array;
}