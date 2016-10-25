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
// app.set('/', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));


//Config Express
app.use(express.static(__dirname + '/views'));

server.listen(process.env.PORT || 8000);

//Datastore config
app.enable('trust proxy');
var Datastore = require('@google-cloud/datastore');
// Instantiate a datastore client
var datastore = Datastore();



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

app.post("/do-sign-up", jsonParser, function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var password_again = req.body.password_again;

    //Check password and password_again is matched or not
    if (password != password_again) {
        res.json({"status": "password error"})
    }

    var hash_password = bcrypt.hashSync(password, salt)

    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', email);

    datastore.runQuery(query, function (err, entities) {
        if (err) {
            return res.json({"status": "db error", "message": "invalid account query error"});
        }
        if (entities.length > 0) {
            return res.json({"status": "email existed", "message": "Account is exist", "email": email});
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
                    return res.json({"status": "success", "message": "Your account already!"});
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
        if (entities.length > 0) {
            //check if password is OK
            bcrypt.compare(password, entities[0].data.password, function (err, matches) {
                if (err) {
                    console.log('Error while checking password');
                } else if (matches) {
                    req.session.user_id = entities[0].data.id;
                    req.session.user_email = email;
                    req.session.user_type = "account";

                    res.json({"status": "success"})

                }else {
                    res.json({"status": "invalid password"})
                    console.log("password wrong");

                }
            })

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
                    return res.json({"status": "db error", "error": 'save datastore error'});
                } else {
                    req.session.user_id = userinfo.id;
                    req.session.user_email = email;
                    req.session.user_type = "facebook";
                    return res.json({"status": "success"});
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
            }, function (err) {
                if (err) {
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


    }
    else {
        res.redirect("/");
    }

});


app.post("/add-user-list", jsonParser, function (req, res) {
    var member_list = req.body.member_list;
    var user_email = req.session.user_email;

    //Update friend list of user
    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', user_email);

    datastore.runQuery(query, function (err, entities) {
        if (entities.length > 0) {
            var current_friend_list = entities[0].data.friend_list;
            var new_user = entities[0].data;
            var new_friend_list = null;
            var is_update = true;
            if (current_friend_list) {
                var current_friend_array = current_friend_list.split(",");
                member_list.split(",").forEach(function (val, i) {
                    var query_list = datastore.createQuery('UserInfo')
                        .filter('email', '=', val);
                    datastore.runQuery(query_list, function (err, entity) {
                        if (entity.length > 0) {
                        } else {
                            is_update = false;
                        }

                    });
                    if (current_friend_array.indexOf(val) == -1) {
                        current_friend_array.push(val);
                    }
                    new_friend_list = current_friend_array.toString();
                });

            } else {
                new_friend_list = member_list;
            }

            new_user.friend_list = new_friend_list;
            if (new_friend_list) {
                if (is_update == true) {
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
                res.json({"status": "fail", "message": "nobody friend update"});
            }
//            res.json({"status": "ok"});


        } else {
            //Email is not ok
            res.json({"status": "fail", "message": "invalid account"});

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
            memo: '',
            todo: '',
            created_date: new Date()
        };

        datastore.save({
            key: datastore.key('Conversation'),
            data: coversation
        }, function (err) {
            if (err) {
                return res.json({
                    "status": "fail",
                    "message": "conversation input fail",
                    "error": 'save datastore conversation error'
                });
            }
        });

        // Update conversation list of user info
        var query = datastore.createQuery('UserInfo')
            .filter('email', '=', sender);
        datastore.runQuery(query, function (err, entities) {
            if (entities.length > 0) {
               var current_conversation_list = entities[0].data.conversation_list;
               var current_conversation_array = current_conversation_list.split(",");
                if (current_conversation_array.indexOf(conversation_id) == -1){
                    //Update user friend list
                    var new_conversation_array = current_conversation_array.push(conversation_id);
                    var new_user = entities[0].data;
                    new_user.conversation_list = new_conversation_array.toString();
                    datastore.update({
                        key: datastore.key(['UserInfo', entities[0].key.id]),
                        data: new_user
                    }, function (err) {
                        if (err) {
                            res.json({"status": "fail", "message": "update conversation list fail"});
                            // Task updated successfully.
                        } else {
                            res.json({"status": "success", "message": "update", 'update_value': entities[0]});
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
                .filter('email', '=', val);
            datastore.runQuery(query, function (err, entities) {
                if (entities.length > 0) {
                    var receiver_conversation_array = entities[0].conversation_list.split(",");
                    receiver_conversation_array.push(conversation_id);

                    var new_user = entities[0].data;
                    new_user.conversation_list = receiver_conversation_array;
                    if (receiver_conversation_array) {

                        //Update user friend list
                        datastore.update({
                            key: datastore.key(['UserInfo', entities[0].key.id]),
                            data: new_user
                        }, function (err) {
                            if (err) {
                                res.json({"status": "fail", "message": "update conversation list fail"});
                                // Task updated successfully.
                            } else {
                                res.json({"status": "success", "message": "update", 'update_value': entities[0]});
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
    }, function (err) {
        if (err) {
            return res.json({
                "status": "fail",
                "message": "conversation input fail",
                "error": 'save datastore conversation error'
            });
        }

    });



});


app.post("/continue-conversation", jsonParser, function (req, res) {
    var conversation_id = req.body.conversation_id;

    var query = datastore.createQuery('Conversation')
        .filter('id', '=', conversation_id);
    datastore.runQuery(query, function (err, entities) {
        if (entities.length > 0) {
            var query_message = datastore.createQuery('MessageInfo')
                .filter('id', '=', conversation_id)
                // .order('-created_date');
            datastore.runQuery(query_message, function (err, message) {
                res.json({message_list: message, organizer: entities[0].organizer, member: entities[0].member})

            });

        }
    });




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
        console.log(cb);
        return cb(body);
    });
}



// setup new webserver for socket.io listening on 65080
var app_chat = require('express')();
var server1 = require('http').Server(app_chat);
var io = require('socket.io')(server1);
server1.listen(65080);




io.on('connection', function (socket) {

    socket.emit('news', { hello: 'world' });

    socket.on("just enter",function (data) {
        console.log("There is a person entered. His name is ", data.name);
        io.sockets.emit("welcome",{name: data.name})
    });

    //TODO send the message to only conversation's member

    socket.on("send a message", function (data) {
        // var room = "room numner 1";
        // socket.join(room);
        io.sockets.emit("notify a new message", {
            sender: data.sender,
            receiver: data.receiver,
            message_text: data.message_text,
            conversation_id: data.conversation_id,

        })

    });

    socket.on("typing",function (data) {
        io.sockets.emit("notify typing",{
            sender: data.sender,
            receiver: data.receiver,
            conversation_id: data.conversation_id

        });

    });

    socket.on("stop typing",function (data) {
        io.sockets.emit("notify stop typing",{
            sender: data.sender,
            receiver: data.receiver,
            conversation_id: data.conversation_id
        });

    });

});


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
