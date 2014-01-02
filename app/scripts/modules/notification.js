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
      } else {
        this.$el.html(message.text)
      }

      if (message.hasOwnProperty('pos')) {
        pos = message.pos;
        pos.position ='absolute';
      }

      message.delay = message.delay || 0

      this.$el.css(pos).show()
      // dont hide if delay is -1
      if (message.delay < 0) {

      } else {
        this.$el.delay(message.delay).fadeOut(1500);
      }


    },

    hide : function() {
      this.$el.fadeOut(1500);

    }

  })

  return Notifications;

})