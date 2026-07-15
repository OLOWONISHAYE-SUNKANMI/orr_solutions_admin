import ProjectReviewClient from './ProjectReviewClient';

// Removed dummy generateStaticParams

export default function ProjectReviewPage({ params }: { params: { id: string } }) {
  return <ProjectReviewClient />;
}
