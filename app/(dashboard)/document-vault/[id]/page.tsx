import DocumentDetailClient from './DocumentDetailClient';

export function generateStaticParams() {
  return [
    { id: '[id]' },
    { id: 'doc_1' },
    { id: 'doc_2' },
    { id: 'doc_3' },
  ];
}

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return <DocumentDetailClient params={params} />;
}
