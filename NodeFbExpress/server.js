console.log('Starting without debugger');
var app = require('./app');
console.log('loaded ../server');

app.set('ipaddress', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);
console.log('port set');
var server = app.listen(app.get('port'), app.get('ipaddress'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
