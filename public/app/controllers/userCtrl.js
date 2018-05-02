angular.module('userCtrl', ['userService'])

  .controller('userController', function(User, Auth, $location, $scope) {

    var vm = this;

    // set a processing variable to show loading things
    vm.processing = true;
$scope.$on('$routeChangeSuccess',function(){

console.log("working");
    Auth.getUser().then(function (response) {

        vm.username = response.data.username;
        vm.name = response.data.name;
          // grab all the users at page load
          User.all()
            .then(function(data) {

              // when all the users come back, remove the processing variable
              vm.processing = false;
              //Set the variables for the current user
              for(var i=0;i<data.data.length;i++){
                if(data.data[i].username === vm.username){
                  vm._id = data.data[i]._id;
                  vm.kills = data.data[i].kills;
                  vm.level = data.data[i].level;
                }
              }
            });
    });
});

    // function to delete a user
    vm.deleteUser = function(id) {
      vm.processing = true;

      User.delete(id)
        .then(function(data) {

          Auth.logout();
          //vm.user = '';
          vm.user = {};
          $location.path('/');

        });
    };

  })


  // controller applied to user edit page
  .controller('userEditController', function($routeParams, User, $location) {

    var vm = this;

    // variable to hide/show elements of the view
    // differentiates between create or edit pages
    vm.type = 'edit';

    // get the user data for the user you want to edit
    // $routeParams is the way we grab data from the URL
    User.get($routeParams.user_id)
      .then(function(data) {
        vm.userData = data;
      });

    // function to save the user
    vm.saveUser = function() {
      vm.processing = true;
      vm.message = '';

      // call the userService function to update
      User.update($routeParams.user_id, vm.userData)
        .then(function(data) {
          vm.processing = false;

          // clear the form
          vm.userData = {};

          // bind the message from our API to vm.message
          vm.message = data.message;
          $location.path('/profile');
        });
    };

  });
