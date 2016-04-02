var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner, _);

var app = express();

app.use('/api/v1', require('./api')(wagner));

app.listen(3000);
console.log('Listening on port 3000!');
