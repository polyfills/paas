
function assert(x, msg) {
  if (!x) throw new Error(msg)
}

;[
  'Array.from',
  'Array.of',
  'Array.prototype.find',
  'Array.prototype.findIndex',
  'atob',
  'btoa',
  'Element.prototype.prepend',
  'Element.prototype.append',
  'Element.prototype.before',
  'Element.prototype.after',
  'Element.prototype.replace',
  'Element.prototype.remove',
  'Element.prototype.matches',
  'Element.prototype.query',
  'Element.prototype.queryAll',
  'matchMedia',
  'Object.observe',
  'Object.setPrototypeOf',
  'performance.now',
  'Promise',
  'RegExp.prototype.match',
  'RegExp.prototype.search',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'setImmediate',
  'clearImmediate',
  'String.fromCodePoint',
  'String.prototype.codePointAt',
  'String.prototype.contains',
  'String.prototype.endsWith',
  'String.prototype.repeat',
  'String.prototype.startsWith',
  'window.fetch',
].forEach(function (x) {
  it(x, function () {
    assert(typeof eval(x) === 'function', x + ' is not a function!')
  })
})

;[
  'EventSource',
].forEach(function (x) {
  it(x, function () {
    assert(typeof eval(x) !== 'undefined', x + ' is not defined!')
  })
})

it('Element.prototype.classList', function () {
  var el = document.createElement('a')
  assert(el.classList, '.classList is not defined!')
})

describe('ES5', function () {
  [
    'Array.prototype.forEach',
    'Array.prototype.map',
    'Object.create',
  ].forEach(function (x) {
    it(x, function () {
      assert(typeof eval(x) === 'function', x + ' is not a function!')
    })
  })
})
