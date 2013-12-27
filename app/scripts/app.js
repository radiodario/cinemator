/*global define */
define(['backbone', 'modules/script', 'router'], function (Backbone, Script, Router) {
  'use strict';

  var cinemator = {

    init: function() {

      this.scripts = new Script.collection();

      this.router = new Router({collection: this.scripts});

      this.scripts.fetch().done(function() {
        Backbone.history.start();
      });

      Backbone.on('savedModel', this.setUrl, this);

    }, 

    setUrl: function(id) {
      this.router.navigate('/script/' + id);
    } 

  };


  // listen to close and save the script
  // window.addEventListener('unload', saveScript);


  return cinemator;
  

});