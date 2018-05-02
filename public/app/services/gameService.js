angular.module('gameService', [])

  .factory('Game', function($http) {

    // create a new object
    var gameFactory = {};

    // update a user
    gameFactory.update = function(id, userData) {
      return $http.put('/api/game/' + id, userData);
    };

    gameFactory.getUserInfo = function(username){
      console.log("Getting user info");
      return $http.get('/api/game/' + username);
    }

    // return our entire userFactory object
    return gameFactory;

  });
