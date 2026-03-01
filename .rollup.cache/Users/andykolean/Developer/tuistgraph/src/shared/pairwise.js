/**
 * Generates all unique unordered pairs from an array.
 *
 * @example
 * for (const [a, b] of pairwise([1, 2, 3])) {
 *   // [1,2], [1,3], [2,3]
 * }
 */
export function* pairwise(items) {
    for (let i = 0; i < items.length; i++) {
        const a = items[i];
        if (a === undefined)
            continue;
        for (let j = i + 1; j < items.length; j++) {
            const b = items[j];
            if (b === undefined)
                continue;
            yield [a, b];
        }
    }
}
/**
 * Generates consecutive adjacent pairs from an array.
 *
 * @example
 * for (const [prev, next] of adjacentPairs([1, 2, 3])) {
 *   // [1,2], [2,3]
 * }
 */
export function adjacentPairs(items) {
    const pairs = [];
    for (let i = 1; i < items.length; i++) {
        const prev = items[i - 1];
        const curr = items[i];
        if (prev === undefined || curr === undefined)
            continue;
        pairs.push([prev, curr]);
    }
    return pairs;
}
//# sourceMappingURL=pairwise.js.map