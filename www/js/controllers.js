angular.module('starter.controllers', [])

accountant.controller('AppCtrl', function($scope, $ionicModal, $timeout, $cordovaSQLite, $filter, $state, $ionicLoading) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the earn modal
  $scope.expendData = {};
  $scope.earnData = {};

  // Create the expend modal that we will use later
  $ionicModal.fromTemplateUrl('templates/modals/expend.html', {
    scope: $scope
  }).then(function(expendmodal) {
    $scope.expendmodal = expendmodal;
  });
  $scope.closeExpend = function() {
    $scope.expendmodal.hide();
    $scope.expendData = {};
  };
  $scope.expendModal = function() {
    $scope.expendmodal.show();
  };

  // Create the earn modal that we will use later
  $ionicModal.fromTemplateUrl('templates/modals/earn.html', {
    scope: $scope
  }).then(function(earnmodal) {
    $scope.earnmodal = earnmodal;
  });
  $scope.closeEarn = function() {
    $scope.earnmodal.hide();
    $scope.earnData = {};
  };
  $scope.earnModal = function() {
    $scope.earnmodal.show();
  };


  // Perform the expend action when the user submits the expend form
  $scope.addExpend = function() {
    $ionicLoading.show({ template: '<center><div class="loader"></div><br/>তথ্য জমা হচ্ছে...</center>', noBackdrop: false, delay: 100 });
    console.log('Doing expend', $scope.expendData);
    $scope.today = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
    console.log($scope.today);

    var query = "INSERT INTO expendings(reason, amount, created_at) VALUES (?,?,?)";
    $cordovaSQLite.execute(db, query, [$scope.expendData.reason, $scope.expendData.amount, $scope.today]);

    $timeout(function() {
      $scope.closeExpend();
      $ionicLoading.hide();
    }, 1000);
    $state.go('app.welcome', {}, {location: "replace", reload: true});
  };
  // Perform the expend action when the user submits the earn form
  $scope.addEarn = function() {
    $ionicLoading.show({ template: '<center><div class="loader"></div><br/>তথ্য জমা হচ্ছে...</center>', noBackdrop: false, delay: 100 });
    console.log('Doing earn', $scope.earnData);
    $scope.today = $filter('date')(new Date(), "yyyy-MM-dd HH:mm:ss");
    console.log($scope.today);

    var query = "INSERT INTO earnings(reason, amount, created_at) VALUES (?,?,?)";
    $cordovaSQLite.execute(db, query, [$scope.earnData.reason, $scope.earnData.amount, $scope.today]);

    $timeout(function() {
      $scope.closeEarn();
      $ionicLoading.hide();
    }, 1000);
    $state.go('app.welcome', {}, {location: "replace", reload: true});
  };
})

.controller('WelcomeCtrl', function($scope, $cordovaSQLite, $ionicHistory, $timeout) {
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  $scope.totalEarned = 0;
  $scope.totalExpent = 0;
  $timeout(function() {
    $cordovaSQLite.execute(db, "SELECT SUM(amount) as amount FROM earnings").then(function(result){
      console.log(result);
      if(result.rows.length) {
        $scope.totalEarned = result.rows[0].amount;
        console.log($scope.totalEarned);
      } else {
        console.log('no data');
      }
    }, function(error){
      console.log('error: '+error);
    });
    $cordovaSQLite.execute(db, "SELECT SUM(amount) as amount FROM expendings").then(function(result){
      console.log(result);
      if(result.rows.length) {
        $scope.totalExpent = result.rows[0].amount;
        console.log($scope.totalExpent);
      } else {
        console.log('no data');
      }
    }, function(error){
      console.log('error: '+error);
    });
  }, 1000);
  
})

