
var utilities = require("./utilities");

var express = require("express");
var request = require('request');
var path = require('path');
var app = express();

var server = require("http").createServer(app);

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
//app.set('/', __dirname + '/views');
app.set('view engine', 'html');


app.use(express.static(path.join(__dirname, 'public')));

//Config Express
app.use(express.static(__dirname + '/views'));


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
//app.io('/main-space', function(socket){
//    socket.emit('stop typing', {data: 'value detail'});
//    socket.on('send a message', function(data){
//        console.log(data);
//    });
//});

server.listen(process.env.PORT || 8000);

app.enable('trust proxy');

// These environment variables are set automatically on Google App Engine
var Datastore = require('@google-cloud/datastore');
var crypto = require('crypto');

// Instantiate a datastore client
var datastore = Datastore();

// [START external_ip]
// In order to use websockets on App Engine, you need to connect directly to
// application instance using the instance's public external IP. This IP can
// be obtained from the metadata server.

//app.use(passport.initialize());
//app.use(passport.session());

// Passport session setup.
//passport.serializeUser(function(user, done) {
//    done(null, user);
//});
//
//passport.deserializeUser(function(obj, done) {
//    done(null, obj);
//});

// Use the TwitterStrategy within Passport.

//passport.use(new TwitterStrategy({
//    consumerKey: 'KNft6WqrLQh1q8ufyClcAbOSR',
//    consumerSecret: 'uNzO3vQkVEJgtYx0eBeoDwTlnFTopi0pnpl2IVszuh751flgiD',
//    callbackURL: 'https://sateraito-business-chat.appspot.com/general/twcallback'
//    },
//    function(token, tokenSecret, profile, done) {
//        console.log(profile);
//        console.log(done);
//        process.nextTick(function () {
//            //Check whether the User exists or not using profile.id
//            if (config.use_database === 'true') {
//                //Perform MySQL operations.
//            }
//            return done(null, profile);
//        });
//    }
//));

//app.get('/auth/twitter', passport.authenticate('twitter'));
//
//app.get('/general/twcallback',
//    passport.authenticate('twitter', { successRedirect : '/', failureRedirect: '/login' }),
//    function(req, res) {
//        console.log('test twitter');
//        console.log(req);
//        console.log(res);
//        res.redirect('/');
//    });
//var numClients = 0;

//io.listen(server);

//var io = require('socket.io').listen(server);

//var allowedOrigins = "http://localhost:* http://127.0.0.1:*";
//var allowedOrigins = "https://sateraito-business-chat.appspot.com:* https://216.58.209.145:*";
//var path ='/stomp'; // you need this if you want to connect to something other than the default socket.io path
//var io = require('socket.io')(server, {
//    origins: allowedOrigins,
//    path : path
//});
//var io = require('socket.io').listen(server);

//var sio_server = io(server, {
//    origins: allowedOrigins,
//    path : path
//});

// Send data to client
// maybe can use io.socket.on('connection', function(socket) {
//io.on('connection', function (socket) {
//    socket.emit('news', { hello: 'world' , port: process.env.PORT, or: 8000});
//    socket.on('test', function (data) {
//        console.log(process.env.PORT);
//        console.log('or');
//        console.log('8000');
//        console.log('show in app js');
//        console.log(data);
//    });
//});


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
    socket.on("just enter", function (data) {
        console.log("There is a person entered. His name is ", data.name);
        io.sockets.emit("welcome", {name: data.name})
    });

    //TODO send the message to only conversation's member

    socket.on("send a message", function (data) {
        console.log('send a message');
        console.log(data);
        // var room = "room numner 1";
        // socket.join(room);
        io.sockets.emit("notify a new message", {
            sender: data.sender,
            receiver: data.receiver,
            message_text: data.message_text,
            conversation_id: data.conversation_id
        })

    });

    socket.on("typing", function (data) {
        console.log('typing');
        console.log(data);
        io.sockets.emit("notify typing", {
            sender: data.sender,
            receiver: data.receiver,
            conversation_id: data.conversation_id
        });

    });

    socket.on("stop typing", function (data) {
        io.sockets.emit("notify stop typing", {
            sender: data.sender,
            receiver: data.receiver,
            conversation_id: data.conversation_id
        });

    });
});

