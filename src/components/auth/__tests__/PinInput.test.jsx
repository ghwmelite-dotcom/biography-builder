import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { PinInput } from '../PinInput'

describe('PinInput', () => {
  it('renders 6 password boxes by default', () => {
    const { container } = render(<PinInput value="" onChange={() => {}} />)
    const inputs = container.querySelectorAll('input[type="password"]')
    expect(inputs).toHaveLength(6)
  })

  it('respects the length prop', () => {
    const { container } = render(<PinInput value="" onChange={() => {}} length={4} />)
    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(4)
  })

  it('uses ariaLabel for each digit', () => {
    const { getByLabelText } = render(
      <PinInput value="" onChange={() => {}} ariaLabel="New PIN" />,
    )
    expect(getByLabelText('New PIN digit 1')).toBeTruthy()
    expect(getByLabelText('New PIN digit 6')).toBeTruthy()
  })

  it('calls onChange with concatenated digits as user types', () => {
    const onChange = vi.fn()
    const { getByLabelText } = render(<PinInput value="" onChange={onChange} ariaLabel="PIN" />)
    fireEvent.change(getByLabelText('PIN digit 1'), { target: { value: '5' } })
    expect(onChange).toHaveBeenCalledWith('5')
  })

  it('strips non-digits from typed input', () => {
    const onChange = vi.fn()
    const { getByLabelText } = render(<PinInput value="" onChange={onChange} ariaLabel="PIN" />)
    fireEvent.change(getByLabelText('PIN digit 1'), { target: { value: 'a' } })
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(/^\d*$/.test(lastCall)).toBe(true)
  })

  it('handles paste of full PIN', () => {
    const onChange = vi.fn()
    const { container } = render(<PinInput value="" onChange={onChange} />)
    const wrapper = container.firstChild
    const pasteEvent = new Event('paste', { bubbles: true, cancelable: true })
    pasteEvent.clipboardData = { getData: () => '654321' }
    fireEvent(wrapper, pasteEvent)
    expect(onChange).toHaveBeenCalledWith('654321')
  })

  it('disables inputs when disabled prop is true', () => {
    const { container } = render(<PinInput value="" onChange={() => {}} disabled />)
    container.querySelectorAll('input').forEach((el) => {
      expect(el.disabled).toBe(true)
    })
  })
})
