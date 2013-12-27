'use strict';
// this is my server
var statik = require('statik');
var server = statik.createServer('.');
server.listen();
