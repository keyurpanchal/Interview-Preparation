/* =============================================================================
   OUTPUT-PREDICTION QUESTIONS  ("what does this log?")
   Rapid-fire round. Answers are in the comments — cover them and self-test.
   Every one of these is testing ONE concept: hoisting, this, event loop,
   coercion, references, or scope.
============================================================================= */

// ---------------------------------------------------------------------------
// HOISTING & TDZ
// ---------------------------------------------------------------------------

console.log(a); // undefined   -> var is hoisted and initialised to undefined
var a = 5;

try {
    console.log(b); // ReferenceError: Cannot access 'b' before initialization
    let b = 5;      // let/const are hoisted but sit in the Temporal Dead Zone
} catch (e) {
    console.log(e.constructor.name); // ReferenceError
}

console.log(fnDeclaration()); // 'works' -> function declarations are fully hoisted
function fnDeclaration() {
    return 'works';
}

try {
    fnExpression(); // TypeError: fnExpression is not a function
} catch (e) {
    console.log(e.constructor.name); // TypeError (var holds undefined at this point)
}
var fnExpression = function () {};

// ---------------------------------------------------------------------------
// SCOPE
// ---------------------------------------------------------------------------

var x = 1;
function scopeTest() {
    console.log(x); // undefined — the inner `var x` shadows and is hoisted
    var x = 2;
}
scopeTest();

let y = 'outer';
{
    let y = 'inner';
    console.log(y); // inner
}
console.log(y);     // outer

// const does not mean immutable — only the binding is fixed
const arr = [1, 2];
arr.push(3);
console.log(arr);   // [1,2,3]  <- allowed
// arr = [];        // TypeError: Assignment to constant variable

// ---------------------------------------------------------------------------
// `this`
// ---------------------------------------------------------------------------

const obj = {
    name: 'obj',
    regular() {
        return this.name;
    },
    arrow: () => {
        // arrow has no own `this` — it takes it from the enclosing (module/global) scope
        return typeof this === 'undefined' ? 'undefined this' : this.name;
    },
    nested() {
        const inner = function () {
            return this?.name; // undefined — plain call, `this` is undefined/global
        };
        const innerArrow = () => this.name; // 'obj' — inherits from nested()
        return [inner(), innerArrow()];
    },
};

console.log(obj.regular());  // 'obj'
console.log(obj.arrow());    // undefined (not 'obj') — classic trap
console.log(obj.nested());   // [undefined, 'obj']

// Losing `this` when you detach a method — THE most common React/DOM bug
const detached = obj.regular;
try {
    console.log(detached()); // undefined or TypeError in strict mode
} catch (e) {
    console.log('detached lost this');
}
console.log(detached.call(obj)); // 'obj' — fix with call/apply/bind

// this inside setTimeout
const timerObj = {
    name: 'timer',
    start() {
        setTimeout(function () {
            console.log('fn:', this.name);    // undefined — `this` is the timer/global
        }, 0);
        setTimeout(() => {
            console.log('arrow:', this.name); // 'timer' — arrow keeps lexical this
        }, 0);
    },
};
timerObj.start();

// ---------------------------------------------------------------------------
// EVENT LOOP  (see async-promises.js #16 for the full walkthrough)
// ---------------------------------------------------------------------------

console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
// A, D, C, B   — sync -> microtasks -> macrotasks

setTimeout(() => console.log('timeout 1'), 0);
Promise.resolve().then(() => {
    console.log('promise 1');
    setTimeout(() => console.log('timeout inside promise'), 0);
});
Promise.resolve().then(() => console.log('promise 2'));
// promise 1, promise 2, timeout 1, timeout inside promise

// setTimeout 0 is not 0ms — it's "after the current stack + min clamp"
const start = Date.now();
setTimeout(() => console.log('actually took', Date.now() - start, 'ms'), 0);
for (let i = 0; i < 1e7; i++) {} // blocks the thread; the timeout waits

// ---------------------------------------------------------------------------
// TYPE COERCION  (the "gotcha" set)
// ---------------------------------------------------------------------------

