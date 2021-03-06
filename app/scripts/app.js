/*global define */
define(['backbone', 'modules/script', 'modules/notification', 'router'], function (Backbone, Script, Notification, Router) {
  'use strict';

  var cinemator = {

    init: function() {

      this.scripts = new Script.collection();

      this.router = new Router({collection: this.scripts});

      this.notification = new Notification();
      this.scriptLoader = new Script.views.ScriptLoader({collection: this.scripts});

      Backbone.trigger('notification', { text:'loading...', delay: -1});


      this.scripts.on('sync', function() {
        
        Backbone.history.start();
      });

      this.scripts.fetch()
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