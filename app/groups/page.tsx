import { PageWrapper } from '@/components/layout/page-wrapper';

export default function GroupsPage() {
  return (
    <PageWrapper className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Groups</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-semibold">Group 1</h2>
          <p className="text-muted-foreground">Group description</p>
        </div>
      </div>
    </PageWrapper>
  );
}
