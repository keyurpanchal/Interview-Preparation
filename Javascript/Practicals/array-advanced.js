/* =============================================================================
   ARRAY PRACTICALS — LEVEL 2
   (basics live in array.js — this file is what actually gets asked at 5 YOE)
============================================================================= */

// ---------------------------------------------------------------------------
// 1. Chunk an array into groups of n  (pagination / grid rows)

function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) {
        out.push(arr.slice(i, i + size));
    }
    return out;
}

console.log(chunk([1, 2, 3, 4, 5, 6, 7], 3)); // [[1,2,3],[4,5,6],[7]]

// ---------------------------------------------------------------------------
// 2. Flatten a nested array to any depth (3 ways — they ask for the manual one)

function flattenBuiltIn(arr) {
    return arr.flat(Infinity);
}

function flattenRecursive(arr) {
    return arr.reduce(
        (acc, item) => acc.concat(Array.isArray(item) ? flattenRecursive(item) : item),
        []
    );
}

function flattenIterative(arr) {
    const stack = [...arr];
    const out = [];
    while (stack.length) {
        const item = stack.pop();
        if (Array.isArray(item)) stack.push(...item);
        else out.push(item);
    }
    return out.reverse();
}

const nested = [1, [2, [3, [4, [5]]]]];
console.log(flattenBuiltIn(nested));   // [1,2,3,4,5]
console.log(flattenRecursive(nested)); // [1,2,3,4,5]
console.log(flattenIterative(nested)); // [1,2,3,4,5]

// Flatten to a given depth (the follow-up question)
function flattenDepth(arr, depth = 1) {
    if (depth < 1) return arr.slice();
    return arr.reduce(
        (acc, item) => acc.concat(Array.isArray(item) ? flattenDepth(item, depth - 1) : item),
        []
    );
}

console.log(flattenDepth([1, [2, [3, [4]]]], 2)); // [1, 2, 3, [4]]

// ---------------------------------------------------------------------------
// 3. Rotate array by k positions

function rotateRight(arr, k) {
    const n = arr.length;
    if (!n) return arr;
    k = k % n;
    return [...arr.slice(-k), ...arr.slice(0, -k)];
}

function rotateLeft(arr, k) {
    const n = arr.length;
    if (!n) return arr;
    k = k % n;
    return [...arr.slice(k), ...arr.slice(0, k)];
}

console.log(rotateRight([1, 2, 3, 4, 5], 2)); // [4,5,1,2,3]
console.log(rotateLeft([1, 2, 3, 4, 5], 2));  // [3,4,5,1,2]

// ---------------------------------------------------------------------------
// 4. Move all zeros to the end (in-place, keep order) — two pointer

function moveZeros(arr) {
    let insertAt = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== 0) {
            [arr[insertAt], arr[i]] = [arr[i], arr[insertAt]];
            insertAt++;
        }
    }
    return arr;
}

console.log(moveZeros([0, 1, 0, 3, 12])); // [1,3,12,0,0]

// ---------------------------------------------------------------------------
// 5. Second largest element (single pass, no sort)

function secondLargest(arr) {
    let first = -Infinity, second = -Infinity;
    for (const n of arr) {
        if (n > first) {
            second = first;
            first = n;
        } else if (n > second && n < first) {
            second = n;
        }
    }
    return second === -Infinity ? null : second;
}

console.log(secondLargest([10, 5, 8, 10, 3])); // 8

// ---------------------------------------------------------------------------
// 6. Kadane's algorithm — maximum subarray sum

function maxSubarraySum(arr) {
    let best = arr[0], current = arr[0];
    for (let i = 1; i < arr.length; i++) {
        current = Math.max(arr[i], current + arr[i]);
        best = Math.max(best, current);
    }
    return best;
}

