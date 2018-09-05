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
var SOCKET_LIST = {};
//var PLAYER_LIST = {}; //Replaced with Player.list
var socketNo = 0;

var Entity = function(){
    var self = {
        x:250,
        y:250,
        spdX:0,
        spdY:0,
        id:"",
    }
    self.update = function(){
        self.updatePosition();
    }
    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
    }
    return self;
}

var Player = function(id){
    /*var self = {
        x:250,
        y:250,
        id:id,
        number:socketNo,
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:10,
    }*/
    //above put using Entity object
    var self = Entity();
    self.id = id;
    self.number = socketNo;
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;

    self.pressingLeftMouse = false;
    self.pressingRightMouse = false;
    self.mouseAngle = 0;

    self.maxSpd = 10;

    /*
    self.updatePosition = function(){
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
    }
    return self;
    */

    var super_update = self.update;
    self.update = function(){
        self.updateSpd();
        super_update();

        //Bullet spawn
        if(self.pressingAttack){
            self.shootBullet(self.mouseAngle);
        }

        if(self.pressingShield){
            self.shootShield(self.mouseAngle);
        }
    }

    self.shootBullet = function(angle){ //bullet shoot function, which links to the bullet spawn
        var b = Bullet(angle);
            b.x = self.x; //set position to center of current player
            b.y = self.y;
    }

    self.shootShield = function(angle){ //bullet shoot function, which links to the bullet spawn
        var b = Shield(angle);
            b.x = self.x; //set position to center of current player
            b.y = self.y;
    }

    self.updateSpd = function(){
        if(self.pressingRight)
            self.spdX = self.maxSpd;
        else if(self.pressingLeft)
            self.spdX = -self.maxSpd;
        else
            self.spdX = 0;

        if(self.pressingUp)
            self.spdY = -self.maxSpd;
        else if(self.pressingDown)
            self.spdY = self.maxSpd;
        else
            self.spdY = 0;
    }
    Player.list[id]=self; //(A2) Moved from io socket init
    return self;
}
Player.list = {};
Player.onConnect = function(socket){
    var player = Player(socket.id);
    socket.on('keyPress',function(data){
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
        
        //mouse
        else if(data.inputId === 'attack')
            player.pressingAttack = data.state;
        else if(data.inputId === 'mouseAngle')
            player.mouseAngle = data.state;
        
        //mouse shield
        else if(data.inputId === 'shield')
            player.pressingShield = data.state;
            
    });

}
Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
}
Player.update = function(){
    var pack = []; //create a new clean package of data to send out every frame

    //calculate and put into package
    for(var i in Player.list){ //increment positions
        var player = Player.list[i];
        player.update();

        pack.push({ //push data of new position into packet
            x:player.x,
            y:player.y,
            number:player.number,
        });
    }
    return pack;
}

//Bullet
var Bullet = function(angle){
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI)*10;
    self.spdY = Math.sin(angle/180*Math.PI)*10;

    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        if(self.timer++ > 0.1) //increment and compare
            self.toRemove = true;
        super_update();
    }
    Bullet.list[self.id] = self;
    return self;
}
Bullet.list = {};

Bullet.update = function(){

    //Bullet spawn moved to player function
    /*if(Math.random()<0.1){
        Enemy(Math.random()*360); //generate Enemy
    }*/

    var pack = []; //create a new clean package of data to send out every frame

    //calculate and put into package
    for(var i in Bullet.list){ //increment positions
        var bullet = Bullet.list[i];
        bullet.update();

        if (bullet.toRemove == true) delete Bullet.list[i]; //remove bullet properly

        pack.push({ //push data of new position into packet
            x:bullet.x,
            y:bullet.y,
        });
    }
    return pack;
}

//Shield
var Shield = function(angle){
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI)*10;
    self.spdY = Math.sin(angle/180*Math.PI)*10;

    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        if(self.timer++ > 0.1) //increment and compare
            self.toRemove = true;
        super_update();
    }
    Shield.list[self.id] = self;
    return self;
}
Shield.list = {};

Shield.update = function(){

    
    /*if(Math.random()<0.1){
        Shield(Math.random()*360); //generate Enemy
    }*/

    var pack = []; //create a new clean package of data to send out every frame

    //calculate and put into package
    for(var i in Shield.list){ //increment positions
        var shield = Shield.list[i];
        shield.update();

        if (shield.toRemove == true) delete Shield.list[i]; //remove bullet properly

        pack.push({ //push data of new position into packet
            x:shield.x,
            y:shield.y,
        });
    }
    return pack;
}
//Shield End

//Enemy
var Enemy = function(angle){ //Generates an enemy
    var self = Entity();
    self.id = Math.random();
    self.x = Math.random()*500;
    self.y = Math.random()*500;
    self.spdX = Math.cos(angle/180*Math.PI)*Math.random()*10;
    self.spdY = Math.sin(angle/180*Math.PI)*Math.random()*10;

    /* //Removal Timer
    self.timer = 0;
    self.toRemove = false;
    var super_update = self.update;
    self.update = function(){
        if(self.timer++ > 100) //increment and compare
            self.toRemove = true;
        super_update();
    }*/

    Enemy.list[self.id] = self;
    return self;
}
Enemy.list = {};

Enemy.update = function(){
    
    
    if(Math.random()<0.1){
        Enemy(Math.random()*360); //generate Enemy
    }
    
    var pack = []; //create a new clean package of data to send out every frame
    //calculate and put into package
    for(var i in Enemy.list){ //increment positions
        var enemy = Enemy.list[i];
        enemy.update();

        pack.push({ //push data of new position into packet
            x:enemy.x,
            y:enemy.y,
        });
    }
    return pack;
}
//EnemyEnd

//Map List and Levels
var TEAM_LIST = [];//tbc to put in groups of 4

//(R1) loads socket.io and initialises it.
var io = require('socket.io')(serv,{});

//whenever a user connects, this function(socket) runs.
io.sockets.on('connection',function(socket){ 

    //Needs fixing... Wanted to prevent very long arrays.
    //Look for free slot in CLIENT_LIST, else take last spot
    /*for(var i = 0; i<CLIENT_LIST.length;i++){
        if(CLIENT_LIST[i]===null){
            clientNo = i;
            break;
        }
        clientNo = CLIENT_LIST.length;//takes up last new spot
    }*/

    socketNo++; //increment client number to differentiate
    socket.id = socketNo;
    SOCKET_LIST[socket.id] = socket;

    
    //PLAYER_LIST[socket.id]=player; //(A1)Moved to Player object so it makes it automatically.
    Player.onConnect(socket);
    console.log('Client '+socket.id+' connection successful.');

    //Remove player when disconnecting
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        Player.onDisconnect(socket);
        
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
    var pack = {
        player:Player.update(),
        bullet:Bullet.update(),
        enemy:Enemy.update(),
        shield:Shield.update(),
    }
    
        

    for (var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack); //must send package to each player connected to server
    }

    /*
    var packE = [];
    packE.push({ //push data of new position into packet
        x:enemy.x,
        y:enemy.y,
    });
    client.emit('newPositionsE',packE);
    */
},1000/25);


//next collision
//making black red.
//skipped chat ep6
