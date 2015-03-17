'use strict';
module.exports = function() {
    this.get = function() {
        browser.get('/#');
    };
    this.title = function() {
        return browser.getTitle();
    };
};