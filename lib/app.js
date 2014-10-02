
var app = module.exports = require('koa')()
var polyfills = require('polyfills')
var fs = require('fs')

var test_html = fs.readFileSync(__dirname + '/test.html')
var test_js = fs.readFileSync(__dirname + '/test.js')

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

var re = /^\/polyfill\.js([+-][a-z,]+)?$/

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
  if (args)
    options[args[0] === '+' ? 'include' : 'exclude'] = args.slice(1).split(',')

  var polyfill = polyfills(options)
  var data = yield polyfill(this.req.headers['user-agent'])

  // 2 weeks
  this.response.set('Cache-Control', 'public, max-age=1209600')
  this.response.vary('User-Agent')
  this.response.type = 'js'
  this.response.etag = data.hash
  this.response.status = 200 // weird
  if (this.request.fresh) return this.response.status = 304

  this.response.set('Content-Encoding', 'gzip')
  this.response.body = polyfill.stream(data.name, '.min.js.gz')
  this.response.length = data.length['.min.js.gz']
})
