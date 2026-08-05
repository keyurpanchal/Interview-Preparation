/* =============================================================================
   ASYNC / PROMISES PRACTICALS
   At 5 YOE they stop asking "what is a promise" and start asking
   "implement retry / concurrency limit / cancel this request".
============================================================================= */

// ---------------------------------------------------------------------------
// 1. sleep / delay — the building block for everything below

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    console.log('start');
    await sleep(100);
    console.log('after 100ms');
})();

// ---------------------------------------------------------------------------
// 2. Promisify a callback-style function (Node error-first convention)

function promisify(fn) {
    return (...args) =>
        new Promise((resolve, reject) => {
            fn(...args, (err, result) => (err ? reject(err) : resolve(result)));
        });
}

const getUserCb = (id, cb) =>
    setTimeout(() => (id ? cb(null, { id, name: 'Keyur' }) : cb(new Error('No id'))), 100);

const getUser = promisify(getUserCb);
getUser(1).then(console.log).catch(console.error); // { id: 1, name: 'Keyur' }

// ---------------------------------------------------------------------------
// 3. Sequential vs parallel — know when each is right

const task = (name, ms) =>
    new Promise((resolve) => setTimeout(() => resolve(`${name} done`), ms));

async function sequential() {
    console.time('sequential');
    const a = await task('A', 300);
    const b = await task('B', 300); // waits for A — 600ms total
    console.timeEnd('sequential');
    return [a, b];
}

async function parallel() {
    console.time('parallel');
    const [a, b] = await Promise.all([task('A', 300), task('B', 300)]); // 300ms total
    console.timeEnd('parallel');
    return [a, b];
}

// Gotcha they test: this is SEQUENTIAL, not parallel.
async function looksParallelButIsnt(ids) {
    const results = [];
    for (const id of ids) results.push(await task(id, 100)); // one at a time
    return results;
}

// This one is truly parallel:
const actuallyParallel = (ids) => Promise.all(ids.map((id) => task(id, 100)));

// Note: forEach does NOT await — a very common bug they want you to spot.
async function brokenForEach(ids) {
    ids.forEach(async (id) => {
        await task(id, 100); // the outer function does not wait for these
    });
    console.log('this logs before any task finishes');
}

// ---------------------------------------------------------------------------
// 4. Promise.all polyfill  (fail-fast, preserves order)

function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        const results = new Array(promises.length);
        let completed = 0;
        if (promises.length === 0) return resolve([]);
        promises.forEach((p, i) => {
            Promise.resolve(p)
                .then((value) => {
                    results[i] = value;      // index keeps the original order
                    if (++completed === promises.length) resolve(results);
                })
                .catch(reject);              // first rejection wins
        });
    });
}

promiseAll([Promise.resolve(1), 2, sleep(50).then(() => 3)]).then(console.log); // [1,2,3]

// ---------------------------------------------------------------------------
// 5. Promise.allSettled polyfill (never rejects)

function promiseAllSettled(promises) {
    return Promise.all(
        promises.map((p) =>
            Promise.resolve(p).then(
                (value) => ({ status: 'fulfilled', value }),
                (reason) => ({ status: 'rejected', reason })
            )
        )
    );
}

promiseAllSettled([Promise.resolve(1), Promise.reject(new Error('boom'))]).then(console.log);
// [ {status:'fulfilled',value:1}, {status:'rejected',reason:Error} ]

// ---------------------------------------------------------------------------
// 6. Promise.race polyfill (first to settle, success or failure)

function promiseRace(promises) {
    return new Promise((resolve, reject) => {
        promises.forEach((p) => Promise.resolve(p).then(resolve, reject));
    });
}

promiseRace([sleep(200).then(() => 'slow'), sleep(50).then(() => 'fast')]).then(console.log);
// 'fast'

// ---------------------------------------------------------------------------
// 7. Promise.any polyfill (first SUCCESS; rejects only if all fail)

function promiseAny(promises) {
    return new Promise((resolve, reject) => {
        const errors = new Array(promises.length);
        let failed = 0;
        promises.forEach((p, i) => {
            Promise.resolve(p).then(resolve, (err) => {
                errors[i] = err;
                if (++failed === promises.length) {
                    reject(new AggregateError(errors, 'All promises were rejected'));
                }
            });
        });
    });
}

promiseAny([Promise.reject(new Error('a')), sleep(50).then(() => 'b')]).then(console.log); // 'b'

// ---------------------------------------------------------------------------
// 8. Timeout wrapper — reject if a promise takes too long

function withTimeout(promise, ms, message = 'Request timed out') {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

withTimeout(sleep(1000), 200).catch((e) => console.log(e.message)); // Request timed out

// ---------------------------------------------------------------------------
// 9. RETRY with exponential backoff — asked constantly

async function retry(fn, { retries = 3, delay = 200, factor = 2 } = {}) {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn(attempt);
        } catch (err) {
            lastError = err;
            console.log(`attempt ${attempt} failed: ${err.message}`);
            if (attempt < retries) {
                await sleep(delay);
                delay *= factor; // 200 -> 400 -> 800
            }
        }
    }
    throw lastError;
}

let attempts = 0;
retry(async () => {
    attempts++;
    if (attempts < 3) throw new Error('network error');
    return 'success on attempt ' + attempts;
})
    .then(console.log)
    .catch(console.error);

