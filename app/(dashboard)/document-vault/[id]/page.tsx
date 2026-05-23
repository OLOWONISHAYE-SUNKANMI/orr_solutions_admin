import DocumentDetailClient from './DocumentDetailClient';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return <DocumentDetailClient params={params} />;
}
