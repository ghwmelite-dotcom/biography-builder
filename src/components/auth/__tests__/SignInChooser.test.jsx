import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SignInChooser } from '../SignInChooser'

describe('SignInChooser', () => {
  it('renders the "Continue with phone" tile (always visible — flag gate dropped)', () => {
    const { getByText } = render(<SignInChooser />)
    expect(getByText('Continue with phone')).toBeTruthy()
  })

  it('renders the "Sign up" link', () => {
    const { getByText } = render(<SignInChooser />)
    expect(getByText('Sign up')).toBeTruthy()
  })

  it('clicking "Continue with phone" opens the phone+PIN login dialog', () => {
    const { getByText, queryByText } = render(<SignInChooser />)
    expect(queryByText('Sign in with phone')).toBeNull()
    fireEvent.click(getByText('Continue with phone'))
    expect(queryByText('Sign in with phone')).toBeTruthy()
  })

  it('clicking "Sign up" opens the signup dialog', () => {
    const { getByText, queryByText } = render(<SignInChooser />)
    expect(queryByText('Create your account')).toBeNull()
    fireEvent.click(getByText('Sign up'))
    expect(queryByText('Create your account')).toBeTruthy()
  })
})
