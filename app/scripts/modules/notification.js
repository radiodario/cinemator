define(['jquery', 'backbone'], function ($, Backbone) {

  var Notifications = Backbone.View.extend({
    el : 'div.notifications',
    initialize : function(options) {
      Backbone.on('notification', this.notify, this)
    },

    notify : function(message) {
      // stop all animations
      this.$el.stop(true, true)
      var pos = { 
        position: 'fixed',
        top: 10, 
        left: window.innerWidth/2 - this.$el.width()/2
      };
      if (typeof message === "string") {
        this.$el
          .html(message)
        
      }

      if (message.hasOwnProperty('pos')) {
        this.$el.html(message.text)
        pos = message.pos;
        pos.position ='absolute';
      }

      this.$el.css(pos).show().fadeOut(1500);

    }

  })

  return Notifications;

})