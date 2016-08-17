var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var books = require('./model').books;
var users = require('./model').users;

var app = express();

var jsonParser = bodyParser.json();

mongoose.connect(config.getDbURL());

app.use('/',express.static(__dirname + '/public',{index: 'index.htm'}));

app.post('/',jsonParser,function(req,res){
    users.find({username: req.body.username},function(err,data){
        if(err) throw err;
        console.log(data);
        console.log(data[0].password);
        console.log(data[0].isAdmin);
        if(data[0] && data[0].username === req.body.username && data[0].password === req.body.password){
            if(data[0].isAdmin) res.send({validUser:true,isAdmin:true}); 
            else res.send({validUser:true});
        }else{
            res.send({validUser:false});
        }
    });
    console.log(req.body.username);
    console.log(req.body.password);
});

app.get('/books',function(req,res){
    console.log(req.query.name);
    console.log(req.query.author);
    console.log(req.query.genre);
    books.find({name: new RegExp(req.query.name,'i'),
                author: new RegExp(req.query.author,'i'),
                genre: new RegExp(req.query.genre,'i')},function(err,data){
        if(err) throw err;
        console.log(data);
        res.send(data);
    });
});

app.get('/users',function(req,res){
    console.log(req.query.name);
    users.find({username: new RegExp(req.query.name,'i')},function(err,data){
        if(err) throw err;
        console.log(data);
        res.send(data);
    });
});

app.get('/issueBook',function(req,res){
    console.log(req.query.bookid);
    console.log(req.query.username);
    books.update({ _id: req.query.bookid },{ $inc: {count:-1}, $push: {issuedTo: req.query.username} },function(err,datanumAffected){
        if(err) throw err;
        console.log(datanumAffected);
        res.send(datanumAffected);
    });
});

app.get('/returnBook',function(req,res){
    books.update({ _id: req.query.bookid },{ $inc: {count:1}, $pull: {issuedTo: req.query.username} },function(err,datanumAffected){
        if(err) throw err;
        console.log(datanumAffected);
        res.send(datanumAffected);
    });
});

app.post('/register',jsonParser,function(req,res){
    console.log(req.body.username);
    console.log(req.body.password);
    console.log(req.body.email);
    var user = new users({username: req.body.username, password: req.body.password, email: req.body.email});
    users.find({username: user.username},function(err,userdata){
        console.log(userdata);
        if(userdata.length === 0){            
            user.save(function(err,savedUserData){
                if(err) throw err;
                if(savedUserData.username === req.body.username)
                    res.send({success: true});
                else
                    res.send({success: false});
            });
        }else res.send({success: false, username: 'taken'});
    });
});

app.get('/addBook',function(req,res){
    console.log(req.query.bookid);
    books.update({ _id: req.query.bookid },{ $inc: {count:1}},function(err,datanumAffected){
        if(err) throw err;
        console.log(datanumAffected);
        res.send(datanumAffected);
    });
});

app.get('/addNewBook',function(req,res){
    console.log(req.query);
    var book = new books({name: req.query.name, author: req.query.author, genre: req.query.genre,
        count: req.query.qty, issuedTo: []});
    books.find({name: book.name, author: book.author, genre: book.genre, count: book.count, issuedTo: book.issuedTo},
    function(err,userdata){
        if(userdata.length === 0){
            book.save(function(err,savedUserData){
                if(err) throw err;
                if(savedUserData.name === req.query.name)
                    res.send({success: true});
                else
                    res.send({success: false});
            });
        }else res.send({success: false,book: 'exists'});
    });
});

app.get('/removeBook',function(req,res){
    console.log(req.query.bookid);
    books.update({ _id: req.query.bookid },{ $inc: {count:-1}},function(err,datanumAffected){
        if(err) throw err;
        console.log(datanumAffected);
        res.send(datanumAffected);
    });
});

app.listen(3000);
