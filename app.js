
var utilities = require("./utilities");

var express = require("express");
var request = require('request');
var path = require('path');
var app = express();
var server = require("http").createServer(app);
// var io = require('socket.io')(server);
var fs = require("fs");
var bcrypt = require('bcrypt');
// Create a password salt
var salt = bcrypt.genSaltSync(10);

//Config EJS
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('.html', require('ejs').__express);
// app.set('/', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));



//Config Express
app.use(express.static(__dirname + '/views'));

server.listen(process.env.PORT || 8000);


//Config session
//TODO generate secret for Node session instead of sateraito_secret
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());
app.use(session(
    {
        secret: 'fhfasiHJBBFLFLDASBDAGDadadaasl12',
        resave: false,
        saveUninitialized: true
    }
));


app.get("/", function (req, res) {

    getExternalIp(function (externalIp) {
        res.render('home', {externalIp: externalIp});
    });

    // if(req.session.user_id){
    //     res.redirect("/main-space")
    // }else{
    //     res.render("home", {})
    // }

});

// app.get("/home", function (req, res) {
//     console.log("req.session.user_id",req.session.user_id);
//     if(req.session.user_id){
//         res.redirect("/main-space")
//     }else{
//         res.render("index", {})
//     }
//
// });





app.get("/logout", function (req, res) {
    req.session.user_id = null;
    req.session.user_email = null;
    res.redirect("/");

});

app.get("/sign-up", function (req, res) {

    getExternalIp(function (externalIp) {
        console.log("gfsdsagfsadas");
        console.log(io);
        res.render('sign-up', {externalIp: externalIp});
    });
});

app.post("/do-sign-up", jsonParser, function (req, res) {
    //Create MySQL connection
    var email = req.body.email;
    var password = req.body.password;
    var password_again = req.body.password_again;

    //Check password and password_again is matched or not
    if (password != password_again) {
        res.json({"status": "password error"})
    }

    //Check email is existed or not
    utilities.runPGQuery("SELECT * FROM UserInfo WHERE email = '" + email + "'",function (rows) {
        //Email is already registered
        if (rows.length == 0) {
            //Create new account in DB
            var new_user_id = utilities.generateUserId();
            // Salt and hash password
            var hash_password = bcrypt.hashSync(password, salt)
            // var post = {id: new_user_id, email: email, password: hash_password};
            var insert_user_string = "INSERT INTO UserInfo (id, user_name, password, validation_code, is_validated, email, last_name, first_name, friend_list, conversation_list, birthday, address, company, created_date, updated_datetime) VALUES ('"+new_user_id+"', '', '"+hash_password+"', '', 0, '"+email+"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)";
            utilities.runPGQuery(insert_user_string,function (result) {;
                req.session.user_id = new_user_id;
                req.session.user_email = email;
                console.log("registered!!");
                res.json({"status": "ok"})
            });

        } else {
            console.log("email is already existed");
            res.json({"status": "email existed"})
        }

    });

});

app.post("/user-login", jsonParser, function (req, res) {

    var email = req.body.email;
    console.log("email param is");
    console.log(email);
    var password = req.body.password;

    utilities.runPGQuery("SELECT * FROM UserInfo WHERE email = '" + email + "'",function (rows) {
        if (rows.length > 0) {
            //check if password is OK
            bcrypt.compare(password, rows[0].password, function (err, matches) {
                if (err) {
                    console.log('Error while checking password');
                } else if (matches) {
                    req.session.user_id = rows[0].id;
                    req.session.user_email = email;

                    res.json({"status": "ok"})
                    console.log("login ok");

                } else {
                    res.json({"status": "invalid account"})
                    console.log("password wrong");

                }

            });

        } else {
            //Email is not ok
            res.json({"status": "invalid account"});
            console.log("email wrong");

        }
        
    });


});

app.get("/main-space", function (req, res) {
    console.log("req.session.user_id", req.session.user_id);
    if (req.session.user_id) {
        utilities.runPGQuery("SELECT * FROM UserInfo WHERE email = '"+req.session.user_email+"'",function (rows) {
            if (rows.length > 0){
                var user_friend_list = rows[0].friend_list;
                var user_conversation_list = rows[0].conversation_list;
                res.render("main_space", {
                    user_email: req.session.user_email,
                    user_id: req.session.user_id,
                    user_friend_list: user_friend_list,
                    user_conversation_list: user_conversation_list
                })
            };
        });


    }
    else {
        res.redirect("/");
    }

});


app.post("/add-user-list", jsonParser, function (req, res) {
    var member_list = req.body.member_list;
    var user_email = req.session.user_email;

    //Update friend list of user
    utilities.runPGQuery("SELECT * FROM UserInfo WHERE email = '" + user_email + "'", function (rows) {
        if (rows.length > 0) {
            var current_friend_list = rows[0].friend_list;
            var new_friend_list = null;


            if (current_friend_list) {
                var current_friend_array = current_friend_list.split(",");
                member_list.split(",").forEach(function (val, i) {
                    if (current_friend_array.indexOf(val) == -1) {
                        current_friend_array.push(val);

                    }
                    new_friend_list = current_friend_array.toString();
                });

            } else {
                new_friend_list = member_list;
            }

            if (new_friend_list) {
                //Update user friend list
                utilities.runPGQuery("UPDATE UserInfo SET friend_list = '" + new_friend_list + "' WHERE email = '" + user_email + "'",
                    function (result) {
                    });
            }



            res.json({"status": "ok"});


        } else {
            //Email is not ok
            res.json({"status": "invalid account"});
            console.log("email wrong");

        }

    });
});

