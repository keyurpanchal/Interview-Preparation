/* =============================================================================
   FUNCTIONS / CLOSURES / HIGHER-ORDER FUNCTIONS
   This is THE 5-YOE round. If you only revise one file, revise this one.
   debounce, throttle, memoize and curry come up in almost every interview.
============================================================================= */

// ---------------------------------------------------------------------------
// 1. Closure counter (the classic opener)

function createCounter(start = 0) {
    let count = start; // private — not reachable from outside
    return {
        increment: () => ++count,
        decrement: () => --count,
        value: () => count,
        reset: () => (count = start),
    };
}

const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.value()); // 2

// ---------------------------------------------------------------------------
// 2. once — run a function only the first time

function once(fn) {
    let called = false;
    let result;
    return function (...args) {
        if (!called) {
            called = true;
            result = fn.apply(this, args);
        }
        return result;
    };
}

const init = once(() => {
    console.log('initialised');
    return 'ready';
});
init(); // logs 'initialised'
init(); // nothing logged, returns cached 'ready'

// ---------------------------------------------------------------------------
// 3. Limit a function to N calls

function limitCalls(fn, n) {
    let calls = 0;
    return (...args) => (calls++ < n ? fn(...args) : undefined);
}

const tryThrice = limitCalls((x) => console.log('call', x), 3);
[1, 2, 3, 4, 5].forEach(tryThrice); // logs 1, 2, 3 only

// ---------------------------------------------------------------------------
// 4. memoize — cache results by arguments

function memoize(fn) {
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            console.log('from cache:', key);
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

const slowSquare = (n) => {
    for (let i = 0; i < 1e6; i++) {} // pretend heavy work
    return n * n;
};
const fastSquare = memoize(slowSquare);
console.log(fastSquare(9)); // computes -> 81
console.log(fastSquare(9)); // from cache -> 81

// Memoized fibonacci — the follow-up they always ask
const fib = memoize((n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));
console.log(fib(40)); // 102334155 — instant instead of seconds

// ---------------------------------------------------------------------------
// 5. DEBOUNCE — wait until the user stops firing events
// Use for: search-as-you-type, resize, form validation, autosave.

function debounce(fn, delay = 300, immediate = false) {
    let timer = null;
    function debounced(...args) {
        const callNow = immediate && timer === null;
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            if (!immediate) fn.apply(this, args);
        }, delay);
        if (callNow) fn.apply(this, args);
    }
    debounced.cancel = () => {
        clearTimeout(timer);
        timer = null;
    };
    return debounced;
}

const search = debounce((q) => console.log('API call for:', q), 400);
search('r');
search('re');
search('rea');
search('react'); // only this one fires, 400ms after the last keystroke

// ---------------------------------------------------------------------------
// 6. THROTTLE — run at most once every X ms
// Use for: scroll, mousemove, drag, rapid button clicks, infinite scroll.

function throttle(fn, limit = 300) {
    let lastCall = 0;
    let timer = null;
    return function (...args) {
        const now = Date.now();
        const remaining = limit - (now - lastCall);
        if (remaining <= 0) {
            lastCall = now;
            fn.apply(this, args);
        } else if (!timer) {
            // trailing call so the final event isn't dropped
            timer = setTimeout(() => {
                lastCall = Date.now();
                timer = null;
                fn.apply(this, args);
            }, remaining);
        }
    };
}

const onScroll = throttle(() => console.log('scroll handler', Date.now()), 1000);

/*  DEBOUNCE vs THROTTLE — the verbal answer they want:
    debounce = "wait for silence, then run once"   -> search box
    throttle = "run regularly, but no more than X" -> scroll position     */

// ---------------------------------------------------------------------------
// 7. CURRY — fixed arity  add(1)(2)(3)

function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) return fn.apply(this, args);
        return (...next) => curried.apply(this, [...args, ...next]);
    };
}

const add3 = (a, b, c) => a + b + c;
const curriedAdd = curry(add3);
console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6

// ---------------------------------------------------------------------------
// 8. INFINITE CURRY — sum(1)(2)(3)() and sum(1)(2)(3) used as a value
// Trick: return a function and override its toString/valueOf.

function sum(a) {
    const fn = (b) => (b === undefined ? a : sum(a + b));
    fn.valueOf = () => a;
    fn.toString = () => String(a);
    return fn;
}

console.log(sum(1)(2)(3)());   // 6  (explicit terminator)
console.log(+sum(1)(2)(3)(4)); // 10 (unary + triggers valueOf)
console.log(`${sum(5)(5)}`);   // "10"

