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

//List of client connections
var CLIENT_LIST = {};
var clientNo = 0;

//(R1) loads socket.io and initialises it.
var io = require('socket.io')(serv,{});
//whenever a user connects, this function(socket) runs.
io.sockets.on('connection',function(client){ 
    clientNo++; //increment client number to differentiate
    client.id = clientNo;
    client.x = 0;
    client.y = 0;
    client.no = client.id; //can be replaced with name in future.
    CLIENT_LIST[clientNo] = client;
    console.log('Client '+clientNo+' connection successful.');

    //Remove player when disconnecting
    client.on('disconnect',function(){
        delete CLIENT_LIST[client.id];
    });

    /* //Example of server listening and sending
    //Server sends a message
    var hello = function(){
        client.emit('serverMsg',{ //output label
            msg:'hello from server' //object label msg from server
        }); 
    }

    //Server listens for message
    client.on('happy',function(input){ //listen for client 'happy', execute. 
        console.log('Client says happy because he inputted '+input.reason);
        hello();
    });
    */
});

//loop for canvas/game drawing
setInterval(function(){ //for every 40ms/ every frame...
    var pack = []; //create a new clean package of data to send out every frame

    //calculate and put into package
    for(var i in CLIENT_LIST){ //increment positions
        var client = CLIENT_LIST[i];
        client.x ++;
        client.y ++;

        pack.push({ //push data of new position into packet
            x:client.x,
            y:client.y,
            no:client.no,
        });
    }

    for (var i in CLIENT_LIST){
        var client = CLIENT_LIST[i];
        client.emit('newPositions',pack); //must send package to each player connected to server
    }
    
},1000/25);


//cont. 4:26