export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function getSleeperWithClear(ms) {
  let timeout = null;
  const sleeper = new Promise(resolve => {
    timeout = setTimeout(resolve, ms);
  });
  const clear = () => {
    clearTimeout(timeout);
  };

  return { sleeper, clear };
}

/** If the promise takes longer than the given number of milliseconds, throw a promise error
 * (error.name === "TimeoutError") */
export function promiseTimeout(promise, time) {
  const sleeper = sleep(time).then(() => {
    const exc = new Error("Timed Out");
    exc.name = "TimeoutError";
    throw exc;
  });
  return Promise.race([promise, sleeper]);
}

/** Try func() several times, eventually timing out after timeout milliseconds
 * func() should return undefined when the results are indeterminate. Any other
 * return value ends the attempts successfully.
 */
export function trySeveralTimes({ func, timeout, interval, returnOnTimeout }) {
  timeout = timeout || 1000;
  interval = interval || 100;
  return new Promise((resolve, reject) => {
    const intervalId = setInterval(async () => {
      try {
        const resp = await func();
        if (resp !== undefined) {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
          resolve(resp);
        }
      } catch (e) {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        reject(e);
      }
    }, interval);
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (returnOnTimeout !== undefined) {
        resolve(returnOnTimeout);
      } else {
        const exc = new Error("Timed out");
        exc.name = "TimeoutError";
        reject(exc);
      }
    }, timeout);
  });
}

/** Creates a Promise with .resolve and .reject attributes, so you can pre-create it and then
 * resolve it somewhere else (like after initialization has run) */
export function makeNakedPromise() {
  let _resolve, _reject;
  const promise = new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });
  promise.resolve = _resolve;
  promise.reject = _reject;
  return promise;
}

export function cmp(a, b) {
  if (a < b) {
    return -1;
  } else if (b < a) {
    return 1;
  }
  return 0;
}

export function normalizedStringsMatch(a, b) {
  function norm(s) {
    s = s.toLowerCase().trim();
    s = s.replace(/\s\s+/, " ");
    s = s.replace(/[^a-z0-9]/, "");
    return s;
  }
  return norm(a) === norm(b);
}

export function randomString(length, chars) {
  const randomStringChars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  chars = chars || randomStringChars;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/* Forces the async function to only be called once, until it has returned */
// FIXME: I'm worried this is going to leak memory, as it creates a forever-growing promise chain
export function serializeCalls(asyncFunction) {
  let otherFuncResult = null;
  return function(...args) {
    if (otherFuncResult) {
      otherFuncResult = otherFuncResult.then(
        () => asyncFunction(...args),
        () => asyncFunction(...args)
      );
    } else {
      otherFuncResult = asyncFunction(...args);
    }
    return otherFuncResult;
  };
}
