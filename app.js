var utilities = require("./utilities");

var express = require("express");
var path = require('path');
var app = express();
var server = require("http").createServer(app);
var io = require('socket.io')(server);
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

// Routing
var nodemailer = require('nodemailer');


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




// var pg = require('pg');
//
// app.get('/', function (request, response) {
//     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
//         client.query('SELECT * FROM test_table', function(err, result) {
//             done();
//             if (err)
//             { console.error(err); response.send("Error " + err); }
//             else
//             { response.render('pages/db', {results: result.rows} ); }
//         });
//     });
// });



app.get("/", function (req, res) {

    res.send("Hello world");

    // res.render("index", {})
});

app.get("/sign-up", function (req, res) {

    res.render("sign-up", {})
});

app.post("/do-sign-up", jsonParser, function (req, res) {
    //Create MySQL connection
    var connection = utilities.getMySqlConnection();
    var email = req.body.email;
    var password = req.body.password;
    var password_again = req.body.password_again;

    //Check password and password_again is matched or not
    if (password != password_again) {
        res.json({"status": "password error"})
    }

    //Check email is existed or not
    connection.query('SELECT * FROM UserInfo WHERE email="' + email + '"', function (err, rows) {
        if (!err) {
            //Email is already registered
            if (rows.length == 0) {
                //Create new account in DB
                var new_user_id = utilities.generateUserId();
                // Salt and hash password
                var hash_password = bcrypt.hashSync(password, salt)
                var post = {id: new_user_id, email: email, password: hash_password};
                connection.query('INSERT INTO UserInfo SET ?', post, function (err, rows) {
                    if (!err) {
                        if (rows.affectedRows == 1) {
                            console.log("registereddffdsfs");
                            req.session.user_id = new_user_id;
                            req.session.user_email = email;

                            //Close connection
                            connection.end(function (err) {

                            });
                            console.log("registered!!");
                            res.json({"status": "ok"})


                        } else {
                            //Close connection
                            connection.end(function (err) {

                            });
                            console.log("registered failed");
                            res.json({"status": "db error"})

                        }


                    } else {
                        console.log('Error while Sign up new user');
                    }


                });


            } else {
                //Close connection
                connection.end(function (err) {

                });
                console.log("email is already existed");
                res.json({"status": "email existed"})
            }


        } else {
            console.log('Error while Check user existing');

        }


    });


});

app.post("/user-login", jsonParser, function (req, res) {
    //Create MySQL connection
    var connection = utilities.getMySqlConnection();
    var email = req.body.email;
    var password = req.body.password;


    connection.query('SELECT * FROM UserInfo WHERE email="' + email + '"', function (err, rows) {
        if (!err) {
            //email is ok
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
                        //Close connection
                        connection.end(function (err) {

                        });
                    } else {
                        res.json({"status": "invalid account"})
                        console.log("password wrong");
                        //Close connection
                        connection.end(function (err) {

                        });

                    }

                });

            } else {
                //Email is not ok
                res.json({"status": "invalid account"});
                console.log("email wrong");
                //Close connection
                connection.end(function (err) {

                });

            }

        } else {
            console.log('Error while Check user');

        }

    });

});

app.get("/chat-room", function (req, res) {
    console.log("req.session.user_id", req.session.user_id);
    if (req.session.user_id) {
        res.render("chat_room", {user_email: req.session.user_email, user_id: req.session.user_id})
    }
    else {
        res.redirect("/");
    }

});

app.get("/conversation", function (req, res) {
    if (req.session.user_id) {
        res.render("conversation", {user_email: req.session.user_email, user_id: req.session.user_id, conversation_id: req.query.conversation_id})
    }
    else {
        res.redirect("/");
    }

});

// app.get("/chat-room-2", function (req, res) {
//     console.log("req.session.user_id", req.session.user_id);
//     if (req.session.user_id) {
//         res.render("chat_room_2", {
//             user_email: req.session.user_email,
//             user_id: req.session.user_id,
//             member_list: req.session.member_list
//         })
//     }
//     else {
//         res.redirect("/");
//     }
//
// });


