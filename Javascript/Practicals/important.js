/* =============================================================================
   ⭐ IMPORTANT — 30 MUST-KNOW JS PRACTICALS (Basics → 4 YOE, Frontend)
   -----------------------------------------------------------------------------
   Every one of these is solvable in <= 15 minutes on a shared editor.
   These are the ones that ACTUALLY get asked in the first practical round.
   If you are short on time, this single file is the revision list.

   HOW TO USE:
     1. Cover the solution, write it yourself, then compare.
     2. For each one be ready to answer: "what's the time complexity?"
     3. Always say the brute force first, then optimise — they want to hear
        the thought process, not just the final answer.

   RULES THEY EXPECT YOU TO FOLLOW:
     - Handle empty input / null before the main logic.
     - Prefer Map / Set / object lookup (O(1)) over nested loops (O(n^2)).
     - Don't mutate the input unless asked (return a new array).
     - Say the complexity out loud without being asked.
============================================================================= */


/* ############################################################################
   PART 1 — STRINGS  (Q1 - Q10)
############################################################################ */

// ---------------------------------------------------------------------------
// Q1. Reverse a string — WITHOUT using .reverse()          [5 min | Very high]

function reverseString(str) {
    let reversed = '';
    for (let i = str.length - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

// one-liner they also expect you to know
const reverseShort = (str) => str.split('').reverse().join('');

console.log(reverseString('javascript')); // tpircsavaj
console.log(reverseShort('javascript'));  // tpircsavaj
// Time O(n) | Space O(n)


// ---------------------------------------------------------------------------
// Q2. Palindrome check (ignore case, spaces, punctuation)  [5 min | Very high]
// Two-pointer version — say this one, not the reverse-and-compare one.

function isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0;
    let right = clean.length - 1;
    while (left < right) {
        if (clean[left] !== clean[right]) return false;
        left++;
        right--;
    }
    return true;
}

console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
console.log(isPalindrome('hello'));                          // false
// Time O(n) | Space O(n) for cleaning, O(1) extra for the scan


// ---------------------------------------------------------------------------
// Q3. Character frequency counter                               [5 min | High]
// The base for Q4, Q5, Q22 — learn this pattern once, reuse everywhere.

function charFrequency(str) {
    const freq = {};
    for (const ch of str) {
        freq[ch] = (freq[ch] || 0) + 1;
    }
    return freq;
}

console.log(charFrequency('banana')); // { b: 1, a: 3, n: 2 }

// Bonus: highest occurring character
const maxChar = (str) => {
    const freq = charFrequency(str);
    return Object.keys(freq).reduce((a, b) => (freq[a] >= freq[b] ? a : b));
};
console.log(maxChar('javascript')); // a
// Time O(n) | Space O(k) where k = unique characters


// ---------------------------------------------------------------------------
// Q4. First non-repeating character                        [10 min | Very high]

function firstNonRepeating(str) {
    const freq = {};
    for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
    for (const ch of str) {              // second pass keeps the original order
        if (freq[ch] === 1) return ch;
    }
    return null;
}

console.log(firstNonRepeating('swiss'));  // w
console.log(firstNonRepeating('aabbcc')); // null
// Time O(n) | Space O(k).  Two passes — NOT indexOf inside a loop (that's O(n^2)).


// ---------------------------------------------------------------------------
// Q5. Anagram check                                        [10 min | Very high]

// Approach 1 — sort. O(n log n), easy to write.
const isAnagramSort = (a, b) =>
    a.toLowerCase().split('').sort().join('') === b.toLowerCase().split('').sort().join('');

// Approach 2 — frequency map. O(n), this is the one to show.
function isAnagram(a, b) {
    a = a.toLowerCase().replace(/\s/g, '');
    b = b.toLowerCase().replace(/\s/g, '');
    if (a.length !== b.length) return false;          // early exit

    const freq = {};
    for (const ch of a) freq[ch] = (freq[ch] || 0) + 1;
    for (const ch of b) {
        if (!freq[ch]) return false;                  // missing or already used up
        freq[ch]--;
    }
    return true;
}

console.log(isAnagram('listen', 'silent'));   // true
console.log(isAnagram('hello', 'world'));     // false
// Time O(n) | Space O(k)


// ---------------------------------------------------------------------------
// Q6. Reverse words in a sentence + reverse each word            [5 min | High]

// "I love js"  ->  "js love I"      (word ORDER reversed)
const reverseWordOrder = (str) => str.trim().split(/\s+/).reverse().join(' ');

// "I love js"  ->  "I evol sj"      (each WORD reversed, order kept)
const reverseEachWord = (str) =>
    str.split(' ').map((w) => w.split('').reverse().join('')).join(' ');

console.log(reverseWordOrder('  I love   javascript ')); // javascript love I
console.log(reverseEachWord('I love javascript'));       // I evol tpircsavaj
// Note: /\s+/ handles multiple spaces — mention this, it's the edge case they check.


// ---------------------------------------------------------------------------
// Q7. Capitalize the first letter of every word (Title Case)   [5 min | Medium]

function titleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
        .join(' ');
}

