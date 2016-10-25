
var utilities = require("./utilities");

var express = require("express");
var request = require('request');
var path = require('path');
var app = express();

//var server = require("http").createServer(app);
var server = require("http").Server(app);
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
//app.set('/', __dirname + '/views');
app.set('view engine', 'html');


app.use(express.static(path.join(__dirname, 'public')));



//Config Express
app.use(express.static(__dirname + '/views'));

//server.listen(app.get('port'), app.get('ipaddress'), function(){
//    console.log('Express server listening on port ' + app.get('port'));
//});

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
app.get("/", function (req, res) {
    getExternalIp(function (externalIp) {
        return res.json({"status": "fail", "message": req.session.user_id, "error": 'save datastore error'});
//        if (req.session.user_id) {
//            res.redirect("/main-space", {externalIp: externalIp})
//        } else {
////            res.render("home", {})
//            res.render('home', {externalIp: externalIp});
//        }
//        res.render('home', {externalIp: externalIp});
    });
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
//    res.render('sign-up');
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
                password: crypto.createHash('sha256').update(password).digest('hex').substr(0, 15),
                validation_code: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 9),
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
                    return res.json({"status": "fail", "message": "invalid account", "error": 'save datastore error'});
                } else {
                    req.session.user_id = userinfo.id;
                    req.session.user_email = email;
                    return res.json({"status": "success", "message": "Your account already!", "userinfo": userinfo});
                }
            });
        }
    });
//    var id_test = generateUserId();
//    var app_chat = require('express')();
//    var server1 = require('http').Server(app_chat);
//    var io = require('socket.io')(server1);
//    server1.listen(65080);
//    io.on('connection', function (socket) {
//        socket.emit('test_id', { id_test: id_test});
//    });
//      socket_client.emit('entities', function(msg){
//          console.log(msg)
//      });
//      socket_client.emit('event', function(data){
//          console.log(data);
//      });
//      socket_client.on('test_id', function(msg){
//          console.log(msg)
//      });
//    socket.('test_id', { id_test: id_test});
//    utilities.getUserLists(params);
//    getUsers(email, password, function(err, user) {
//        if (err) {
//            return next(err);
//        }
//        return res
//            .status(200)
//            .set('Content-Type', 'text/plain')
//            .send('user:\n' + user.join('\n'));
//    });
        //Email is already registered
//        if (rows.length == 0) {
//            //Create new account in DB
//            var new_user_id = utilities.generateUserId();
//            // Salt and hash password
//            var hash_password = bcrypt.hashSync(password, salt);
//            // var post = {id: new_user_id, email: email, password: hash_password};
//            var insert_user_string = "INSERT INTO UserInfo (id, user_name, password, validation_code, is_validated, email, last_name, first_name, friend_list, conversation_list, birthday, address, company, created_date, updated_datetime) VALUES ('"+new_user_id+"', '', '"+hash_password+"', '', 0, '"+email+"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)";
//            utilities.runPGQuery(insert_user_string,function (result) {;
//                req.session.user_id = new_user_id;
//                req.session.user_email = email;
//                console.log("registered!!");
//                res.json({"status": "ok"})
//            });
//
//        } else {
//            console.log("email is already existed");
//            res.json({"status": "email existed"})
//        }
//    });
//    var id = tools.generateID();

    //Check email is existed or not