app.post("/send-a-message", jsonParser, function (req, res) {
    var sender = req.body.sender;
    var receiver = req.body.receiver;
    var conversation_id = req.body.conversation_id;
    var message_text = req.body.message_text;
    var user_conversation_list = req.body.user_conversation_list;

    //If this is a new conversation
    if(user_conversation_list.split(",").indexOf(conversation_id) == -1){

        var member_array = receiver.split(",");
        member_array.push(sender);

        //TODO catch error while operate query

        //Create new conversation into database
        utilities.runPGQuery("INSERT INTO Conversation (id, organizer, member, memo, todo) VALUES ('"+conversation_id+"', '"+sender+"', '"+member_array.toString()+"', NULL, NULL)",function (rows) {

        });

        //Update conversation list to sender
        var new_conversation_array = user_conversation_list.split(",");
        new_conversation_array.push(conversation_id);
        utilities.runPGQuery("UPDATE UserInfo SET conversation_list = '"+new_conversation_array.toString()+"' WHERE email = '"+sender+"'",function (rows) {

        });

        //update conversation list to receiver
        receiver.split(",").forEach(function (val,i) {
            utilities.runPGQuery("SELECT * from UserInfo WHERE email = '"+val+"'",function (rows) {
                if(rows.length > 0){
                    var receiver_conversation_array = rows[0].conversation_list.split(",");
                    receiver_conversation_array.push(conversation_id);
                    utilities.runPGQuery("UPDATE UserInfo SET conversation_list = '"+receiver_conversation_array.toString()+"' WHERE email = '"+val+"'",function (rows) {

                    });

                }

            });


        });

    }

    //Then add this message to database
    //Create new conversation into database
    var message_id = utilities.generateMessageId()
    utilities.runPGQuery("INSERT INTO message_info (id, conversation_id, content, sender, receiver) VALUES ('"+message_id+"','"+conversation_id+"', '"+message_text+"', '"+sender+"', '"+receiver+"')",function (rows) {
    });



});


app.post("/continue-conversation", jsonParser, function (req, res) {
    var conversation_id = req.body.conversation_id;

    utilities.runPGQuery("SELECT * FROM Conversation WHERE id = '"+conversation_id+"'",function (results) {
        if (results.length > 0){

            //TODO Load messages of conversation, implement limit
            utilities.runPGQuery("SELECT * FROM message_info WHERE conversation_id = '"+conversation_id+"' ORDER BY created_datetime ASC",function (rows) {

                res.json({message_list: rows , organizer: results[0].organizer , member: results[0].member})

            });

        }


    });






});

// [START external_ip]
// In order to use websockets on App Engine, you need to connect directly to
// application instance using the instance's public external IP. This IP can
// be obtained from the metadata server.
var METADATA_NETWORK_INTERFACE_URL = 'http://metadata/computeMetadata/v1/' +
    '/instance/network-interfaces/0/access-configs/0/external-ip';

function getExternalIp (cb) {
    var options = {
        url: METADATA_NETWORK_INTERFACE_URL,
        headers: {
            'Metadata-Flavor': 'Google'
        }
    };

    request(options, function (err, resp, body) {
        if (err || resp.statusCode !== 200) {
            console.log('Error while talking to metadata server, assuming localhost');
            return cb('localhost');
        }
        return cb(body);
    });
}


// setup new webserver for socket.io listening on 65080
var app_chat = require('express')();
var server1 = require('http').Server(app_chat);
var io = require('socket.io')(server1);
server1.listen(65080);

io.on('connection', function (socket) {
    console.log('user connected');
    socket.on('chat_message', function (data) {
        console.log('client sent:',data);
        socket.emit('chat_message', 'Server is echoing your message: ' + data);
    });
});


// io.on('connection', function (socket) {
//
//     socket.emit('news', { hello: 'world' });
//
//     socket.on("just enter",function (data) {
//         console.log("There is a person entered. His name is ", data.name);
//         io.sockets.emit("welcome",{name: data.name})
//     });
//
//     //TODO send the message to only conversation's member
//
//     socket.on("send a message", function (data) {
//         var room = "room numner 1";
//         socket.join(room);
//         io.sockets.in(room).emit("notify a new message", {
//             sender: data.sender,
//             receiver: data.receiver,
//             message_text: data.message_text,
//             conversation_id: data.conversation_id,
//             room: room
//         })
//
//     });
//
//     socket.on("typing",function (data) {
//         io.sockets.emit("notify typing",{
//             sender: data.sender,
//             receiver: data.receiver,
//             conversation_id: data.conversation_id
//
//         });
//
//     });
//
//     socket.on("stop typing",function (data) {
//         io.sockets.emit("notify stop typing",{
//             sender: data.sender,
//             receiver: data.receiver,
//             conversation_id: data.conversation_id
//         });
//
//     });
//
// });
