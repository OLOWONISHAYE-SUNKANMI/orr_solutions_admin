import ProjectReviewClient from './ProjectReviewClient';

export function generateStaticParams() {
  return [
    { id: '[id]' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function ProjectReviewPage() {
  return <ProjectReviewClient />;
}
