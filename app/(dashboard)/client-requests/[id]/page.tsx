import ClientRequestDetailClient from './ClientRequestDetailClient';

export function generateStaticParams() {
  return [
    { id: '[id]' },
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function ClientRequestDetailPage({ params }: { params: { id: string } }) {
  return <ClientRequestDetailClient />;
}
