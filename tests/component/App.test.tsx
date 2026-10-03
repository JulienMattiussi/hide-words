import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

describe('App', () => {
  it('renders the project title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Hide Words' })).toBeInTheDocument()
  })

  it('reveals every code by default', () => {
    render(<App />)
    expect(
      screen.getByRole('img', { name: 'Grille révélant : JOUR, NUIT, SOIR' }),
    ).toBeInTheDocument()
  })

  it('reveals a single code when the others are unchecked', async () => {
    const user = userEvent.setup()
    render(<App />)
    const show = screen.getAllByRole('checkbox', { name: 'Afficher' })
    await user.click(show[1]!)
    await user.click(show[2]!)
    expect(screen.getByRole('img', { name: 'Grille révélant : JOUR' })).toBeInTheDocument()
  })

  it('hides everything when all codes are unchecked', async () => {
    const user = userEvent.setup()
    render(<App />)
    for (const checkbox of screen.getAllByRole('checkbox', { name: 'Afficher' })) {
      await user.click(checkbox)
    }
    expect(screen.getByRole('img', { name: /codes cachés/i })).toBeInTheDocument()
  })

  it('shrinks the number of codes with the segmented control', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '1' }))
    expect(screen.getAllByRole('checkbox', { name: 'Afficher' })).toHaveLength(1)
  })

  it('flags a key combination leaving a region without its own letter', async () => {
    const user = userEvent.setup()
    render(<App />)
    const keyInputs = screen.getAllByLabelText(/Clé \(lettres du tracé\)/)
    for (const input of keyInputs) {
      await user.clear(input)
      await user.type(input, 'AB')
    }
    expect(screen.getByRole('alert')).toHaveTextContent(/Aucune lettre propre/)
  })

  it('fills the keys with the generate button', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /Générer des mots clés/i }))
    const keyInput = screen.getAllByLabelText(/Clé \(lettres du tracé\)/)[0] as HTMLInputElement
    expect(keyInput.value).toMatch(/^[A-Z]+$/)
  })
})
