var libraryApp = angular.module('libraryApp',['ngMessages','ngResource','ngRoute']);
libraryApp.config(function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl: 'pages/loginScreen.htm',
            controller: 'userLoginController'
        })
        .when('/books',{
            templateUrl: 'pages/booksScreen.htm',
            controller: 'booksController'
        })
        .when('/register',{
            templateUrl: 'pages/registerUserScreen.htm',
            controller: 'registerUserController'
        })
        .when('/admin',{
            templateUrl: 'pages/adminScreen.htm',
            controller: 'adminController'
        })
        .when('/adminBooks',{
            templateUrl: 'pages/adminBookScreen.htm',
            controller: 'adminBookController'
        })
        .when('/adminUsers',{
            templateUrl: 'pages/adminUserScreen.htm',
            controller: 'adminUserController'
        })
});
libraryApp.service('user',function(){
    this.name='';
})
libraryApp.controller('userLoginController',['$scope','$resource','$location','user',function($scope,$resource,$location,user){
    $scope.user = {
        username: '',
        password: ''
    };
    $scope.validateUser = function(){
        var validateUserApi = $resource('/');
        validateUserApi.save({username:$scope.user.username,password:$scope.user.password},function(response){
            console.log(response);
            switch(response.validUser){
                case true:
                    $scope.showInvalidUser=false;
                    user.name=$scope.user.username;
                    if(response.isAdmin) $location.path("/admin");
                    else $location.path("/books");
                    break;
                case false:
                    $scope.showInvalidUser=true;
            } 
            
        });
    };
}]);
libraryApp.controller('booksController',['$scope','$resource','$location','user',
function($scope,$resource,$location,user){
    if(user.name){
        $scope.username = user.name;
        $scope.book = {
            name:'',
            author:'',
            genre:''
        };
        $scope.books=[];
        $scope.genres=[];
        
        function populateBooks(){
            var getBooksApi = $resource('/books');
            getBooksApi.query({name: $scope.book.name,author: $scope.book.author,genre: $scope.book.genre},function(response){
                if($scope.books.length===0){
                    response.forEach(function(abook){
                        $scope.genres.push(abook.genre);
                        console.log($scope.genres);
                    });
                    $scope.genres = $scope.genres.sort().reduce(function(a, b){ if (b != a[a.length-1]) {a.push(b);console.log(a);} return a }, []);
                    console.log($scope.genres);
                }
                $scope.books=response;
                return $scope.books;
            });
        };

        $scope.$watchGroup(['book.name','book.author','book.genre'],populateBooks);

        $scope.issueBook = function(bookid){
            console.log(bookid);
            var issueBk = $resource('/issueBook',{},{query: {method: 'get',isArray: false}});
            issueBk.query({bookid: bookid,username: $scope.username},function(response){
                console.log(response);
                if(response.nModified===1)
                    swal('Hurray!!','The book has been issued to you');
                else
                    swal('Sorry!!','The book could not be issued');
                populateBooks();
            });
        };
        $scope.returnBook = function(bookid){
            console.log(bookid);
            var returnBk = $resource('/returnBook',{},{query: {method: 'get',isArray: false}});
            returnBk.query({bookid: bookid,username: $scope.username},function(response){
                console.log(response);
                if(response.nModified===1)
                    swal('Thank You!!', 'Book Returned');
                else
                    swal('Sorry!!','The book could not be returned');
                populateBooks();
            });
        };
    }else $location.path("/");
}]);

libraryApp.controller('registerUserController',['$scope','$resource','$location','user',function($scope,$resource,$location,user){
    $scope.user = {
        username: '',
        password: '',
        email: ''
    };
    $scope.registerUser = function(){
        if($scope.user.username.length>0 && $scope.user.password.length>0  && $scope.user.email.length>0){
            var registerUser = $resource('/register');
            registerUser.save({username: $scope.user.username,
                password: $scope.user.password,
                email: $scope.user.email
            },function(response){
                if(response.success){
                    swal('Done!!', 'Registration Completed');
                    user.name=$scope.user.username;
                    $location.path("/books");
                }else if(response.username === 'taken')
                    swal('Sorry!!','This username has been taken');
                else swal('Sorry!!','Registration could not be completed');
            });
        }else $scope.requiredFieldMissing=true;
    }
}]);

libraryApp.controller('adminController',['$scope','$location','user',function($scope,$location,user){
    if(user.name)
        $scope.username = user.name;
    else
        $location.path('/');
}]);

libraryApp.controller('adminBookController',['$scope','$resource','$location','user',
function($scope,$resource,$location,user){
    if(user.name){
        $scope.username = user.name;
        $scope.book = {
            name:'',
            author:'',
            genre:''
        };
        $scope.newBook = {
            name:'',
            author:'',
            genre:'',
            qty: ''
        };
        $scope.books=[];
        $scope.genres=[];
        
        function populateBooks(){
            var getBooksApi = $resource('/books');
            getBooksApi.query({name: $scope.book.name,author: $scope.book.author,genre: $scope.book.genre},function(response){
                if($scope.books.length===0){
                    response.forEach(function(abook){
                        $scope.genres.push(abook.genre);
                    });
                    $scope.genres = $scope.genres.sort().reduce(function(a, b){ if (b != a[a.length-1]) a.push(b); return a }, []);
                }
                $scope.books=response;
                return $scope.books;
            });
        };

        $scope.$watchGroup(['book.name','book.author','book.genre'],populateBooks);

        $scope.addBook = function(bookid){
            console.log(bookid);
            var addBk = $resource('/addBook',{},{query: {method: 'get',isArray: false}});
            addBk.query({bookid: bookid},function(response){
                console.log(response);
                if(response.nModified===1)
                    swal('Hurray!!','1 Book added to the Library');
                else
                    swal('Sorry!!','The book could not be added');
                populateBooks();
            });
        };
        $scope.addNewBook = function(){
            var addNewBk = $resource('/addNewBook',{},{query: {method: 'get',isArray: false}});
            addNewBk.query({name: $scope.newBook.name, author: $scope.newBook.author, genre: $scope.newBook.genre,
                qty: $scope.newBook.qty},function(response){
                console.log(response);
                if(response.success){
                    swal('Hurray!!','New Book added to the Library');
                    populateBooks();
                }else if(response.book === 'exists')
                    swal('Hey!!','The book already exists in the Library');
                else
                    swal('Sorry!!','The book could not be added');
            });
        };
        $scope.removeBook = function(bookid){
            console.log(bookid);
            var removeBk = $resource('/removeBook',{},{query: {method: 'get',isArray: false}});
            removeBk.query({bookid: bookid},function(response){
                console.log(response);
                if(response.nModified===1)
                    swal('Hmm..', 'Book Removed');
                else
                    swal('Sorry!!','The book could not be removed');
                populateBooks();
            });
        };
    }else $location.path("/");
}]);

libraryApp.controller('adminUserController',['$scope','$resource','$location','user',function($scope,$resource,$location,user){
    if(user.name){
        $scope.username = user.name;
        $scope.user = {
            name:'',
            email:''
        };
        $scope.users=[];
        
        function populateUsers(){
            var getUsersApi = $resource('/users');
            getUsersApi.query({name: $scope.user.name},function(response){
                $scope.users=response;
            });
        };

        $scope.$watch('user.name',populateUsers);
    }else
        $location.path('/');
}]);