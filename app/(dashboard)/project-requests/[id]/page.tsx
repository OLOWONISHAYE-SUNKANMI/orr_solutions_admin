import ProjectReviewClient from './ProjectReviewClient';

export function generateStaticParams() {
  const params = [
    { id: '[id]' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];

  // Pre-generate range of dynamic project IDs for static HTML export compatibility
  for (let i = 1; i <= 100; i++) {
    const formattedId = `ORR-PROJ-${String(i).padStart(6, '0')}`;
    params.push({ id: formattedId });
  }

  return params;
}

export default function ProjectReviewPage() {
  return <ProjectReviewClient />;
}