//    utilities.runPGQuery("SELECT * FROM UserInfo WHERE email = '" + email + "'",function (rows) {
//        //Email is already registered
//        if (rows.length == 0) {
//            //Create new account in DB
//            var new_user_id = utilities.generateUserId();
//            // Salt and hash password
//            var hash_password = bcrypt.hashSync(password, salt);
//            // var post = {id: new_user_id, email: email, password: hash_password};
//            var insert_user_string = "INSERT INTO UserInfo (id, user_name, password, validation_code, is_validated, email, last_name, first_name, friend_list, conversation_list, birthday, address, company, created_date, updated_datetime) VALUES ('"+new_user_id+"', '', '"+hash_password+"', '', 0, '"+email+"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)";
//            utilities.runPGQuery(insert_user_string,function (result) {;
//                req.session.user_id = new_user_id;
//                req.session.user_email = email;
//                console.log("registered!!");
//                res.json({"status": "ok"})
//            });
//
//        } else {
//            console.log("email is already existed");
//            res.json({"status": "email existed"})
//        }
//
//    });
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
            if (crypto.createHash('sha256').update(password).digest('hex').substr(0, 15) == entities[0].data.password) {
                req.session.user_id = entities[0].data.id;
                req.session.user_email = email;
                return res.json({"status": "success", "email": email});
            } else {
                return res.json({"status": "fail", "message": "Wrong password!", "password": password, "entities_password": entities[0].data.password});
            }
        } else {
            return res.json({"status": "fail", "message": "Your account no is registered"});
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
                        externalIp: externalIp
                    });
                });

            }
        });
    } else {
        getExternalIp(function (externalIp) {
            res.render('sign-up', {externalIp: externalIp});
        });
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
                var friend_list_invalid = '';

                var new_user = entities[0].data;
                var new_friend_list = null;
                var is_update = null;
                var current_friend_array = current_friend_list.split(",");

                member_list.split(",").forEach(function (val, i) {
                    var query_list = datastore.createQuery('UserInfo')
                        .filter('email', '=', val);
                    datastore.runQuery(query_list, function (err, entity) {
                        if (entity.length <= 0) {
                            is_update = "invalid email!";
                            if (friend_list_invalid != ''){
                                friend_list_invalid += ','
                            }
                            friend_list_invalid += entity[0].data.email;
                        } else {
                            if (current_friend_array.indexOf(val) == -1) {
                                current_friend_array.push(val);
                            }
                        }

                    });
//                    if (current_friend_array.indexOf(val) == -1) {
//                        current_friend_array.push(val);
//                    }
//                    new_friend_list = current_friend_array.toString();
                });

//                if (current_friend_list) {
//                    var current_friend_array = current_friend_list.split(",");
//                    member_list.split(",").forEach(function (val, i) {
//                        var query_list = datastore.createQuery('UserInfo')
//                            .filter('email', '=', val);
//                        datastore.runQuery(query_list, function (err, entity) {
//                            if (entity.length > 0) {
//                            } else {
//                                is_update = "invalid email!";
//                            }
//
//                        });
//                        if (current_friend_array.indexOf(val) == -1) {
//                            current_friend_array.push(val);
//                        }
//                        new_friend_list = current_friend_array.toString();
//                    });
//
//                } else {
//                    new_friend_list = member_list;
//                }

                new_friend_list = current_friend_array.toString();
                new_user.friend_list = new_friend_list;
                if (new_friend_list) {
                    if (!is_update) {
                        //Update user friend list
                        datastore.update({
//                    key: datastore.key('UserInfo'),
//                    ds.key([kind, parseInt(id, 10)])
                            key: datastore.key(['UserInfo', entities[0].key.id]),
                            data: new_user
                        }, function (err) {
                            if (!err) {
                                return res.json({"status": "success", "message": "update", 'update_value': entities[0], "is_update": is_update});
                                // Task updated successfully.
                            } else {
                                return res.json({"status": "fail", "message": "update friend list fail", 'update_value': entities[0], "is_update": is_update});
                            }

                        });
                    } else {
                        return res.json({"status": "fail", "message": "update friend list fail", 'update_value': entities[0], "is_update": is_update});
                    }
                } else {
                    return res.json({"status": "fail", "message": "nobody friend update or email not exist!"});
                }
//            res.json({"status": "ok"});


            } else {
                //Email is not ok
                return res.json({"status": "fail", "message": "invalid account"});
            }
        } else {
            return res.json({"status": "fail", "message": "invalid query"});
        }

    });

});

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
//io.sockets.on('connection', function (socket) {
//    socket.broadcast.emit('news', { hello: 'world' , port: process.env.PORT, or: 8000});
//    socket.on('test', function (data) {
//        console.log(process.env.PORT);
//        console.log('or');
//        console.log('8000');
//        console.log('show in app js');
//        console.log(data);
//    });

//    socket.on("hearing", function (data) {
//        console.log("I am hearing, " + data.user_email);
//        socket.emit('joined', {
//            user_email: data.user_email
//        })
//
//    });
//
//    //Server check user conversation request from client
//    socket.on("check available conversation", function (data) {
//        var connection = utilities.getMySqlConnection();
//        connection.query('SELECT * FROM Conversation WHERE organizer="' + data.user_email + '" OR member LIKE "'+data.user_email+'"', function (err, rows) {
//            if (!err) {
//                //in case of having available conversation
//                if (rows.length > 0) {
//                    var conversation_list = [];
//                    rows.forEach(function (val,i) {
//                        var conversation_info = {};
//                        conversation_info.id = val.id;
//                        conversation_info.organizer = val.organizer;
//                        conversation_info.member_list = val.member;
//                        conversation_list.push(conversation_info);
//
//                    });
//
//                    socket.emit("available conversation detected",{
//                        conversation_list : conversation_list
//
//                    });
//
//
//                } else {
//                    console.log('No available conversation');
//
//                }
//
//            } else {
//                console.log('Error while Check user');
//
//            }
//
//        });
//
//    });
//
//    //Listen generating new conversation from client
//    socket.on("start new conversation", function (data) {
//        console.log("conversation started, conversation_id is " + data.conversation_id);
//        socket.emit('conversation ready', {
//            conversation_id: data.conversation_id,
//            organizer_email: data.organizer_email,
//            member_list: data.member_list
//        })
//
//    });
//
//
//    //TODO send the message to only conversation's member
//    socket.on("send message", function (data) {
//        console.log("message is " + data.message_text);
//        console.log("user is " + data.user_email);
//
//        io.sockets.emit("new message", {
//            user_email: data.user_email,
//            message_text: data.message_text,
//            conversation_id: data.conversation_id
//        })
//
//    });

