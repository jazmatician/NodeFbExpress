var express = require('express');
var router = express.Router();
var moment = require('moment');
var fbr = require('../modules/fbretrieve');
var Q = require('q');

router.get('/usersOverTime', function (req, res) {
    var groupId = req.query.gid;
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var query = '/' + groupId + '/feed?fields=id,from,likes.summary(true)';
    if (!!startDate) query += '&since=' + startDate;
    if (!!endDate) query += '&until=' + endDate;
    query += '&limit=100';
    
    var postsC = db.get('posts');
    var sDate = new Date(startDate);
    var beforeStart = function (item) {
        var itemDate = new Date(item.updated_time);
        return itemDate < sDate;
    };
    var completed = false;
    var processResult = function (err, fresp) {
        
        if (!!fresp && !err) {
            var cleaned = _.chain(fresp.data)
                .map(function (post) {
                post._id = post.id;
                post.like_count = !post.likes ? 0 : post.likes.summary.total_count;
                return _.omit(post, ['id', 'likes']);
            })
                .reject(beforeStart)
                .value();
            postsC.insert(cleaned);
            // last call was 0 length, is this also?
            if (completed) completed = !cleaned.length;
            if (!completed && !!fresp.paging && !!fresp.paging.next) {
                completed = !cleaned.length; // will do one more call
                graph.get(fresp.paging.next, processResult);
            }
        }
    };
    graph.get(query, 
        _.wrap(processResult, function (proc, err, fbr) {
        proc(err, fbr);
        
        // TODO: Make this return method wait until completed somehow
        postsC.find({ updated_time: { $gt: startDate, $lt: endDate } }, {}, function (e, docs) {
            var result = _.map(
                _.groupBy(docs, function (x) { return moment(x.updated_time).format('YYYY-DD-MM'); })
            
                , function (val, tag) {
                    _.map(_.groupBy(val, function (x) { return x.from.name; }), function (content, name) {
                        var partial = {
                            'date': tag,
                            'posts': val.length,
                            'likes': _.reduce(val, function (m, l) { return m + l.like_count; }, 0)
                        };
                    });
                    partial.ratio = partial.likes / partial.posts;
                    return partial;
                });
            var resAsObject = _.map(result, function (val) { return [val.author, val.posts, val.likes, val.ratio]; });
            res.send(resAsObject);
        });

    })
    );
});
router.get('/posts', function(req, res) {
    var groupId = req.query.gid;
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var dbResult = Q.defer();
    var result = fbr.posts(groupId, startDate, endDate, dbResult);
    result.then(function(d) {
         res.send(d);
    });
});
module.exports = router;