
;[
  'matchMedia',
  'performance.now',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'setImmediate',
  'clearImmediate',
  'window.fetch',
].forEach(function (x) {
  it(x, isFunction(x))
})

it('Element.prototype.classList', function () {
  var el = document.createElement('a')
  assert(el.classList, '.classList is not defined!')
})

describe('W3 Selectors API Level 2', function () {
  [
    'Element.prototype.prepend',
    'Element.prototype.append',
    'Element.prototype.before',
    'Element.prototype.after',
    'Element.prototype.replace',
    'Element.prototype.remove',
    'Element.prototype.matches',
    'Element.prototype.query',
    'Element.prototype.queryAll',
  ].forEach(function (x) {
    it(x, isFunction(x))
  })
})

describe('WHATWG HTML Living Standard', function () {
  [
    'atob',
    'btoa',
  ].forEach(function (x) {
    it(x, isFunction(x))
  })

  ;[
    'EventSource',
  ].forEach(function (x) {
    it(x, function () {
      assert(typeof eval(x) !== 'undefined', x + ' is not defined!')
    })
  })
})

describe('ES5', function () {
  [
    'Array.prototype.forEach',
    'Array.prototype.map',
    'Object.create',
  ].forEach(function (x) {
    it(x, isFunction(x))
  })
})

describe('ES6', function () {
  [
    'Array.from',
    'Array.of',
    'Array.prototype.find',
    'Array.prototype.findIndex',
    'Object.setPrototypeOf',
    'Promise',
    'RegExp.prototype.match',
    'RegExp.prototype.search',
    'String.fromCodePoint',
    'String.prototype.codePointAt',
    'String.prototype.contains',
    'String.prototype.endsWith',
    'String.prototype.repeat',
    'String.prototype.startsWith',
  ].forEach(function (x) {
    it(x, isFunction(x))
  })
})

describe('ES7', function () {
  [
    'Object.observe',
  ].forEach(function (x) {
    it(x, isFunction(x))
  })
})

function assert(x, msg) {
  if (!x) throw new Error(msg)
}

function isFunction(x) {
  return function () {
    assert(typeof eval(x) === 'function', x + ' is not a function!')
  }
}
