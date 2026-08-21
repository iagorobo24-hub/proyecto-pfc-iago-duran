import { test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { within } from '@testing-library/dom'

test('testing dependencies are loadable and have expected exports', () => {
  // Verify @testing-library/react has core exports
  expect(render).toBeDefined()
  expect(screen).toBeDefined()

  // Verify @testing-library/dom has core exports
  expect(within).toBeDefined()
})
