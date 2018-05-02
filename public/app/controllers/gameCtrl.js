angular.module('gameCtrl', ['SocketFactory','gameService'])

.controller('gameController',function($scope, $location, Socket, Auth, Game, User){
//['$scope','$location','Socket','Auth','Game',
  Socket.connect();

  var loggedIn = Auth.isLoggedIn();
    // if not logged in redirect to login
  if(!loggedIn){
    $location.path('/login');
  }
  var vm = game;

    // get user information on page load
    Auth.getUser()
      .then(function(response) {
        vm.user = response.data;
        var name = vm.user.name;
        var userName = vm.user.username;
        //console.log(response);
        //chat
        //  Game.getUserInfo(userName).then(function(response){
          //    console.log(response.data);
          //    });
            Socket.emit('add-user',{username: name});

});

var id = "";
var level = 0;
var kills = 0;

Auth.getUser()
  .then(function (response) {
    vm.username = response.data.username;
    vm.name = response.data.name;
      // grab all the users at page load
      User.all()
        .then(function(data) {
          console.log(data);
          // when all the users come back, remove the processing variable
          vm.processing = false;
          //Set the variables for the current user
          for(var i=0;i<data.data.length;i++){
            if(data.data[i].username === vm.username){
              id = data.data[i]._id;
              level = data.data[i].level;
              kills = data.data[i].kills;
              console.log(level +" "+ kills);
              Socket.emit('updates',{level:level, kills:kills});
            }
          }
        });
});



        $scope.users = [];
        $scope.messages = [];

        $scope.sendMessage = function(msg){
          if(msg != null && msg != ""){
            Socket.emit('message',{message:msg});
            $scope.msg="";
          }
        }

        Socket.emit('request-users',{});

        Socket.on('users',function(data){
          $scope.users = data.users;
        });

        Socket.on('message',function(data){
          $scope.messages.push(data);
        });

        Socket.on('add-user',function(data){
          $scope.users.push(data.username);
          $scope.messages.push({username:data.username,message:' has entered the chat'});
        });

        Socket.on('remove-user', function(data){
          $scope.users.splice($scope.users.indexOf(data.username),1);
          $scope.messages.push({username:data.username, message:' has left the chat'});
        });


        //game

        var Img = {};
        Img.player=new Image();
        Img.player.src = 'assets/images/player.png';
        Img.hit=new Image();
        Img.hit.src = 'assets/images/sword.png';
        Img.map=new Image();
        Img.map.src = 'assets/images/map.png';
        Img.health=new Image();
        Img.health.src = 'assets/images/health.png';


      var WIDTH = "500";
      var HEIGHT = "500";
      var canvas  = document.getElementById("ctx");
        var ctx = document.getElementById("ctx").getContext("2d");
        	ctx.font = '30px Arial';

        	var Player = function(initPack){
        		var self = {};
        		self.id = initPack.id;
        		self.number = initPack.number;
        		self.x = initPack.x;
        		self.y = initPack.y;
        		self.hp = initPack.hp;
        		self.hpMax = initPack.hpMax;
        		self.score = initPack.score;
            self.level  = level;
          //  console.log(level);
        		self.draw = function(){
        			var x = self.x - Player.list[selfId].x + WIDTH/2;
        			var y = self.y - Player.list[selfId].y + HEIGHT/2;

        			var hpWidth = 30 * self.hp / self.hpMax;
        			ctx.fillStyle = 'red';
        			ctx.fillRect(x - hpWidth/2,y - 40,hpWidth,4);

        			var width = Img.player.width;
        			var height = Img.player.height;


        			ctx.drawImage(Img.player,
        				0,0,Img.player.width,Img.player.height,
        				x-width/2,y-height/2,width,height);

        			//ctx.fillText(self.score,self.x,self.y-60);
        		}

        		Player.list[self.id] = self;


        		return self;
        	}
        	Player.list = {};

        

        	var Hit = function(initPack){
        		var self = {};
        		self.id = initPack.id;
        		self.x = initPack.x;
        		self.y = initPack.y;

        		self.draw = function(){
        			var width = Img.hit.width;
        			var height = Img.hit.height;

        			var x = self.x - Player.list[selfId].x + WIDTH/2;
        			var y = self.y - Player.list[selfId].y + HEIGHT/2;

        			ctx.drawImage(Img.hit,0,0,Img.hit.width,Img.hit.height,x-width/2,y-height/2,width,height);
        		}

        		Hit.list[self.id] = self;
        		return self;
        	}
        	Hit.list = {};

        	var selfId = null;

        	Socket.on('init',function(data){
        		if(data.selfId)
        			selfId = data.selfId;
        		//{ player : [{id:123,number:'1',x:0,y:0},{id:1,number:'2',x:0,y:0}], hit: []}
        		for(var i = 0 ; i < data.player.length; i++){
        			new Player(data.player[i]);
        		}
        		for(var i = 0 ; i < data.hit.length; i++){
        			new Hit(data.hit[i]);
        		}
        	});

        	Socket.on('update',function(data){
        		//{ player : [{id:123,x:0,y:0},{id:1,x:0,y:0}], hit: []}
        		for(var i = 0 ; i < data.player.length; i++){
        			var pack = data.player[i];
        			var p = Player.list[pack.id];
        			if(p){
        				if(pack.x !== undefined)
        					p.x = pack.x;
        				if(pack.y !== undefined)
        					p.y = pack.y;
        				if(pack.hp !== undefined)
        					p.hp = pack.hp;
                  if(pack.hpMax !== undefined)
          					p.hpMax = pack.hpMax;
        				if(pack.score !== undefined)
        					p.score = pack.score;
                  if(pack.score !== undefined)
          					p.level = pack.level;
        			}
        		}
        		for(var i = 0 ; i < data.hit.length; i++){
        			var pack = data.hit[i];
        			var b = Hit.list[data.hit[i].id];
        			if(b){
        				if(pack.x !== undefined)
        					b.x = pack.x;
        				if(pack.y !== undefined)
        					b.y = pack.y;
        			}
        		}
        	});

        	Socket.on('remove',function(data){
        		for(var i = 0 ; i < data.player.length; i++){

        			delete Player.list[data.player[i]];
        		}
        		for(var i = 0 ; i < data.hit.length; i++){
        			delete Hit.list[data.hit[i]];
        		}
        	});

          Socket.on('HPBoost',function(data){
            drawHPBoost(data);
          });

        	setInterval(function(){
        		if(!selfId)
        			return;
        		ctx.clearRect(0,0,500,500);
        		drawMap();
        		drawScore();
        		for(var i in Player.list)
        			Player.list[i].draw();
        		for(var i in Hit.list)
        			Hit.list[i].draw();
        	},40);

        	var drawMap = function(){
        		var x = WIDTH/2 - Player.list[selfId].x;
        		var y = HEIGHT/2 - Player.list[selfId].y;

          //  var ptrn = ctx.createPattern(Img.map, 'repeat'); // Create a pattern with this image, and set it to "repeat".
          //  ctx.fillStyle = ptrn;
          //  ctx.fillRect(0, 0, WIDTH,HEIGHT);

        		ctx.drawImage(Img.map,x,y);
        	}

          var drawHPBoost = function(data){
            var x =data.x;
        		var y = data.y;
            ctx.drawImage(Img.health,x,y,20,20);
          }

        	var drawScore = function(){
        		ctx.fillStyle = 'black';
        		ctx.fillText("Score " + Player.list[selfId].score,370,30);
            ctx.fillText("Level " + Player.list[selfId].level,30,30);
        	}

         document.onkeydown = function(event){
             if(event.keyCode === 68)    //d
                 Socket.emit('keyPress',{inputId:'right',state:true});
             else if(event.keyCode === 83)   //s
                 Socket.emit('keyPress',{inputId:'down',state:true});
             else if(event.keyCode === 65) //a
                 Socket.emit('keyPress',{inputId:'left',state:true});
             else if(event.keyCode === 87) // w
                 Socket.emit('keyPress',{inputId:'up',state:true});

         }
         document.onkeyup = function(event){
             if(event.keyCode === 68)    //d
                 Socket.emit('keyPress',{inputId:'right',state:false});
             else if(event.keyCode === 83)   //s
                 Socket.emit('keyPress',{inputId:'down',state:false});
             else if(event.keyCode === 65) //a
                 Socket.emit('keyPress',{inputId:'left',state:false});
             else if(event.keyCode === 87) // w
                 Socket.emit('keyPress',{inputId:'up',state:false});
         }

         document.onclick = function(event){
             Socket.emit('keyPress',{inputId:'attack',state:true});
         }

         document.onmouseup = function(event){
             Socket.emit('keyPress',{inputId:'attack',state:false});
         }

         document.onmousemove = function(event){

             var mousePos = getMousePos(canvas,event);
             var rect = canvas.getBoundingClientRect();
             var p1x = 250;
             var p1y = 250;
             var angle = Math.atan2(mousePos.y - p1y, mousePos.x - p1x) * 180 / Math.PI;
             Socket.emit('keyPress',{inputId:'mouseAngle',state:angle});
         }
         function getMousePos(canvas, evt) {
             var rect = canvas.getBoundingClientRect();
             return {
               x: evt.clientX - rect.left,
               y: evt.clientY - rect.top
             };
         }
      $scope.$on('$locationChangeStart', function(event){
          if(Player.list[selfId]){
            var userData = {};
            userData.level = Player.list[selfId].level;
            userData.kills = Player.list[selfId].score;
            console.log(Player.list[selfId].hpMax);
            Game.update(id,userData);

             vm.userData = {};
        }
        Socket.disconnect(true);
      });

})