console.log(titleCase('the quick brown fox')); // The Quick Brown Fox
// Edge case: empty strings from double spaces — the ternary above guards it.


// ---------------------------------------------------------------------------
// Q8. String compression — "aaabbc" => "a3b2c1"                  [10 min | High]

function compress(str) {
    let result = '';
    let count = 1;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === str[i + 1]) {
            count++;
        } else {
            result += str[i] + count;
            count = 1;
        }
    }
    return result;
}

console.log(compress('aaabbc'));  // a3b2c1
console.log(compress('aabcccdd')); // a2b1c3d2

// Common follow-up: "return the original if compression doesn't help"
const compressSmart = (str) => {
    const compressed = compress(str);
    return compressed.length < str.length ? compressed : str;
};
console.log(compressSmart('abcd'));   // abcd    (a1b1c1d1 is longer)
console.log(compressSmart('aaabbc')); // aaabbc  (a3b2c1 is the SAME length — not shorter)
// Time O(n) | Space O(n).  Build with an array + join if the string is huge.


// ---------------------------------------------------------------------------
// Q9. Valid parentheses — "{[()]}" ✓  "{[(])}" ✗          [10 min | Very high]
// The standard "do you know a stack?" question.

function isValidParentheses(str) {
    const pairs = { ')': '(', ']': '[', '}': '{' };
    const stack = [];
    for (const ch of str) {
        if (ch === '(' || ch === '[' || ch === '{') {
            stack.push(ch);
        } else if (pairs[ch]) {
            if (stack.pop() !== pairs[ch]) return false;   // wrong / nothing to close
        }
    }
    return stack.length === 0;                              // nothing left unclosed
}

console.log(isValidParentheses('{[()]}')); // true
console.log(isValidParentheses('{[(])}')); // false
console.log(isValidParentheses('((('));    // false
// Time O(n) | Space O(n)


// ---------------------------------------------------------------------------
// Q10. Longest substring without repeating characters      [15 min | Very high]
// Sliding window. The classic "now optimise it to O(n)" question.

function longestUniqueSubstring(str) {
    const lastSeen = new Map();     // char -> last index
    let start = 0;
    let maxLen = 0;
    let result = '';

    for (let end = 0; end < str.length; end++) {
        const ch = str[end];
        // if we've seen it INSIDE the current window, shrink the window
        if (lastSeen.has(ch) && lastSeen.get(ch) >= start) {
            start = lastSeen.get(ch) + 1;
        }
        lastSeen.set(ch, end);

        if (end - start + 1 > maxLen) {
            maxLen = end - start + 1;
            result = str.slice(start, end + 1);
        }
    }
    return { length: maxLen, substring: result };
}

console.log(longestUniqueSubstring('abcabcbb')); // { length: 3, substring: 'abc' }
console.log(longestUniqueSubstring('pwwkew'));   // { length: 3, substring: 'wke' }
// Time O(n) | Space O(k).  Brute force is O(n^3) — say that first, then this.


/* ############################################################################
   PART 2 — ARRAYS  (Q11 - Q24)
############################################################################ */

// ---------------------------------------------------------------------------
// Q11. Remove duplicates — 3 ways                          [5 min | Very high]

const uniqueSet = (arr) => [...new Set(arr)];                       // best
const uniqueFilter = (arr) => arr.filter((v, i) => arr.indexOf(v) === i); // O(n^2)
const uniqueReduce = (arr) =>
    arr.reduce((acc, v) => (acc.includes(v) ? acc : [...acc, v]), []);

console.log(uniqueSet([1, 2, 2, 3, 4, 4, 5])); // [1,2,3,4,5]