// ---------------------------------------------------------------------------
// 10. CONCURRENCY LIMIT / promise pool — "fetch 100 urls, 3 at a time"
// This is the single most common senior async question.

async function pool(tasks, limit = 3) {
    const results = new Array(tasks.length);
    let index = 0;

    async function worker() {
        while (index < tasks.length) {
            const current = index++;          // claim a task
            results[current] = await tasks[current]();
        }
    }

    // start `limit` workers that drain the queue in parallel
    await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
    return results;
}

const jobs = [1, 2, 3, 4, 5, 6].map((n) => async () => {
    await sleep(100);
    console.log('finished job', n);
    return n * 10;
});

pool(jobs, 2).then((r) => console.log('pool results:', r)); // [10,20,30,40,50,60]

// ---------------------------------------------------------------------------
// 11. Run promises in series (one after another, collecting results)

async function series(tasks) {
    const results = [];
    for (const t of tasks) results.push(await t());
    return results;
}

// Same thing with reduce (they sometimes ask for the functional version)
const seriesReduce = (tasks) =>
    tasks.reduce(
        (chain, t) => chain.then((acc) => t().then((r) => [...acc, r])),
        Promise.resolve([])
    );

// ---------------------------------------------------------------------------
// 12. Cancellable request with AbortController (real-world typeahead)

function fetchWithAbort(url) {
    const controller = new AbortController();
    const promise = fetch(url, { signal: controller.signal });
    return { promise, cancel: () => controller.abort() };
}

// Typeahead: cancel the in-flight request whenever a new keystroke arrives
function createSearch() {
    let controller = null;
    return async function search(query) {
        if (controller) controller.abort();       // kill the previous one
        controller = new AbortController();
        try {
            const res = await fetch(`/api/search?q=${query}`, { signal: controller.signal });
            return await res.json();
        } catch (err) {
            if (err.name === 'AbortError') return null; // expected, ignore
            throw err;
        }
    };
}

// ---------------------------------------------------------------------------
// 13. Async debounce that returns a promise (debounced API call with a result)

function debounceAsync(fn, delay = 300) {
    let timer;
    let rejectPrev;
    return (...args) =>
        new Promise((resolve, reject) => {
            clearTimeout(timer);
            if (rejectPrev) rejectPrev({ cancelled: true });
            rejectPrev = reject;
            timer = setTimeout(() => {
                rejectPrev = null;
                Promise.resolve(fn(...args)).then(resolve, reject);
            }, delay);
        });
}

// ---------------------------------------------------------------------------
// 14. Cache in-flight requests (dedupe identical parallel calls)

function dedupe(fn) {
    const inFlight = new Map();
    return function (key, ...args) {
        if (inFlight.has(key)) return inFlight.get(key); // reuse the pending promise
        const promise = Promise.resolve(fn(key, ...args)).finally(() =>
            inFlight.delete(key)
        );
        inFlight.set(key, promise);
        return promise;
    };
}

const fetchOnce = dedupe(async (id) => {
    console.log('actual call for', id);
    await sleep(100);
    return { id };
});
fetchOnce(1);
fetchOnce(1); // no second "actual call" log — same promise returned

// ---------------------------------------------------------------------------
// 15. Async task queue that processes one item at a time

class TaskQueue {
    constructor() {
        this.queue = [];
        this.running = false;
    }
    add(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.run();
        });
    }
    async run() {
        if (this.running) return;
        this.running = true;
        while (this.queue.length) {
            const { task, resolve, reject } = this.queue.shift();
            try {
                resolve(await task());
            } catch (err) {
                reject(err);
            }
        }
        this.running = false;
    }
}

const queue = new TaskQueue();
queue.add(() => task('q1', 100)).then(console.log);
queue.add(() => task('q2', 50)).then(console.log); // still runs after q1

// ---------------------------------------------------------------------------
// 16. EVENT LOOP ORDER — guaranteed output question. Learn this cold.

console.log('1 sync');

setTimeout(() => console.log('2 timeout (macrotask)'), 0);

Promise.resolve().then(() => console.log('3 promise (microtask)'));

queueMicrotask(() => console.log('4 queueMicrotask'));

(async () => {
    console.log('5 sync inside async (runs immediately)');
    await null;
    console.log('6 after await (microtask)');
})();

console.log('7 sync end');

/*  Output:
    1 sync
    5 sync inside async (runs immediately)
    7 sync end
    3 promise (microtask)
    4 queueMicrotask
    6 after await (microtask)
    2 timeout (macrotask)

    Rule: run all sync code -> drain the ENTIRE microtask queue -> then one macrotask.
    await X is just .then(...) — everything after it is a microtask.            */

// ---------------------------------------------------------------------------
// 17. Error handling patterns

// try/catch only catches awaited rejections
async function safe() {
    try {
        await Promise.reject(new Error('caught'));
    } catch (e) {
        console.log('handled:', e.message);
    } finally {
        console.log('always runs');
    }
}
safe();

// Go-style tuple helper — avoids try/catch pyramids
const to = (promise) => promise.then((data) => [null, data]).catch((err) => [err, null]);

(async () => {
    const [err, data] = await to(getUser(1));
    if (err) return console.error(err);
    console.log('data:', data);
})();

// ---------------------------------------------------------------------------