.controller('CurrentExpendCtrl', function($scope, $cordovaSQLite, $ionicHistory, $ionicModal, $state, $ionicLoading, $timeout, $ionicActionSheet) {
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();

  $scope.showButtons = false;
  $scope.showButtonSettings = function() {
    return $scope.showButtons = !$scope.showButtons;
  }

  $scope.allCurrentData = [];
  $scope.totalCurrent = 0;
  $cordovaSQLite.execute(db, "SELECT id, strftime('%Y-%m-%d', created_at) as created_at, reason, amount FROM expendings ORDER BY created_at DESC").then(function(result){
    console.log(result);
    if(result.rows.length) {
      for(var i=0;i<result.rows.length;i++) {
        $scope.allCurrentData.push(result.rows.item(i));
        $scope.totalCurrent = $scope.totalCurrent + result.rows.item(i).amount;
      }
      console.log($scope.totalCurrent);
    } else {
      console.log('no data');
    }
  }, function(error){
    console.log('error: '+error);
  });

  // Create the edit modal that we will use later
  $ionicModal.fromTemplateUrl('templates/modals/editexpend.html', {
    scope: $scope,
    backdropClickToClose: false
  }).then(function(modalEditExpense) {
    $scope.modalEditExpense = modalEditExpense;
  });
  // Triggered in the edit modal to close it
  $scope.closeEditExpense = function() {
    $scope.modalEditExpense.hide();
    $state.go('app.currentexpent', {}, {location: "replace", reload: true});
  };
  $scope.showEditExpense = function(item) {
    $scope.modalEditExpense.show();
    $scope.editExpendData = item;
  };
  $scope.editExpense = function() {
    console.log($scope.editExpendData);
    $ionicLoading.show({ template: '<center><div class="loader"></div><br/>তথ্য হালনাগাদ হচ্ছে...</center>', noBackdrop: false, delay: 100 });

    var query = "UPDATE expendings set reason=?, amount=? WHERE id=?";
    $cordovaSQLite.execute(db, query, [$scope.editExpendData.reason, $scope.editExpendData.amount, $scope.editExpendData.id]);

    $timeout(function() {
      $scope.closeEditExpense();
      $ionicLoading.hide();
    }, 1000);
    $state.go('app.currentexpent', {}, {location: "replace", reload: true});
  };


  // open delete action sheet
  $scope.showDltExpendActnsht = function(item) {
    $ionicActionSheet.show({
      titleText: 'Confirm Delete?',    
      destructiveText: '<i class="icon ion-trash-a"></i> Delete',
      cancelText: '<i class="icon ion-close"></i> Cancel',
      cancel: function() {
        console.log('Canceled!');
      },
      destructiveButtonClicked: function() {
        $ionicLoading.show({ template: '<center><div class="loader"></div><br/>তথ্য হালনাগাদ হচ্ছে...</center>', noBackdrop: false, delay: 100 });
        $scope.expenseToDelete = item;
        console.log($scope.expenseToDelete);

        var query = "DELETE from expendings WHERE id=?";
        $cordovaSQLite.execute(db, query, [$scope.expenseToDelete.id]);
        console.log('Deleted!');

        $timeout(function() {
          $ionicLoading.hide();
        }, 1000);
        $state.go('app.currentexpent', {}, {location: "replace", reload: true});
      }
    });
  };

})