// Duplicates in an ARRAY OF OBJECTS — needs a key, Set won't work directly
function uniqueBy(arr, key) {
    const seen = new Set();
    return arr.filter((item) => {
        if (seen.has(item[key])) return false;
        seen.add(item[key]);
        return true;
    });
}
console.log(uniqueBy([{ id: 1 }, { id: 2 }, { id: 1 }], 'id')); // [{id:1},{id:2}]
// Set version: Time O(n).  filter+indexOf: O(n^2) — know why.


// ---------------------------------------------------------------------------
// Q12. Max & min WITHOUT Math.max                                [5 min | High]

function findMinMax(arr) {
    if (!arr.length) return { min: null, max: null };
    let min = arr[0];
    let max = arr[0];
    for (const n of arr) {
        if (n > max) max = n;
        if (n < min) min = n;
    }
    return { min, max };
}

console.log(findMinMax([5, 1, 8, 3, 2])); // { min: 1, max: 8 }
// Why not Math.max(...arr)? It blows the call stack on ~100k+ elements.


// ---------------------------------------------------------------------------
// Q13. Second largest element (single pass, no sort)            [10 min | High]

function secondLargest(arr) {
    let first = -Infinity;
    let second = -Infinity;
    for (const n of arr) {
        if (n > first) {
            second = first;      // old max becomes second
            first = n;
        } else if (n > second && n < first) {   // n < first skips duplicates
            second = n;
        }
    }
    return second === -Infinity ? null : second;
}

console.log(secondLargest([10, 5, 8, 10, 3])); // 8
console.log(secondLargest([5, 5, 5]));         // null
// Time O(n) | Space O(1).  Duplicates of the max are THE edge case they check.


// ---------------------------------------------------------------------------
// Q14. Two Sum — return indices of the pair summing to target [10 min | V.high]

// Brute force O(n^2) — mention it, then replace it
function twoSumBrute(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) return [i, j];
        }
    }
    return [];
}

// Optimal O(n) with a hash map — this is the expected answer
function twoSum(nums, target) {
    const seen = new Map();                 // value -> index
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) return [seen.get(complement), i];
        seen.set(nums[i], i);
    }
    return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0,1]
console.log(twoSum([3, 2, 4], 6));      // [1,2]
// Time O(n) | Space O(n).  "Trade space for time" — say that phrase.


// ---------------------------------------------------------------------------
// Q15. Move all zeros to the end (keep order, in-place)         [10 min | High]

function moveZeros(arr) {
    let insertAt = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== 0) {
            [arr[insertAt], arr[i]] = [arr[i], arr[insertAt]];  // swap
            insertAt++;
        }
    }
    return arr;
}

console.log(moveZeros([0, 1, 0, 3, 12])); // [1,3,12,0,0]
// Two-pointer. Time O(n) | Space O(1) — "in-place" is the whole point.


// ---------------------------------------------------------------------------
// Q16. Flatten a nested array to any depth                 [10 min | Very high]

// built-in
const flat1 = (arr) => arr.flat(Infinity);

// recursion — write this one
function flatten(arr) {
    return arr.reduce(
        (acc, item) => acc.concat(Array.isArray(item) ? flatten(item) : item),
        []
    );
}

// iterative with a stack (no recursion — good bonus answer)
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
console.log(flat1(nested));            // [1,2,3,4,5]
console.log(flatten(nested));          // [1,2,3,4,5]
console.log(flattenIterative(nested)); // [1,2,3,4,5]

// Follow-up they ALWAYS ask: flatten only up to N levels
function flattenDepth(arr, depth = 1) {
    if (depth < 1) return arr.slice();
    return arr.reduce(
        (acc, item) => acc.concat(Array.isArray(item) ? flattenDepth(item, depth - 1) : item),
        []
    );
}
console.log(flattenDepth([1, [2, [3, [4]]]], 2)); // [1, 2, 3, [4]]


// ---------------------------------------------------------------------------
// Q17. Chunk an array into groups of n                          [5 min | High]
// Real use: pagination, grid rows, batching API calls.

