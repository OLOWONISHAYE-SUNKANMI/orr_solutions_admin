import ClientRequestDetailClient from './ClientRequestDetailClient';

// For static export, Next.js requires generateStaticParams to list all possible dynamic routes.
// Here we provide an empty list as a placeholder. Populate with real IDs when available.
export async function generateStaticParams() {
  return [];
}

export default function ClientRequestDetailPage({ params }: { params: { id: string } }) {
  // params.id contains the dynamic segment value.
  return <ClientRequestDetailClient />;
}
