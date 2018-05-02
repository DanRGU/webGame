angular.module('app.routes', ['ngRoute'])

  .config(function($routeProvider, $locationProvider) {

    $routeProvider

      // route for the home page
      .when('/', {
        templateUrl: 'app/views/pages/home.html'
      })

      // login page
      .when('/login', {
        templateUrl: 'app/views/pages/login.html',
        controller: 'mainController',
        controllerAs: 'login'
      })

      // sign up page
      .when('/signup', {
        templateUrl: 'app/views/pages/signup.html',
        controller: 'mainController',
        controllerAs: 'signup'
      })

      // game page
      .when('/game', {
        templateUrl: '/app/views/pages/game.html',
        controller:'gameController',
        controllerAs: 'game'
      })

      // show all users
      .when('/profile', {
        templateUrl: 'app/views/pages/users/all.html',
        controller: 'userController',
        controllerAs: 'user'
      })


      // page to edit a user
      .when('/profile/:user_id', {
        templateUrl: 'app/views/pages/users/single.html',
        controller: 'userEditController',
        controllerAs: 'user'
      });

    $locationProvider.html5Mode(true);

  });
