// BASE SETUP
// ======================================

// CALL THE PACKAGES --------------------
var express = require('express'); // call express
var app = express(); // define our app using express
var serv = require('http').Server(app);
var bodyParser = require('body-parser'); // get body-parser
var morgan = require('morgan'); // used to see requests
var mongoose = require('mongoose');
var config = require('./config');
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http,{});

// APP CONFIGURATION ==================
// ====================================
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

// log all requests to the console
app.use(morgan('dev'));

// connect to our database (hosted on modulus.io)
mongoose.connect(config.database);

// set static files location
// used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// ROUTES FOR OUR API =================
// ====================================

// API ROUTES ------------------------
var apiRoutes = require('./app/routes/api')(app, express);
app.use('/api', apiRoutes);

// MAIN CATCHALL ROUTE ---------------
// SEND USERS TO FRONTEND ------------
// has to be registered after API ROUTES
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});
// START THE SERVER
// ====================================
http.listen(config.port);
console.log('Magic happens on port ' + config.port);
//GAME - Server Side Code
var SOCKET_LIST = {};

var Entity = function(){
   var self = {
       x:Math.random() * 500,
       y:Math.random() * 500,
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
   self.getDistance = function(pt){
       return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
   }
   return self;
}

var Player = function(id,kills,level){
   var self = Entity();
   self.id = id;
   self.number = "" + Math.floor(10 * Math.random());
   self.pressingRight = false;
   self.pressingLeft = false;
   self.pressingUp = false;
   self.pressingDown = false;
   self.pressingAttack = false;
   self.mouseAngle = 0;
   self.maxSpd = 10;
   self.hp = 10+level;
   self.hpMax = 10+level;
   self.score = kills;
   self.level=level;

   var super_update = self.update;
   self.update = function(){
       self.updateSpd();
       super_update();


   }
   self.shootHit = function(angle){
       var b = Hit(self.id,angle);
       b.x = self.x;
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

   self.getInitPack = function(){
       return {
           id:self.id,
           x:self.x,
           y:self.y,
           number:self.number,
           hp:self.hp,
           hpMax:self.hpMax,
           score:self.score,
           level:self.level,
       };
   }
   self.getUpdatePack = function(){
       return {
           id:self.id,
           x:self.x,
           y:self.y,
           hp:self.hp,
           hpMax:self.hpMax,
           score:self.score,
           level:self.level,
       }
   }

   Player.list[id] = self;

   initPack.player.push(self.getInitPack());
   return self;
}
Player.list = {};

Player.onConnect = function(socket,kills,level){
   var player = Player(socket.id,kills,level);

   socket.on('keyPress',function(data){
       if(data.inputId === 'left')
           player.pressingLeft = data.state;
       else if(data.inputId === 'right')
           player.pressingRight = data.state;
       else if(data.inputId === 'up')
           player.pressingUp = data.state;
       else if(data.inputId === 'down')
           player.pressingDown = data.state;
       else if(data.inputId === 'attack')
            player.shootHit(player.mouseAngle);
       else if(data.inputId === 'mouseAngle')
           player.mouseAngle = data.state;
   });

   socket.emit('init',{
       selfId:socket.id,
       player:Player.getAllInitPack(),
       hit:Hit.getAllInitPack(),
   })
}

Player.getAllInitPack = function(){
   var players = [];
   for(var i in Player.list)
       players.push(Player.list[i].getInitPack());
   return players;
}

Player.onDisconnect = function(socket){
   delete Player.list[socket.id];
   removePack.player.push(socket.id);
}
Player.update = function(){
   var pack = [];
   for(var i in Player.list){
       var player = Player.list[i];
       player.update();
       pack.push(player.getUpdatePack());
   }
   return pack;
}

var HPBoost = function(){
   var self = Entity();
   self.id = Math.random();
   self.timer = 0;
   self.toRemove = false;

   var super_update = self.update;
   self.update = function(){
       if(self.timer ++ > 100000000)
           self.toRemove = true;
       super_update();

       for(var i in Player.list){
           var p = Player.list[i];
           if(self.getDistance(p) < 15){

               p.hp = p.hpMax;
               self.toRemove = true;
           }
       }
   }
   self.getInitPack = function(){
       return {
           id:self.id,
           x:self.x,
           y:self.y,
       };
   }
   self.getUpdatePack = function(){
       return {
           id:self.id,
           x:self.x,
           y:self.y,
       };
   }
   return self;
}

var Hit = function(parent,angle){
   var self = Entity();
   self.id = Math.random();
   self.spdX = Math.cos(angle/180*Math.PI) * 10;
   self.spdY = Math.sin(angle/180*Math.PI) * 10;
   self.parent = parent;
   self.timer = 0.0;
   self.toRemove = false;
   var super_update = self.update;
   self.update = function(){
       if(self.timer ++ > 0.1)
           self.toRemove = true;
       super_update();

       for(var i in Player.list){
           var p = Player.list[i];
           if(self.getDistance(p) < 15 && self.parent !== p.id){
             var shooter = Player.list[self.parent];

               p.hp -= 1;

               if(p.hp <= 0){

                   if(shooter)
                       shooter.score += 1;

                   if(shooter.score%5===0)
                   {
                      shooter.level++;
                      shooter.hpMax++;
                    }

                   p.hp = p.hpMax;
                   p.x = Math.random() * 500;
                   p.y = Math.random() * 500;
               }

               self.toRemove = true;
           }
       }
   }
   self.getInitPack = function(){
       return {
           id:self.id,
           x:self.x,
           y:self.y,
       };
   }
   self.getUpdatePack = function(){
       return {
           id:self.id,
           x:self.x,
           y:self.y,
       };
   }

   Hit.list[self.id] = self;
   initPack.hit.push(self.getInitPack());
   return self;
}
Hit.list = {};

Hit.update = function(){
   var pack = [];
   for(var i in Hit.list){
       var hit = Hit.list[i];
       hit.update();
       if(hit.toRemove){
           delete Hit.list[i];
           removePack.hit.push(hit.id);
       } else
           pack.push(hit.getUpdatePack());
   }
   return pack;
}

Hit.getAllInitPack = function(){
   var hits = [];
   for(var i in Hit.list)
       hits.push(Hit.list[i].getInitPack());
   return hits;
}

var users=[];

io.on('connection', function(socket){
  console.log("Connected");
//=======================GAME=================================

socket.id = Math.random();
SOCKET_LIST[socket.id] = socket;

socket.on('updates',function(data){
  Player.onConnect(socket,data.kills,data.level);
});
//=======================CHAT=================================
  var username="";

  socket.on('request-users',function(){
      socket.emit('users',{users:users});
  });

  socket.on('add-user',function(data){
    if(users.indexOf(data.username)==-1){
      io.emit('add-user',{username:data.username});
      username=data.username;
      users.push(data.username);
    }
  });

  socket.on('message',function(data){
    io.emit('message',{username:username, message:data.message});
  });

 socket.on('evalServer',function(data){
   if(!DEBUG){
     return;
   }
       var res = eval(data);
   socket.emit('evalAnswer', res);
   });

  socket.on('disconnect', function(){
      console.log("Disconnected");
      //chat
      users.splice(users.indexOf(username),1);
      io.emit('remove-user',{username:username});
      //Game
      delete SOCKET_LIST[socket.id];
      Player.onDisconnect(socket);
  })
});


var initPack = {player:[],hit:[]};
var removePack = {player:[],hit:[]};
var health = null;

setInterval(function(){
    health = HPBoost();

},3000);

setInterval(function(){
    var pack = {
        player:Player.update(),
        hit:Hit.update(),
    }

    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('init',initPack);
        socket.emit('update',pack);
        socket.emit('remove',removePack);
        socket.emit('HPBoost',health);
        console.log("health spawn");
    }
    initPack.player = [];
    initPack.hit = [];
    removePack.player = [];
    removePack.hit = [];

},1000/25);
