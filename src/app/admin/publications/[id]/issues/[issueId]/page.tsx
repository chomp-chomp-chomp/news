import { requirePublicationAdmin } from '@/lib/auth'
import { getPublicationById } from '@/lib/db/publications'
import { getIssueById } from '@/lib/db/issues'
import { notFound } from 'next/navigation'
import IssueEditor from '@/components/admin/IssueEditor'

interface PageProps {
  params: Promise<{ id: string; issueId: string }>
}

export default async function EditIssuePage({ params }: PageProps) {
  const { id, issueId } = await params

  try {
    await requirePublicationAdmin(id)
  } catch {
    return notFound()
  }

  const [publication, issue] = await Promise.all([
    getPublicationById(id),
    getIssueById(issueId),
  ])

  if (!publication || !issue) {
    return notFound()
  }

  // Ensure issue belongs to publication
  if (issue.publication_id !== id) {
    return notFound()
  }

  return (
    <IssueEditor
      publication={publication}
      issue={issue}
      blocks={issue.blocks || []}
    />
  )
}
