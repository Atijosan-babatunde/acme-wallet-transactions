'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cx } from '@/lib/cx'
import { UserMenu } from './UserMenu'
import styles from './Navbar.module.css'

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/convert', label: 'Convert' },
]

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

export function Navbar() {
  // usePathname is the same on server and client (window.location caused a hydration mismatch)
  // and updates on client-side navigation.
  const pathname = usePathname()

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          acme<span className={styles.logoDot}>.</span>wallet
        </Link>
        <nav className={styles.links} aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cx(styles.link, isActive(pathname, link.href) && styles.active)}
              aria-current={isActive(pathname, link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <UserMenu />
      </div>
    </header>
  )
}
