import { requireAuth, getUserPublications } from '@/lib/auth'
import MobileSidebar from '@/components/admin/MobileSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const publications = await getUserPublications(user.id)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <MobileSidebar userEmail={user.email || ''} publications={publications} />

      {/* Main Content */}
      <main className="admin-main-content" style={{ flex: 1, padding: 'var(--spacing-xl)', maxWidth: '1200px' }}>
        {children}
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .admin-main-content {
            margin-left: 0;
            padding-top: 4rem !important;
          }
        }
      `}</style>
    </div>
  )
}
