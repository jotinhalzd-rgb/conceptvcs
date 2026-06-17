import { vi } from "vitest";

/**
 * Builds a chainable Supabase query mock.
 * Every chainable method returns the builder itself. Terminal methods
 * (`maybeSingle`, `single`, the awaited builder) resolve to `result`.
 *
 * Usage:
 *   const supabase = makeSupabaseMock({ from: { data: [{ id: "1" }], error: null } });
 *   const { data } = await supabase.from("queues").select("*").eq("id", "1");
 */
export function makeSupabaseMock(
  resultsByTable: Record<string, { data?: unknown; error?: unknown } | undefined> = {},
  defaultResult: { data?: unknown; error?: unknown } = { data: null, error: null },
) {
  function builder(table: string) {
    const result = resultsByTable[table] ?? defaultResult;
    const thenable = {
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve),
    };
    const chain: Record<string, unknown> = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      upsert: vi.fn(() => chain),
      delete: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      neq: vi.fn(() => chain),
      in: vi.fn(() => chain),
      is: vi.fn(() => chain),
      gt: vi.fn(() => chain),
      gte: vi.fn(() => chain),
      lt: vi.fn(() => chain),
      lte: vi.fn(() => chain),
      like: vi.fn(() => chain),
      ilike: vi.fn(() => chain),
      or: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      range: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve(result)),
      maybeSingle: vi.fn(() => Promise.resolve(result)),
      then: thenable.then,
    };
    return chain;
  }

  return {
    from: vi.fn((table: string) => builder(table)),
    rpc: vi.fn((_name: string) => Promise.resolve(defaultResult)),
  };
}

export type SupabaseMock = ReturnType<typeof makeSupabaseMock>;