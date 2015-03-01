var express = require('express');
var router = express.Router();
var graph = require('facebook-complete');
var _ = require('underscore');


var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/fbStats');

router.get('/posts', function(req, res) {
    var groupId = req.query.gid;
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    var query = '/' + groupId + '/feed?fields=id,from,likes.summary(true)';
    if (!!startDate) query += '&since=' + startDate;
    if (!!endDate) query += '&until=' + endDate;
    query += '&limit=100';

    var postsC = db.get('posts');
    var sDate = new Date(startDate);
    var beforeStart = function(item) {
        var itemDate = new Date(item.updated_time);
        return itemDate < sDate;
    };
    var completed = false;
    var processResult = function(err, fresp) {

        if (!!fresp && !err) {
            var cleaned = _.chain(fresp.data)
                .map(function(post) {
                    post._id = post.id;
                    post.like_count = !post.likes ? 0 : post.likes.summary.total_count;
                    return _.omit(post, ['id', 'likes']);
                })
                .reject(beforeStart)
                .value();
            postsC.insert(cleaned);
            // last call was 0 length, is this also?
            if (completed) completed = !cleaned.length;
            if (!completed && !!fresp.paging && !!fresp.paging.next     ) {
                completed = !cleaned.length; // will do one more call
                graph.get(fresp.paging.next, processResult);
            }
        }
    };
    graph.get(query, //'/feed?fields=id,from,likes.summary(true),comments{id,from,like_count,comment_count}&since=' + startDate + '&until=' + endDate,
        _.wrap(processResult, function(proc, err, fbr) {
            proc(err, fbr);
           
            // TODO: Make this return method wait until completed somehow
        postsC.find({ updated_time: { $gt: startDate, $lt: endDate } }, {}, function (e, docs) {
            var result = _.map(
                _.groupBy(docs, function (x) { return x.from.name; })
                , function(val) {
                    return {
                        'author': val[0].from.name
                        , 'posts': val.length
                        , 'likes': 
                            _.reduce(val, function (m, l) { return m + l.like_count; }, 0)
                    };
                });
            var resAsObject = _.map(result, function(val) { return [val.author, val.posts, val.likes]; });
                res.send(resAsObject);
            });

        })
    );
});
module.exports = router;