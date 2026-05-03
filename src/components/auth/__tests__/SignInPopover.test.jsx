import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SignInPopover } from '../SignInPopover'

describe('SignInPopover', () => {
  it('renders Sign in trigger button', () => {
    const { getByText } = render(<SignInPopover />)
    expect(getByText('Sign in')).toBeTruthy()
  })

  it('does not show chooser by default', () => {
    const { queryByText } = render(<SignInPopover />)
    expect(queryByText('Continue with phone')).toBeNull()
  })

  it('clicking Sign in trigger opens the chooser', () => {
    const { getByText, queryByText } = render(<SignInPopover />)
    fireEvent.click(getByText('Sign in'))
    // After click, the popover content (which contains SignInChooser) should be in the DOM
    expect(queryByText('Continue with phone')).toBeTruthy()
  })
})