console.log(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6  -> [4,-1,2,1]

// ---------------------------------------------------------------------------
// 7. Maximum sum of k consecutive elements (sliding window)

function maxSumWindow(arr, k) {
    let sum = 0;
    for (let i = 0; i < k; i++) sum += arr[i];
    let best = sum;
    for (let i = k; i < arr.length; i++) {
        sum += arr[i] - arr[i - k];
        best = Math.max(best, sum);
    }
    return best;
}

console.log(maxSumWindow([2, 1, 5, 1, 3, 2], 3)); // 9

// ---------------------------------------------------------------------------
// 8. Find the missing number in 1..n

function missingNumber(arr, n) {
    const expected = (n * (n + 1)) / 2;
    const actual = arr.reduce((a, b) => a + b, 0);
    return expected - actual;
}

console.log(missingNumber([1, 2, 4, 5], 5)); // 3

// ---------------------------------------------------------------------------
// 9. Find all duplicates in an array

function findDuplicates(arr) {
    const seen = new Set();
    const dupes = new Set();
    for (const item of arr) {
        if (seen.has(item)) dupes.add(item);
        else seen.add(item);
    }
    return [...dupes];
}

console.log(findDuplicates([1, 2, 3, 2, 4, 3, 5])); // [2,3]

// ---------------------------------------------------------------------------
// 10. Frequency count of items

function frequency(arr) {
    return arr.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});
}

console.log(frequency(['a', 'b', 'a', 'c', 'b', 'a'])); // { a: 3, b: 2, c: 1 }

// ---------------------------------------------------------------------------
// 11. Union / intersection / difference — with Set for O(n)

const union = (a, b) => [...new Set([...a, ...b])];
const intersection = (a, b) => {
    const setB = new Set(b);
    return [...new Set(a.filter((x) => setB.has(x)))];
};
const difference = (a, b) => {
    const setB = new Set(b);
    return a.filter((x) => !setB.has(x));
};

console.log(union([1, 2, 3], [3, 4]));        // [1,2,3,4]
console.log(intersection([1, 2, 3], [2, 3, 4])); // [2,3]
console.log(difference([1, 2, 3], [2, 3, 4]));   // [1]

// ---------------------------------------------------------------------------
// 12. Two Sum in O(n) with a hash map (the optimal answer for array.js version)

function twoSumOptimal(nums, target) {
    const seen = new Map(); // value -> index
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        if (seen.has(need)) return [seen.get(need), i];
        seen.set(nums[i], i);
    }
    return [];
}

console.log(twoSumOptimal([2, 7, 11, 15], 9)); // [0,1]

// ---------------------------------------------------------------------------
// 13. Merge two sorted arrays (without concat+sort)

function mergeSorted(a, b) {
    const out = [];
    let i = 0, j = 0;
    while (i < a.length && j < b.length) {
        out.push(a[i] <= b[j] ? a[i++] : b[j++]);
    }
    while (i < a.length) out.push(a[i++]);
    while (j < b.length) out.push(b[j++]);
    return out;
}

console.log(mergeSorted([1, 3, 5], [2, 4, 6])); // [1,2,3,4,5,6]

// ---------------------------------------------------------------------------
// 14. Binary search (iterative)

