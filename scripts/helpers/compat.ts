import type { InsertOp } from './transaction.helpers';

/**
 * Compatibility layer that mimics the InstantDB tx API but produces
 * InsertOp objects for Supabase batch inserts.
 *
 * Usage: tx.tableName[entityId].update({...}).link({...})
 * Returns an InsertOp-compatible object with { table, row } properties.
 */
class ChainableOp {
  table: string;
  row: Record<string, any>;

  constructor(table: string, entityId: string) {
    this.table = table;
    this.row = { id: entityId };
  }

  update(fields: Record<string, any>): ChainableOp {
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        this.row[key] = value;
      }
    }
    return this;
  }

  link(links: Record<string, any>): ChainableOp {
    for (const [key, value] of Object.entries(links)) {
      if (value === undefined) continue;
      // Convert link field to FK column: "organizer" → "organizerId"
      const fkKey = key.endsWith('Id') ? key : `${key}Id`;
      // If value is an array, take the first element (e.g., .link({ roles: [roleId] }))
      this.row[fkKey] = Array.isArray(value) ? value[0] : value;
    }
    return this;
  }

  delete(): InsertOp {
    return { table: this.table, row: { id: this.row.id, _delete: true } };
  }
}

/**
 * Creates a tx proxy that mimics InstantDB's transaction builder.
 * tx.tableName[entityId] returns a ChainableOp.
 *
 * Special handling: '$users' maps to 'profiles' table.
 */
function createTx(): any {
  return new Proxy(
    {},
    {
      get: (_target, tableName: string) => {
        const resolvedTable = tableName === '$users' ? 'profiles' : tableName;
        return new Proxy(
          {},
          {
            get: (_target2, entityId: string) => {
              return new ChainableOp(resolvedTable, entityId);
            },
          }
        );
      },
    }
  );
}

/**
 * Singleton tx proxy instance.
 * Drop-in replacement for `import { tx } from '@instantdb/admin'`
 */
export const tx: any = createTx();
