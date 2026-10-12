import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Drawer } from './Drawer'

function setup() {
  const onClose = vi.fn()
  render(
    <Drawer open title="Transaction details" onClose={onClose}>
      <p>Body content</p>
    </Drawer>
  )
  return { onClose, user: userEvent.setup() }
}

describe('Drawer', () => {
  it('is an accessible dialog named by its title', () => {
    setup()
    expect(screen.getByRole('dialog', { name: 'Transaction details' })).toHaveFocus()
  })

  it('does not close when clicking inside the panel', async () => {
    const { onClose, user } = setup()
    await user.click(screen.getByText('Body content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes from the close button and from Escape', async () => {
    const { onClose, user } = setup()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