function chunk(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

console.log(chunk([1, 2, 3, 4, 5, 6, 7], 3)); // [[1,2,3],[4,5,6],[7]]
// Time O(n).  Edge cases: size <= 0, size > arr.length.


// ---------------------------------------------------------------------------
// Q18. Rotate an array by k positions                          [10 min | High]

const rotateRight = (arr, k) => {
    if (!arr.length) return arr;
    k = k % arr.length;                     // k can be bigger than length!
    return [...arr.slice(-k), ...arr.slice(0, -k)];
};

const rotateLeft = (arr, k) => {
    if (!arr.length) return arr;
    k = k % arr.length;
    return [...arr.slice(k), ...arr.slice(0, k)];
};

console.log(rotateRight([1, 2, 3, 4, 5], 2)); // [4,5,1,2,3]
console.log(rotateLeft([1, 2, 3, 4, 5], 2));  // [3,4,5,1,2]
// The k % length line is what they're checking for.


// ---------------------------------------------------------------------------
// Q19. Find the missing number in 1..n                          [5 min | High]

function missingNumber(arr, n) {
    const expectedSum = (n * (n + 1)) / 2;              // Gauss formula
    const actualSum = arr.reduce((a, b) => a + b, 0);
    return expectedSum - actualSum;
}

console.log(missingNumber([1, 2, 4, 5], 5)); // 3
// Time O(n) | Space O(1).  The XOR solution is the "senior" alternative.


// ---------------------------------------------------------------------------
// Q20. Find all duplicates in an array                          [5 min | High]

function findDuplicates(arr) {
    const seen = new Set();
    const duplicates = new Set();
    for (const item of arr) {
        if (seen.has(item)) duplicates.add(item);
        else seen.add(item);
    }
    return [...duplicates];
}

console.log(findDuplicates([1, 2, 3, 2, 4, 3, 5, 3])); // [2,3]
// Using a Set for the result handles an item appearing 3+ times. Time O(n).


// ---------------------------------------------------------------------------
// Q21. Union / Intersection / Difference of two arrays          [10 min | High]

const union = (a, b) => [...new Set([...a, ...b])];

const intersection = (a, b) => {
    const setB = new Set(b);                  // O(1) lookups instead of .includes
    return [...new Set(a.filter((x) => setB.has(x)))];
};

const difference = (a, b) => {
    const setB = new Set(b);
    return a.filter((x) => !setB.has(x));      // in a but not in b
};

console.log(union([1, 2, 3], [3, 4]));           // [1,2,3,4]
console.log(intersection([1, 2, 3], [2, 3, 4])); // [2,3]
console.log(difference([1, 2, 3], [2, 3, 4]));   // [1]
// arr2.includes(x) inside filter = O(n*m). Converting to a Set = O(n+m). SAY THIS.


// ---------------------------------------------------------------------------
// Q22. Count occurrences / frequency of array items        [5 min | Very high]

function countOccurrences(arr) {
    return arr.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});
}

console.log(countOccurrences(['a', 'b', 'a', 'c', 'b', 'a']));
// { a: 3, b: 2, c: 1 }

// Count even/odd — same pattern, simplest variant
const countEvenOdd = (arr) =>
    arr.reduce(
        (acc, n) => {
            n % 2 === 0 ? acc.even++ : acc.odd++;
            return acc;
        },
        { even: 0, odd: 0 }
    );
console.log(countEvenOdd([1, 2, 3, 4, 5])); // { even: 2, odd: 3 }


// ---------------------------------------------------------------------------
// Q23. Merge two SORTED arrays (without concat + sort)         [10 min | High]

function mergeSorted(a, b) {
    const result = [];
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
        result.push(a[i] <= b[j] ? a[i++] : b[j++]);
    }
    while (i < a.length) result.push(a[i++]);   // leftovers
    while (j < b.length) result.push(b[j++]);
    return result;
}

console.log(mergeSorted([1, 3, 5], [2, 4, 6, 8])); // [1,2,3,4,5,6,8]
// Time O(n+m). concat().sort() is O((n+m) log(n+m)) — worse, and they know it.


// ---------------------------------------------------------------------------
// Q24. Maximum subarray sum — Kadane's algorithm          [15 min | Med-High]

function maxSubarraySum(arr) {
    if (!arr.length) return 0;
    let maxSoFar = arr[0];
    let currentMax = arr[0];
    for (let i = 1; i < arr.length; i++) {
        // either extend the previous subarray or start fresh at arr[i]
        currentMax = Math.max(arr[i], currentMax + arr[i]);
        maxSoFar = Math.max(maxSoFar, currentMax);
    }
    return maxSoFar;
}

console.log(maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6  -> [4,-1,2,1]
// Time O(n) | Space O(1).  Handles all-negative arrays correctly (returns -1 for [-1,-3]).

// Same family: max sum of k consecutive elements (sliding window)
function maxSumOfKWindow(arr, k) {
    let windowSum = 0;
    for (let i = 0; i < k; i++) windowSum += arr[i];
    let best = windowSum;
    for (let i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];   // add new, drop old — no re-summing
        best = Math.max(best, windowSum);
    }
    return best;
}
console.log(maxSumOfKWindow([2, 1, 5, 1, 3, 2], 3)); // 9


