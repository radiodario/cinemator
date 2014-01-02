require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        backbone: '../bower_components/backbone/backbone',
        backfire: '../bower_components/backfire/backbone-firebase',
        underscore: '../bower_components/underscore/underscore',
        firebase: '../bower_components/firebase/lib/firebase',
        localstorage : '../bower_components/backbone.localStorage/backbone.localStorage'
    },
    shim: {
        backbone : {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        backfire : {
            deps: ['firebase', 'backbone']
        }
    }
});

require(['app', 'jquery'], function (cinemator, $) {
    'use strict';
    
    // use app here
    cinemator.init();
    
});
