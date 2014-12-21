
var app = module.exports = require('koa')()
var polyfills = require('polyfills')
var fs = require('fs')

var test_html = fs.readFileSync(__dirname + '/test.html')
var test_js = fs.readFileSync(__dirname + '/test.js')
var loaded = false

// update every hour
setInterval(polyfills.update, 60 * 60 * 1000)

// TODO: proper method handling like below
app.use(function* _tests(next) {
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

var re = /^\/polyfill\.js([+-][a-z0-9,]+)?$/

app.use(function* _polyfills(next) {
  var m = re.exec(this.request.path)
  if (!m) return yield* next

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
  var args = m[1]
  if (args) options[args[0] === '+' ? 'include' : 'exclude'] = args.slice(1).split(',')

  if (!loaded) {
    yield polyfills.load
    loaded = true
  }

  var polyfill = polyfills(options)
  var js = polyfill(this.req.headers['user-agent'])

  this.response.set('Cache-Control', 'public, max-age=86400')
  this.response.vary('User-Agent')
  this.response.type = 'js'
  this.response.body = js
})