/* ############################################################################
   PART 3 — ARRAY OF OBJECTS  (Q25 - Q27)
   This is REAL frontend work — shaping API responses. Expect at least one.
############################################################################ */

const employees = [
    { id: 1, name: 'Amit', dept: 'IT', salary: 50000, age: 24 },
    { id: 2, name: 'Bhavna', dept: 'HR', salary: 70000, age: 31 },
    { id: 3, name: 'Chirag', dept: 'IT', salary: 90000, age: 38 },
    { id: 4, name: 'Divya', dept: 'Sales', salary: 60000, age: 29 },
];

// ---------------------------------------------------------------------------
// Q25. Group an array of objects by a key                  [10 min | Very high]

function groupBy(arr, keyOrFn) {
    const getKey = typeof keyOrFn === 'function' ? keyOrFn : (item) => item[keyOrFn];
    return arr.reduce((acc, item) => {
        const key = getKey(item);
        (acc[key] = acc[key] || []).push(item);
        return acc;
    }, {});
}

console.log(groupBy(employees, 'dept'));
// { IT: [Amit, Chirag], HR: [Bhavna], Sales: [Divya] }

console.log(Object.keys(groupBy(employees, (e) => (e.age < 30 ? 'young' : 'senior'))));
// [ 'young', 'senior' ]   <- grouping by a computed key is the follow-up


// ---------------------------------------------------------------------------
// Q26. Sort an array of objects (by key, and by multiple keys)  [10 min | High]

// single key
const byNumber = [...employees].sort((a, b) => b.salary - a.salary);     // desc
const byString = [...employees].sort((a, b) => a.name.localeCompare(b.name));

console.log(byNumber.map((e) => e.name)); // [ 'Chirag', 'Bhavna', 'Divya', 'Amit' ]

// multiple keys — prefix with '-' for descending
function sortBy(arr, ...keys) {
    return [...arr].sort((a, b) => {
        for (const key of keys) {
            const desc = key.startsWith('-');
            const k = desc ? key.slice(1) : key;
            if (a[k] === b[k]) continue;                 // tie -> next key
            const result = a[k] > b[k] ? 1 : -1;
            return desc ? -result : result;
        }
        return 0;
    });
}

console.log(sortBy(employees, 'dept', '-salary').map((e) => `${e.dept}-${e.salary}`));
// [ 'HR-70000', 'IT-90000', 'IT-50000', 'Sales-60000' ]

// GOTCHA: .sort() MUTATES the original array. [...arr].sort() to keep it pure.
// GOTCHA: [10,1,2].sort() => [1,10,2]. Default sort is string-based!


// ---------------------------------------------------------------------------
// Q27. Aggregate with reduce — totals, averages, lookup map [10 min | Very high]

const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
const avgSalary = totalSalary / employees.length;
console.log(totalSalary, avgSalary); // 270000 67500

// sum grouped by a key (total salary per department)
const salaryByDept = employees.reduce((acc, e) => {
    acc[e.dept] = (acc[e.dept] || 0) + e.salary;
    return acc;
}, {});
console.log(salaryByDept); // { IT: 140000, HR: 70000, Sales: 60000 }

// highest paid employee
const topEarner = employees.reduce((max, e) => (e.salary > max.salary ? e : max));
console.log(topEarner.name); // Chirag

// index by id — turns O(n) .find() calls into O(1) lookups
const byId = employees.reduce((acc, e) => {
    acc[e.id] = e;
    return acc;
}, {});
console.log(byId[3].name); // Chirag

// array of objects -> array of one field, filtered
console.log(employees.filter((e) => e.dept === 'IT').map((e) => e.name)); // ['Amit','Chirag']


/* ############################################################################
   PART 4 — NUMBER / LOGIC BASICS  (Q28 - Q30)
   Asked as a warm-up or to a candidate they're unsure about. Don't fumble these.
############################################################################ */

// ---------------------------------------------------------------------------
// Q28. FizzBuzz + Prime check                              [5 min | Very high]

function fizzBuzz(n) {
    const out = [];
    for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) out.push('FizzBuzz');       // check 15 FIRST
        else if (i % 3 === 0) out.push('Fizz');
        else if (i % 5 === 0) out.push('Buzz');
        else out.push(i);
    }
    return out;
}

