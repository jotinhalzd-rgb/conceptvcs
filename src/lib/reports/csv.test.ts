import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toCSV, csvFilename } from "./csv";

describe("reports/csv / toCSV", () => {
  it("renders header line even with no rows", () => {
    const out = toCSV([], [{ key: "id", label: "ID" }]);
    expect(out).toBe("ID\n");
  });

  it("escapes commas, quotes and newlines by wrapping in double quotes", () => {
    const out = toCSV(
      [{ name: 'Ana, "A"', note: "linha1\nlinha2" }],
      [
        { key: "name", label: "Nome" },
        { key: "note", label: "Nota" },
      ],
    );
    expect(out).toBe('Nome,Nota\n"Ana, ""A""","linha1\nlinha2"');
  });

  it("renders null/undefined as empty string", () => {
    const out = toCSV(
      [{ a: null, b: undefined, c: 0 }],
      [
        { key: "a", label: "A" },
        { key: "b", label: "B" },
        { key: "c", label: "C" },
      ],
    );
    expect(out).toBe("A,B,C\n,,0");
  });

  it("preserves unicode characters", () => {
    const out = toCSV(
      [{ x: "ação — café ☕" }],
      [{ key: "x", label: "X" }],
    );
    expect(out).toContain("ação — café ☕");
  });
});

describe("reports/csv / csvFilename", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-07T10:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("formats filename with zero-padded date", () => {
    expect(csvFilename("inbox")).toBe("relatorio-inbox-20260107.csv");
  });
});