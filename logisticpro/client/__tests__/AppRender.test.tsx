// client/__tests__/AppRender.test.tsx
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../src/App'
import { describe, expect, test } from 'vitest'

describe('Renderizado principal de LogisticPro', () => {
  test('Debe renderizar el título base o el menú principal', () => {
    render(<App />)

    // Revisa el texto "LogisticPro" o "Dashboard" si el logo se oculta en móvil
    const brand = screen.queryByText(/logisticpro/i) || screen.queryByText(/dashboard/i)

    expect(brand).toBeInTheDocument()
  })
})