.controller('CurrentEarnedCtrl', function($scope, $cordovaSQLite, $ionicHistory, $ionicModal, $state, $ionicLoading, $timeout, $ionicActionSheet) {
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();

  $scope.showButtons = false;
  $scope.showButtonSettings = function() {
    return $scope.showButtons = !$scope.showButtons;
  }

  $scope.allCurrentData = [];
  $scope.totalCurrent = 0;
  $cordovaSQLite.execute(db, "SELECT id, strftime('%Y-%m-%d', created_at) as created_at, reason, amount FROM earnings ORDER BY created_at DESC").then(function(result){
    console.log(result);
    if(result.rows.length) {
      for(var i=0;i<result.rows.length;i++) {
        $scope.allCurrentData.push(result.rows.item(i));
        $scope.totalCurrent = $scope.totalCurrent + result.rows.item(i).amount;
      }
      console.log($scope.totalCurrent);
    } else {
      console.log('no data');
    }
  }, function(error){
    console.log('error: '+error);
  });

  // Create the edit modal that we will use later
  $ionicModal.fromTemplateUrl('templates/modals/editearn.html', {
    scope: $scope,
    backdropClickToClose: false
  }).then(function(modalEditEarn) {
    $scope.modalEditEarn = modalEditEarn;
  });
  // Triggered in the edit modal to close it
  $scope.closeEditEarn = function() {
    $scope.modalEditEarn.hide();
    $state.go('app.currentearned', {}, {location: "replace", reload: true});
  };
  $scope.showEditEarn = function(item) {
    $scope.modalEditEarn.show();
    $scope.editEarnData = item;
  };
  $scope.editEarn = function() {
    console.log($scope.editEarnData);
    $ionicLoading.show({ template: '<center><div class="loader"></div><br/>তথ্য হালনাগাদ হচ্ছে...</center>', noBackdrop: false, delay: 100 });

    var query = "UPDATE earnings set reason=?, amount=? WHERE id=?";
    $cordovaSQLite.execute(db, query, [$scope.editEarnData.reason, $scope.editEarnData.amount, $scope.editEarnData.id]);

    $timeout(function() {
      $scope.closeEditEarn();
      $ionicLoading.hide();
    }, 1000);
    $state.go('app.currentearned', {}, {location: "replace", reload: true});
  };


  // open delete action sheet
  $scope.showDltEarnActnsht = function(item) {
    $ionicActionSheet.show({
      titleText: 'Confirm Delete?',    
      destructiveText: '<i class="icon ion-trash-a"></i> Delete',
      cancelText: '<i class="icon ion-close"></i> Cancel',
      cancel: function() {
        console.log('Canceled!');
      },
      destructiveButtonClicked: function() {
        $ionicLoading.show({ template: '<center><div class="loader"></div><br/>তথ্য হালনাগাদ হচ্ছে...</center>', noBackdrop: false, delay: 100 });
        $scope.earningToDelete = item;
        console.log($scope.earningToDelete);

        var query = "DELETE from earnings WHERE id=?";
        $cordovaSQLite.execute(db, query, [$scope.earningToDelete.id]);
        console.log('Deleted!');

        $timeout(function() {
          $ionicLoading.hide();
        }, 1000);
        $state.go('app.currentearned', {}, {location: "replace", reload: true});
      }
    });
  };

})

.controller('MonthlyCtrl', function($scope, $cordovaSQLite, $ionicHistory) {
  $ionicHistory.clearCache();
  $ionicHistory.clearHistory();
  $scope.allCurrentDataEr = [];
  $scope.allCurrentDataEx = [];
  $scope.totalCurrent = 0;
  $cordovaSQLite.execute(db, "SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as earningsamounts FROM earnings GROUP BY strftime('%Y-%m', created_at) ORDER BY strftime('%Y-%m', created_at) DESC").then(function(result){
    console.log(result);
    if(result.rows.length) {
      for(var i=0;i<result.rows.length;i++) {
        $scope.allCurrentDataEr.push(result.rows.item(i));
      }
    } else {
      console.log('no data');
    }
  }, function(error){
    console.log('error: '+error);
  });

  $cordovaSQLite.execute(db, "SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as expendingsamounts FROM expendings GROUP BY strftime('%Y-%m', created_at) ORDER BY id DESC").then(function(result){
    console.log(result);
    if(result.rows.length) {
      for(var i=0;i<result.rows.length;i++) {
        $scope.allCurrentDataEx.push(result.rows.item(i));
      }
    } else {
      console.log('no data');
    }
  }, function(error){
    console.log('error: '+error);
  });

  $scope.Date = function(arg){
    return new Date(arg);
  };
})

// .controller('PlaylistCtrl', function($scope, $stateParams) {
// });
