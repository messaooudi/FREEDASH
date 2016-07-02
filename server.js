
var fs = require('fs');
var https = require('https');
var express = require('express');
var socketio = require('socket.io');
var cmd	 = require('child_process');
var app = express();
var request = require('request')
var progress = require('request-progress');
var formidable = require('formidable');
var async = require('async');


var options = {
      key: fs.readFileSync('./private.key', 'utf8'),
      cert: fs.readFileSync('./certificate.pem', 'utf8')
 };




//var server = https.createServer(options, app).listen(443,"192.168.1.38");
var server = app.listen(80,"192.168.43.204");
var io = socketio.listen(server);

app.get("/*",function(req,res){ 
    var file = __dirname+req.path;
    fs.exists(file,function(exists){
       if(exists){
           res.sendFile(file);
           console.log(file);
       }else{
           //res.redirect("/");
           console.log(file+":NOT EXISTE");
       } 
    });
});

io.on('connection', function (socket) {
      console.log("new Client : "+socket.request.connection.remoteAddress);
      
      socket.on("download",function(file){

        console.log("start ; "+file.name);
        //var file = fs.createWriteStream("./files/"+file.name);
        
        socket.emit("showLoader",""); 
        var get = request.get(
            {url: file.url
            , encoding: null    // Force Request to return the data as Buffer
            , headers:
            { Authorization: 'Bearer ' + file.token}
            }
            , function done (err, res ,body) {
                 fs.writeFile('./files/'+file.name, body, function (err) {
                 if(!err){
                        cmd.exec("ls -1 ./files/",function(error,stdout,stderr){
                          if(!error){
                            var files = stdout.split("\n");
                             socket.emit("files",files);
                          }
                        });
                        
                       socket.emit("hideLoader","");
                     }  
                     if(err){
                         console.log("ERROOR");
                         socket.emit("hideLoader","");
                     } 
                 })
            }
        );
        progress(get).on('progress', function (state) {
            console.log(state);
            if(state.percentage)
                socket.emit("progress",state);
        });
     });
      
      socket.on("getFiles",function(){
          cmd.exec("ls -1 ./files/",function(error,stdout,stderr){
              if(!error){
                  var files = stdout.split("\n");
                  socket.emit("files",files);
              }
          });
      });
      
      socket.on("removeFile",function(file){
        cmd.exec("rm './files/"+file+"'",function(error, stdout, stderr){}); 
      });
      
      socket.on("showFile",function(file){
          cmd.exec("xdg-open './files/"+file+"'",function(error, stdout, stderr){

                setTimeout(function(){
                  cmd.exec("xdotool key Escape F11 F5",function(error, stdout, stderr){});
                },500);
          });
      });
      
      socket.on("freeLaser",function(data){
         cmd.exec("sh laser.sh "+data.x+" "+data.y,function(error, stdout, stderr){}); 
      });
      
      socket.on("keyStrok",function(key){
          var commande = "xdotool key "+key;
          cmd.exec(commande,function(error,stdout,stderr){});
      });
      
      socket.on("slider",function(direction){
          var commande = "xdotool click "+direction;
          cmd.exec(commande,function(error,stdout,stderr){});
      });
      
      socket.on("tap",function(click){
          var commande = "xdotool click "+click;
          cmd.exec(commande,function(error,stdout,stderr){});
      })
      
      socket.on("touchMove",function(data){
          var commande = "xdotool mousemove_relative -- "+data.x+" "+data.y;
          cmd.exec(commande,function(error,stdout,stderr){});
      })
      
      socket.on("laserMove",function(data){
          var commande = "bash laser.sh "+data.x+" "+data.y;
          cmd.exec(commande,function(error, stdout, stderr){});
      });
      var free = true;
      var old = '';
      socket.on("input",function(val){
          if(free)
          async.series([
              function(callback){
                  free = false;
                  if(val.length<old.length){
                   async.each(
                           old.slice(val.length-old.length),
                           function(e,callback){
                               var commande = "xdotool key BackSpace";
                                cmd.exec(commande,function(error, stdout, stderr){
                                      if(error) return callback('error');
                                      callback(null);   
                                });
                           },
                           function(err){
                               callback('fin',null);
                           })
                  }else{
                      callback(null,null);
                  }
              },
              function(callback){                  
                    var commande = "xdotool type '"+val.slice(old.length-val.length)+"'";
                     cmd.exec(commande,function(error, stdout, stderr){
                            if(error) return callback('error');
                                  callback(null);
                     });       
              }
          ],function(err,data){
              free = true;
              old = val;
          })
      });
      
      socket.on("laser",function(action){
          if(action == "show"){
            cmd.exec("./show-lazer.sh",function(error, stdout, stderr){});
          }else{
            cmd.exec("./kill-lazer.sh",function(error, stdout, stderr){});
          }
      });
});

app.post('/files', function(req, res){
      var form = new formidable.IncomingForm();
      form.multiples = true;
      form.uploadDir = __dirname+"/files/";
      form.on('file', function(field, file) {
            fs.rename(file.path,form.uploadDir+file.name);
      });
      
      form.on('error', function(err) {
         console.log('An error has occured: \n' + err);
      });
      
      form.on('end', function() {
         res.end('success');
      });
       
     form.parse(req);
});
