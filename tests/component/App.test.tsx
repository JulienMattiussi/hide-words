import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('App', () => {
  it('renders the project title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'hidden-word' })).toBeInTheDocument()
  })

  it('reveals the hidden word by default', () => {
    render(<App />)
    expect(screen.getByRole('img', { name: /révélant le mot CODE/i })).toBeInTheDocument()
  })

  it('hides the word when the reveal toggle is turned off', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('checkbox', { name: /révélé/i }))
    expect(screen.getByRole('img', { name: /mot caché/i })).toBeInTheDocument()
  })

  it('updates the grid label when the word changes', async () => {
    const user = userEvent.setup()
    render(<App />)
    const wordInput = screen.getByLabelText('Mot à cacher')
    await user.clear(wordInput)
    await user.type(wordInput, 'Été42')
    expect(screen.getByRole('img', { name: /révélant le mot Été42/i })).toBeInTheDocument()
  })
})
