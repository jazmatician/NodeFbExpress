(function() {
    var app = angular.module('group', ['ui.bootstrap']);

    app.controller('ConfigController', ['$http', function($http) {
        var config = this;
        config.client_id = "";
        config.client_secret = "";
        config.redirect_uri = "http://localhost:1337/fb/auth";
        config.scope = "email, user_about_me, user_birthday, user_location, publish_stream";
        config.saveConfig = function() {
            //TODO: write an api endpoint to persist this data.
            $http.post('/fb/config', config); //TODO: try it?
        };
    }]);

    app.controller('FormController', ['$http', function($http) {
        var posts = this;
        posts.opened = false;
        posts.strLbl = "Start Date";
        posts.endLbl = "End Date";
        posts.results = '';
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        posts.startDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
        posts.endDate = moment().format('YYYY-MM-DD');
        // ReSharper restore UseOfImplicitGlobalInFunctionScope


        // Disable weekend selection
        posts.disabled = function(date, mode) {
            return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
        };

        posts.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        posts.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            posts.opened = true;
        };

        posts.getData = function() {
                var query = "/api/posts?gid=" + posts.gid;
                var start = moment(posts.startDate);
                //var end = (!!posts.endDate) ? moment(posts.endDate) : start.add(1, 'month');
                var end = start.clone().add(1, 'month');
            query += (!!posts.startDate) ? '&startDate=' + start.format('YYYY-MM-DD') : '';
            query += (!!posts.endDate) ? '&endDate=' + end.format('YYYY-MM-DD') : '';
            $http.get(query).success(function(data, status) {
                debugger;
                posts.results = data;

                var dt = new google.visualization.DataTable();
                dt.addColumn('string', 'Author');
                dt.addColumn('number', 'Posts');
                dt.addColumn('number', 'Likes');
                dt.addColumn('number', 'Ratio');
                dt.addRows(data);
                var options = {
                    vAxes: {
                            0: { format: '#,###' },
                        1: { format: '#,###' },
                       2: { format: '#,###' }
                    },
                    hAxis: {title: "User"},
                                            seriesType: "bars",
                                            series: { 2: { type: "line" }
                },
                title: 'Post Count and popularity by Author'
            };
                debugger;
                var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
                chart.draw(dt, options);
            });
        };
    }]);
})();