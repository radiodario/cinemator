define(['jquery', 'backbone', 'templates', 'backfire'], function ($, Backbone, JST) {

  var Script = {};

  // the types of things that we can edit
  // order them somehow based on popularity
  var scriptParts = [
    'sceneheading',
    'action',
    'character',
    'dialog',
    'parenthetical',
    'transition',
    'shot',
    'text'
    ];

  // what's the preferred next part when adding a new one
  var nextParts = {
    'sceneheading' : 'action',
    'character' : 'dialog',
    'dialog' : 'character',
    'parenthetical' : 'dialog',
    'transition' : 'sceneheading',
    'action':'character',
    'shot': 'action',
    'text':'sceneheading'
  };

  // The model
  Script.model = Backbone.Model.extend({
    defaults : {
      title: 'My Script',
      parts: [{
        type : 'sceneheading',
        text : 'fade from black'
      }],
      characters: {}
    },
    // firebase: "https://cinemator.firebaseio.com/scripts",
    
    initialize : function() {
      this.on('change', this.notify, this);
    },

    notify : function() {
      Backbone.trigger('notification', 'Saved!')
    }

  });

  // The collection
  Script.collection = Backbone.Firebase.Collection.extend({
    model: Script.model,
    // url: '/api/scripts',
    firebase: "https://cinemator.firebaseio.com/scripts"  
    // localStorage: new Backbone.LocalStorage('cinemator')
  })


  Script.views = {};

  Script.views.Typewriter = Backbone.View.extend({
    template: JST['app/scripts/templates/script.ejs'],
    el: 'div.typewriter',

    initialize: function() {
      this.model.on('change', this.render, this)
    },

    render : function() {
      var script = this.model.toJSON();
      var html = this.template({script: script});
      this.$el.html(html);
      this.moveSelectionToEnd(this.$('p').last().get(0));
    },

    events : {
      'keydown' : 'handleKeyboard'
    },

    // loads the user's markup and turns it into data
    // to feed the model. I don't know if this should
    // be done inside the model, or in a more clever 
    // way but so far it should work fine
    saveScript : function() {
      // let's use Javascript rather than fucking jquery
      // for speed ok?
      var partNodes = this.el.querySelectorAll('p');

      // setup some vars
      var i, partNode, part;

      // this will be the data temporarily
      var data = {
        // this keeps the parts
        parts : [],
        // we keep counts of the characters
        characters : {},
      }

      // we use the fastest for loop there is for
      // performance. We'll be doing this quite a
      // lot. 
      // In the future we might want to get starter about
      // how we load these, maybe keep a better
      // data representation.
      for (i = 0; i < partNodes.length; i++) {
        partNode = partNodes[i];
        // we can probably get rid of this?
        part = {
          type : partNode.className,
          text : partNode.innerHTML
        }

        data.parts.push(part);

        // keep counts on character usage, which we'll
        // use to suggest things
        if ((part.type === 'character') && (part.text !== '&nbsp;')) {
          var cname = part.text.toLowerCase();
          if (data.characters.hasOwnProperty(cname)) {
            data.characters[cname]++;
          } else {
            data.characters[cname] = 1;
          }
        }


      }

      // set the model
      this.model.set(data);

      // save the model
      // this.model.save()

      Backbone.trigger('savedModel', this.model.id);

    },

    // Keyboard Handling
    // ===================================================
    // handle keyboard input proxy. We might want to
    // make this more elegant to handle different 
    // keyboards, etc.
    handleKeyboard: function(e) {

      clearTimeout(this.timeout);
      
      switch (e.keyCode) {
        case 9:
          this.handleTab(e);
          break;
        case 13:
          this.handleEnter(e);
          break;
        case 8:
          this.handleDelete(e);
          break;
        default:
          this.checkCharacter(e);
          break;
      }
      
      this.timeout = setTimeout(this.saveScript.bind(this), 1500);

    },

    // handle Tab Key
    handleTab: function(e) {
      // stop default things
      e.preventDefault();
      this.cycleType(e);
    },

    // handle Enter Key
    handleEnter: function(e) {
      // escape quickly if we have the
      // shiftKey pressed
      if (e.shiftKey) 
        return;

      if (this.candidate) {
        var cs = this.getCurrentSelectionElement();
        cs.innerHTML = this.candidate;
      }
      
      // prevent the default otherwise
      e.preventDefault();

      // capture the selection
      var s = window.getSelection();
      // and look to see if we're at the end of the 
      // selection 
      var atEOL = s.anchorOffset == s.anchorNode.length;

      if (atEOL) {
        return this.addPart(e);
      }

      // otherwise go to the end of the line
      return s.modify('move', 'forward', 'line')

    },

    // handle Delete Key
    handleDelete: function(e) {
      // get our current selected element, i.e where
      // the keyboard has the focus
      var s = window.getSelection();
      
      // check if we have reached the end of the current
      // 'p' node, where the editor places us on 'div'
      if (s.anchorOffset === 0) {
        e.preventDefault();
        this.deletePart(e);
      }

    },

    // Data Handling
    // ===================================================
    // Should we make these operations keep the model
    // updated in real time, or wait to convert things?
    // I think we should probably do it as we go, keeping
    // the model updated, so that we don't have to do long
    // expesive saving operations when the scripts grow 
    // massively?

    // these should probably be proxies to the 
    // cycle through the types of a part 
    cycleType: function(e) {
      var i, partType, newPartType;
      var part = this.getCurrentSelectionElement();

      for (i = 0; i < scriptParts.length; i++) {
        partType = scriptParts[i];
        // if this is the type
        if (part.classList.contains(partType)) {
          // remove the part type
          part.classList.remove(partType);
          // and make it the next one in the list;
          if (e.shiftKey) {
            // backwards if we have shift key on
            newPartType = scriptParts[(i - 1) >= 0 ? i - 1 : scriptParts.length-1 ]
          } else {
            // or forwards
            newPartType = scriptParts[(i + 1) % scriptParts.length];
          }
          
          part.classList.add(newPartType);
          // we have to notify somehow the user that this is the 
          // new part type
          // and get out of the loop
          var p = this.$(part);

          var pos = p.offset();
          pos.top += p.height();

          if (newPartType === 'transition')
            pos.left = pos.left + (p.width() - 150)

          var notification = {
            text : newPartType,
            pos : pos
          }

          return Backbone.trigger('notification', notification);
        }      
      }


    },

    // add a new part to the script
    addPart: function(e) {
      // add a new para with right class type
      var newPart = document.createElement('p');
      // we need to add this space otherwise we can't focus onto it
      newPart.innerHTML = '&nbsp;'
      
      // this assumes the p only has one class
      var currentNode = this.getCurrentSelectionElement();
      var currentType = currentNode.className;
      var newPartType = nextParts[currentType];

      // remove any br's from the end
      // that firefox might have decided to add
      currentNode.innerHTML = currentNode.innerHTML.replace(/<br>$/, '');
      
      // give it the most useful next part
      newPart.classList.add(newPartType);
      // add it to the paper after the current element
      // even if it's null;
      this.el.insertBefore(newPart, currentNode.nextSibling);
      // move the selection to it
      this.moveSelectionTo(newPart);

      var p = this.$(newPart);
      var pos = p.offset();
      pos.top += p.height();

      if (newPartType === 'transition')
        pos.left = pos.left + (p.width() - 150)

      var notification = {
        text : newPartType,
        pos : pos
      }

      return Backbone.trigger('notification', notification);

    },

    // delete a part from the script
    // this will happen when there's nothing left on the
    // node so currentSelection is 
    deletePart: function(e) {
      // the anchor node is the current P
      var currentNode = window.getSelection().anchorNode;
      // get the previous guy
      var ps = currentNode.previousSibling;
      if (ps === null) return;
      // check that we have a 'P' before otherwise don't remove
      // we got to the 'P'
      while (ps.tagName !== 'P') {
        ps.remove();
        ps = currentNode.previousSibling;
        // if there's no more previous siblings, stay.
        if (ps === null) return;
      }

      
      // so delete the original node
      currentNode.remove();
      // and send us to the previous sibling
      this.moveSelectionToEnd(ps);
      
    },

    // checks if it is a character
    checkCharacter: function(e) {
      var cs = this.getCurrentSelectionElement();
      this.candidate = false;
      if (!cs.classList.contains('character')) {
        return
      } else {
        var typed = cs.innerHTML;
        var characters = this.model.get('characters');
        for (var character in characters) {
          if (character.indexOf(typed.toLowerCase()) == 0) {
            // we have to notify somehow the user that this is the 
            // new part type
            // and get out of the loop
            var p = this.$(cs);

            var pos = p.offset();
            pos.top += p.height();

            var notification = {
              text : character,
              pos : pos
            }

            this.candidate = character;

            return Backbone.trigger('notification', notification)
          }
        }
        this.candidate.false;
      }
    },

    // element selection node
    // this might change if we use subviews?
    getCurrentSelectionElement: function() {
      return window.getSelection().anchorNode.parentNode
    },

      // moves the selection to an element and selects the whole thing
    moveSelectionTo: function (element) {
      // move the pointer to it
      var range = document.createRange(); //Create a range (a range is a like the selection but invisible)
      range.selectNodeContents(element);
      var selection = window.getSelection();//get the selection object (allows you to change selection)
      selection.removeAllRanges();//remove any selections already made
      selection.addRange(range);//make the range you have just created the visible selection
    },

    // moves the selection to the end of a node
    moveSelectionToEnd: function (element) {
      // move the pointer to it
      var range = document.createRange(); //Create a range (a range is a like the selection but invisible)
      range.selectNodeContents(element);
      range.collapse();
      var selection = window.getSelection();//get the selection object (allows you to change selection)
      selection.removeAllRanges();//remove any selections already made
      selection.addRange(range);//make the range you have just created the visible selection
    }

  });

  Script.views.ScriptLoader = Backbone.View.extend({
    template: JST['app/scripts/templates/scriptLoader.ejs'],
    el: 'div.scriptLoader',

    events: {
      'click .close' : 'closeLoader',
      'click .load' : 'show',
      'click .new' : 'makeNew',
      'click li' : 'loadScript',
      'click .delete' : 'areyousure',
      'mouseout .delete.yes' : 'notsure',
      'click .delete.yes' : 'delete'
     },

    initialize: function() {
      this.collection.on('sync', this.render, this);
    },

    render: function() {
      this.$el.html(this.template({scripts : this.collection.toJSON()}))
      if (!this.$el.hasClass('open')) {
        var loadHeight = this.$('a.load').height();
        this.$el.css({'top' : -this.$el.height() + (loadHeight*2)})
      }
    },

    show: function() {
      this.$el
        .css({'top' : -this.$el.height() + this.$('a.load').height()})
        .animate({'top': 0})
        .addClass('open')
      document.body.classList.add('modal-open');
    },

    makeNew: function() {
      Backbone.history.navigate('new', true);
    },

    closeLoader : function() {
      document.body.classList.remove('modal-open');
      var loadHeight = this.$('a.load').height();
      this.$el.removeClass('open').animate({'top': -this.$el.height() + (loadHeight*2) })
    },

    loadScript : function(e) {
      if (e.currentTarget === e.target) {
        Backbone.history.navigate('#script/' + e.target.id, true);
        this.closeLoader();
      }
    },

    areyousure : function(e) {
      e.preventDefault();
      e.currentTarget.innerHTML = 'sure?'
      e.currentTarget.classList.add('yes');
    },

    notsure : function(e) {
      e.currentTarget.innerHTML = '×';
      e.currentTarget.classList.remove('yes');
    },

    delete : function(e) {
      e.preventDefault();
      var modelId = e.currentTarget.parentNode.id;
      var toremove = this.collection.findWhere({id : modelId});

      this.$(e.target.parentNode).fadeOut(200, function() {
        $(this).remove();
        if (toremove) {
          toremove.destroy();
        }
      });
  
    }


  });



  return Script;
});