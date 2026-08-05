/* =============================================================================
   POLYFILLS
   "Implement map / reduce / bind yourself" is the standard way to check whether
   you understand `this`, callbacks and the prototype chain.
   Rules for all of these: put them on the prototype, use a normal function (not
   an arrow — you need `this`), skip holes, and pass (value, index, array).
============================================================================= */

// ---------------------------------------------------------------------------
// 1. Array.prototype.map

Array.prototype.myMap = function (callback, thisArg) {
    if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (i in this) result[i] = callback.call(thisArg, this[i], i, this); // skip holes
    }
    return result;
};

console.log([1, 2, 3].myMap((n) => n * 2)); // [2,4,6]

// ---------------------------------------------------------------------------
// 2. Array.prototype.filter

Array.prototype.myFilter = function (callback, thisArg) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback.call(thisArg, this[i], i, this)) result.push(this[i]);
    }
    return result;
};

console.log([1, 2, 3, 4].myFilter((n) => n % 2 === 0)); // [2,4]

// ---------------------------------------------------------------------------
// 3. Array.prototype.reduce (the tricky one — no-initial-value case)

Array.prototype.myReduce = function (callback, initialValue) {
    if (typeof callback !== 'function') throw new TypeError(callback + ' is not a function');
    let acc = initialValue;
    let startIndex = 0;

    if (arguments.length < 2) {
        // no initial value: find the first non-hole element
        while (startIndex < this.length && !(startIndex in this)) startIndex++;
        if (startIndex >= this.length) {
            throw new TypeError('Reduce of empty array with no initial value');
        }
        acc = this[startIndex++];
    }

    for (let i = startIndex; i < this.length; i++) {
        if (i in this) acc = callback(acc, this[i], i, this);
    }
    return acc;
};

console.log([1, 2, 3].myReduce((a, b) => a + b));    // 6
console.log([1, 2, 3].myReduce((a, b) => a + b, 10)); // 16

// ---------------------------------------------------------------------------
// 4. forEach / find / findIndex / some / every / includes

Array.prototype.myForEach = function (callback, thisArg) {
    for (let i = 0; i < this.length; i++) {
        if (i in this) callback.call(thisArg, this[i], i, this);
    }
    // returns undefined — that's why you can't chain it
};

Array.prototype.myFind = function (callback) {
    for (let i = 0; i < this.length; i++) {
        if (callback(this[i], i, this)) return this[i];
    }
    return undefined;
};

Array.prototype.mySome = function (callback) {
    for (let i = 0; i < this.length; i++) {
        if (i in this && callback(this[i], i, this)) return true;
    }
    return false;
};

Array.prototype.myEvery = function (callback) {
    for (let i = 0; i < this.length; i++) {
        if (i in this && !callback(this[i], i, this)) return false;
    }
    return true;
};

console.log([1, 2, 3].myFind((n) => n > 1)); // 2
console.log([1, 2, 3].mySome((n) => n > 2)); // true
console.log([1, 2, 3].myEvery((n) => n > 0)); // true

// ---------------------------------------------------------------------------
// 5. Array.prototype.flat

Array.prototype.myFlat = function (depth = 1) {
    const result = [];
    for (const item of this) {
        if (Array.isArray(item) && depth > 0) result.push(...item.myFlat(depth - 1));
        else result.push(item);
    }
    return result;
};

console.log([1, [2, [3, [4]]]].myFlat(Infinity)); // [1,2,3,4]

// ---------------------------------------------------------------------------
// 6. call — invoke a function with a given `this`

Function.prototype.myCall = function (context, ...args) {
    context = context ?? globalThis;
    if (Object(context) !== context) context = Object(context); // box primitives
    const key = Symbol('fn');   // Symbol avoids clobbering an existing property
    context[key] = this;        // `this` here is the function being called
    const result = context[key](...args);
    delete context[key];
    return result;
};

// ---------------------------------------------------------------------------
// 7. apply — same, but arguments come as an array

Function.prototype.myApply = function (context, args = []) {
    return this.myCall(context, ...args);
};

// ---------------------------------------------------------------------------
// 8. bind — returns a new function; must also work with `new`

Function.prototype.myBind = function (context, ...boundArgs) {
    const targetFn = this;
    if (typeof targetFn !== 'function') throw new TypeError('Bind must be called on a function');

    function bound(...callArgs) {
        // if called with `new`, ignore the bound context
        const isNew = this instanceof bound;
        return targetFn.apply(isNew ? this : context, [...boundArgs, ...callArgs]);
    }

    bound.prototype = Object.create(targetFn.prototype || null);
    return bound;
};

const person = { name: 'Keyur' };
function introduce(role, company) {
    return `${this.name} — ${role} at ${company}`;
}

