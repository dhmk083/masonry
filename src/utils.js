export const identity = x => x

export const objectMap = (obj, fn) =>
  Object.entries(obj).reduce((acc, [k, v]) => ((acc[k] = fn(v, k)), acc), {})

export const delayed = (ms, x) => new Promise(res => setTimeout(res, ms, x))

export const encodeQuery = q =>
  Object.entries(q)
    .map(kv => kv.map(encodeURIComponent).join('='))
    .join('&')

export const debounced = (fn, ms) => {
  let tid

  return (...args) => {
    clearTimeout(tid)
    tid = setTimeout(fn, ms, ...args)
  }
}

export const pick = arr => arr[~~(Math.random() * arr.length)]
