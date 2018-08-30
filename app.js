//Notes
//If you cmd 'node app.js', this below will display in cmd console
    /*console.log('Hello World'); 
    var a = 1;
    console.log(a);*/
//Express (files): client asks server for files, imgs
//Socket.io (packets): two way data sending 'positions, key inputs'
//NotesEnd

//Express code for server
var express = require('express');
var app = express();
var serv = require('http').Server(app);
app.get('/',function(req,res){ // '/' means nothing, /(nothing) was requested from port 2000.
    res.sendFile(__dirname+'/client/index.html'); //sends index.html homepage to user when /(nothing) is requested.
});
app.use('/client',express.static(__dirname+'/client'));//if request matches /client, send files within that folder. Otherwise ignore other requests i.e. /js

//Server start confirmer.
serv.listen(2000); //listening for request for port 2000. Use localhost:2000 for domain for local testing.
console.log("Server started."); //states success when server starts when cmd node app.js

//(R1) loads socket.io and initialises it.
var io = require('socket.io')(serv,{});

//whenever a user connects, this function(socket) runs.
io.sockets.on('connection',function(socket){ 
    console.log('Socket connection successful.');

    //Server sends a message
    var hello = function(){
        socket.emit('serverMsg',{ //output label
            msg:'hello from server' //object label msg from server
        }); 
    }

    //Server listens for message
    socket.on('happy',function(input){ //listen for client 'happy', execute. 
        console.log('Client says happy because he inputted '+input.reason);
        hello();
    });

    
});


//cont. 4:26