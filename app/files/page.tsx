import { PageWrapper } from '@/components/layout/page-wrapper';

export default function FilesPage() {
  return (
    <PageWrapper className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Files</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-semibold">File Management</h2>
          <p className="text-muted-foreground">Upload and manage your files</p>
        </div>
      </div>
    </PageWrapper>
  );
}
