(function() {
    var app = angular.module('group', []);

    app.controller('FormController', ['$http', function($http) {
        var posts = this;
        posts.strLbl = "Start Date";
        posts.endLbl = "End Date";
        posts.results = '';
        // ReSharper disable UseOfImplicitGlobalInFunctionScope
        posts.startDate = moment().subtract(2, 'days').format('YYYY-MM-DD');
        posts.endDate = moment().format('YYYY-MM-DD');
        // ReSharper restore UseOfImplicitGlobalInFunctionScope


        posts.getData = function() {
            var query = "/api/posts?gid=" + posts.gid;
            query += (!!posts.startDate) ? '&startDate=' + posts.startDate : '';
            query += (!!posts.endDate) ? '&endDate=' + posts.endDate : '';
            $http.get(query).success(function(data, status) {
                debugger;
                posts.results = data;

                    var dt = new google.visualization.DataTable();
                    dt.addColumn('string', 'Author');
                    dt.addColumn('number', 'Posts');
                    dt.addColumn('number', 'Likes');
                dt.addRows(data);
                var options = {
                    title: 'Post Count and popularity by Author'
                    };
                debugger;
                var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
                chart.draw(dt, options);
            });
        };
    }]);

    //app.controller("GenericChartCtrl", function ($scope, $routeParams) {
    //    $scope.chartObject = {};

    //    $scope.onions = [
    //        { v: "Onions" },
    //        { v: 3 },
    //    ];

    //    $scope.chartObject.data = {
    //        "cols": [
    //            { id: "t", label: "Topping", type: "string" },
    //            { id: "s", label: "Slices", type: "number" }
    //        ], "rows": [
    //            {
    //                c: [
    //                    { v: "Mushrooms" },
    //                    { v: 3 },
    //                ]
    //            },
    //            { c: $scope.onions },
    //            {
    //                c: [
    //                    { v: "Olives" },
    //                    { v: 31 }
    //                ]
    //            },
    //            {
    //                c: [
    //                    { v: "Zucchini" },
    //                    { v: 1 },
    //                ]
    //            },
    //            {
    //                c: [
    //                    { v: "Pepperoni" },
    //                    { v: 2 },
    //                ]
    //            }
    //        ]
    //    };

    //    // $routeParams.chartType == BarChart or PieChart or ColumnChart...
    //    $scope.chartObject.type = $routeParams.chartType;
    //    $scope.chartObject.options = {
    //        'title': 'How Much Pizza I Ate Last Night'
    //    };
    //});
})();