var nsp = io.of('/main-space');
nsp.on('connection', function(socket){
  console.log('someone connected');
  io.sockets.emit("welcome", {name: 'welcome'})
});
nsp.emit('hi', 'everyone!');

app.get("/", function (req, res) {
    getExternalIp(function (externalIp) {
        if (req.session.user_id) {
            res.redirect("/main-space", {externalIp: externalIp})
        } else {
            res.render('home', {externalIp: externalIp});
        }
    });
});

app.get("/logout", function (req, res) {
    req.session.user_id = null;
    req.session.user_email = null;
    res.redirect("/");

});

app.get("/sign-up", function (req, res) {
    getExternalIp(function (externalIp) {
        res.render('sign-up', {externalIp: externalIp});
    });
});

app.post("/do-sign-up", jsonParser, function (req, res, next) {
    //Create MySQL connection
    var email = req.body.email;
    var password = req.body.password;
    var password_again = req.body.password_again;

    //Check password and password_again is matched or not
    if (password != password_again) {
        res.json({"status": "password error"})
    }
    var hash_password = bcrypt.hashSync(password, salt);
    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', email);

    datastore.runQuery(query, function (err, entities) {
        if (err) {
            return res.json({"status": "fail", "message": "invalid account query error", "email": entities[0].data.email});
        }
//        return res.json({"status": "check entities value", "entities": entities, "number": entities.length, 'or': entities.rows});
        if (entities.length > 0) {
            return res.json({"status": "fail", "message": "Account is exist", "email": email});
        } else {
            var arr = email.split("@").map(function (val) {
                return val;
            });
            var userinfo = {
                // Store a hash of the use
                id: generateUserId(),
                user_name: arr[0],
                password: hash_password,
                validation_code: generateRandomString(),
                email: email,
                first_name: arr[0],
                last_name: '',
                image_url: '',
                friend_list: '',
                conversation_list: '',
                is_validated: '',
                birthday: '',
                address: '',
                company: '',
                created_date: new Date(),
                updated_datetime: new Date()
            };

            datastore.save({
                key: datastore.key('UserInfo'),
                data: userinfo
            }, function (err) {
                if (err) {
                    return res.json({"status": "db error", "message": "invalid account", "error": 'save datastore error'});
                } else {
                    req.session.user_id = userinfo.id;
                    req.session.user_email = email;
                    req.session.user_type = "account";
                    return res.json({"status": "success", "message": "Your account already!", "userinfo": userinfo});
                }
            });
        }
    });
});

app.post("/user-login", jsonParser, function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', email);
    datastore.runQuery(query, function (err, entities) {
        if (err) {
            return res.json({"status": "fail", "message": "invalid account query error","email": email});
        }
//        return res.json({"status": "check entities value", "entities": entities, "number": entities.length, 'or': entities.rows});
        if (entities.length > 0) {
            //check if password is OK
//            if (bcrypt.hashSync(password, salt) == entities[0].data.password) {
            bcrypt.compare(password, entities[0].data.password, function (com_err, matches) {
                if (!com_err) {
                    if (matches) {
                        req.session.user_id = entities[0].data.id;
                        req.session.user_email = email;
                        req.session.user_type = "account";
                        return res.json({"status": "success", "email": email});
                    } else {
                        return res.json({"status": "invalid password"});
                    }
                }

            });
        } else {
            return res.json({"status": "invalid email"});
        }
    });
});

app.post("/user-login-facebook", jsonParser, function (req, res) {

    var email = req.body.email;
    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', email);

    datastore.runQuery(query, function (err, entities) {
        if (err) {
            return res.json({"status": "db error", "error": "invalid account query error"});
        }

        if (entities.length > 0) {
            return res.json({"status": "success"});
        } else {
            var arr = email.split("@").map(function (val) {
                return val;
            });
            var userinfo = {
                // Store a hash of the use
                id: generateUserId(),
                user_name: arr[0],
                password: '',
                validation_code: generateRandomString(),
                email: email,
                first_name: arr[0],
                last_name: '',
                image_url: '',
                friend_list: '',
                conversation_list: '',
                is_validated: '',
                birthday: '',
                address: '',
                company: '',
                created_date: new Date(),
                updated_datetime: new Date()
            };

            datastore.save({
                key: datastore.key('UserInfo'),
                data: userinfo
            }, function (err) {
                if (err) {
                    res.json({"status": "db error", "error": 'save datastore error'});
                } else {
                    req.session.user_id = userinfo.id;
                    req.session.user_email = email;
                    req.session.user_type = "facebook";
                    res.json({"status": "success"});
                }
            });
        }
    });
});

