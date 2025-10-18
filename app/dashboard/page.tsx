export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Dashboard content */}
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 text-lg font-semibold">Overview</h2>
          <p className="text-muted-foreground">Dashboard overview content</p>
        </div>
      </div>
    </div>
  );
}
