/*global define */
define([], function () {
  'use strict';

  // the typewriter container
  var typewriter = document.querySelector('.typewriter');

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
    'parenthetical' : 'sceneheading',
    'transition' : 'sceneheading',
    'action':'character',
    'shot': 'action',
    'text':'sceneheading'
  };

  function getCurrentSelectionElement() {
    return document.getSelection().anchorNode.parentNode
  }

  typewriter.addEventListener('keydown', tabHandler);


  function tabHandler(e) {

    // console.log(e.keyCode, e)

    // save 30 seconds after we stop typing
    // i.e. set a timeout for saving 2 seconds
    // after we stop typing, but clear it otherwise
    if (window.saveTimeout) clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(saveScript, 2000);


    // handle the tab
    if (e.keyCode == 9) {
      e.preventDefault();
      return cycleType(e);
    }
    
    // add a new part on enter
    if ((e.keyCode == 13) && (!e.shiftKey)) {
      e.preventDefault();
      var s = document.getSelection();
      var endofline = s.extentOffset == s.anchorNode.length;
      if (endofline) {
        return addPart(e);
      } else {
        s.modify('move', 'forward', 'line')
      }

    }
    
    // delete if it's empty
    if (e.keyCode == 8) {
      var ce = getCurrentSelectionElement();
      // we reached the end of the current node
      // so it places us on the div, altough we havent
      // removed the "P" yet
      if (ce === typewriter) {
        e.preventDefault();
        deletePart(e);
      }
    }

    // save the script if we press cmd + s 
    // if (e.keyCode == )


  }

  // adds a new part to the script
  function addPart(e) {
    // add a new para with right class type
    var newPart = document.createElement('p');
    // we need to add this space otherwise we can't focus onto it
    newPart.innerHTML = '&nbsp;';
    // this assumes the p only has one class
    var currentNode = getCurrentSelectionElement()
    var currentType = currentNode.className;
    // give it the most useful next part
    newPart.classList.add(nextParts[currentType]);
    // add it to the paper
    typewriter.appendChild(newPart);
    // move the selection to it
    moveSelectionTo(newPart);
  }

  // delete the part {
  function deletePart(e) {
    // the anchor node is the current P
    var currentNode = window.getSelection().anchorNode;
    // get the previous guy
    
    //debugger;
    var ps = currentNode.previousSibling;
    if (ps === null) return;
    // check that we have a 'P' before otherwise don't remove
    // we got to the 'P'
    if (ps.tagName == 'P') {
      // so delete the original node
      currentNode.remove();
      // and send us to the previous sibling
      moveSelectionToEnd(ps);
    } else {
      ps.remove();
      deletePart(e);
    }
  }

  // cycle through the types
  function cycleType(event) {
    var i, partType, newPartType;
    // go over the types
    var part = getCurrentSelectionElement();

    for (i = 0; i < scriptParts.length; i++) {
      partType = scriptParts[i];
      // if this is the type
      if (part.classList.contains(partType)) {
        // remove the part type
        part.classList.remove(partType);
        // and make it the next one in the list;
        if (event.shiftKey) {
          newPartType = scriptParts[(i - 1) >= 0 ? i - 1 : scriptParts.length-1 ]
        } else {
          newPartType = scriptParts[(i + 1) % scriptParts.length];
        }
        // we have to notify somehow the user that this is the 
        // new part type
        console.log(newPartType)
        // and get out of the loop
        return part.classList.add(newPartType);
      }      
    }
    
  }

  // moves the selection to an element and selects the whole thing
  function moveSelectionTo(element) {
    // move the pointer to it
    var range = document.createRange(); //Create a range (a range is a like the selection but invisible)
    range.selectNode(element);
    var selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);//make the range you have just created the visible selection
  }

  // moves the selection to the end of a node
  function moveSelectionToEnd(element) {
    // move the pointer to it
    var range = document.createRange(); //Create a range (a range is a like the selection but invisible)
    range.selectNode(element);
    range.collapse();
    var selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);//make the range you have just created the visible selection
  }

  function saveScript() {
    var parts = typewriter.querySelectorAll('p');
    var i, partNode, part;

    var script = {
      parts : [],
      characters: {}
    };
    
    for (i = 0; i < parts.length; i++) {
      partNode = parts[i];
      part = {
        type : partNode.className,
        text : partNode.innerHTML
      }
      script.parts.push(part)
    }

    // store on local storage
    if (Modernizr.localstorage) {
      localStorage["cinemator.script"] = JSON.stringify(script);
    } else {
      console.log("there is no localstorage, couldn't save");
    }
    

    console.log('saved!')
    return script;

  }

  function loadScript() {
    var script;
    if (Modernizr.localstorage) {
      script = JSON.parse(localStorage["cinemator.script"]);
    }
    
    if (!script.hasOwnProperty('parts')) {
      return;
    }

    // clear contents
    typewriter.innerHTML = '';

    var i, partNode, part;
    for (i = 0; i < script.parts.length; i++) {
      part = script.parts[i];
      partNode = document.createElement('p');
      partNode.innerHTML = part.text;
      partNode.classList.add(part.type);
      typewriter.appendChild(partNode);
    }

    return script;

  }

  window.saveScript = saveScript;
  window.loadScript = loadScript;


  // listen to close and save the script
  window.addEventListener('unload', saveScript);

  // load and see if we have something in localStorage
  return loadScript();

});