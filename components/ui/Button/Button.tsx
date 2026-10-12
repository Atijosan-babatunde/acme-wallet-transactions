import type { ReactNode } from 'react'
import { cx } from '@/lib/cx'
import { Icon, type IconName } from '../Icon'
import styles from './Button.module.css'

export interface ButtonProps {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  iconLeft?: IconName
  iconRight?: IconName
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  'aria-label'?: string
  'aria-current'?: 'page'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  iconLeft,
  iconRight,
  fullWidth,
  disabled,
  onClick,
  className,
  ...rest
}: ButtonProps) {
  // A real <button>: focusable, activates with Enter/Space, announced as a button, and
  // `disabled` actually blocks interaction. It used to be a <div> with onClick.
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {iconLeft && <Icon name={iconLeft} size={16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  )
}
