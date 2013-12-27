define(['jquery', 'backbone', 'modules/script'], function ($, Backbone, Script) {


  var Router = Backbone.Router.extend({
    
    initialize: function(options) {
      this.collection = options.collection;
    },

    routes : {
      '' : 'newScript',
      'script/:id' : 'loadScript'
    },

    newScript : function() {
      var script = new Script.model();
      this.collection.add(script);
      var view = new Script.views.Typewriter({model: script});
      view.render();
    },

    loadScript: function(id) {
      var script = this.collection.findWhere({id: id});
      var view = new Script.views.Typewriter({model: script});
      view.render();
    }

  });

  return Router;

});