console.log(1 + '1');        // '11'   number -> string with +
console.log('3' - 1);        // 2      - has no string meaning, so string -> number
console.log('3' * '4');      // 12
console.log([] + []);        // ''     both become ''
console.log([] + {});        // '[object Object]'
console.log([1, 2] + [3]);   // '1,23'
console.log(true + true);    // 2
console.log(null + 1);       // 1      null -> 0
console.log(undefined + 1);  // NaN    undefined -> NaN

console.log(0.1 + 0.2);              // 0.30000000000000004  (IEEE-754 float)
console.log(0.1 + 0.2 === 0.3);      // false
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true — the correct check

console.log(null == undefined);  // true  — special case in the spec
console.log(null === undefined); // false
console.log(null == 0);          // false — null only loosely equals undefined
console.log(NaN === NaN);        // false
console.log(Object.is(NaN, NaN)); // true
console.log([] == false);        // true  — [] -> '' -> 0, false -> 0
console.log('' == 0);            // true
console.log('0' == false);       // true
console.log([] == ![]);          // true  — ![] is false, then [] == false

console.log(typeof NaN);         // 'number'
console.log(typeof null);        // 'object'  (a 30-year-old bug in JS)
console.log(typeof function () {}); // 'function'
console.log(typeof undefined);   // 'undefined'

// Falsy values — memorise the list of 8:
// false, 0, -0, 0n, '', null, undefined, NaN.  Everything else is truthy.
console.log(Boolean([]));  // true  — empty array is truthy!
console.log(Boolean({}));  // true  — empty object is truthy!
console.log(Boolean('0')); // true  — non-empty string

// ---------------------------------------------------------------------------
// REFERENCES vs VALUES
// ---------------------------------------------------------------------------

let obj1 = { val: 1 };
let obj2 = obj1;
obj2.val = 99;
console.log(obj1.val); // 99 — same reference

let a1 = [1, 2];
let a2 = [...a1];   // shallow copy
a2.push(3);
console.log(a1);    // [1,2] — unaffected

const nested1 = { inner: { n: 1 } };
const nested2 = { ...nested1 }; // SHALLOW — inner is shared
nested2.inner.n = 99;
console.log(nested1.inner.n);   // 99 — the spread trap

function mutate(o, arr) {
    o.changed = true;  // affects the caller (same object)
    arr = [9];         // does NOT affect the caller (reassigning the local binding)
}
const testObj = {}, testArr = [1];
mutate(testObj, testArr);
console.log(testObj, testArr); // { changed: true }  [1]

// ---------------------------------------------------------------------------
// ARRAYS — quirks
// ---------------------------------------------------------------------------

console.log([1, 2, 3, 10].sort());              // [1,10,2,3] — default sort is lexicographic!
console.log([1, 2, 3, 10].sort((a, b) => a - b)); // [1,2,3,10]

console.log([10, 1, 2].sort()); // [1, 10, 2]

const arr2 = [1, 2, 3];
arr2.length = 1;
console.log(arr2); // [1] — setting length truncates

console.log(['1', '7', '11'].map(parseInt)); // [1, NaN, 3] !!
// because map passes (value, index) and parseInt takes (string, radix):
// parseInt('1',0)=1, parseInt('7',1)=NaN, parseInt('11',2)=3
console.log(['1', '7', '11'].map(Number));   // [1,7,11] — the fix

console.log([1, 2, 3].includes(NaN));  // false
console.log([NaN].includes(NaN));      // true
console.log([NaN].indexOf(NaN));       // -1  — indexOf uses ===, includes uses SameValueZero

console.log(typeof []);           // 'object'
console.log(Array.isArray([]));   // true — the correct check

// ---------------------------------------------------------------------------
// OBJECTS — quirks
// ---------------------------------------------------------------------------

const keyed = {};
keyed[{ a: 1 }] = 'first';
keyed[{ b: 2 }] = 'second';
console.log(keyed); // { '[object Object]': 'second' } — object keys stringify!
// Use a Map when you need object keys.

const ordered = { b: 1, 2: 'two', a: 2, 1: 'one' };
console.log(Object.keys(ordered)); // ['1','2','b','a'] — integer keys sort first

