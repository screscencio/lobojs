import { test } from 'vitest';
import profile from '../../../../src/core/profile';

interface Card {
  id: number;
  title: string;
  done: boolean;
}

const board: Card[] = Array.from({ length: 5000 }, (_, id) => ({ id, title: `card ${id}`, done: false }));

test('a card save', async () => {
  await profile('card_save', async () => {
    const saved = JSON.parse(JSON.stringify(board[42])) as Card;
    saved.title = 'renamed';
    return saved;
  });
});

test('a card close', () => {
  profile('card_close', () => {
    board.filter((card) => card.id % 2 === 0).forEach((card) => { card.done = true; });
  });
});
