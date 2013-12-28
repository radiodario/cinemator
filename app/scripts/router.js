define(['jquery', 'backbone', 'modules/script'], function ($, Backbone, Script) {


  var Router = Backbone.Router.extend({
    
    initialize: function(options) {
      this.collection = options.collection;
    },

    routes : {
      '' : 'welcome',
      'new' : 'newScript',
      'script/:id' : 'loadScript'
    },

    welcome : function() {

      // check if you've been here before
      if (!localStorage['cinemator.hereBefore']) {
        $('.welcome').fadeIn(200);
        $('body').addClass('modal-open');
        localStorage['cinemator.hereBefore'] = true;
      } else {
        // if you've been here before, go to a new one
        this.navigate('#new', true);
      }
    },

    newScript : function() {
      $('.welcome').fadeOut(500);
      $('body').removeClass('modal-open');
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