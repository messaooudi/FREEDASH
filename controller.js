/* global io */
 
var socket = io('http://192.168.43.204')

$(function(){
    socket.emit("getFiles","");    
})
 
 
socket.on("showLoader",function(){
    $("#fade").css("visibility","visible");
    $("#fade").css("background","rgba(0, 0, 0, 0.8)");
    $(".sk-folding-cube").css("visibility","visible");
}); 

socket.on("hideLoader",function(){
    $("#fade").css("background","rgba(0, 0, 0, 0)");
    $("#fade").css("visibility","hidden");
    $(".sk-folding-cube").css("visibility","hidden");
}); 

socket.on("progress",function(state){
    $("#progress").html(parseInt(state.percentage*100+"")+"%");
});


var fullScreen = ["F11","F11"]; 

socket.on("files",function(files){
    var table = $("#filesTable");
    $("#filesTable tr").remove();
 
    for(var index=0 ; index < files.length-1 ; index++){
        var name = files[index];
        var short_name = files[index].match(new RegExp('.{1,' +20+ '}', 'g'))[0];
        if(name!=short_name)
            short_name=short_name+"...";
        var type = name.slice((name.lastIndexOf(".") - 1 >>> 0) + 2);
        var type_img = "<img width='30px' heigth='30px' src='images/"+type+".png'/>"
        
        var deleteFileButtonStyle = "background-image: url(images/delete_image.png);background-repeat: no-repeat;";
        var delete_image = "<button class='deleteFileButton' file='"+name+"' rowId='"+'row'+index+"' style='"+deleteFileButtonStyle+"'></button>"
        
        var showFileButtonStyle = "background-image: url(images/show_image.png);background-repeat: no-repeat;";
        var show_image = "<button class='showFileButton' file='"+name+"' type='"+type+"' style='"+showFileButtonStyle+"'></button>"
        
        var row = "<tr id='row"+index+"'><td>"+type_img+"</td><td>"+short_name+"</td><td>"+show_image+"</td><td>"+delete_image+"</td></tr>";
        $(table).append(row);
    }
    
    $(".deleteFileButton").bind("click",function(e){
        $("#"+$(this).attr("rowId")).remove();
        socket.emit("removeFile",$(this).attr("file"));
    });
    
    $(".showFileButton").bind("click",function(e){
        if($(this).attr("type")=="ppt"||$(this).attr("type")=="pptx"){
            fullScreen = ["Escape","F5"];
        }else{
            fullScreen = ["F11","F11"];
        }
        socket.emit("showFile",$(this).attr("file"));
        $('#activateControllePad').trigger('touchend'); 
    });
});
 
var alpha0 = 0,beta0 = 0;
 
var freeLaserHandler = function(e){
    var
        alpha = e.alpha,
        beta=e.beta;
        if(Math.abs(alpha0-alpha)<50&&20*Math.abs(alpha0-alpha)>1&&Math.abs(beta0-beta)<50&&20*Math.abs(beta0-beta)>1) {
            socket.emit("freeLaser",{x:26*(alpha0 - alpha),y:26*(beta0 - beta)});
        }
        alpha0 = alpha;
        beta0 = beta;
}
 
$(".controllerButton").bind("touchend",function(){
    if($(this).attr("id")=="F11"){
        $(this).attr("key",$(this).attr("isActive")=="true"?fullScreen[0]:fullScreen[1]);
        $(this).attr("isActive",$(this).attr("isActive")=="true"?"false":"true");
    }
    socket.emit("keyStrok",$(this).attr("key"));
});


$("#keyboard").bind("touchstart",function(e){
    e.preventDefault();
    $('#fakeInput').trigger('focus');
});

 $('#fakeInput').keyup(function(e){
     socket.emit("input",$(this).val()+"");
 });

var pageY0 = 0;
$("#slider").bind({
    touchmove : function(e){
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        if(touch.pageY<window.innerHeight-parseInt($(this).css("height"))&&touch.pageY>parseInt($(".header").css("height")))
            $(this).css("top",touch.pageY);
        if(Math.abs(touch.pageY-pageY0)>2&&touch.pageY-pageY0<0)
            socket.emit("slider","4");
        else if(Math.abs(touch.pageY-pageY0)>2&&touch.pageY-pageY0>0)
            socket.emit("slider","5");
        pageY0 = touch.pageY;
    },
    touchend : function(e){
        e.preventDefault();
        $(this).css("top","45%");
    }
});


