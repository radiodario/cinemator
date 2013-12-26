/*global define */
define([], function () {
  'use strict';

  // the typewritter container
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

  // add event handler for all parts when we begin
  /* function setupParts() {
    var parts = typewriter.querySelectorAll('p');
    var i;
    for (i = 0; i < parts.length; i++) {
      setupPart(parts[i]);
    }
  } */

  //setupParts();



  function setupPart(part) {
    part.addEventListener('keydown', tabHandler);
    part.contentEditable=true;
    part.hidefocus=true;
  }

  function getCurrentElement() {
     console.log(document.getSelection().anchorNode.parentNode.tagName);
    return document.getSelection().anchorNode.parentNode
  }

  typewriter.addEventListener('keydown', tabHandler);


  function tabHandler(e) {

    
    // handle the tab
    if (e.keyCode == 9) {
      e.preventDefault();
      return cycleType(e);
    }
    
    // add a new part on enter
    if ((e.keyCode == 13) && (!e.shiftKey)) {
      
      var s = document.getSelection();
      console.log(s, s.extentOffset, s.anchorNode.length)
      var endofline = s.extentOffset == s.anchorNode.length;
      if (endofline) {
        e.preventDefault();
        return addPart(e);
      }
    }
    
    // delete if it's empty
    if (e.keyCode == 8) {
      if (e.target.innerHTML === '') {
        deletePart(e);
      }
    } 
  }

  // adds a new part to the script
  function addPart(e) {
    console.log("adding a new type");
    // add a new para with right class type
    var newPart = document.createElement('p');
    // this assumes the p only has one class
    var currentType = e.target.className;
    // give it the most useful next part
    newPart.classList.add(nextParts[currentType]);
    // add it to the paper
    typewriter.appendChild(newPart);
    setupPart(newPart);
    newPart.focus();
  }

  // delete the part {
  function deletePart(e) {
    var ps = e.target.previousSibling;
    if (ps === null) return;
    // check that we have a 'P' before otherwise don't remove
    if (ps.tagName == 'P') {
      ps.focus();
      e.target.remove();
    } else {
      ps.remove();
      deletePart(e);
    }
  }

  // cycle through the types
  function cycleType(event) {
    var i, partType, newPartType;
    // go over the types
    var part = getCurrentElement();
    for (i = 0; i < scriptParts.length; i++) {
      partType = scriptParts[i];
      // if this is the type
      if (part.classList.contains(partType)) {
        console.log(i, scriptParts[i]);
        // remove the part type
        part.classList.remove(partType);
        // and make it the next one in the list;
        // wrapping around
        // to do, wrap backwards
        newPartType = scriptParts[(i + 1) % scriptParts.length];
        return part.classList.add(newPartType);
        // and get out of the loop
      }      
    }
    

  }

});