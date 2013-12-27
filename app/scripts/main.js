require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        underscore: '../bower_components/underscore/underscore',
        localstorage : '../bower_components/backbone.localStorage/backbone.localStorage'
    },
    shim: {
        backbone : {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        }
    }
});

require(['app', 'jquery'], function (cinemator, $) {
    'use strict';
    
    // use app here
    cinemator.init();

});
