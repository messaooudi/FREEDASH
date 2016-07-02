/* global google */
/* global gapi */

    var developerKey = 'AIzaSyCopGumk0XmliwO-0dOdo974glwHXu_S2U';

    var clientId = "837845096298-usjskvbiq328u7lfci3n6cggd185667l.apps.googleusercontent.com"

    var appId = "837845096298";

    var scope = ['https://www.googleapis.com/auth/drive'];

    var pickerApiLoaded = false;
    var oauthToken;

    function loadPicker() {
      gapi.load('auth', {'callback': onAuthApiLoad});
      gapi.load('picker', {'callback': onPickerApiLoad});
    }

    function onAuthApiLoad() {  
      window.gapi.auth.authorize(
              {
                'client_id': clientId,
                'scope': scope,
                'immediate': false
              },
              handleAuthResult);
    }

    function onPickerApiLoad() {
      pickerApiLoaded = true;
      createPicker();
    }

    function handleAuthResult(authResult) {
      if (authResult && !authResult.error) {
        oauthToken = authResult.access_token;
        createPicker();
      }
    }

    function createPicker() {
      if (pickerApiLoaded && oauthToken) {
        //var view = new google.picker.View(google.picker.ViewId.DOCUMENTS);
        //view.setMimeTypes("application/vnd.google-apps.folder");
        var picker = new google.picker.PickerBuilder()
                .addView(google.picker.ViewId.DOCS)
                .enableFeature(google.picker.Feature.NAV_HIDDEN)
                .setAppId(appId)
                .setOAuthToken(oauthToken)
                .setDeveloperKey(developerKey)
                .setCallback(pickerCallback)
                .hideTitleBar()
                .build();
            picker.setVisible(true); 
               
        $(".picker-dialog").css("width","98%")
        $(".picker-dialog").css("height","98%");
        $(".picker-dialog").css("min-width","98%")
        $(".picker-dialog").css("min-height","98%");
        $(".picker-dialog").css("top","1%");
        $(".picker-dialog").css("left","1%");
        $(".picker-dialog-content").css("width","100%")
        $(".picker-dialog-content").css("height","100%");
        $(".picker-dialog-content").css("min-width","100%")
        $(".picker-dialog-content").css("min-height","100%");
      
      }
    }
		
    function pickerCallback(data) {
        if(data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
    
             $("#googlePicker").css("left","-100%");
    
            var docs = data[google.picker.Response.DOCUMENTS];
            docs.forEach(function (file) {
            var downloadUrl;
            gapi.client.request({
                    'path': '/drive/v2/files/' + file.id,
                    'method': 'GET',
                    callback: function (responsejs, responsetxt) {

                               downloadUrl = responsejs.downloadUrl;
                               var accessToken = gapi.auth.getToken().access_token;
                               socket.emit("download",{name : file.name, url:downloadUrl , token:accessToken});
                               }
                });

            });
}
    }
    





