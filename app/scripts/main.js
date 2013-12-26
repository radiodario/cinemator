require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery'
    },
    shim: {
        
    }
});

require(['app', 'jquery'], function (app, $) {
    'use strict';
    // use app here
    window.script = app;
});
