var fallback = require('express-history-api-fallback');
var express = require('express');
var path =  require('path');
var app = express()
app.use(express.static(__dirname));
app.use(express.static(path.resolve(__dirname, '../../')));
app.use(fallback('./index.html', { root: __dirname }));
app.listen(3000, () => console.log('Example app listening on port 3000!'));