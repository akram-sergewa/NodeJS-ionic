/* global angular, document, window */
'use strict';

angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, AuthService, AUTH_EVENTS, $ionicModal, $ionicPopover, $timeout) {

 
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    $scope.logout = function(){
        AuthService.logout();
        $state.go('app.login');
    };

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
})

.controller('LoginCtrl', function($scope, $timeout, $stateParams, $state, AuthService, $ionicPopup, ionicMaterialInk) {

    $scope.user = {
    name: '',
    password: ''
  };
 

  $scope.login = function() {
    AuthService.login($scope.user).then(function(msg) {
      $state.go('app.activity');
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: errMsg
      });
    });
  };



 // AuthService.login($scope.user).then(function(msg) {
 //      $state.go('app.profile');
 //    }, function(errMsg) {
 //      var alertPopup = $ionicPopup.alert({
 //        title: 'Login failed!',
 //        template: errMsg
 //      });
 //    });
  

    $scope.$parent.clearFabs();
    $timeout(function() {
        $scope.$parent.hideHeader();
    }, 0);
    ionicMaterialInk.displayEffect();
})

.controller('newPostCtrl', function($scope, $timeout, $stateParams, $state, multipartForm, API_ENDPOINT, AuthService, $ionicPopup, ionicMaterialInk, ionicMaterialMotion) {
// Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');

    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in'
        });
    }, 200);


    // Set Ink
    ionicMaterialInk.displayEffect();

    $scope.newPost = {};
    $scope.submit = function(){
        var uploadUrl = API_ENDPOINT.url + '/posts/addpost';
        multipartForm.post(uploadUrl, $scope.newPost);
        $state.go("app.activity");
    }
})

.controller('FriendsCtrl', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.$parent.setHeaderFab('left');

    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        $scope.$parent.setExpanded(true);
    }, 300);

    // Set Motion
    ionicMaterialMotion.fadeSlideInRight();

    // Set Ink
    ionicMaterialInk.displayEffect();
})

.controller('ProfileCtrl', function($scope, $stateParams, $ionicPopup, $timeout, multipartForm, API_ENDPOINT, $http, ionicMaterialMotion, ionicMaterialInk) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.myInfo = {};

    $scope.adressChanged = false;
    $scope.workPlaceChanged = false;
    $scope.telphoneChanged = false;
    $scope.educationChanged = false;
    $scope.profileImageChanged = false;
    $scope.inputData = {};

    $scope.profileImagePath;

     $scope.getMyInfo = function() {
        $http.get(API_ENDPOINT.url + '/user/getMyInfo').then(function(result) {
          $scope.myInfo = result.data.myInfo;
          $scope.profileImagePath = result.data.profileImagePath;
          console.log($scope.myInfo);
        });
      };

      $scope.updateName = function() {

         

          // An elaborate, custom popup
          var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="inputData.name">',
            title: 'ادخل الاسم',
            scope: $scope,
            buttons: [
              { text: 'Cancel' },
              {
                text: '<b>Save</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.inputData.name) {
                    //don't allow the user to close unless he enters wifi password
                    e.preventDefault();
                  } else {
                    return $scope.inputData.name;
                  }
                }
              }
            ]
          });

          myPopup.then(function(res) {
            $http.post(API_ENDPOINT.url + '/user/updateMyName', {name : res}).then(function (res){
            //$scope.response = res.data;
                if (res.data.success){

                }
            });
          });





      }

      $scope.updateAddress = function(address) {
        $http.post(API_ENDPOINT.url + '/user/updateMyAddress', {address : address}).then(function (res){
            //$scope.response = res.data;
            if (res.data.success){

            }
        });
      };

       $scope.updateWorkPlace = function(workPlace) {
        $http.post(API_ENDPOINT.url + '/user/updateMyWorkPlace', {workPlace : workPlace}).then(function (res){
            //$scope.response = res.data;
            if (res.data.success){
                
            }
        });
      };

       $scope.updateEducation = function(education) {
        $http.post(API_ENDPOINT.url + '/user/updateMyEducation', {education : education}).then(function (res){
            //$scope.response = res.data;
            if (res.data.success){
                
            }
        });
      };

       $scope.updateTelephone = function(telephone) {
        $http.post(API_ENDPOINT.url + '/user/updateMyTelephone', {telephone : telephone}).then(function (res){
            //$scope.response = res.data;
            if (res.data.success){
                
            }
        });
      };
    
    $scope.profileImage = {};
      $scope.uploadProfileImage = function(){
                var uploadUrl = API_ENDPOINT.url + '/user/uploadProfileImage';
                multipartForm.post(uploadUrl, $scope.profileImage);
      }


    // Set Motion
    $timeout(function() {
        ionicMaterialMotion.slideUp({
            selector: '.slide-up'
        });
    }, 300);

    $timeout(function() {
        ionicMaterialMotion.fadeSlideInRight({
            startVelocity: 3000
        });
    }, 700);

    // Set Ink
    ionicMaterialInk.displayEffect();
})

