/**
 * Utility to properly await Zero mutation server confirmation.
 *
 * `zero.mutate(...)` returns `{ client: Promise, server: Promise }` — NOT a
 * plain Promise. When code does `await zero.mutate(...)`, JavaScript resolves
 * immediately because the return value is not thenable. The `.server` promise
 * must be explicitly awaited to detect server-side rejections.
 *
 * This helper awaits the server result and throws if the mutation was rejected.
 */

interface MutationResultLike {
  server: Promise<{
    readonly type: 'success' | 'error';
    readonly error?: {
      readonly type: string;
      readonly message: string;
    };
  }>;
}

/**
 * Await server confirmation of a Zero mutation.
 * Throws an `Error` whose message comes from the server rejection.
 *
 * @example
 * ```ts
 * const result = zero.mutate(mutators.foo.bar(args));
 * await serverConfirmed(result);
 * toast.success('Done!');
 * ```
 */
export async function serverConfirmed(result: MutationResultLike): Promise<void> {
  const serverResult = await result.server;
  if (serverResult.type === 'error') {
    throw new Error(serverResult.error?.message ?? 'Mutation failed on server');
  }
}
