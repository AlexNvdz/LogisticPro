import { describe, test, expect } from "vitest";

describe("Conexión real con el backend", () => {
  test("El backend debe responder correctamente en /", async () => {
    const res = await fetch("https://logisticpro.onrender.com/");
    
    expect(res.status).toBe(200);

    const text = await res.text();
    expect(text).toMatch(/LogisticPro API/i);
  }, 15000);
});