$("#activateTouchPad").bind("touchend",function(){
    if($(this).attr("isActive")=="false"){
         $(this).attr("isActive","true");
         $("#touchPad").css("background","rgba(0, 0, 0, 0.9)");
         $("#touchPad").css("visibility","visible");
         $(".h").css("visibility","hidden");
         $(this).css("visibility","visible");
         $("#activateSlider").css("visibility","visible");
    }else{
         $(this).attr("isActive","false");
         $("#touchPad").css("background","rgba(0, 0, 0, 0)");
         $("#touchPad").css("visibility","hidden");
         $(".h").css("visibility","visible");
         if($("#activateControllePad").attr("isActive")=="false"){
            $("#activateSlider").css("visibility","hidden");
            $("#activateSlider").attr("isActive","false");
            $("#slider").css("visibility","hidden");
         }
         
    }
})

var touchStartTime = 0;
var touchStartTouch;
var X0=0,Y0=0;
$("#touchPad").bind({
    touchstart : function(e){
        touchStartTime = new Date().getTime();
        touchStartTouch = e.originalEvent.touches || e.originalEvent.changedTouches;
        X0 = touchStartTouch[0].pageX;
        Y0 = touchStartTouch[0].pageY;
    },
    touchend : function(e){
        e.preventDefault();
        var touchEndTime = new Date().getTime();
        
        if(touchStartTouch.length == 2){
            if((touchEndTime-touchStartTime)<150){
                socket.emit("tap",3);
            }
        }else if(touchStartTouch.length == 1){
            if((touchEndTime-touchStartTime)<150){
                socket.emit("tap",1);
            }   
        }
        touchStartTouch = {}
        
    },
    touchmove : function(e){
        e.preventDefault();
        var touchMoveTouch = e.originalEvent.touches || e.originalEvent.changedTouches; 
        
        if(touchMoveTouch.length == 2){
            
        }else if(touchMoveTouch.length == 1){
             socket.emit("touchMove",{x :2*(touchMoveTouch[0].pageX-X0),y : 2*(touchMoveTouch[0].pageY-Y0)});
        }   
        
        X0 = touchMoveTouch[0].pageX;
        Y0 = touchMoveTouch[0].pageY;
    }
})

$("#laserPad").bind({
    touchstart : function(e){
        touchStartTime = new Date().getTime();
        touchStartTouch = e.originalEvent.touches || e.originalEvent.changedTouches;
        X0 = touchStartTouch[0].pageX;
        Y0 = touchStartTouch[0].pageY;
        
        $("#laserImage").css("top",touchStartTouch[0].pageY);
        $("#laserImage").css("left",touchStartTouch[0].pageX);
        $("#laserImage").css("visibility","visible");
    },
    touchmove : function(e){
        e.preventDefault();
        var touchMoveTouch = e.originalEvent.touches || e.originalEvent.changedTouches; 
        
        if(touchMoveTouch.length == 2){
            
        }else if(touchMoveTouch.length == 1){
             socket.emit("laserMove",{x :5*(touchMoveTouch[0].pageX-X0),y : 5*(touchMoveTouch[0].pageY-Y0)});
             $("#laserImage").css("top",touchMoveTouch[0].pageY);
             $("#laserImage").css("left",touchMoveTouch[0].pageX);
        }   
        
        X0 = touchMoveTouch[0].pageX;
        Y0 = touchMoveTouch[0].pageY;
    },
    touchend : function(e){
        $("#laserImage").css("visibility","hidden");
    }
});




$("#burgger").bind("touchend",function(){
    $("#sideBar").css("left","0px");
    $("#sideBarFade").css("visibility","visible");
    $("#sideBarFade").css("background","rgba(0, 0, 0, 0.8)");
    $("#option").css("z-index","1");
});


$("#sideBarFade").bind("touchend",function(){
     $(this).css("visibility","hidden");
     $(this).css("background","rgba(0, 0, 0, 0)");
     $("#sideBar").css("left","-75%");
     
     setTimeout(function(){
         $("#option").css("z-index","15");
     }, 700);    
});


$("#activateSlider").bind("touchend",function(){
    var visibility = $(this).attr("isActive");
    $("#slider").css("visibility",visibility=="true"?"hidden":"visible");
    $(this).attr("isActive",visibility=="true"?"false":"true");
});

