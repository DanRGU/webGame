angular.module('SocketFactory', [])

.factory('Socket',['socketFactory',function(socketFactory){
  return socketFactory();
}])
