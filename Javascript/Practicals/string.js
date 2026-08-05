/* =============================================================================
   STRING PRACTICALS
   Most common warm-up round. Interviewer usually says "no built-in reverse",
   so keep a manual loop version ready for every one-liner.
============================================================================= */

// ---------------------------------------------------------------------------
// 1. Reverse a string (built-in + manual, they will ask for manual)

function reverseString(str) {
    return str.split('').reverse().join('');
}

function reverseStringManual(str) {
    let out = '';
    for (let i = str.length - 1; i >= 0; i--) out += str[i];
    return out;
}

console.log(reverseString('interview'));       // weivretni
console.log(reverseStringManual('interview')); // weivretni

// ---------------------------------------------------------------------------
// 2. Palindrome check (ignore case, spaces and punctuation)

function isPalindrome(str) {
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0, right = clean.length - 1;
    while (left < right) {
        if (clean[left] !== clean[right]) return false;
        left++;
        right--;
    }
    return true;
}

console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
console.log(isPalindrome('hello'));                          // false

// ---------------------------------------------------------------------------
// 3. Count vowels and consonants

function countVowelsConsonants(str) {
    let vowels = 0, consonants = 0;
    for (const ch of str.toLowerCase()) {
        if (!/[a-z]/.test(ch)) continue;          // skip digits, spaces, symbols
        if ('aeiou'.includes(ch)) vowels++;
        else consonants++;
    }
    return { vowels, consonants };
}

console.log(countVowelsConsonants('Hello World 123')); // { vowels: 3, consonants: 7 }

// ---------------------------------------------------------------------------
// 4. Character frequency map

function charFrequency(str) {
    const freq = {};
    for (const ch of str) {
        freq[ch] = (freq[ch] || 0) + 1;
    }
    return freq;
}

console.log(charFrequency('banana')); // { b: 1, a: 3, n: 2 }

// ---------------------------------------------------------------------------
// 5. First non-repeating character  (very common follow-up of #4)

function firstNonRepeating(str) {
    const freq = charFrequency(str);
    for (const ch of str) {
        if (freq[ch] === 1) return ch;
    }
    return null;
}

console.log(firstNonRepeating('swiss'));  // w
console.log(firstNonRepeating('aabbcc')); // null

// ---------------------------------------------------------------------------
// 6. Highest occurring character

function maxOccurringChar(str) {
    const freq = charFrequency(str);
    return Object.keys(freq).reduce((a, b) => (freq[a] >= freq[b] ? a : b));
}

console.log(maxOccurringChar('javascript')); // a

// ---------------------------------------------------------------------------
// 7. Anagram check
// O(n log n) with sort, O(n) with frequency map — mention both.

function isAnagram(a, b) {
    const norm = (s) => s.toLowerCase().replace(/\s/g, '').split('').sort().join('');
    return norm(a) === norm(b);
}

function isAnagramOptimal(a, b) {
    if (a.length !== b.length) return false;
    const freq = {};
    for (const ch of a) freq[ch] = (freq[ch] || 0) + 1;
    for (const ch of b) {
        if (!freq[ch]) return false;
        freq[ch]--;
    }
    return true;
}

console.log(isAnagram('listen', 'silent'));        // true
console.log(isAnagramOptimal('listen', 'silent')); // true
console.log(isAnagramOptimal('hello', 'world'));   // false

// ---------------------------------------------------------------------------
// 8. Capitalize first letter of every word (title case)

function titleCase(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
        .join(' ');
}

console.log(titleCase('the quick brown fox')); // The Quick Brown Fox

// ---------------------------------------------------------------------------
// 9. Reverse words in a sentence (order of words, not the letters)

function reverseWords(str) {
    return str.trim().split(/\s+/).reverse().join(' ');
}

console.log(reverseWords('  I love   javascript ')); // javascript love I

// ---------------------------------------------------------------------------
// 10. Reverse each word but keep word order

function reverseEachWord(str) {
    return str
        .split(' ')
        .map((w) => w.split('').reverse().join(''))
        .join(' ');
}

console.log(reverseEachWord('I love javascript')); // I evol tpircsavaj

// ---------------------------------------------------------------------------
// 11. Truncate string with ellipsis

function truncate(str, max) {
    return str.length <= max ? str : str.slice(0, max - 3) + '...';
}

console.log(truncate('Frontend developer', 12)); // Frontend ...

// ---------------------------------------------------------------------------
// 12. Longest word in a sentence

function longestWord(str) {
    return str.split(/\s+/).reduce((longest, w) => (w.length > longest.length ? w : longest), '');
}

console.log(longestWord('I am learning javascript deeply')); // javascript

// ---------------------------------------------------------------------------
// 13. Remove duplicate characters

function removeDuplicateChars(str) {
    return [...new Set(str)].join('');
}

console.log(removeDuplicateChars('programming')); // progamin

// ---------------------------------------------------------------------------
// 14. String compression — "aaabbc" => "a3b2c1"

