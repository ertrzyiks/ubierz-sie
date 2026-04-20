import { clothingItems, type ClothingBodyPart } from "./clothes";

export const BODY_PARTS: Array<{ id: ClothingBodyPart; label: string }> = [
  { id: "head", label: "Głowa" },
  { id: "torso", label: "Tułów" },
  { id: "hands", label: "Dłonie" },
  { id: "legs", label: "Nogi" },
  { id: "feet", label: "Stopy" },
];

export function buildGameQueue(selectedIds: string[]): string[] {
  const selectedSet = new Set(selectedIds);

  // Build buckets for all non-hands body parts: items sorted by layer ASC.
  const buckets: string[][] = BODY_PARTS.filter(({ id }) => id !== "hands")
    .map(({ id: partId }) =>
      clothingItems
        .filter((item) => item.bodyPart === partId && selectedSet.has(item.id))
        .sort((a, b) => a.layer - b.layer)
        .map((item) => item.id),
    )
    .filter((bucket) => bucket.length > 0);

  // Hands are always picked last.
  const handsBucket = clothingItems
    .filter((item) => item.bodyPart === "hands" && selectedSet.has(item.id))
    .sort((a, b) => a.layer - b.layer)
    .map((item) => item.id);

  const queue: string[] = [];

  while (buckets.length > 0) {
    // Pick a random body part bucket.
    const randomIndex = Math.floor(Math.random() * buckets.length);
    const bucket = buckets[randomIndex]!;

    // Pull the first (lowest-layer) item from that bucket.
    queue.push(bucket.shift()!);

    // Drop empty buckets.
    if (bucket.length === 0) {
      buckets.splice(randomIndex, 1);
    }
  }

  queue.push(...handsBucket);

  return queue;
}
