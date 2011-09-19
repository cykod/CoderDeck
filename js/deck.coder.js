/*!
 *Copyright (c) 2011 Cykod LLC
 Dual licensed under the MIT license and the GPL license

*/


/*
This module adds a code editor that shows up in individual slides

*/



(function($, deck, window, undefined) {
  var $d = $(document),
  $window = $(window),
  editorFocused = false

  function runCode(element,template) {
    iframe = document.createElement("IFRAME"); 
    iframe.style.width = ($(element).parent().width()-2) + "px";
    iframe.style.height = ($(element).parent().height()-2) + "px";
    iframe.style.overflow = 'auto';
    iframe.style.border ="none";

    var dest = $(element).attr('data-target');
    var destination = $("#" + dest );
    $(destination).html("").append(iframe);


    var editor = $(element).data('editor');
    var code = editor.getValue();

    var language = $(element).attr('data-language');


    if($(element).attr('data-save')) {
      localStorage[$(element).attr('data-save')] = code;
    }

    if(language == 'js') {
      code = "<scr" + "ipt>\n" + code + "\n</scr" + "ipt>";
    }

    var tmpl = $("#coderdeck-default").html();

    code = "<!DOCTYPE HTML>" + tmpl.replace(/END/,'</s' + 'cript>').replace(/CODE/,code);

    writeIFrame(iframe,code);
  }



  function writeIFrame(iframe,code) {
    iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
    iframe.document.open();
    iframe.document.write(code);
    iframe.document.close();
  }



 function focusCallback() {
   disableKeyboardEvents = true;
  }

  function blurCallback() {
    disableKeyboardEvents = false;
  }


  $d.bind('deck.init',function() {

    $("a").attr('target','_blank');

    $.each($[deck]('getSlides'), function(idx, $el) {
      var slide = $($el);

      var element =slide.find(".coder-editor"); 
      var full = $(element).hasClass('coder-editor-full');
      var fullClass = full ? " coder-wrapper-full" : " coder-wrapper-split";

      $(element).data('full',full);
      $(element).data('instant',element.hasClass('coder-editor-instant'));

      slide.find(".coder-editor").attr({
        'id': 'editor-' + idx,
        'data-target' : 'destination-' + idx
        }).wrapAll("<div class='coder-wrapper" + fullClass + "'><div class='coder-editor-wrapper' id='wrapper-" + idx + "'></div></div>").css('position','static');

       $("<div class='coder-destination' id='destination-" + idx + "'></div>").insertAfter("#wrapper-"+idx);
        var solution = slide.find("script[type=codedeck]")[0]
        if(solution) {
          $(solution).attr({ 'id' : 'solution-' + idx });
          slide.find(".coder-editor").attr({ 'data-solution' : 'solution-' + idx });
        }

      });

      
      $d.unbind('keydown.deck').bind('keydown.deck', function(e) {
        if(!editorFocused) {
          switch (e.which) {
            case $.deck.defaults.keys.next:
            $.deck('next');
            e.preventDefault();
            break;
            case $.deck.defaults.keys.previous:
            $.deck('prev');
            e.preventDefault();
            break;
          }
        }
      });


  });


  $d.bind('deck.change',function(e,from,to) {
    var current =$[deck]('getSlide', to);
        
    current.find(".coder-wrapper").each(function() {
      if(!$(this).hasClass('coderEditor')) {

        var element = $(this).find('.coder-editor');
        var wrapper = $(this).find('.coder-editor-wrapper');

        var html = element.html().replace(/SCRIPT/g,'<script>').replace(/END/,'</s' + 'cript>').replace(/&lt;/g,'<').replace(/&gt;/g,'>');

        $(element).css('visibility','visible');

        var editorOptions = { 
          lineNumbers: true,
          onFocus: function() { editorFocused = true; },
          onBlur: function() { editorFocused = false; } 
        };

        if($(element).data('instant')) {
          editorOptions['onChange'] =  function() { runCode(element); }
        }
        var editor = CodeMirror.fromTextArea(element[0], editorOptions );


        $(editor.getScrollerElement()).height($(current).height() - $(this).position().top - 80);

        $(this).addClass('coderEditor');


        var language = $(element).attr('data-language');


        var isFull = $(element).data('full');

        setTimeout(function() {
          if($(element).attr('data-save') && localStorage[$(element).attr('data-save')]) {
            editor.setValue(localStorage[$(element).attr('data-save')]);
          } else {
            editor.setValue(html);
          }
        },500);

        $(element).data('editor',editor);

        var dest = $(element).attr('data-target');
        var destination = $("#" + dest );


        destination.css('height',$(current).height() - $(this).position().top - 80);


        $("<button>Run</button>").insertBefore(wrapper).click(function() {
          if(isFull) {  
            $(wrapper).hide();
          }
          $(destination).show();
          runCode(element);

        });

        if(isFull) { 
          $("<button>Back</button>").insertBefore(wrapper).click(function() {
            $(destination).toggle();
            $(wrapper).toggle();
          });
        }


        if($(element).data('instant')) {
           runCode(element);
        }

        var solution = element.attr('data-solution');
        if(solution) {
          $("<button>Solution</button>").insertBefore(wrapper).click(function() {
              var html = $("#" + solution).html().replace(/SCRIPT/g,'<script>').replace(/END/,'</s' + 'cript>');
          editor.setValue(html);

          });
        }
      }
    });
    
  });

})(jQuery,'deck',this);
