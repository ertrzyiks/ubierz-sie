import { describe, it, expect } from "vitest";
import { buildGameQueue } from "./buildGameQueue";

// ── tests ────────────────────────────────────────────────────────────────────

describe("buildGameQueue", () => {
  it("returns an empty array when no ids are selected", () => {
    expect(buildGameQueue([])).toEqual([]);
  });

  it("returns exactly the selected ids — no extras, no omissions", () => {
    const selected = ["koszulka", "spodnie", "buty", "skarpetki"];
    const queue = buildGameQueue(selected);
    expect(queue).toHaveLength(selected.length);
    expect(queue.sort()).toEqual([...selected].sort());
  });

  it("ignores ids that do not exist in clothingItems", () => {
    const queue = buildGameQueue(["koszulka", "nieistniejace-ubranie"]);
    expect(queue).toEqual(["koszulka"]);
  });

  it("deduplicates repeated ids", () => {
    const queue = buildGameQueue(["koszulka", "koszulka", "spodnie"]);
    expect(queue).toHaveLength(2);
  });

  // ── layer ordering within a body part ──────────────────────────────────────

  it("skarpetki (feet layer 1) always comes before buty (feet layer 2)", () => {
    // Run many times to rule out lucky random ordering.
    for (let i = 0; i < 50; i++) {
      const queue = buildGameQueue(["buty", "skarpetki"]);
      expect(queue.indexOf("skarpetki")).toBeLessThan(queue.indexOf("buty"));
    }
  });

  it("koszulka (torso layer 2) always comes before bluza (torso layer 3)", () => {
    for (let i = 0; i < 50; i++) {
      const queue = buildGameQueue(["bluza", "koszulka"]);
      expect(queue.indexOf("koszulka")).toBeLessThan(queue.indexOf("bluza"));
    }
  });

  it("bluza (torso layer 3) always comes before kurtka (torso layer 4)", () => {
    for (let i = 0; i < 50; i++) {
      const queue = buildGameQueue(["kurtka", "bluza"]);
      expect(queue.indexOf("bluza")).toBeLessThan(queue.indexOf("kurtka"));
    }
  });

  it("koszulka → bluza → kurtka order is preserved when all three are selected", () => {
    for (let i = 0; i < 50; i++) {
      const queue = buildGameQueue(["kurtka", "bluza", "koszulka"]);
      expect(queue.indexOf("koszulka")).toBeLessThan(queue.indexOf("bluza"));
      expect(queue.indexOf("bluza")).toBeLessThan(queue.indexOf("kurtka"));
    }
  });

  it("hands are always picked after non-hands items", () => {
    for (let i = 0; i < 50; i++) {
      const queue = buildGameQueue([
        "kurtka",
        "spodnie",
        "czapka-zimowa",
        "rekawiczki",
      ]);

      const handIndex = queue.indexOf("rekawiczki");
      const nonHands = ["kurtka", "spodnie", "czapka-zimowa"];
      const lastNonHandsIndex = Math.max(
        ...nonHands.map((id) => queue.indexOf(id)),
      );

      expect(handIndex).toBeGreaterThan(lastNonHandsIndex);
    }
  });

  // ── cross-body-part interleaving is random ─────────────────────────────────

  it("items from different body parts can appear in any interleaved order", () => {
    // With enough runs, czapka-zimowa (head) should sometimes appear before
    // AND sometimes after skarpetki (feet) — they are independent.
    const headFirst: boolean[] = [];
    for (let i = 0; i < 100; i++) {
      const queue = buildGameQueue(["czapka-zimowa", "skarpetki"]);
      headFirst.push(
        queue.indexOf("czapka-zimowa") < queue.indexOf("skarpetki"),
      );
    }
    expect(headFirst.some(Boolean)).toBe(true);
    expect(headFirst.some((v) => !v)).toBe(true);
  });

  // ── full winter preset ─────────────────────────────────────────────────────

  it("processes the full winter selection with correct layer ordering", () => {
    const winter = [
      "czapka-zimowa",
      "szalik",
      "kurtka",
      "spodnie",
      "skarpetki",
      "buty",
      "rekawiczki",
    ];

    for (let i = 0; i < 30; i++) {
      const queue = buildGameQueue(winter);
      expect(queue).toHaveLength(winter.length);

      // feet: skarpetki before buty
      expect(queue.indexOf("skarpetki")).toBeLessThan(queue.indexOf("buty"));

      // torso layers: kurtka(4) < szalik(5)
      const torsoPresentIds = ["szalik", "kurtka"].filter((id) =>
        queue.includes(id),
      );
      if (torsoPresentIds.length === 2) {
        expect(queue.indexOf("kurtka")).toBeLessThan(queue.indexOf("szalik"));
      }
    }
  });

  // ── single item ────────────────────────────────────────────────────────────

  it("handles a single selected item", () => {
    expect(buildGameQueue(["koszulka"])).toEqual(["koszulka"]);
  });
});
