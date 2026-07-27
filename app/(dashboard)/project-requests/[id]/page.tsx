import ProjectReviewClient from './ProjectReviewClient';

export function generateStaticParams() {
  return [
    { id: 'ORR-PROJ-000001' },
    { id: 'ORR-PROJ-000002' }
  ];
}

export default function ProjectReviewPage({ params }: { params: { id: string } }) {
  return <ProjectReviewClient />;
}
