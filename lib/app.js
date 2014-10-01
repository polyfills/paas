
var app = module.exports = require('koa')()
var polyfills = require('polyfills')
var fs = require('fs')

var test_html = fs.readFileSync(__dirname + '/test.html')
var test_js = fs.readFileSync(__dirname + '/test.js')

app.use(function* (next) {
  switch (this.request.path) {
    case '/test.html':
      this.response.type = 'html'
      this.response.body = test_html
      break;
    case '/test.js':
      this.response.type = 'js'
      this.response.body = test_js
      break;
    default:
      return yield* next;
  }

  this.response.set('Cache-Control', 'public, max-page=86400')
})

app.use(function* (next) {
  if (this.request.path !== '/polyfill.js') return yield* next

  switch (this.request.method) {
    case 'HEAD':
    case 'GET':
      break; // continue
    case 'OPTIONS':
      this.response.set('Allow', 'OPTIONS,HEAD,GET')
      this.response.status = 204
      return
    default:
      this.response.set('Allow', 'OPTIONS,HEAD,GET')
      this.response.status = 405
      return
  }

  // setup options
  var options = {}
  var query = this.request.query
  if (query.include) {
    this.assert(typeof query.include === 'string', 400)
    options.include = query.include.split(/[,;]/g).map(trim)
  } else if (query.exclude) {
    this.assert(typeof query.exclude === 'string', 400)
    options.exclude = query.exclude.split(/[,;]/g).map(trim)
  }
  var polyfill = polyfills(options)
  var data = yield polyfill(this.req.headers['user-agent'])

  this.response.set('Cache-Control', 'public, max-age=1209600')
  this.response.set('Vary', 'Accept-Encoding')
  this.response.set('Vary', 'User-Agent')
  this.response.type = 'js'
  this.response.etag = data.hash
  this.response.status = 200 // weird
  if (this.request.fresh) return this.response.status = 304

  var info = polyfill.select(data, true, this.request.acceptsEncodings('gzip', 'identity') === 'gzip')
  var ext = info[0]
  if (info[1]) this.response.set('Content-Encoding', 'gzip')
  this.response.set('Content-Length', data.length[ext])
  this.response.body = polyfill.stream(data.name, ext)
})

function trim(string) {
  return string.trim()
}
