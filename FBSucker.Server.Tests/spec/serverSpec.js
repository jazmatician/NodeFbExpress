'use strict';

describe('Server', function() {
    var module, appWasInitialized, expressMock, appMock, routerMock,
        serveStaticMock, staticContentPath, middlewareFunction;
    var modulePath = '../../NodeFbExpress/server.js';
    var mockery = require('mockery');
    
    
    beforeEach(function() {
        appMock = jasmine.createSpyObj('app', ['set', 'use', 'listen','static','get']);
        routerMock = jasmine.createSpyObj('router', ['get', 'post']);
        expressMock = function() {
            appWasInitialized = true;
            return appMock;
        };
        middlewareFunction = function() {};
        serveStaticMock = function(path) {
            staticContentPath = path;
            return middlewareFunction;
        };
        routerMock = jasmine.createSpyObj('router', ['get', 'post']);
        expressMock.Router = function() { return jasmine.createSpyObj('router', ['get', 'post']); };
        expressMock.static = function() { return serveStaticMock; };
    
        mockery.enable({ useCleanCache: true , warnOnUnregistered: false });
        mockery.registerMock('express', expressMock);
        
        mockery.registerAllowable(modulePath);
    });

    function assumeModuleIsLoaded() {
        module = require(modulePath);
    }

    afterEach(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    it('Should be defined', function () {
        assumeModuleIsLoaded();
        expect(module).toBeDefined();
    });
    it('Should initialize express application', function () {
        assumeModuleIsLoaded();
        expect(appWasInitialized).toBeDefined();
        expect(appWasInitialized).toBeTruthy();
    });

    //it('Should default to running application on port 3000', function () {
    //    assumeModuleIsLoaded();
    //    expect(appMock.set).toHaveBeenCalledWith('port', 3000);
    //});

    //it('Should use lower case environment variable for port if set', function () {
    //    process.env.PORT = 1337;
    //    assumeModuleIsLoaded();
    //    expect(appMock.set).toHaveBeenCalledWith('port', process.env.PORT);
    //});

    //it('Should start the application listening for requests', function() {
    //    process.env.PORT = 1337;
    //    assumeModuleIsLoaded();
    //    expect(appMock.listen).toHaveBeenCalledWith(jasmine.any(Function));
    //});
    //it('Should log to console when server startup completes', function() {
    //    process.env.PORT = 1337;
    //    spyOn(console, 'log');
    //    assumeModuleIsLoaded();
    //    appMock.listen.calls[0].args[0]();
    //    expect(console.log).toHaveBeenCalledWith('Express server listening on port 1337');
    //});
});