export type SubmissionProject = {
  id: number
  title: string
  subtitle: string
  description: string
  rarity: number
  tags?: string[]
}

export type Scene3DProps = {
  projects: SubmissionProject[]
  onProjectClick: (project: SubmissionProject) => void
  onProjectSelect: (index: number) => void
}

export type ProjectModalProps = {
  project: SubmissionProject | null
  onClose: () => void
}

