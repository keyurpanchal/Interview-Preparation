/* =============================================================================
   OBJECT PRACTICALS
   These map 1:1 to real work (API response shaping), so interviewers love them.
============================================================================= */

// ---------------------------------------------------------------------------
// 1. Deep clone — 3 approaches, know the trade-offs

const data = { a: 1, b: { c: 2, d: [3, 4] }, e: new Date() };

// (a) JSON — quick but loses Date/undefined/function/Map/Set and breaks on cycles
const cloneJson = JSON.parse(JSON.stringify(data));

// (b) structuredClone — built in, handles Date/Map/Set/cycles, NOT functions
const cloneStructured = structuredClone({ a: 1, b: { c: 2 } });

// (c) manual recursion — what they actually want you to write
function deepClone(value, seen = new WeakMap()) {
    if (value === null || typeof value !== 'object') return value; // primitives
    if (seen.has(value)) return seen.get(value);                   // circular refs

    if (value instanceof Date) return new Date(value);
    if (value instanceof RegExp) return new RegExp(value.source, value.flags);
    if (value instanceof Map) {
        const map = new Map();
        seen.set(value, map);
        value.forEach((v, k) => map.set(k, deepClone(v, seen)));
        return map;
    }
    if (value instanceof Set) {
        const set = new Set();
        seen.set(value, set);
        value.forEach((v) => set.add(deepClone(v, seen)));
        return set;
    }

    const copy = Array.isArray(value) ? [] : {};
    seen.set(value, copy);
    for (const key of Object.keys(value)) {
        copy[key] = deepClone(value[key], seen);
    }
    return copy;
}

const original = { a: 1, nested: { b: 2 } };
original.self = original; // circular
const cloned = deepClone(original);
console.log(cloned.nested !== original.nested); // true — really a deep copy
console.log(cloned.self === cloned);            // true — cycle preserved

// ---------------------------------------------------------------------------
// 2. Deep equality check

function deepEqual(a, b) {
    if (a === b) return true; // handles primitives + same reference
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return false;
    }
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => keysB.includes(key) && deepEqual(a[key], b[key]));
}

console.log(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })); // true
console.log(deepEqual({ a: 1 }, { a: '1' }));                       // false

// ---------------------------------------------------------------------------
// 3. Flatten a nested object into dot-notation keys

function flattenObject(obj, prefix = '') {
    return Object.keys(obj).reduce((acc, key) => {
        const path = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(acc, flattenObject(value, path));
        } else {
            acc[path] = value;
        }
        return acc;
    }, {});
}

console.log(flattenObject({ a: 1, b: { c: 2, d: { e: 3 } } }));
// { a: 1, 'b.c': 2, 'b.d.e': 3 }

// ---------------------------------------------------------------------------
// 4. Unflatten it back (the follow-up)

function unflattenObject(flat) {
    const result = {};
    for (const flatKey in flat) {
        const keys = flatKey.split('.');
        keys.reduce((acc, key, i) => {
            if (i === keys.length - 1) acc[key] = flat[flatKey];
            else acc[key] = acc[key] || {};
            return acc[key];
        }, result);
    }
    return result;
}

console.log(unflattenObject({ a: 1, 'b.c': 2, 'b.d.e': 3 }));
// { a: 1, b: { c: 2, d: { e: 3 } } }

// ---------------------------------------------------------------------------
// 5. Safe nested access — lodash `get` (asked as "optional chaining by hand")

function get(obj, path, defaultValue = undefined) {
    const keys = Array.isArray(path) ? path : path.replace(/\[(\d+)\]/g, '.$1').split('.');
    let result = obj;
    for (const key of keys) {
        if (result == null) return defaultValue;
        result = result[key];
    }
    return result === undefined ? defaultValue : result;
}

const apiResponse = { user: { addresses: [{ city: 'Ahmedabad' }] } };
console.log(get(apiResponse, 'user.addresses[0].city'));       // Ahmedabad
console.log(get(apiResponse, 'user.profile.avatar', 'N/A'));   // N/A

// set() counterpart
function set(obj, path, value) {
    const keys = Array.isArray(path) ? path : path.replace(/\[(\d+)\]/g, '.$1').split('.');
    keys.reduce((acc, key, i) => {
        if (i === keys.length - 1) {
            acc[key] = value;
        } else if (acc[key] == null) {
            acc[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        return acc[key];
    }, obj);
    return obj;
}

console.log(set({}, 'a.b[0].c', 42)); // { a: { b: [ { c: 42 } ] } }

// ---------------------------------------------------------------------------
// 6. groupBy — Array.prototype.groupBy is new, so write it yourself

function groupBy(arr, keyOrFn) {
    const getKey = typeof keyOrFn === 'function' ? keyOrFn : (item) => item[keyOrFn];
    return arr.reduce((acc, item) => {
        const key = getKey(item);
        (acc[key] = acc[key] || []).push(item);
        return acc;
    }, {});
}

const people = [
    { name: 'A', dept: 'IT', age: 24 },
    { name: 'B', dept: 'HR', age: 31 },
    { name: 'C', dept: 'IT', age: 38 },
];
console.log(groupBy(people, 'dept'));
console.log(groupBy(people, (p) => (p.age < 30 ? 'young' : 'senior')));

// ---------------------------------------------------------------------------
// 7. pick / omit

const pick = (obj, keys) =>
    keys.reduce((acc, k) => {
        if (k in obj) acc[k] = obj[k];
        return acc;
    }, {});

const omit = (obj, keys) =>
    Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

console.log(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])); // { a: 1, c: 3 }
console.log(omit({ a: 1, b: 2, c: 3 }, ['b']));      // { a: 1, c: 3 }