app.post("/create-chat", jsonParser, function (req, res) {
    var connection = utilities.getMySqlConnection();
    var member_list = req.body.member_list;
    var organizer_email = req.body.organizer_email;



    //TODO Check if conversation member have already register "Sateraito Business Chat". If yes create conversation, if no invite them
    //TODO and force they register Sateraito business chat

    //Create new conversation
    var new_conversation_id = utilities.generateConversationId();
    var post = {
        id: new_conversation_id,
        organizer: organizer_email,
        member: member_list

    };

    connection.query('INSERT INTO Conversation SET ?', post, function (err, rows) {
        if (!err) {
            if (rows.affectedRows == 1) {
                req.session.member_list = member_list;
                req.session.conversation_id = new_conversation_id;

                res.json({"status": "ok","conversation_id": new_conversation_id});
                //Close connection
                connection.end(function (err) {

                });

                //TODO update friend_list and conversation_list of user
                // //Created conversation and saved it into DB of organizer
                // connection.query('SELECT * FROM UserInfo WHERE email="' + organizer_email + '"', function (err, rows) {
                //     if (!err) {
                //         //update user friend list and conversation list
                //         if (rows.length > 0) {
                //             var current_friend_list = rows[0].friend_list;
                //             var current_conversation_list = rows[0].conversation_list;
                //
                //             var new_friend_list = null;
                //             var new_conversation_list = null;
                //
                //
                //             if (current_friend_list) {
                //                 var current_friend_array = current_friend_list.split(",");
                //                 member_list.split(",").forEach(function (val, i) {
                //                     if (current_friend_array.indexOf(val) == -1) {
                //                         current_friend_array.push(val);
                //
                //                     }
                //                     new_friend_list = current_friend_array.toString();
                //                 });
                //
                //             } else {
                //                 new_friend_list = member_list;
                //             }
                //
                //
                //             if (current_conversation_list) {
                //                 var current_conversation_array = current_conversation_list.split(",");
                //                 new_conversation_list = current_conversation_array.push(new_conversation_id).toString();
                //             } else {
                //                 new_conversation_list = new_conversation_id;
                //             }
                //
                //             if (new_friend_list) {
                //                 //Update user friend list
                //                 connection.query('UPDATE UserInfo SET friend_list = ? WHERE email = ?', [new_friend_list, organizer_email])
                //             }
                //
                //             if (new_conversation_list) {
                //                 //Update user conversation list
                //                 connection.query('UPDATE UserInfo SET conversation_list = ? WHERE email = ?', [new_conversation_list, organizer_email])
                //             }
                //
                //             res.json({"status": "ok"});
                //             //Close connection
                //             connection.end(function (err) {
                //
                //             });
                //
                //
                //         } else {
                //             //Email is not ok
                //             res.json({"status": "invalid account"});
                //             console.log("email wrong");
                //             //Close connection
                //             connection.end(function (err) {
                //
                //             });
                //
                //         }
                //
                //     } else {
                //         console.log('Error while Check user');
                //
                //     }
                //
                // });


            } else {
                //something went wrong
                res.json({"status": "not ok"});
                //Close connection
                connection.end(function (err) {

                });

            }

        } else {
            console.log('Error while add new conversation');

        }

    });


});


io.on('connection', function (socket) {



    socket.on("hearing", function (data) {
        console.log("I am hearing, " + data.user_email);
        socket.emit('joined', {
            user_email: data.user_email
        })

    });

    //Server check user conversation request from client
    socket.on("check available conversation", function (data) {
        var connection = utilities.getMySqlConnection();
        connection.query('SELECT * FROM Conversation WHERE organizer="' + data.user_email + '" OR member LIKE "'+data.user_email+'"', function (err, rows) {
            if (!err) {
                //in case of having available conversation
                if (rows.length > 0) {
                    var conversation_list = [];
                    rows.forEach(function (val,i) {
                        var conversation_info = {};
                        conversation_info.id = val.id;
                        conversation_info.organizer = val.organizer;
                        conversation_info.member_list = val.member;
                        conversation_list.push(conversation_info);
                        
                    });
                    
                    socket.emit("available conversation detected",{
                        conversation_list : conversation_list
                            
                    });


                } else {
                    console.log('No available conversation');

                }

            } else {
                console.log('Error while Check user');

            }

        });

    });

    //Listen generating new conversation from client
    socket.on("start new conversation", function (data) {
        console.log("conversation started, conversation_id is " + data.conversation_id);
        socket.emit('conversation ready', {
            conversation_id: data.conversation_id,
            organizer_email: data.organizer_email,
            member_list: data.member_list
        })

    });


    //TODO send the message to only conversation's member
    socket.on("send message", function (data) {
        console.log("message is " + data.message_text);
        console.log("user is " + data.user_email);

        io.sockets.emit("new message", {
            user_email: data.user_email,
            message_text: data.message_text,
            conversation_id: data.conversation_id
        })

    });

});