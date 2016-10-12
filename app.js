var express = require("express");
var path = require('path')
var app = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);
var fs = require("fs");

//Config EJS
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.engine('.html', require('ejs').__express);
// app.set('/', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

//Config session
var session = require('express-session');
app.use(session(
    {
        secret: '123456789',
        resave: true,
        saveUninitialized: true
    }

    ));
// Routing
var nodemailer = require('nodemailer');

app.use(express.static(__dirname + '/views'));

server.listen(process.env.PORT || 3000);

app.get("/", function(req, res){
    // res.sendFile(__dirname + "/tri-test/index.html");
    res.render("index",{})
});

app.post("/chat-room", jsonParser, function(req, res){
    var user_name = req.body.user_name;
    sess = req.session;
    sess.user_name = user_name;
    // res.sendFile(__dirname + "/tri-test/chat_room.html", { name: user_name });
    res.render("chat_room", { name: user_name });

    // res.send(__dirname + "/tri-test/chat_room.html");
});

var numUsers = 0;
var user_list = [];
var message_list = [];

io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        socket.user_name = username;
        user_list.push(username);
        ++numUsers;
        addedUser = true;

    });



    socket.on("hearing",function(data){
        console.log("I am hearing, " + data.user_name);
        socket.emit('joined', {
            user_list: user_list,
            numUsers: numUsers,
            user_name: socket.user_name
        })

    });



    socket.on("send message",function(data){
        console.log("message is " + data.message_text);
        console.log("user is " + data.user_name);

        var message_info = {
            user_name: data.user_name,
            message_text : data.message_text
        }
        message_list.push(message_info);

        io.sockets.emit("new message",{
            user_name: data.user_name,
            message_text : data.message_text
        })

    });

});