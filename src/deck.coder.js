/*!
 Copyright (c) 2011 Cykod LLC
 Dual licensed under the MIT license and the GPL license
*/


/*
This module adds a code editor that shows up in individual slides
*/



(function($, deck, window, undefined) {
  var $d = $(document),
    $window = $(window),
    savedGistData = {};

  function unsanitize(str) {
   return addScript(str).replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }

  function addScript(str) {
   return str.replace(/SCRIPTEND/g,'</s' + 'cript>').replace(/SCRIPT/g,'<script>')
  }

  function runCode(element,template) {
    iframe = document.createElement("IFRAME"); 

    var dest = $(element).attr('data-target');
    var destination = $("#" + dest );
    iframe.style.width = (destination.parent().width()-2) + "px";
    iframe.style.height = (destination.parent().height()-2) + "px";
    iframe.style.overflow = 'auto';
    iframe.style.border ="none";

    $(destination).html("").append(iframe);


    var editor = $(element).data('editor');
    var code = editor.getValue();

    if($(element).attr('data-save')) {
      localStorage[$(element).attr('data-save')] = code;
    }

    var tmpl = $(template ? "#" + template : "#coderdeck-default").html();

    code = "<!DOCTYPE HTML>" + addScript(tmpl).replace(/CODE/,code);

    writeIFrame(iframe,code);
  }

  function writeIFrame(iframe,code) {
    iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
    iframe.document.open();
    iframe.document.write(code);
    iframe.document.close();
  }


  // Prepare a slide to give unique id to code editor, create run destinations
  // and match code editors with solutions and destinations
  function prepareSlide(idx,$el) {
    var slide = $($el);
    var $element =slide.find(".coder-editor"); 
    var solution = slide.find("script[type=coder-solution]")[0]
    var config = {
      isFull:     $element.hasClass("coder-editor-full"),
      isInstant:  $element.hasClass('coder-editor-instant'), 
      isSolution: !!solution,
      isSaving:   $element.attr('data-save'),
      language:   $element.attr('data-language')
    };

    slide.attr('data-slide-id', idx);

    var fullClass = config.isFull ? " coder-wrapper-full" : " coder-wrapper-split";

    slide.find(".coder-editor").attr({
      'id': 'editor-' + idx,
      'data-target' : 'destination-' + idx
    }).wrapAll("<div class='coder-wrapper" + fullClass + "'><div class='coder-editor-wrapper' id='wrapper-" + idx + "'></div></div>").css('position','static');

    $("<div class='coder-destination' id='destination-" + idx + "'></div>").insertAfter("#wrapper-"+idx);
    if(solution) {
      $(solution).attr({ 'id' : 'solution-' + idx });
      slide.find(".coder-editor").attr({ 'data-solution' : 'solution-' + idx });
    }

    $element.data("config", config);


    // If we're showing the current slide,
    // launch the editors/etc
    if($.deck('getSlide')[0] == $el[0]) {
      displayCodeSlide($el);
    }
  }

  function loadFromLocalStorage($element,config) {
    if(localStorage[$element.attr('data-save')]) {
      config.html = localStorage[$element.attr('data-save')];
    }
  }

  function setupCodeEditor(currentSlide,$container,$element,$destination,config) {
    var editorOptions = { 
      lineNumbers: true,
      onFocus: function() { editorFocused = true; },
      onBlur: function() { editorFocused = false; },
      mode: config.language || "htmlmixed"
    };

    if(config.isInstant) {
      $destination.show();
      var changeTimer = null;
      editorOptions['onChange'] =  function() { 
        clearTimeout(changeTimer);
        changeTimer = setTimeout(function() {
          runCode($element,$element.attr('data-coder-template'));
        }, 50);
      };

    }
    var editor = CodeMirror.fromTextArea($element[0], editorOptions );

    $element.data('editor',editor);
    $(editor.getScrollerElement()).height($(currentSlide).height() - $container.position().top - 80);
    $container.addClass('coderEditor');
    $destination.height($(currentSlide).height() - $container.position().top - 80);
    editor.setValue(config.html);
    return editor;
  }

  function createButtonWrapper($wrapper) {
    return $("<div class='coder-buttons'>").insertBefore($wrapper);

  }

  function createBackbutton($wrapper,callback) {
    return $("<button>Back</button>").appendTo($wrapper).click(callback).hide();
  }

  function createSolution($wrapper,callback) {
    return $("<button>Solution</button>").appendTo($wrapper).click(callback);
  }

  function createRunButton(config,$wrapper,callback) {
    var buttonName = config.isSaving ? "Run/Save" : "Run";
    return $("<button>" + buttonName + "</button>").appendTo($wrapper).click(callback);
  }

  function resizeEditors(currentSlide,$container) {
    var $element = $container.find('.coder-editor');
    var $destination = $("#" + $element.attr('data-target'));

    var editor = $element.data("editor");
    var height = $(currentSlide).height() - $container.position().top - 80;
    $(editor.getScrollerElement()).height(height);
    $destination.height(height);
  }

  function generateCodeSlide($container,currentSlide) { 
    var $element = $container.find('.coder-editor');
    var $wrapper = $container.find('.coder-editor-wrapper');
    var $destination = $("#" + $element.attr('data-target'));

    var config = $element.data("config");
    config.html = unsanitize($element.html());

    if(config.isSaving) { loadFromLocalStorage($element,config); }

    $element.css('visibility','visible');

    var editor = setupCodeEditor(currentSlide,$container,$element,$destination,config);

    var $backButton = null;

    var $buttonWrapper = createButtonWrapper($wrapper);

    if(!config.isInstant) {
      createRunButton(config,$buttonWrapper, function() {
        if(config.isFull) {  
          $backButton.show();
          $wrapper.hide();
        }
        $destination.show();
        runCode($element,$element.attr('data-coder-template'));
      });
    }

    if(config.isFull) { 
      $backButton = createBackbutton($buttonWrapper,function() {
        $destination.toggle();
        $wrapper.toggle();
      });
    }

    if(config.isSolution) {
      createSolution($buttonWrapper,function() {
        var solution = $element.attr('data-solution');
        editor.setValue(unsanitize($("#" + solution).html()));
      });

    }
  }

  function getGist(gistId) {
    url = 'https://api.github.com/gists/' + gistId + '?callback=?';
    $.getJSON(url, function(gistData) {
      var $gists = savedGistData[gistId],
      length = $gists.length;
      while(length--){
        var $gist = $($gists[length]);
        updateGistSlide( $gist, gistData );  
      }
    });
  }

  function updateGistSlide($gist, gistData) {
    var content = gistData.data.files["gistfile1.txt"].content,
    id = gistData.data.id,
    slide = $gist.parents('.slide'),
    type = $gist.attr('type'),
    classes = $gist.attr('data-gist-classes'),
    template = $gist.attr('data-coder-template') || '',
    language =  $gist.attr('data-language') || '',
    save = $gist.attr('data-save') || '';

    if(type === 'text/coderdeck') {
      $el = $('<script />')
      .attr('id', $gist.attr('id'))
      .attr('type', type);
    }
    else {
      $el = $('<textarea />');
    }

    $el.addClass(classes)
    .attr('data-coder-template', template)
    .attr('data-language', language)
    .attr('data-save', save)
    .text(content)
    .find("a")
    .attr('target','_blank')
    .end();

    $gist.after($el).remove();


    prepareSlide(slide.attr('data-slide-id'), slide);

  }


  function displayCodeSlide(slide) {
    slide.find(".coder-wrapper").each(function() {
      var $container = $(this);
      if(!$container.hasClass('coderEditor')) {
        generateCodeSlide($container,slide);
      }
      resizeEditors(slide,$container);
    });

  }

  $d.bind('deck.init',function() {

    $('.gist[data-gist-id]').each(function(idx) {
      var $gist = $(this);
      var gistId = $gist.attr('data-gist-id');

      savedGistData[gistId] = savedGistData[gistId] || [];
      savedGistData[gistId].push($gist);
    });

    for(var id in savedGistData){
      getGist(id);
    }


    $("a").attr('target','_blank');
    $.each($[deck]('getSlides'), prepareSlide);

    prettyPrint();
  });


  $d.bind('deck.change',function(e,from,to) {
    var current =$[deck]('getSlide', to);

    displayCodeSlide(current);
  });

})(jQuery,'deck',this);
