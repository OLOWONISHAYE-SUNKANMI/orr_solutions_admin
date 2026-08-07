import DocumentDetailClient from './DocumentDetailClient';

export function generateStaticParams() {
  const params = [
    { id: '[id]' },
  ];

  // Pre-generate range of dynamic document IDs for static HTML export compatibility
  for (let i = 1; i <= 200; i++) {
    params.push({ id: String(i) });
  }

  return params;
}

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return <DocumentDetailClient params={params} />;
}
