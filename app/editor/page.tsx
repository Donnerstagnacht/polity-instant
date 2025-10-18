'use client';

import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditorPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Rich Text Editor</h1>
        <p className="text-muted-foreground">
          Create and edit documents with our powerful rich text editor powered by Plate.js.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Editor</CardTitle>
          <CardDescription>
            Use the toolbar above to format your text, add images, links, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[600px]">
            <PlateEditor />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
