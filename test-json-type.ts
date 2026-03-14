import { json, table, string, type Row, createSchema } from '@rocicorp/zero';

// Test 1: simple JSON type
type MySettings = { theme: 'light' | 'dark'; fontSize: number };
const t1 = table('test1')
  .columns({ id: string(), settings: json<MySettings>().optional() })
  .primaryKey('id');

// Test 2: array JSON type (like editor content)
type EditorContent = Array<{ type: string; children: Array<{ text: string }> }>;
const t2 = table('test2')
  .columns({ id: string(), content: json<EditorContent>().optional() })
  .primaryKey('id');

const s = createSchema({ tables: [t1, t2], relationships: [] });
type R1 = Row<(typeof s)['tables']['test1']>;
type R2 = Row<(typeof s)['tables']['test2']>;

// These should be properly typed:
declare const r1: R1;
declare const r2: R2;

const theme: 'light' | 'dark' | undefined = r1.settings?.theme;
const firstNode: { type: string; children: Array<{ text: string }> } | undefined = r2.content?.[0];

// Test 3: string array
const t3 = table('test3')
  .columns({ id: string(), tags: json<string[]>().optional() })
  .primaryKey('id');
