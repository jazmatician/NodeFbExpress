var express = require('express');
var router = express.Router();
var graph = require('facebook-complete');
var _ = require('underscore');
var fs = require('fs');

var mongo = require('mongodb');
var monk = require('monk');
var db_name = 'fbgroups';
//provide a sensible default for local development
mongodb_connection_string = 'mongodb://localhost:27017/' + db_name;
//take advantage of openshift env vars when available:
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + db_name;
}
var db = monk(mongodb_connection_string);

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

/*
 * Configuration looks like the following:
 * 
 * {"client_id":"YOUR_APP_ID",
 * "client_secret":"YOURSECRETHERE",
 * "scope":"email, user_about_me, user_birthday, user_location, publish_stream",
 * "redirect_uri":"http://localhost:1337/fb/auth"}
 * 
 * Since this is using JSON.parse, your best bet is to uncomment the two lines 
 * below the first time you run the app. God help me if I can type out by hand 
 * a JSON string that will pass the parser.
 *
 */

//var c = { "client_id": "YOUR_APP_ID","client_secret":"YOURSECRETHERE", "scope": "email, user_about_me, user_birthday, user_location, publish_stream", "redirect_uri": "http://localhost:1337/fb/auth" };
//fs.writeFileSync('./config.json', JSON.stringify(c));
var configfile = process.env.OPENSHIFT_DATA_DIR || './';
configfile += 'config.json';
console.log('reading config');
var data = fs.readFileSync(configfile, 'utf8'), conf;

try {
    conf = JSON.parse(data);
    var host = 'http://' + (process.env.OPENSHIFT_APP_DNS || "localhost");
    host += ":" + (process.env.OPENSHIFT_NODEJS_PORT || '8080') + "/fb/auth";
    console.log('redirect URI set to ' + host);
    conf.redirect_uri = host;
}
  catch (err) {
    console.log('There has been an error parsing your JSON.');
    console.log(err);
}
router.get('/config', function (req, res) {
    res.render('fbConfig', {
        config: conf
    });
});

router.post('/config', function (req, res) {
    fs.writeFileSync(configfile, JSON.stringify(_.omit(req.body, '__proto__')));
});

router.get('/auth', function (req, res) {
    
    if (!conf.client_id) {
    
    }
    
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
        if (!err) {
            req.fbRes = facebookRes;
            res.redirect('/fb/loginSuccess');
        }
    });
});

router.get('/loginSuccess', function(req, res) {
    res.redirect('groupList');
});
router.get('/groupList', function(req,res){
    graph.get("/me?fields=id,name,groups{administrator,bookmark_order,id,name}", function (err, fres) {
        fres.adminGroups = _.chain(fres.groups.data)
            .filter(function (group) { return group.administrator === true; })
            .sortBy("bookmark_order")
            .value();
        fres.allGroups = _.sortBy(fres.groups.data, "bookmark_order");
        fres.groups = null;
        res.render("fbGroups", {
            "fbData": fres
        });
        
    });
});

router.get('/group/:gid', function (req, res) {
    var groupId = req.params.gid || req.query.gid;
    if (_.isEmpty(_.omit(req.query, "__proto"))) {
        graph.get('/' + groupId,
            function(err, fresp) {
                res.render('fbGroupData', fresp);
            });
    } 
});
module.exports = router;