app.post("/user-login-google", jsonParser, function (req, res) {
    var email = req.body.email;
    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', email);

    datastore.runQuery(query, function (err, entities) {
        if (err) {
            return res.json({"status": "db error", "error": "invalid account query error"});
        }

        if (entities.length > 0) {
            return res.json({"status": "success"});
        } else {
            var arr = email.split("@").map(function (val) {
                return val;
            });
            var userinfo = {
                // Store a hash of the use
                id: generateUserId(),
                user_name: arr[0],
                password: '',
                validation_code: generateRandomString(),
                email: email,
                first_name: arr[0],
                last_name: '',
                image_url: '',
                friend_list: '',
                conversation_list: '',
                is_validated: '',
                birthday: '',
                address: '',
                company: '',
                created_date: new Date(),
                updated_datetime: new Date()
            };

            datastore.save({
                key: datastore.key('UserInfo'),
                data: userinfo
            }, function (save_err) {
                if (save_err) {
                    return res.json({"status": "db error", "error": 'save datastore error'});
                } else {
                    req.session.user_id = userinfo.id;
                    req.session.user_email = email;
                    req.session.user_type = "google";
                    return res.json({"status": "success"});


                }
            });

        }
    });


});

app.get("/main-space", function (req, res) {
    if (req.session.user_id) {
        // Query datastore user info with email
        var query = datastore.createQuery('UserInfo')
            .filter('email', '=', req.session.user_email);
        datastore.runQuery(query, function (err, entities) {
            if (entities.length > 0) {
                var user_friend_list = entities[0].data.friend_list;
                var user_conversation_list = entities[0].data.conversation_list;
                for(var i = 1; i < entities.length; i++){
                    user_friend_list += ',' + entities[i].data.friend_list;
                    user_conversation_list = ',' + entities[i].data.conversation_list;
                }

                getExternalIp(function (externalIp) {
                    res.render("main_space", {
                        user_email: req.session.user_email,
                        user_id: req.session.user_id,
                        user_friend_list: user_friend_list,
                        user_conversation_list: user_conversation_list,
                        user_type : req.session.user_type,
                        externalIp: externalIp
                    });
                });

            }
        });
    } else {
        res.redirect("/");
//        getExternalIp(function (externalIp) {
//            res.render('sign-up', {externalIp: externalIp});
//        });
    }

});

