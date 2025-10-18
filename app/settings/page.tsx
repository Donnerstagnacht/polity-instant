import { PageWrapper } from '@/components/layout/page-wrapper';

export default function SettingsPage() {
  return (
    <PageWrapper className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-semibold">General</h2>
          <p className="text-muted-foreground">General settings</p>
        </div>
      </div>
    </PageWrapper>
  );
}
