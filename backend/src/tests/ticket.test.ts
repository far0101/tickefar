import { describe, it, expect } from 'vitest';
import { calcTotal, hasStock } from '../services/ticket.service';

describe('calcTotal', () => {
  it('multiplica precio por cantidad correctamente', () => {
    expect(calcTotal(15000, 3)).toBe(45000);
  });

  it('devuelve 0 si cantidad es 0', () => {
    expect(calcTotal(15000, 0)).toBe(0);
  });
});

describe('hasStock', () => {
  it('retorna true cuando hay stock suficiente', () => {
    expect(hasStock(10, 3)).toBe(true);
  });

  it('retorna false cuando el stock es insuficiente', () => {
    expect(hasStock(2, 5)).toBe(false);
  });
});
