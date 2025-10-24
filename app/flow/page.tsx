'use client';

import { FlowEditor } from '@/components/ui-flow/flowEditor';
import { GroupHierarchyFlow } from '@/components/groups/GroupHierarchyFlow';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FlowPage() {
  return (
    <AuthGuard requireAuth={true}>
      <div className="h-full w-full">
        <div className="container mx-auto p-8">
          <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Flow Editor</h1>
            <p className="text-muted-foreground">
              Create and edit visual workflows, process diagrams, and group hierarchies.
            </p>
          </div>

          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Flow Editor</TabsTrigger>
              <TabsTrigger value="hierarchy">Gruppenhierarchie</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-0">
              <div className="h-[600px] w-full rounded-lg border">
                <FlowEditor />
              </div>
            </TabsContent>

            <TabsContent value="hierarchy" className="mt-0">
              <GroupHierarchyFlow />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
