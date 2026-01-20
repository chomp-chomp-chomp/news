import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requirePublicationAdmin } from '@/lib/auth'
import { getPublicationById } from '@/lib/db/publications'
import { getPublicationLists } from '@/lib/db/lists'
import { ListManagement } from '@/components/admin/ListManagement'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PublicationListsPage({ params }: PageProps) {
  const { id } = await params

  try {
    await requirePublicationAdmin(id)
  } catch {
    return notFound()
  }

  const [publication, lists] = await Promise.all([
    getPublicationById(id),
    getPublicationLists(id),
  ])

  if (!publication) {
    return notFound()
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href={`/admin/publications/${id}`}
          style={{ fontSize: '0.9rem', color: 'var(--color-accent)', textDecoration: 'none' }}
        >
          ← Back to {publication.name}
        </Link>
        <h1 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          Publication Lists
        </h1>
        <p className="text-muted">
          Create and manage subscriber lists for {publication.name}
        </p>
      </div>

      <ListManagement publicationId={id} initialLists={lists} />
    </div>
  )
}