console.log(fizzBuzz(15).join(' '));
// 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz

function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i * i <= n; i += 2) {   // only up to sqrt(n), skip evens
        if (n % i === 0) return false;
    }
    return true;
}

console.log([1, 2, 9, 17, 25].filter(isPrime)); // [2, 17]
// The i*i <= n bound is what they're looking for (O(sqrt n) not O(n)).


// ---------------------------------------------------------------------------
// Q29. Factorial + Fibonacci (loop, recursion, memoized)  [10 min | Very high]

const factorialLoop = (n) => {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
};
const factorialRec = (n) => (n <= 1 ? 1 : n * factorialRec(n - 1));

console.log(factorialLoop(5), factorialRec(5)); // 120 120

// Fibonacci — naive recursion is O(2^n), they WILL ask you to fix it
const fibSlow = (n) => (n <= 1 ? n : fibSlow(n - 1) + fibSlow(n - 2));

// memoized — O(n)
function memoize(fn) {
    const cache = new Map();
    return function (...args) {
        const key = args.join(',');
        if (cache.has(key)) return cache.get(key);
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}
const fib = memoize((n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(50)); // 12586269025 — instant. fibSlow(50) would never finish.

// iterative — O(n) time, O(1) space, no stack overflow
function fibSeries(n) {
    const series = [0, 1];
    for (let i = 2; i < n; i++) series.push(series[i - 1] + series[i - 2]);
    return series.slice(0, n);
}
console.log(fibSeries(10)); // [0,1,1,2,3,5,8,13,21,34]


// ---------------------------------------------------------------------------
// Q30. Number utilities: reverse, sum of digits, swap, Armstrong [10 min | Med]

const reverseNumber = (n) => {
    const sign = Math.sign(n);
    let reversed = 0;
    n = Math.abs(n);
    while (n > 0) {
        reversed = reversed * 10 + (n % 10);   // pull the last digit off
        n = Math.floor(n / 10);
    }
    return reversed * sign;
};
console.log(reverseNumber(-1234)); // -4321

const sumOfDigits = (n) =>
    String(Math.abs(n)).split('').reduce((sum, d) => sum + Number(d), 0);
console.log(sumOfDigits(12345)); // 15

// Swap two variables without a temp variable
let p = 1, q = 2;
[p, q] = [q, p];                    // ES6 destructuring — the modern answer
console.log(p, q);                  // 2 1

let m = 5, n = 9;
m = m + n; n = m - n; m = m - n;    // arithmetic — the "old" answer they may want
console.log(m, n);                  // 9 5

// Armstrong number: 153 = 1^3 + 5^3 + 3^3
const isArmstrong = (num) => {
    const digits = String(num).split('');
    const power = digits.length;
    return digits.reduce((sum, d) => sum + Number(d) ** power, 0) === num;
};
console.log(isArmstrong(153), isArmstrong(154)); // true false


/* =============================================================================
   ⚡ FINAL CHECKLIST — say these out loud during the round
   -----------------------------------------------------------------------------
   1. Clarify first: "Can the input be empty? Are there duplicates? Negatives?"
   2. Brute force first, then optimise. Never jump straight to the clever answer.
   3. Name the complexity: O(n) time, O(n) space — unprompted.
   4. Nested loop + .includes() / .indexOf() = O(n^2). Replace with Set/Map.
   5. .sort(), .reverse(), .splice(), .push() MUTATE. .slice(), .map(),
      .filter(), .concat(), spread do NOT.
   6. [1,10,2].sort() is wrong — always pass (a,b) => a-b for numbers.
   7. Test your own code with: [], [1], duplicates, negatives, and one big case.
   8. Keep talking. Silence for 3 minutes reads worse than a wrong first attempt.

   REDUCE PATTERNS TO REMEMBER (covers half of these questions):
     sum      -> reduce((acc, x) => acc + x, 0)
     count    -> reduce((acc, x) => { acc[x] = (acc[x]||0)+1; return acc }, {})
     group    -> reduce((acc, x) => { (acc[k]=acc[k]||[]).push(x); return acc }, {})
     max      -> reduce((max, x) => x > max ? x : max)
     flatten  -> reduce((acc, x) => acc.concat(Array.isArray(x)?flatten(x):x), [])
     indexBy  -> reduce((acc, x) => { acc[x.id] = x; return acc }, {})
============================================================================= */
