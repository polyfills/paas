
var request = require('supertest')
var assert = require('assert')

var server = require('..').listen()

// http://caniuse.com/#feat=promises
// http://www.useragentstring.com/pages/Chrome/
var chrome27 = 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1500.55 Safari/537.36'
var chrome35 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
var safari71 = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.1.17 (KHTML, like Gecko) Version/7.1 Safari/537.85.10'
var etag

describe('PaaS', function () {
  it('GET /', function (done) {
    request(server)
    .get('/')
    .expect(404, done)
  })

  it('GET /test.html', function (done) {
    request(server)
    .get('/test.html')
    .expect('Content-Type', /text\/html/)
    .expect(200, done)
  })

  it('GET /test.js', function (done) {
    request(server)
    .get('/test.js')
    .expect('Content-Type', /application\/javascript/)
    .expect(200, done)
  })

  it('HEAD /polyfill.js', function (done) {
    request(server)
    .head('/polyfill.js')
    .expect(200, function (err, res) {
      assert.ifError(err)
      assert(etag = res.headers.etag)
      done()
    })
  })

  it('OPTIONS /polyfill.js', function (done) {
    request(server)
    .options('/polyfill.js')
    .expect('Allow', 'OPTIONS,HEAD,GET')
    .expect(204, done)
  })

  it('POST /polyfill.js', function (done) {
    request(server)
    .post('/polyfill.js')
    .expect('Allow', 'OPTIONS,HEAD,GET')
    .expect(405, done)
  })

  describe('GET /polyfill.js', function () {
    it('should set Vary', function (done) {
      request(server)
      .get('/polyfill.js')
      .expect('Vary', 'User-Agent')
      .expect(200, done);
    })

    it('should support 304 status codes with ETags', function (done) {
      request(server)
      .get('/polyfill.js')
      .set('If-None-Match', etag)
      .expect(304, done)
    })

    it('should not include promises with Chrome 35', function (done) {
      request(server)
      .get('/polyfill.js')
      .set('User-Agent', chrome35)
      .expect('Content-Type', /application\/javascript/)
      .expect('Content-Encoding', 'gzip')
      .expect(200, function (err, res) {
        assert.ifError(err)
        var js = res.text
        new Function(js)
        assert(!~js.indexOf('Promise'))
        done()
      })
    })

    it('should include promises with Chrome 27', function (done) {
      request(server)
      .get('/polyfill.js')
      .set('User-Agent', chrome27)
      .expect('Content-Type', /application\/javascript/)
      .expect(200, function (err, res) {
        assert.ifError(err)
        var js = res.text
        new Function(js)
        assert(~js.indexOf('Promise'))
        done()
      })
    })

    it('should not include promises w/ Chrome 27 and include!=promise', function (done) {
      request(server)
      .get('/polyfill.js+domels')
      .set('User-Agent', chrome27)
      .expect('Content-Type', /application\/javascript/)
      .expect(200, function (err, res) {
        assert.ifError(err)
        var js = res.text
        new Function(js)
        assert(!~js.indexOf('Promise'))
        done()
      })
    })

    it('should not include promises w/ Chrome 27 and exclude=promise', function (done) {
      request(server)
      .get('/polyfill.js-promise')
      .set('User-Agent', chrome27)
      .expect('Content-Type', /application\/javascript/)
      .expect(200, function (err, res) {
        assert.ifError(err)
        var js = res.text
        new Function(js)
        assert(!~js.indexOf('Promise'))
        done()
      })
    })

    it('should support , and ; delimited options', function (done) {
      request(server)
      .get('/polyfill.js+promise,domelements,dom4,raf')
      .expect(200, function (err, res) {
        assert.ifError(err)
        var js = res.text
        new Function(js)
        assert(~js.indexOf('Promise'))
        assert(~js.indexOf('Element.prototype.query'))
        assert(~js.indexOf('requestAnimationFrame'))
        assert(!~js.indexOf('EventSource'))
        done()
      })
    })
  })
})
