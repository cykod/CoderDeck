
function runCode(element) {
  iframe = document.createElement("IFRAME"); 
   iframe.style.width = ($(element).width()-2) + "px";
   iframe.style.height = ($(element).height()-2) + "px";
   iframe.style.overflow = 'auto';
   iframe.style.border ="none";

   var dest = $(element).attr('data-target');
   var destination = $("#" + dest );
   $(destination).html("").append(iframe);

   var editor = $(element).data('editor');
   var code = editor.getSession().getValue();

   var language = $(element).attr('data-language');

   if(language == 'js') {
     code = "<scr" + "ipt>\n" + code + "\n</scr" + "ipt>";
   }

   code = "<html><head><scr" + "ipt src='js/jquery.min.js'></scr" + "ipt></head><body>" + code + '</body></html>';

   writeIFrame(iframe,code);
}

function writeIFrame(iframe,code) {
  iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
  iframe.document.open();
  iframe.document.write(code);
  iframe.document.close();
}



$(document).ready(function() {

  var JavaScriptMode = require("ace/mode/javascript").Mode;

  $("a").attr('target','_blank');

 function focusCallback() {
   disableKeyboardEvents = true;
  }

  function blurCallback() {
    disableKeyboardEvents = false;
  }

  $("article").each(function(idx) {
    var slide = $(this);

    slide.find(".code-editor").attr({
        'id': 'editor-' + idx,
        'data-target' : 'destination-' + idx
    }).wrapAll("<div class='code-wrapper'></div>").css('position','static');
    slide.find(".destination").attr('id','destination-' + idx);
    var solution = slide.find("script[type=codedeck]")[0]
    if(solution) {
      $(solution).attr({ 'id' : 'solution-' + idx });
      slide.find(".code-editor").attr({ 'data-solution' : 'solution-' + idx });
    }

  });

  $(document).bind('slideleave',function(e) {
    $('.destination').html("");

  });

  $(document).bind("slideenter",function(e) {
    var current = $(".current");
    current.find(".code-editor").each(function() {
      if(!$(this).hasClass('codeEditor')) {
        var element = this;
        $(this).css('visibility','visible');
        var editor = ace.edit(this.id);
        $(this).addClass('codeEditor');
        editor.getSession().setMode(new JavaScriptMode());

        if($(this).attr('data-script')) {
          var html = $("#" + $(this).attr('data-script')).html().replace(/SCRIPT/g,'<script>').replace(/END/,'</s' + 'cript>');
          editor.getSession().setValue(html);
        }

        $(this).data('editor',editor);
        editor.on('focus', focusCallback);
        editor.on('blur', blurCallback);
        $("<button>Run</button>").insertBefore(this).click(function() {
          runCode(element);
        });

        var solution = $(this).attr('data-solution');
        if(solution) {
          $("<button>Solution</button>").insertBefore(this).click(function() {
              var html = $("#" + solution).html().replace(/SCRIPT/g,'<script>').replace(/END/,'</s' + 'cript>');
          editor.getSession().setValue(html);

          });
        }
      }
    });

  });

});