console.log({ a: 1 } === { a: 1 }); // false — different references
console.log(JSON.stringify({ a: undefined, b: () => {}, c: NaN }));
// {"c":null} — undefined and functions are dropped, NaN becomes null

// ---------------------------------------------------------------------------
// CLOSURES
// ---------------------------------------------------------------------------

function makeAdders() {
    const fns = [];
    for (var i = 0; i < 3; i++) fns.push(() => i);
    return fns.map((f) => f());
}
console.log(makeAdders()); // [3,3,3] — var, one shared binding

function makeAddersFixed() {
    const fns = [];
    for (let i = 0; i < 3; i++) fns.push(() => i);
    return fns.map((f) => f());
}
console.log(makeAddersFixed()); // [0,1,2] — let, new binding per iteration

// ---------------------------------------------------------------------------
// FUNCTION ARGUMENTS & DEFAULTS
// ---------------------------------------------------------------------------

function defaults(a, b = a * 2, c = a + b) {
    return [a, b, c];
}
console.log(defaults(1));      // [1, 2, 3] — defaults can reference earlier params
console.log(defaults(1, 10));  // [1, 10, 11]

function counterDefault(items = []) {
    items.push(1);
    return items.length;
}
console.log(counterDefault(), counterDefault()); // 1 1 — a fresh [] each call (unlike Python)

const arrowArgs = () => {
    try {
        return arguments.length; // ReferenceError — arrows have no `arguments`
    } catch (e) {
        return 'no arguments object';
    }
};
console.log(arrowArgs()); // 'no arguments object'

console.log(((a, b) => 0).length); // 2 — fn.length = number of declared params
console.log(((a, b = 1) => 0).length); // 1 — stops counting at the first default

// ---------------------------------------------------------------------------
// CLASSES / PROTOTYPES
// ---------------------------------------------------------------------------

class Animal {
    constructor(name) {
        this.name = name;
    }
    speak() {
        return `${this.name} makes a sound`;
    }
}
class Dog extends Animal {
    speak() {
        return `${super.speak()} — woof`;
    }
}
console.log(new Dog('Rex').speak()); // Rex makes a sound — woof

function Old(name) {
    this.name = name;
}
Old.prototype.greet = function () {
    return 'hi ' + this.name;
};
const inst = new Old('a');
console.log(inst.hasOwnProperty('greet'));            // false — it's on the prototype
console.log('greet' in inst);                          // true  — `in` walks the chain
console.log(Object.getPrototypeOf(inst) === Old.prototype); // true

// Forgetting `new`
function NoNew(name) {
    this.name = name;
}
// const bad = NoNew('x');  // TypeError in strict mode / pollutes global otherwise

// ---------------------------------------------------------------------------
// OPTIONAL CHAINING / NULLISH
// ---------------------------------------------------------------------------

const user = { profile: null, count: 0, label: '' };
console.log(user.profile?.avatar);       // undefined — no crash
console.log(user.missing?.deep?.value);  // undefined
console.log(user.count || 10);           // 10  — WRONG, 0 is falsy
console.log(user.count ?? 10);           // 0   — RIGHT, ?? only checks null/undefined
console.log(user.label || 'default');    // 'default'
console.log(user.label ?? 'default');    // ''

// ---------------------------------------------------------------------------
// MISC TRAPS
// ---------------------------------------------------------------------------

console.log(1 < 2 < 3);  // true  -> (1<2)=true -> true<3 -> 1<3 -> true
console.log(3 > 2 > 1);  // false -> (3>2)=true -> true>1 -> 1>1 -> false

console.log('b' + 'a' + +'a' + 'a'); // 'baNaNa'  (+'a' is NaN)

console.log([..."hello"]); // ['h','e','l','l','o']

let count = 0;
console.log(count++, count); // 0 1 — postfix returns then increments
console.log(++count, count); // 2 2 — prefix increments then returns

console.log((function () {
    return
        { ok: true }; // returns undefined — automatic semicolon insertion after `return`
})());

// ---------------------------------------------------------------------------
