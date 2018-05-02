angular.module('mainCtrl', ['userService'])

  .controller('mainController', function($rootScope, $location, Auth, User) {


        var vm = this;
$rootScope.$on('$routeChangeSuccess',function(){
  console.log("working2");
        Auth.getUser()
          .then(function (response) {
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
                    }
                  }
                });
        });
      });

    // set a processing variable to show loading things
    vm.processing = false;

    // get info if a person is logged in
    vm.loggedIn = Auth.isLoggedIn();

    // check to see if a user is logged in on every request
    $rootScope.$on('$routeChangeStart', function() {
      vm.loggedIn = Auth.isLoggedIn();

      // get user information on page load
      Auth.getUser()
        .then(function(response) {
          vm.user = response.data;
        });
    });

    // function to handle login form
    vm.doLogin = function() {
      vm.processing = true;

      // clear the error
      vm.error = '';

      Auth.login(vm.loginData.username, vm.loginData.password)
        .then(function(data) {
          console.log('Auth.login', data);
          vm.processing = false;

          // if a user successfully logs in, redirect to users page
          if (data.success)
            $location.path('/profile');
          else
            vm.error = data.message;

        });
    };

    vm.doSignup = function(){
      vm.processing = true;
      vm.message = '';
      vm.userData.kills = 0;
      vm.userData.level = 1;
      // use the create function in the authService
      Auth.create(vm.userData)
        .then(function(data) {
          console.log(data);
          vm.processing = false;
          vm.userData = {};
          vm.message = data.message;

          if(data.success!= null){
            console.log("Error in signup");
            vm.message = data.message;
            console.log(vm);

          }
          else{
            $location.path('/login');
            console.log("Redirecting to login");
            console.log(vm.message);
          }
        });
    };

    // function to handle logging out
    vm.doLogout = function() {
      Auth.logout();
      //vm.user = '';
      vm.user = {};

      $location.path('/');
    };

  });
