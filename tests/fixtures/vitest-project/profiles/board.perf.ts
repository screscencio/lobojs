import { test } from 'vitest';
import profile from '../../../../src/core/profile';

test('a board read', () => {
  profile('board_read', () => {
    const columns = new Map<string, number[]>();
    for (let i = 0; i < 20000; i++) {
      const column = `column ${i % 5}`;
      columns.set(column, [...(columns.get(column) || []), i]);
    }
    return columns;
  });
});
