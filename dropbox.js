/* global Dropbox */

var options = {

    success: function(files) {
        var action ="if wget -P ./dropbox "+files[0].link+";then DISPLAY=:0 xdg-open ./dropbox/\""+files[0].name+"\";else touch error;fi";
           
        triggerPhp(action);
        alert(action);
    },

    cancel: function() {

    },

    linkType: "direct", //preview or direct

    multiselect: false, // or true
    
    extensions: ['.pdf', '.doc', '.docx'],
};

$("#dropboxChooser").bind("touchend",function(){Dropbox.choose(options);});

function  triggerPhp(ACTION){
    $.post("action.php", {action : ACTION});
}