function compress(str) {
    let out = '';
    let count = 1;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === str[i + 1]) count++;
        else {
            out += str[i] + count;
            count = 1;
        }
    }
    return out;
}

console.log(compress('aaabbc'));   // a3b2c1
console.log(compress('aabcccdd')); // a2b1c3d2

// Real-world twist: keep the original when compression doesn't actually help
const compressSmart = (str) => {
    const out = compress(str);
    return out.length < str.length ? out : str;
};
console.log(compressSmart('abc'));    // abc (a1b1c1 is longer)
console.log(compressSmart('aaabbc')); // aaabbc (a3b2c1 is equal length, not shorter)

// ---------------------------------------------------------------------------
// 15. Longest substring without repeating characters (sliding window)
// Classic "can you do it in O(n)?" question.

function longestUniqueSubstring(str) {
    const seen = new Map();
    let start = 0, best = 0, bestStr = '';
    for (let end = 0; end < str.length; end++) {
        const ch = str[end];
        if (seen.has(ch) && seen.get(ch) >= start) {
            start = seen.get(ch) + 1;
        }
        seen.set(ch, end);
        if (end - start + 1 > best) {
            best = end - start + 1;
            bestStr = str.slice(start, end + 1);
        }
    }
    return { length: best, substring: bestStr };
}

console.log(longestUniqueSubstring('abcabcbb')); // { length: 3, substring: 'abc' }
console.log(longestUniqueSubstring('pwwkew'));   // { length: 3, substring: 'wke' }

// ---------------------------------------------------------------------------
// 16. Check if one string is a rotation of another

function isRotation(a, b) {
    return a.length === b.length && (a + a).includes(b);
}

console.log(isRotation('erbottlewat', 'waterbottle')); // true

// ---------------------------------------------------------------------------
// 17. camelCase <-> snake_case / kebab-case  (very frontend-flavoured)

function toCamelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, ch) => (ch ? ch.toUpperCase() : ''))
        .replace(/^(.)/, (m) => m.toLowerCase());
}

function toSnakeCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
}

function toKebabCase(str) {
    return toSnakeCase(str).replace(/_/g, '-');
}

console.log(toCamelCase('user_first-name'));  // userFirstName
console.log(toSnakeCase('userFirstName'));    // user_first_name
console.log(toKebabCase('userFirstName'));    // user-first-name

// ---------------------------------------------------------------------------
// 18. Word frequency counter (sorted by count)

function wordFrequency(str) {
    const words = str.toLowerCase().match(/\b[a-z']+\b/g) || [];
    const freq = words.reduce((acc, w) => {
        acc[w] = (acc[w] || 0) + 1;
        return acc;
    }, {});
    return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

console.log(wordFrequency('the cat and the hat and the bat'));
// [ [ 'the', 3 ], [ 'and', 2 ], [ 'cat', 1 ], [ 'hat', 1 ], [ 'bat', 1 ] ]

// ---------------------------------------------------------------------------
// 19. Valid parentheses (stack — the "do you know stacks" question)

function isValidParentheses(str) {
    const pairs = { ')': '(', ']': '[', '}': '{' };
    const stack = [];
    for (const ch of str) {
        if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
        else if (pairs[ch]) {
            if (stack.pop() !== pairs[ch]) return false;
        }
    }
    return stack.length === 0;
}

console.log(isValidParentheses('{[()]}')); // true
console.log(isValidParentheses('{[(])}')); // false

// ---------------------------------------------------------------------------
// 20. Count occurrences of a substring (overlapping-safe)

function countSubstring(str, sub) {
    let count = 0, pos = str.indexOf(sub);
    while (pos !== -1) {
        count++;
        pos = str.indexOf(sub, pos + 1); // +sub.length for non-overlapping
    }
    return count;
}

console.log(countSubstring('aaaa', 'aa')); // 3 (overlapping)

// ---------------------------------------------------------------------------
// 21. All permutations of a string (recursion — tests backtracking basics)

function permutations(str) {
    if (str.length <= 1) return [str];
    const result = [];
    for (let i = 0; i < str.length; i++) {
        const rest = str.slice(0, i) + str.slice(i + 1);
        for (const perm of permutations(rest)) {
            result.push(str[i] + perm);
        }
    }
    return [...new Set(result)];
}

console.log(permutations('abc')); // ['abc','acb','bac','bca','cab','cba']

// ---------------------------------------------------------------------------
// 22. Mask a string except last 4 chars (card / phone masking — real UI task)

function mask(str, visible = 4, maskChar = '*') {
    if (str.length <= visible) return str;
    return maskChar.repeat(str.length - visible) + str.slice(-visible);
}

console.log(mask('4111111111111234')); // ************1234

// ---------------------------------------------------------------------------
// 23. Template string interpolation — replace {{key}} from an object

function interpolate(template, data) {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
        data[key] !== undefined ? data[key] : ''
    );
}

console.log(interpolate('Hi {{name}}, you have {{count}} messages', { name: 'Keyur', count: 5 }));
// Hi Keyur, you have 5 messages

// ---------------------------------------------------------------------------