//});

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
            memo: '',
            todo: '',
            created_date: new Date()
        };

        datastore.save({
            key: datastore.key('Conversation'),
            data: coversation
        }, function (err) {
            if (err) {
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
        var new_conversation_array = user_conversation_list.split(",");
        var query = datastore.createQuery('UserInfo')
            .filter('email', '=', sender);
        datastore.runQuery(query, function (err, entities) {
            if (entities.length > 0) {
//                var current_conversation_list = entities[0].data.conversation_list;
                var new_user = entities[0].data;
                new_user.conversation_list = new_conversation_array.toString();
                if (new_conversation_array) {

                    //Update user friend list
                    datastore.update({
                        key: datastore.key(['UserInfo', entities[0].key.id]),
                        data: new_user
                    }, function (err) {
                        if (err) {
                            res.json({"status": "fail", "message": "update conversation list fail"});
                            // Task updated successfully.
//                        } else {
//                            res.json({"status": "success", "message": "update", 'update_value': entities[0]});
                        }
                    });
                } else {
                    res.json({"status": "fail", "message": "No conversation list updated"});
                }
//            res.json({"status": "ok"});


            } else {
                //Email is not ok
                res.json({"status": "fail", "message": "invalid account"});

            }
        });

        //update conversation list to receiver
        receiver.split(",").forEach(function (val) {
            var query = datastore.createQuery('UserInfo')
                .filter('email', '=', val);
            datastore.runQuery(query, function (err, entity_receivers) {
                if (entity_receivers.length > 0) {
                    var receiver_conversation_array = entity_receivers[0].conversation_list.split(",");
                    receiver_conversation_array.push(conversation_id);

                    var new_user = entity_receivers[0].data;
                    new_user.conversation_list = receiver_conversation_array;
                    if (receiver_conversation_array) {

                        //Update user friend list
                        datastore.update({
                            key: datastore.key(['UserInfo', entity_receivers[0].key.id]),
                            data: new_user
                        }, function (err) {
                            if (err) {
                                res.json({"status": "fail", "message": "update conversation list fail"});
                                // Task updated successfully.
//                            } else {
//                                res.json({"status": "success", "message": "update", 'update_value': entity_receivers[0]});
                            }
                        });
                    } else {
                        res.json({"status": "fail", "message": "No conversation list updated"});
                    }
//            res.json({"status": "ok"});


                } else {
                    //Email is not ok
                     res.json({"status": "fail", "message": "invalid account"});

                }
            });

//            utilities.runPGQuery("SELECT * from UserInfo WHERE email = '" + val + "'", function (rows) {
//                if (rows.length > 0) {
//                    var receiver_conversation_array = rows[0].conversation_list.split(",");
//                    receiver_conversation_array.push(conversation_id);
//                    utilities.runPGQuery("UPDATE UserInfo SET conversation_list = '" + receiver_conversation_array.toString() + "' WHERE email = '" + val + "'", function (rows) {
//
//                    });
//
//                }
//
//            });


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
    }, function (err) {
        if (err) {
            return res.json({"status": "fail", "message": "conversation input fail", "error": 'save datastore conversation error'});
        }
//                req.session.user_id = userinfo.id;
//                req.session.user_email = email;
//                return res.json({"status": "success", "message": "Your account already!", "userinfo": userinfo});
    });
//    utilities.runPGQuery("INSERT INTO message_info (id, conversation_id, content, sender, receiver) VALUES ('"+message_id+"','"+conversation_id+"', '"+message_text+"', '"+sender+"', '"+receiver+"')",function (rows) {
//    });
});

app.post("/continue-conversation", jsonParser, function (req, res) {
    var conversation_id = req.body.conversation_id;

    var query = datastore.createQuery('Conversation')
        .filter('id', '=', conversation_id);
    datastore.runQuery(query, function (err, entities) {
        if (entities.length > 0) {
            var query_message = datastore.createQuery('MessageInfo')
                .filter('id', '=', conversation_id)
                .order('-created_date');
            datastore.runQuery(query_message, function (err, message) {
                if (!err) {
                    res.json({message_list: message, organizer: entities[0].organizer, member: entities[0].member})
                }
            });

        }
    });

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