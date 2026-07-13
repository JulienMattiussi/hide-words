import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('App', () => {
  it('renders the project title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'hidden-word' })).toBeInTheDocument()
  })

  it('reveals the hidden text by default', () => {
    render(<App />)
    expect(screen.getByRole('img', { name: /révélant le mot CODE CACHÉ/i })).toBeInTheDocument()
  })

  it('hides the text when the reveal toggle is turned off', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('checkbox', { name: /révélé/i }))
    expect(screen.getByRole('img', { name: /mot caché/i })).toBeInTheDocument()
  })

  it('updates the grid from the multiline text field', async () => {
    const user = userEvent.setup()
    render(<App />)
    const textInput = screen.getByLabelText(/Texte à cacher/)
    await user.clear(textInput)
    await user.type(textInput, 'Été{enter}42')
    expect(screen.getByRole('img', { name: /révélant le mot Été 42/i })).toBeInTheDocument()
  })
})