console.log(introduce.myCall(person, 'Frontend Dev', 'Mars'));
console.log(introduce.myApply(person, ['Frontend Dev', 'Mars']));
console.log(introduce.myBind(person, 'Frontend Dev')('Mars'));

// ---------------------------------------------------------------------------
// 9. `new` operator implementation (explains the 4 steps of construction)

function myNew(Constructor, ...args) {
    const obj = Object.create(Constructor.prototype); // 1. new object, proto linked
    const result = Constructor.apply(obj, args);      // 2. run ctor with this = obj
    return result !== null && typeof result === 'object' ? result : obj; // 3/4. return
}

function User(name) {
    this.name = name;
}
User.prototype.greet = function () {
    return 'Hi ' + this.name;
};

const u = myNew(User, 'Keyur');
console.log(u.greet());          // Hi Keyur
console.log(u instanceof User);  // true

// ---------------------------------------------------------------------------
// 10. instanceof — walk the prototype chain

function myInstanceOf(obj, Constructor) {
    if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false;
    let proto = Object.getPrototypeOf(obj);
    while (proto !== null) {
        if (proto === Constructor.prototype) return true;
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

console.log(myInstanceOf([], Array));  // true
console.log(myInstanceOf([], Object)); // true (Array inherits from Object)
console.log(myInstanceOf({}, Array));  // false

// ---------------------------------------------------------------------------
// 11. A minimal Promise implementation (the "impress them" answer)

class MyPromise {
    static PENDING = 'pending';
    static FULFILLED = 'fulfilled';
    static REJECTED = 'rejected';

    constructor(executor) {
        this.state = MyPromise.PENDING;
        this.value = undefined;
        this.callbacks = []; // queued {onFulfilled, onRejected} while pending

        const resolve = (value) => this.#settle(MyPromise.FULFILLED, value);
        const reject = (reason) => this.#settle(MyPromise.REJECTED, reason);

        try {
            executor(resolve, reject);
        } catch (err) {
            reject(err);
        }
    }

    #settle(state, value) {
        if (this.state !== MyPromise.PENDING) return; // settle only once
        this.state = state;
        this.value = value;
        // always async — this is what makes promises microtasks
        queueMicrotask(() => this.callbacks.forEach((cb) => this.#handle(cb)));
    }

    #handle({ onFulfilled, onRejected, resolve, reject }) {
        try {
            if (this.state === MyPromise.FULFILLED) {
                resolve(typeof onFulfilled === 'function' ? onFulfilled(this.value) : this.value);
            } else {
                if (typeof onRejected === 'function') resolve(onRejected(this.value));
                else reject(this.value);
            }
        } catch (err) {
            reject(err);
        }
    }

    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            const callback = { onFulfilled, onRejected, resolve, reject };
            if (this.state === MyPromise.PENDING) this.callbacks.push(callback);
            else queueMicrotask(() => this.#handle(callback));
        });
    }

    catch(onRejected) {
        return this.then(undefined, onRejected);
    }

    finally(onFinally) {
        return this.then(
            (v) => { onFinally(); return v; },
            (e) => { onFinally(); throw e; }
        );
    }

    static resolve(value) {
        return new MyPromise((resolve) => resolve(value));
    }
    static reject(reason) {
        return new MyPromise((_, reject) => reject(reason));
    }
}

new MyPromise((resolve) => setTimeout(() => resolve(10), 50))
    .then((v) => v * 2)
    .then((v) => {
        console.log('MyPromise chain:', v); // 20
        throw new Error('oops');
    })
    .catch((e) => console.log('MyPromise caught:', e.message))
    .finally(() => console.log('MyPromise finally'));

// ---------------------------------------------------------------------------
// 12. Object.create / Object.assign / Object.entries

const myObjectCreate = (proto) => {
    function F() {}
    F.prototype = proto;
    return new F();
};

const myAssign = (target, ...sources) => {
    sources.forEach((src) => {
        for (const key in src) {
            if (Object.prototype.hasOwnProperty.call(src, key)) target[key] = src[key];
        }
    });
    return target;
};

const myEntries = (obj) => Object.keys(obj).map((k) => [k, obj[k]]);

console.log(myAssign({ a: 1 }, { b: 2 }, { c: 3 })); // { a:1, b:2, c:3 }
console.log(myEntries({ x: 1, y: 2 }));              // [['x',1],['y',2]]

// ---------------------------------------------------------------------------
// 13. Accurate typeof — typeof is famously broken for null/array/date

function typeOf(value) {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

console.log(typeof null, typeOf(null));           // 'object'   'null'
console.log(typeof [], typeOf([]));               // 'object'   'array'
console.log(typeof new Date(), typeOf(new Date())); // 'object' 'date'
console.log(typeof NaN, typeOf(NaN));             // 'number'   'number'

// ---------------------------------------------------------------------------
// 14. debounce/throttle live in functions-hof.js — they're also polyfill fodder.
// ---------------------------------------------------------------------------
