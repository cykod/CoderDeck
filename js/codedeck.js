

$(document).ready(function() {

  var JavaScriptMode = require("ace/mode/javascript").Mode;


 function focusCallback() {
   disableKeyboardEvents = true;
  }

  function blurCallback() {
    disableKeyboardEvents = false;
  }

  $(document).bind("slideenter",function(e) {
    var current = $(".current");
    current.find(".code > .editor").each(function() {
      if(!$(this).hasClass('codeEditor')) {
        var editor = ace.edit(this.id);
        $(this).addClass('codeEditor');
        editor.getSession().setMode(new JavaScriptMode());

        editor.on('focus', focusCallback);
        editor.on('blur', blurCallback);
      }
    });

  });

});

