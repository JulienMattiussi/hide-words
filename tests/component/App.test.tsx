import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('App', () => {
  it('renders the project title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'hidden-word' })).toBeInTheDocument()
  })

  it('reveals both codes by default', () => {
    render(<App />)
    expect(screen.getByRole('img', { name: /révélant les deux codes/i })).toBeInTheDocument()
  })

  it('switches to revealing only the first code', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('radio', { name: 'Code 1' }))
    expect(screen.getByRole('img', { name: /révélant le code 1 : JOUR/i })).toBeInTheDocument()
  })

  it('hides the codes when asked', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('radio', { name: 'Caché' }))
    expect(screen.getByRole('img', { name: /codes cachés/i })).toBeInTheDocument()
  })

  it('warns when the key combination does not share exactly two letters', async () => {
    const user = userEvent.setup()
    render(<App />)
    const key2 = screen.getAllByLabelText(/Lettres du tracé/)[1]!
    await user.clear(key2)
    await user.type(key2, 'JOUR')
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
