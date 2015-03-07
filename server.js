﻿console.log('Starting without debugger');
var app = require('./app');
console.log('loaded ../server');

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
console.log('port set');
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
