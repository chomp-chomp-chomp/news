'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import { Database } from '@/types/database'

type Publication = Database['public']['Tables']['publications']['Row']

interface MobileSidebarProps {
  userEmail: string
  publications: Publication[]
}

export default function MobileSidebar({ userEmail, publications }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="mobile-menu-button"
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
          padding: '0.75rem',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          display: 'none', // Hidden by default, shown via CSS media query
        }}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {isOpen ? (
            // X icon when open
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            // Hamburger icon when closed
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Overlay - only visible on mobile when sidebar is open */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            display: 'none', // Hidden by default, shown via CSS media query
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${isOpen ? 'mobile-open' : ''}`}
        style={{
          width: '250px',
          backgroundColor: 'var(--color-sidebar)',
          borderRight: '1px solid var(--color-border)',
          padding: 'var(--spacing-md)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Newsletter Admin</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>
            {userEmail}
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
              Main
            </h3>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/admin" onClick={closeSidebar} style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.2s',
                }}>
                  Dashboard
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/admin/publications" onClick={closeSidebar} style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.2s',
                }}>
                  Publications
                </Link>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <Link href="/admin/settings" onClick={closeSidebar} style={{
                  display: 'block',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background 0.2s',
                }}>
                  Site Settings
                </Link>
              </li>
            </ul>
          </div>

          {publications.length > 0 && (
            <div>
              <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                Your Publications
              </h3>
              <ul style={{ listStyle: 'none' }}>
                {publications.map((pub: Publication) => (
                  <li key={pub.id} style={{ marginBottom: '0.5rem' }}>
                    <Link href={`/admin/publications/${pub.id}`} onClick={closeSidebar} style={{
                      display: 'block',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s',
                    }}>
                      {pub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
          <Link href="/" className="btn btn-secondary" onClick={closeSidebar} style={{ width: '100%', marginBottom: '0.5rem', justifyContent: 'center' }}>
            View Public Site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: block !important;
          }

          .sidebar-overlay {
            display: block !important;
          }

          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 999;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
          }

          .admin-sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  )
}