$("#laser").bind("touchend",function(){
    if($(this).attr("isActive")=="false"){
         var visibility = $("#laserOption").attr("isActive");
         $("#laserOption").css("visibility",visibility=="true"?"hidden":"visible");
         $("#laserOption").attr("isActive",visibility=="true"?"false":"true");
         $("#fade").css("visibility",visibility=="true"?"hidden":"visible");
         $("#fade").css("background",visibility=="true"?"rgba(0,0,0,0)":"rgba(0,0,0,0.8)");
         $(".h").css("visibility",visibility=="true"?"visible":"hidden");
         $("#activateSlider").css("visibility","hidden");
         $(this).css("visibility","visible");
         if($("#activateControllePad").attr("isActive")=="true"){
            $("#fade").css("visibility","visible");
            $("#fade").css("background","rgba(0, 0, 0, 0.8)");
         }
    }else{
       $(this).attr("isActive","false");
       $("#laserPad").css("visibility","hidden");
       $("#laserPad").css("background","rgba(0, 0, 0, 0)");
        if($("#activateControllePad").attr("isActive")=="false"){
            $("#fade").css("visibility","hidden");
            $("#fade").css("background","rgba(0, 0, 0, 0)");
        }
       $(".h").css("visibility","visible");
       $("#activateSlider").css("visibility","hidden");
       window.removeEventListener('deviceorientation',freeLaserHandler,true);
       socket.emit("laser","kill");
    }
});


$("#freeLaser").bind("touchend",function(){
   $("#laserOption").css("visibility","hidden");
   $("#laserOption").attr("isActive","false"); 
   $("#laser").attr("isActive","true");
   $("#fade").css("visibility","visible");
   $("#fade").css("background","rgba(0, 0, 0, 0.8)");
   socket.emit("laser","show");
   window.addEventListener('deviceorientation',freeLaserHandler,true);
});

$("#touchLaser").bind("touchend",function(){
   $("#laserOption").css("visibility","hidden");
   $("#laserOption").attr("isActive","false"); 
   $("#laser").attr("isActive","true");   
   $("#laserPad").css("background","rgba(0, 0, 0, 0.9)");
   $("#laserPad").css("visibility","visible");
   socket.emit("laser","show");
});


var touchEndTouch;
$("#swipePad").bind({
   touchstart : function(e){
      e.preventDefault();
      touchStartTime = new Date().getTime();
      touchStartTouch = e.originalEvent.touches || e.originalEvent.changedTouches;
      X0 = touchStartTouch[0].pageX;
      Y0 = touchStartTouch[0].pageY;
   },
   touchmove : function(e){
      e.preventDefault();
      touchEndTouch = e.originalEvent.touches || e.originalEvent.changedTouches;
   },
   touchend : function(e){
       var touchEndTime = new Date().getTime();
       var X = touchEndTouch[0].pageX;
       var Y = touchEndTouch[0].pageY;
       if(Math.abs(Y-Y0)<100&&(touchEndTime-touchStartTime)<1500){
           if((X-X0)>30){
               socket.emit("keyStrok","Next");
           }
           else if((X0-X)>30){
               socket.emit("keyStrok","Prior"); 
           }
       }
   }
});

$("#activateControllePad").bind("touchend",function(e){
    if($(this).attr("isActive")=="false"){
        $("#fade").css("visibility","visible");
        $("#fade").css("background","rgba(0, 0, 0, 0.8)");
        $("#controllePad").css("left","0");
        $("#controllePad").css("top",$(".header").css("height"));
        $("#activateSlider").css("visibility","visible");
        $(this).attr("isActive","true");
    }else{
        $("#fade").css("background","rgba(0, 0, 0, 0)");
        $("#fade").css("visibility","hidden");
        $("#controllePad").css("left","-150%");
        $("#controllePad").css("top","0");
        $("#activateSlider").css("visibility","hidden");
        $("#activateSlider").attr("isActive","false");
        $("#slider").css("visibility","hidden");
        $(this).attr("isActive","false");
    }
});

$("#drivePicker").on("touchend",function(e){
      $("#sideBarFade").trigger("touchend");
});

$("#dropboxChooser").on("touchend",function(e){
      $("#sideBarFade").trigger("touchend");
});


$('#upload-button').bind('click', function (){
    $('#upload-input').click();
});


$('#upload-input').on('change', function(){

  $("#sideBarFade").trigger("touchend");  
  var files = $(this).get(0).files;
  
  if (files.length > 0){
    // AJAX request
    var formData = new FormData();
    
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      formData.append('uploads[]', file, file.name);
    }

    $.ajax({
      url: './files/',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          socket.emit("getFiles","");
      },
      xhr: function() {
        var xhr = new XMLHttpRequest();
        
        $("#fade").css("visibility","visible");
        $("#fade").css("background","rgba(0, 0, 0, 0.8)");
        $(".sk-folding-cube").css("visibility","visible");

        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(""+percentComplete * 100);
            
            $("#progress").html(percentComplete + '%');
            
            if (percentComplete === 100) {
             $("#fade").css("background","rgba(0, 0, 0, 0)");
             $("#fade").css("visibility","hidden");
             $(".sk-folding-cube").css("visibility","hidden");
            }

          }

        }, false);

        return xhr;
      }
    });

  }
});
