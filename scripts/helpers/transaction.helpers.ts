import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Represents a single insert/upsert operation for a Supabase table.
 */
export interface InsertOp {
  table: string;
  row: Record<string, any>;
}

/**
 * Batch insert/upsert rows into Supabase tables.
 * Groups operations by table, merges rows with the same id, then upserts in batches.
 * Handles conflicts with retry logic and exponential backoff.
 */
export async function batchTransact(
  supabase: SupabaseClient,
  ops: InsertOp[],
  batchSize = 100
): Promise<void> {
  if (ops.length === 0) return;

  // Group by table and merge rows with the same id
  const grouped = new Map<string, Map<string, Record<string, any>>>();

  for (const op of ops) {
    if (!grouped.has(op.table)) grouped.set(op.table, new Map());
    const tableMap = grouped.get(op.table)!;
    const rowId = op.row.id;

    if (rowId && tableMap.has(rowId)) {
      // Merge: later ops fill in missing fields (don't overwrite with undefined)
      const existing = tableMap.get(rowId)!;
      for (const [key, value] of Object.entries(op.row)) {
        if (value !== undefined) {
          existing[key] = value;
        }
      }
    } else {
      tableMap.set(rowId || `_no_id_${tableMap.size}`, { ...op.row });
    }
  }

  // Insert in batches per table
  for (const [table, rowMap] of grouped) {
    const rows = Array.from(rowMap.values());

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      let retries = 3;

      while (retries > 0) {
        const { error } = await supabase.from(table).upsert(batch, { onConflict: 'id' });

        if (!error) break;

        if (error.code === '23505' || error.message?.includes('duplicate')) {
          const backoff = (4 - retries) * 1000;
          console.warn(`  ⚠️  Conflict in ${table}, retrying in ${backoff}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          retries--;
        } else {
          throw new Error(`Failed to upsert into ${table}: ${error.message}`);
        }
      }

      if (retries === 0) {
        throw new Error(`Failed to upsert into ${table} after 3 retries`);
      }
    }
  }
}
