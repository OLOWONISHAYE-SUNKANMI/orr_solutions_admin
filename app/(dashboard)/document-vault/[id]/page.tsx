import DocumentDetailClient from './DocumentDetailClient';


export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return <DocumentDetailClient params={params} />;
}
