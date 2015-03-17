'use strict';

var HomePage = require('../automation/HomePage.js');

describe('Application', function () {
    it('should have correct title', function() {
        var homePage = new HomePage();
        homePage.get();
        expect(homePage.title()).toEqual('FB Groups');
    });
})