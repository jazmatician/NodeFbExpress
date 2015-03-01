var express = require('express');
var router = express.Router();
var graph     = require('facebook-complete');
/* GET home page. */

router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

//#region user management from walkthrough
router.get('/chart', function (req, res) {
    res.render('chart', { title: "Chrat Demo" });
});

//#region user management from walkthrough
router.get('/newuser', function (req, res) {
    res.render('newuser', { title: "Add New User" });
});

router.post('/adduser', function(req, res) {
    var db = req.db;
    var userName = req.body.username;
    var userEmail = req.body.useremail;
    var collection = db.get('usercollection');

    collection.insert({
            username: userName,
            email: userEmail
        }, function(err, doc) {
            if (err) res.send("there was a problem writing to the database");
            else {
                res.location("userlist");
                res.redirect("userlist");
            }
        }
    );
});

router.get('/userlist', function (req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({}, {}, function (e, docs) {
        res.render("userlist", {
            "userlist": docs
        });
    });
});
//#endregion
module.exports = router;