// ---------------------------------------------------------------------------
// 9. Partial application

function partial(fn, ...preset) {
    return (...later) => fn(...preset, ...later);
}

const greet = (greeting, name) => `${greeting}, ${name}!`;
const hello = partial(greet, 'Hello');
console.log(hello('Keyur')); // Hello, Keyur!

// ---------------------------------------------------------------------------
// 10. pipe and compose

const pipe = (...fns) => (input) => fns.reduce((acc, fn) => fn(acc), input);
const compose = (...fns) => (input) => fns.reduceRight((acc, fn) => fn(acc), input);

const double = (n) => n * 2;
const increment = (n) => n + 1;
const square = (n) => n * n;

console.log(pipe(double, increment, square)(3));    // ((3*2)+1)^2 = 49
console.log(compose(square, increment, double)(3)); // same, right to left = 49

// Async pipe (each step may return a promise)
const pipeAsync = (...fns) => (input) =>
    fns.reduce((chain, fn) => chain.then(fn), Promise.resolve(input));

pipeAsync(
    async (n) => n * 2,
    (n) => n + 1
)(5).then((r) => console.log('pipeAsync:', r)); // 11

// ---------------------------------------------------------------------------
// 11. Function that counts its own invocations (closure on a function object)

function counted(fn) {
    function wrapper(...args) {
        wrapper.count++;
        return fn(...args);
    }
    wrapper.count = 0;
    return wrapper;
}

const tracked = counted((x) => x);
tracked(1);
tracked(2);
console.log(tracked.count); // 2

// ---------------------------------------------------------------------------
// 12. Rate limiter — max N calls per time window (sliding window)

function rateLimit(fn, maxCalls, windowMs) {
    const timestamps = [];
    return function (...args) {
        const now = Date.now();
        while (timestamps.length && now - timestamps[0] > windowMs) timestamps.shift();
        if (timestamps.length >= maxCalls) {
            console.warn('Rate limit exceeded');
            return;
        }
        timestamps.push(now);
        return fn.apply(this, args);
    };
}

const limitedApi = rateLimit((id) => console.log('fetching', id), 3, 1000);
[1, 2, 3, 4].forEach(limitedApi); // 4th one is blocked

// ---------------------------------------------------------------------------
// 13. Chained / fluent API (calculator) — tests `return this`

class Calculator {
    constructor(value = 0) {
        this.value = value;
    }
    add(n) { this.value += n; return this; }
    subtract(n) { this.value -= n; return this; }
    multiply(n) { this.value *= n; return this; }
    divide(n) {
        if (n === 0) throw new Error('Divide by zero');
        this.value /= n;
        return this;
    }
    result() { return this.value; }
}

console.log(new Calculator(10).add(5).multiply(2).subtract(10).result()); // 20

// ---------------------------------------------------------------------------
// 14. The classic setTimeout-in-a-loop question and its 3 fixes

// Broken: var is function-scoped, all callbacks see the final i
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log('var:', i), 0); // 3, 3, 3
}

// Fix 1: let creates a new binding each iteration
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log('let:', j), 0); // 0, 1, 2
}

// Fix 2: IIFE captures the value in a closure
for (var k = 0; k < 3; k++) {
    (function (k) {
        setTimeout(() => console.log('iife:', k), 0); // 0, 1, 2
    })(k);
}

// Fix 3: pass as a setTimeout argument
for (var m = 0; m < 3; m++) {
    setTimeout((m) => console.log('arg:', m), 0, m); // 0, 1, 2
}

// ---------------------------------------------------------------------------
// 15. Private state without classes (module pattern / IIFE)

const bankAccount = (function () {
    let balance = 0; // truly private
    return {
        deposit(amount) {
            if (amount > 0) balance += amount;
            return this;
        },
        withdraw(amount) {
            if (amount > balance) throw new Error('Insufficient funds');
            balance -= amount;
            return this;
        },
        getBalance: () => balance,
    };
})();

bankAccount.deposit(100).withdraw(30);
console.log(bankAccount.getBalance()); // 70
console.log(bankAccount.balance);      // undefined — inaccessible

// ---------------------------------------------------------------------------
// 16. Deep function to flatten arguments of any shape (rest + recursion)

const sumAll = (...args) =>
    args.flat(Infinity).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);

console.log(sumAll(1, [2, [3, 4]], 5)); // 15

// ---------------------------------------------------------------------------
