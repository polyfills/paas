
var app = module.exports = require('./app')

if (!module.parent) app.listen(process.env.PORT)
