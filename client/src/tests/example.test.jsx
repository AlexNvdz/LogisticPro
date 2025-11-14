// client/src/tests/example.test.jsx
import { expect, test } from 'vitest';

test('Prueba de ejemplo que siempre pasa', () => {
  // Un matcher simple
  expect(1 + 1).toBe(2);
});

test('Prueba de texto', () => {
  const saludo = 'Hola';
  // Otro matcher
  expect(saludo).toBe('Hola');
});