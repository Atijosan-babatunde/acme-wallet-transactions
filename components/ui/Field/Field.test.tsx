import { render, screen } from '@testing-library/react'
import { Input } from '../Input'
import { Select } from '../Select'

describe('Field labels', () => {
  it('names the input and the select they belong to', () => {
    render(
      <>
        <Input label="Search" />
        <Select label="Type" options={[{ value: '', label: 'All types' }]} />
      </>
    )
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Type' })).toBeInTheDocument()
  })
})
