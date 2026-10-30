import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Login from './Login'

describe('Login form validation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows the schema password error and sends no request for invalid input', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )

    const email = screen.getByLabelText('Email Address')
    await user.clear(email)
    await user.type(email, 'alex@example.com')
    await user.clear(screen.getByLabelText('Password'))
    await user.type(screen.getByLabelText('Password'), '123')
    await user.click(screen.getByRole('button', { name: '🔑 Log In & Authenticate' }))

    expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument()
    await waitFor(() => expect(fetchSpy).not.toHaveBeenCalled())
  })
})