// ---------------------------------------------------------------------------
// 8. Deep merge two objects (config merging — spread only does shallow!)

function deepMerge(target, source) {
    const output = { ...target };
    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = target[key];
        if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
            output[key] = deepMerge(tgtVal, srcVal);
        } else {
            output[key] = srcVal;
        }
    }
    return output;
}

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

console.log(deepMerge({ a: 1, b: { c: 2, d: 3 } }, { b: { d: 99, e: 5 } }));
// { a: 1, b: { c: 2, d: 99, e: 5 } }

// Compare: spread loses nested keys
console.log({ ...{ b: { c: 2, d: 3 } }, ...{ b: { d: 99 } } }); // { b: { d: 99 } }

// ---------------------------------------------------------------------------
// 9. Invert keys and values

const invert = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

console.log(invert({ a: 1, b: 2 })); // { '1': 'a', '2': 'b' }

// ---------------------------------------------------------------------------
// 10. Object <-> query string (URL params, very frontend)

function toQueryString(obj) {
    return Object.entries(obj)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) =>
            Array.isArray(v)
                ? v.map((item) => `${encodeURIComponent(k)}=${encodeURIComponent(item)}`).join('&')
                : `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
        )
        .join('&');
}

function parseQueryString(qs) {
    return qs
        .replace(/^\?/, '')
        .split('&')
        .filter(Boolean)
        .reduce((acc, pair) => {
            const [k, v = ''] = pair.split('=').map(decodeURIComponent);
            if (k in acc) acc[k] = [].concat(acc[k], v);
            else acc[k] = v;
            return acc;
        }, {});
}

console.log(toQueryString({ page: 1, sort: 'name', tags: ['a', 'b'], empty: '' }));
// page=1&sort=name&tags=a&tags=b
console.log(parseQueryString('?page=1&tags=a&tags=b'));
// { page: '1', tags: [ 'a', 'b' ] }

// ---------------------------------------------------------------------------
// 11. Deep freeze (immutability — Object.freeze is shallow)

function deepFreeze(obj) {
    Object.values(obj).forEach((value) => {
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    });
    return Object.freeze(obj);
}

const config = deepFreeze({ api: { url: 'x' } });
config.api.url = 'hacked';
console.log(config.api.url); // 'x' — mutation silently ignored (throws in strict mode)

// ---------------------------------------------------------------------------
// 12. Count / sum / average from an array of objects

const items = [
    { product: 'pen', qty: 2, price: 10 },
    { product: 'book', qty: 1, price: 200 },
    { product: 'pen', qty: 3, price: 10 },
];

const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
console.log(total); // 250

// Sum grouped by a key
const qtyByProduct = items.reduce((acc, i) => {
    acc[i.product] = (acc[i.product] || 0) + i.qty;
    return acc;
}, {});
console.log(qtyByProduct); // { pen: 5, book: 1 }

// ---------------------------------------------------------------------------
// 13. Index an array by id (O(1) lookups instead of .find in a loop)

const indexBy = (arr, key) => Object.fromEntries(arr.map((item) => [item[key], item]));

console.log(indexBy([{ id: 'a', v: 1 }, { id: 'b', v: 2 }], 'id'));
// { a: { id: 'a', v: 1 }, b: { id: 'b', v: 2 } }

// ---------------------------------------------------------------------------
// 14. Diff two objects — which keys changed (used for dirty-form detection)

function diff(oldObj, newObj) {
    const changes = {};
    const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
    for (const key of keys) {
        if (!deepEqual(oldObj[key], newObj[key])) {
            changes[key] = { from: oldObj[key], to: newObj[key] };
        }
    }
    return changes;
}

console.log(diff({ name: 'A', age: 5 }, { name: 'A', age: 6, city: 'X' }));
// { age: { from: 5, to: 6 }, city: { from: undefined, to: 'X' } }

// ---------------------------------------------------------------------------
// 15. Check if an object is empty (and the gotchas)

const isEmpty = (obj) => obj != null && Object.keys(obj).length === 0;

console.log(isEmpty({}));           // true
console.log(isEmpty({ a: 1 }));     // false
console.log({} === {});             // false — never compare objects with ===
console.log(JSON.stringify({}) === '{}'); // true, but key-order dependent

// ---------------------------------------------------------------------------
// 16. Make an object iterable (Symbol.iterator) — senior-level flex

const collection = {
    items: ['a', 'b', 'c'],
    [Symbol.iterator]() {
        let i = 0;
        const items = this.items;
        return {
            next: () => (i < items.length ? { value: items[i++], done: false } : { done: true }),
        };
    },
};

console.log([...collection]);       // ['a','b','c']
for (const x of collection) console.log(x);

// ---------------------------------------------------------------------------
