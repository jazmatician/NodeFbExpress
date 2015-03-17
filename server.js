
var express = require('express')
  , graph = require('facebook-complete')
  , app = module.exports = express.createServer()
    , http = require('http');

// this should really be in a config file!
var conf = {
    client_id: '1422825314618727'
    , client_secret: 'bc10b3a649bd1fa59288a9eeb3c11d6a'
    , scope: 'email, user_about_me, user_birthday, user_location, publish_stream'
    , redirect_uri: 'http://localhost:3000/auth/facebook'
};

// Configuration
var __dirname = '';
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});

// Routes

app.get('/', function (req, res) {
    res.render("index", { title: "click link to connect" });
});

app.get('/auth/facebook', function (req, res) {
    
    // we don't have a code yet
    // so we'll redirect to the oauth dialog
    if (!req.query.code) {
        var authUrl = graph.getOauthUrl({
            "client_id": conf.client_id
            , "redirect_uri": conf.redirect_uri
            , "scope": conf.scope
        });
        
        if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
            res.redirect(authUrl);
        } else {  //req.query.error == 'access_denied'
            res.send('access denied');
        }
        return;
    }
    
    // code is set
    // we'll send that and get the access token
    graph.authorize({
        "client_id": conf.client_id
        , "redirect_uri": conf.redirect_uri
        , "client_secret": conf.client_secret
        , "code": req.query.code
    }, function (err, facebookRes) {
        res.redirect('/UserHasLoggedIn');
    });


});


// user gets sent here after being authorized
app.get('/UserHasLoggedIn', function (req, res) {
    res.render("index", { title: "Logged In" });
});


var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Express server listening on port %d", port);
});