function binarySearch(arr, target) {
    let low = 0, high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

console.log(binarySearch([1, 3, 5, 7, 9, 11], 7)); // 3

// ---------------------------------------------------------------------------
// 15. Zip two/many arrays

function zip(...arrays) {
    const len = Math.min(...arrays.map((a) => a.length));
    return Array.from({ length: len }, (_, i) => arrays.map((a) => a[i]));
}

console.log(zip([1, 2, 3], ['a', 'b', 'c'])); // [[1,'a'],[2,'b'],[3,'c']]

// ---------------------------------------------------------------------------
// 16. Longest consecutive sequence — O(n) with a Set

function longestConsecutive(arr) {
    const set = new Set(arr);
    let best = 0;
    for (const n of set) {
        if (set.has(n - 1)) continue; // only start counting from a sequence head
        let length = 1;
        while (set.has(n + length)) length++;
        best = Math.max(best, length);
    }
    return best;
}

console.log(longestConsecutive([100, 4, 200, 1, 3, 2])); // 4  -> [1,2,3,4]

// ---------------------------------------------------------------------------
// 17. Majority element (Boyer-Moore voting)

function majorityElement(arr) {
    let candidate = null, count = 0;
    for (const n of arr) {
        if (count === 0) candidate = n;
        count += n === candidate ? 1 : -1;
    }
    return candidate;
}

console.log(majorityElement([2, 2, 1, 1, 1, 2, 2])); // 2

// ---------------------------------------------------------------------------
// 18. Array of objects — remove duplicates by key

function uniqueBy(arr, key) {
    const seen = new Set();
    return arr.filter((item) => {
        if (seen.has(item[key])) return false;
        seen.add(item[key]);
        return true;
    });
}

const users = [
    { id: 1, name: 'A' },
    { id: 2, name: 'B' },
    { id: 1, name: 'A dup' },
];
console.log(uniqueBy(users, 'id')); // [{id:1,name:'A'},{id:2,name:'B'}]

// ---------------------------------------------------------------------------
// 19. Sort array of objects by multiple keys (real table-sorting task)

function sortBy(arr, ...keys) {
    return [...arr].sort((a, b) => {
        for (const key of keys) {
            const desc = key.startsWith('-');
            const k = desc ? key.slice(1) : key;
            if (a[k] === b[k]) continue;
            const result = a[k] > b[k] ? 1 : -1;
            return desc ? -result : result;
        }
        return 0;
    });
}

const employees = [
    { dept: 'IT', salary: 50 },
    { dept: 'HR', salary: 70 },
    { dept: 'IT', salary: 90 },
];
console.log(sortBy(employees, 'dept', '-salary'));
// [{dept:'HR',salary:70},{dept:'IT',salary:90},{dept:'IT',salary:50}]

// ---------------------------------------------------------------------------
// 20. Custom sort with a priority order (e.g. status column)

function sortByPriority(arr, key, order) {
    const rank = new Map(order.map((v, i) => [v, i]));
    return [...arr].sort(
        (a, b) => (rank.get(a[key]) ?? Infinity) - (rank.get(b[key]) ?? Infinity)
    );
}

const tickets = [{ status: 'done' }, { status: 'open' }, { status: 'progress' }];
console.log(sortByPriority(tickets, 'status', ['open', 'progress', 'done']));
// [{status:'open'},{status:'progress'},{status:'done'}]

// ---------------------------------------------------------------------------
// 21. range() and generating fixed-length arrays

const range = (start, end, step = 1) =>
    Array.from({ length: Math.ceil((end - start) / step) }, (_, i) => start + i * step);

console.log(range(0, 10, 2)); // [0,2,4,6,8]

// Careful: new Array(3).map(...) does NOT work — array holes are skipped.
console.log(new Array(3).map((_, i) => i));        // [ <3 empty items> ]
console.log(Array.from({ length: 3 }, (_, i) => i)); // [0,1,2]   <- correct way

// ---------------------------------------------------------------------------
// 22. Flatten an array of objects into a tree / build tree from flat list
// (menus, comment threads, category trees — asked a lot in frontend rounds)

function buildTree(items, parentKey = 'parentId', idKey = 'id') {
    const map = new Map();
    const roots = [];
    items.forEach((item) => map.set(item[idKey], { ...item, children: [] }));
    items.forEach((item) => {
        const node = map.get(item[idKey]);
        const parent = map.get(item[parentKey]);
        if (parent) parent.children.push(node);
        else roots.push(node);
    });
    return roots;
}

const flatMenu = [
    { id: 1, parentId: null, name: 'Home' },
    { id: 2, parentId: null, name: 'Products' },
    { id: 3, parentId: 2, name: 'Laptops' },
    { id: 4, parentId: 3, name: 'Gaming' },
];
console.log(JSON.stringify(buildTree(flatMenu), null, 2));

// Reverse: flatten the tree back
function flattenTree(nodes, depth = 0) {
    return nodes.reduce((acc, node) => {
        const { children = [], ...rest } = node;
        return [...acc, { ...rest, depth }, ...flattenTree(children, depth + 1)];
    }, []);
}

console.log(flattenTree(buildTree(flatMenu)));

// ---------------------------------------------------------------------------