app.post("/add-user-list", jsonParser, function (req, res) {
    var member_list = req.body.member_list;
    var user_email = req.session.user_email;


    //Update friend list of user
    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', user_email);
    datastore.runQuery(query, function (err, entities) {
        if (!err) {
            if (entities.length > 0) {
                var current_friend_list = entities[0].data.friend_list;
//                var friend_list_valid = null;
//                var friend_list_invalid = '';

                var new_user = entities[0].data;
                var current_friend_array = current_friend_list.split(",");

                member_list.split(",").forEach(function (val, i) {
                    var query_list = datastore.createQuery('UserInfo')
                        .filter('email', '=', val.trim());
                    datastore.runQuery(query_list, function (check_err, check_entity) {
                        if (!check_err) {
                            if (check_entity.length > 0) {
                                var check_mail = val.replace(/' '/g, '');
                                if (current_friend_array.indexOf(check_mail) == -1) {
                                    current_friend_array.push(check_mail);
                                    var new_friend_list = current_friend_array.toString();
                                    if (new_user.friend_list != ''){
                                        new_user.friend_list += ',';
                                    }
                                    new_user.friend_list += check_mail;
                                    if (new_friend_list) {
                                        //Update user friend list
                                        datastore.update({
    //                            key: datastore.key(['UserInfo', entities[0].key.id]),
                                            key: entities[0].key,
                                            data: new_user
                                        }, function (update_err, update) {
                                            if (!update_err) {
                                                res.json({"status": "success", "message": "updated", 'update_value': update,
                                                     "new_friend_list": new_friend_list, "new_user": new_user});
                                                // Task updated successfully.
                                            } else {
                                                res.json({"status": "fail", "message": "update friend list fail", 'update_value': entities[0]});
                                            }

                                        });
                                    } else {
                                        res.json({"status": "fail", "message": "nobody friend update or email not exist!"});
                                    }
                                }
                            }
                        }
                    });
                });
            } else {
                //Email is not ok
                res.json({"status": "fail", "message": "invalid account"});
            }
        } else {
            res.json({"status": "fail", "message": "invalid query"});
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
    if (user_conversation_list.split(",").indexOf(conversation_id) == -1) {

        var member_array = receiver.split(",");
        member_array.push(sender);

        //TODO catch error while operate query

        //Create new conversation into database
        var coversation = {
            // Store a hash of the use
            id: conversation_id,
            organizer: sender,
            member: member_array.toString(),
            image_url: '',
            title: '',
            memo: '',
            todo: '',
            created_date: new Date()
        };

        datastore.save({
            key: datastore.key('Conversation'),
            data: coversation
        }, function (save_err) {
            if (save_err) {
               res.json({"status": "fail", "message": "conversation input fail", "error": 'save datastore conversation error'});
//            } else {
//                res.json({"status": "success", "message": "Your account already!", "conversation": coversation});
            }
        });
//        return res.json({"status": "success", "message": "conversation input", "update": 'update success'});

        //Update conversation list to sender

//        new_conversation_array.push(conversation_id);
//        utilities.runPGQuery("UPDATE UserInfo SET conversation_list = '"+new_conversation_array.toString()+"' WHERE email = '"+sender+"'",function (rows) {
//
//        });

        // Update conversation list to sender

        var query = datastore.createQuery('UserInfo')
            .filter('email', '=', sender);
        datastore.runQuery(query, function (sender_err, sender_entities) {
            if (sender_entities.length > 0) {
                var current_conversation_list = sender_entities[0].data.conversation_list;
                var current_conversation_array = current_conversation_list.split(",");
//                var new_user = entities[0].data;
//                var new_conversation_array = user_conversation_list.split(",");
//                new_user.conversation_list = new_conversation_array.toString();

                if (current_conversation_array.indexOf(conversation_id) == -1) {
                    //Update user friend list
                    var new_conversation_array = current_conversation_array.push(conversation_id);
                    var new_user = sender_entities[0].data;
                    new_user.conversation_list = new_conversation_array.toString();

                    datastore.update({
                        key: sender_entities[0].key,
                        data: new_user
                    }, function (update_err) {
                        if (update_err) {
                            res.json({"status": "fail", "message": "update conversation list fail"});
                            // Task updated successfully.
                        } else {
                            res.json({"status": "success", "message": "update", 'update_value': sender_entities[0]});
                        }
                    });
                }

            } else {
                //Email is not ok
                res.json({"status": "fail", "message": "invalid account"});
            }
        });

        //update conversation list to receiver
        receiver.split(",").forEach(function (val, i) {
            var query = datastore.createQuery('UserInfo')
                .filter('email', '=', val.trim());
            datastore.runQuery(query, function (receiver_err, entities_receiver) {
                if (entities_receiver.length > 0) {
                    var receiver_conversation_array = entities_receiver[0].conversation_list.split(",");
                    receiver_conversation_array.push(conversation_id);

                    var new_user_receive = entities_receiver[0].data;
                    new_user_receive.conversation_list = receiver_conversation_array;
                    if (receiver_conversation_array) {

                        //Update user friend list
                        datastore.update({
                            key:entities_receiver[0].key,
                            data: new_user_receive
                        }, function (update_receiver_err) {
                            if (update_receiver_err) {
                                res.json({"status": "fail", "message": "update conversation list fail"});
                                // Task updated successfully.
                            } else {
                                res.json({"status": "success", "message": "update", 'update_value': entities_receiver[0]});
                            }
                        });
                    } else {
                        res.json({"status": "fail", "message": "No conversation list updated"});
                    }


                } else {
                    //Email is not ok
                    res.json({"status": "fail", "message": "invalid account"});

                }
            });

        });

    }

    //Then add this message to database
    //Create new conversation into database
    var message_id = utilities.generateMessageId();

    var message_info = {
        // Store a hash of the use
        id: message_id,
        conversation_id: conversation_id,
        content: message_text,
        sender: sender,
        receiver: receiver,
        is_read: false,
        created_date: new Date()
    };

    datastore.save({
        key: datastore.key('MessageInfo'),
        data: message_info
    }, function (msg_err) {
        if (msg_err) {
            res.json({
                "status": "fail",
                "message": "conversation input fail",
                "error": 'save datastore conversation error'
            });
        }
    });

    res.json({
        'status': "finish writeline chat"
    })
});

app.post("/continue-conversation", jsonParser, function (req, res) {
    var conversation_id = req.body.conversation_id;

    var query = datastore.createQuery('Conversation')
        .filter('id', '=', conversation_id);
    datastore.runQuery(query, function (con_err, con_entities) {
        if (con_entities.length > 0) {
            var query_message = datastore.createQuery('MessageInfo')
                .filter('id', '=', conversation_id)
                .order('-created_date');
            datastore.runQuery(query_message, function (msg_err, message) {
                if (!msg_err) {
                    res.json({message_list: message, organizer: con_entities[0].organizer, member: con_entities[0].member})
                }
            });

        }
    });

    res.json({status: "ok"});

//    utilities.runPGQuery("SELECT * FROM Conversation WHERE id = '" + conversation_id + "'", function (results) {
//        if (results.length > 0) {
//
//            //TODO Load messages of conversation, implement limit
//            utilities.runPGQuery("SELECT * FROM message_info WHERE conversation_id = '" + conversation_id + "' ORDER BY created_datetime ASC", function (rows) {
//
//                res.json({message_list: rows, organizer: results[0].organizer, member: results[0].member})
//
//            });
//        }
//    });
});

//var auth = io.of('/main-space').use(function(socket, next) {
//    socket.on("send a message", function (data) {
//        console.log('send a message');
//        console.log(data);
//        // var room = "room numner 1";
//        // socket.join(room);
//        io.sockets.emit("notify a new message", {
//            sender: data.sender,
//            receiver: data.receiver,
//            message_text: data.message_text,
//            conversation_id: data.conversation_id
//        })
//
//    });
//
//    socket.on("typing", function (data) {
//        console.log('typing');
//        console.log(data);
//        io.sockets.emit("notify typing", {
//            sender: data.sender,
//            receiver: data.receiver,
//            conversation_id: data.conversation_id
//        });
//
//    });
//    console.log("Authenticating...");
//    next();
//});

//auth.on('connection', function(socket){
//    console.log("Connected to namespace /test");
//        //TODO send the message to only conversation's member
//
//    socket.on("send a message", function (data) {
//        console.log('send a message');
//        console.log(data);
//        // var room = "room numner 1";
//        // socket.join(room);
//        io.sockets.emit("notify a new message", {
//            sender: data.sender,
//            receiver: data.receiver,
//            message_text: data.message_text,
//            conversation_id: data.conversation_id
//        })
//
//    });
//
//    socket.on("typing", function (data) {
//        console.log('typing');
//        console.log(data);
//        io.sockets.emit("notify typing", {
//            sender: data.sender,
//            receiver: data.receiver,
//            conversation_id: data.conversation_id
//        });
//
//    });
//});

//function sendTime() {
//    io.of('/main-space').emit('time', { time: new Date().toJSON() });
//}
//
//setInterval(sendTime, 100);

// Use express-ws to enable web sockets.
//require('express-ws')(app);
//
//// A simple echo service.
//app.ws('/main-space', function (ws) {
//  ws.on('message', function (msg) {
//    ws.send(msg);
//  });
//
//  ws.on('typing', function (msg) {
//    ws.send('aabssscsss');
//  });
//});
//
//// Start the websocket server
//var wsServer = app.listen('65080', function () {
//  console.log('Websocket server listening on port %s', wsServer.address().port);
//});

function generateUserId() {
    Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [this.getFullYear(), !mm[1] && '', mm, !dd[1] && '0', dd].join(''); // padding
    };

    var date = new Date();


    var user_id = "user_" + date.yyyymmdd();

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        user_id += possible.charAt(Math.floor(Math.random() * possible.length));

    return user_id;
}

function generateRandomString() {
    Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [this.getFullYear(), !mm[1] && '', mm, !dd[1] && '0', dd].join(''); // padding
    };

    var date = new Date();


    var user_id = date.yyyymmdd();

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        user_id += possible.charAt(Math.floor(Math.random() * possible.length));

    return user_id;


};