.controller('ActivityCtrl', function($scope, $stateParams, $state, AuthService, API_ENDPOINT, currentPostService, $http, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');
    $scope.posts = [];

    $scope.pageNumber = 1;
    $scope.endOfPosts = false;

    $scope.getPosts = function() {

        $http.get(API_ENDPOINT.url + '/posts/getLatestPosts?pageNumber='+$scope.pageNumber).then(function(result) {
          $scope.posts = result.data.posts;
        });
        $scope.pageNumber = $scope.pageNumber + 1;
        console.log(JSON.stringify($scope.loginData));
      };


    $scope.updatePostsList = function() {

        $http.get(API_ENDPOINT.url + '/posts/getLatestPosts?pageNumber='+$scope.pageNumber).then(function(result) {
          $scope.posts = $scope.posts.concat(result.data.posts);
          $scope.$broadcast('scroll.infiniteScrollComplete');

         
          if (result.data.endOfPosts == true){
            $scope.endOfPosts = true;
            console.log("endOfPosts is true"+$scope.posts.length);
          }
        });
        $scope.pageNumber = $scope.pageNumber + 1;
      };


      $scope.getPost = function(post_id) {
        currentPostService.currentPost_id = post_id;
        $state.go("app.post", {'post_id': post_id});
      }



    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();
})

.controller('MyPostsCtrl', function($scope, $stateParams, $state, AuthService, API_ENDPOINT, currentPostService, $http, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');
    $scope.posts = [];

    $scope.pageNumber = 1;
    $scope.endOfPosts = false;

    $scope.getPosts = function() {

        $http.get(API_ENDPOINT.url + '/posts/getMyPosts?pageNumber='+$scope.pageNumber).then(function(result) {
          $scope.posts = result.data.posts;
        });
        $scope.pageNumber = $scope.pageNumber + 1;
        console.log(JSON.stringify($scope.loginData));
      };


    $scope.updatePostsList = function() {

        $http.get(API_ENDPOINT.url + '/posts/getMyPosts?pageNumber='+$scope.pageNumber).then(function(result) {
          $scope.posts = $scope.posts.concat(result.data.posts);
          $scope.$broadcast('scroll.infiniteScrollComplete');

         
          if (result.data.endOfPosts == true){
            $scope.endOfPosts = true;
            console.log("endOfPosts is true"+$scope.posts.length);
          }
        });
        $scope.pageNumber = $scope.pageNumber + 1;
      };


      $scope.getPost = function(post_id) {
        currentPostService.currentPost_id = post_id;
        $state.go("app.post", {'post_id': post_id});
      }



    $timeout(function() {
        ionicMaterialMotion.fadeSlideIn({
            selector: '.animate-fade-slide-in .item'
        });
    }, 200);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();
})


.controller('PostCtrl', function($scope, $stateParams, $state, $window, $http, $timeout, $ionicPopup, currentPostService, API_ENDPOINT, ionicMaterialInk, ionicMaterialMotion) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(false);
    $scope.comment = [];
    $scope.comments = [];


    $scope.deletePost = function(){
        $http.post(API_ENDPOINT.url + '/posts/deletePost', {post_id: $stateParams.post_id}).then(function(result) {
            $state.go("app.activity");

        });
    }
    $scope.deleteComment = function(comment_id){
         // A confirm dialog
             
               var confirmPopup = $ionicPopup.confirm({
                 title: 'Remove comment',
                 template: 'Are you sure you want to remove the comment?'
               });

               confirmPopup.then(function(res) {
                 if(res) {
                   

                        $http.post(API_ENDPOINT.url + '/posts/deleteComment', {comment_id: comment_id}).then(function(result) {
                            if (result.data.success){
                                       var alertPopup = $ionicPopup.alert({
                                         title: 'Comment was removed',
                                         template: 'Comment was removed'
                                       });

                                       alertPopup.then(function(res) {
                                        $state.reload();
                                       });
                                     
                            }else{
                                       var alertPopup = $ionicPopup.alert({
                                         title: 'Failed to remove the comment',
                                         template: 'Failed to remove the comment'
                                       });

                                       alertPopup.then(function(res) {
                                        $state.reload();
                                       });
                                     
                            }

                        });


                 } else {
                   console.log('You are not sure');
                 }
               });
             

        
    }

    $scope.submitComment= function(){
        $http.post(API_ENDPOINT.url + '/posts/addComment', {post_id: $stateParams.post_id, comment: $scope.comment.comment}).then(function(result) {
             $window.location.reload();


        });
    }
     $scope.getPost = function() {
        //console.log("this"+currentPostService.currentPost_id);
        //console.log("stateParams.post_id " + $stateParams.post_id);
        $http.get(API_ENDPOINT.url + '/posts/getPost?post_id='+$stateParams.post_id).then(function(result) {
          $scope.post = result.data.post;
          $scope.comments = result.data.comments;

          console.log('comments '+result.data.comments.length);
        });
        
        
      }

    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    ionicMaterialMotion.pushDown({
        selector: '.push-down'
    });
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });

})

.controller('RegisterCtrl', function($scope, AuthService, $ionicPopup, $state) {
  $scope.user = {
    name: '',
    password: ''
  };
 
  $scope.signup = function() {
    AuthService.register($scope.user).then(function(msg) {
      $state.go('outside.login');
      var alertPopup = $ionicPopup.alert({
        title: 'Register success!',
        template: msg
      });
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Register failed!',
        template: errMsg
      });
    });
  };
})

.controller('GalleryCtrl', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab(false);

    // Activate ink for controller
    ionicMaterialInk.displayEffect();

    ionicMaterialMotion.pushDown({
        selector: '.push-down'
    });
    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });

})

;
