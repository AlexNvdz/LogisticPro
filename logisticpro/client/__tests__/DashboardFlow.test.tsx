import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../src/App";
import { describe, expect, test } from "vitest";

describe("Flujo principal del Dashboard en LogisticPro", () => {
  test("Debe renderizar el título base", () => {
    render(<App />);
    expect(screen.getByText(/logisticpro/i)).toBeInTheDocument();
  });

  test("Debe mostrar las opciones de navegación Usuarios y Vehículos", () => {
    render(<App />);

    const usuariosNav = screen.getByRole("link", { name: /usuarios/i });
    const vehiculosNav = screen.getByRole("link", { name: /vehículos/i });

    expect(usuariosNav).toBeInTheDocument();
    expect(vehiculosNav).toBeInTheDocument();
  });

  test("Debe navegar a Usuarios al hacer clic en el menú", () => {
    render(<App />);

    const usuariosNav = screen.getByRole("link", { name: /usuarios/i });
    fireEvent.click(usuariosNav);

    expect(screen.getByRole("heading", { name: /usuarios/i })).toBeInTheDocument();
  });
});
