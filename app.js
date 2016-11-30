var utilities = require("./utilities");

var express = require("express");
var path = require('path');
var request = require('request');
var app = express();
var server = require("http").createServer(app);
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
app.enable('trust proxy');

// These environment variables are set automatically on Google App Engine
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
        secret: 'fdhgfsddheuywsa176r6492dahdb885701046',
        resave: false,
        saveUninitialized: true
    }
));

//Google Storage config
// These environment variables are set automatically on Google App Engine
var Storage = require('@google-cloud/storage');

// Instantiate a storage client
var storage = Storage();
// Multer is required to process file uploads and make them available via
// req.files.
var multer = require('multer')({
    inMemory: true,
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
});

// A bucket is a container for objects (files).
var bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
var format = require('util').format;

// [END config]

var images_smiles = ["image/emoji/smile_1.png", "image/emoji/smile_2.png", "image/emoji/smile_3.png", "image/emoji/smile_4.png",
                    "image/emoji/smile_5.png", "image/emoji/smile_6.png", "image/emoji/smile_7.png", "image/emoji/smile_8.png",
                    "image/emoji/smile_9.png", "image/emoji/smile_10.png"];
var images_animals = ["image/emoji/animal_1.png", "image/emoji/animal_2.png", "image/emoji/animal_3.png", "image/emoji/animal_4.png",
                    "image/emoji/animal_5.png", "image/emoji/animal_6.png", "image/emoji/animal_7.png", "image/emoji/animal_8.png",
                    "image/emoji/animal_9.png", "image/emoji/animal_10.png"];

app.get("/", function (req, res) {

    if(req.session.user_id){
        res.redirect("/main-space")
    }else{
        getExternalIp(function (externalIp) {
            res.render('home', {externalIp: externalIp});
        });
    }

});

app.get("/logout", function (req, res) {

    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', req.session.user_email);

    datastore.runQuery(query, function (err, entities) {
        if (err) {
            return res.json({"status": "fail", "message": "invalid account query error","email": email});
        }
        if (entities.length > 0) {
            var user_info = entities[0].data;
            user_info.is_online = false;

            datastore.update({
                key: entities[0].key,
                data: user_info
            }, function (update_err) {
                if (update_err) {
                    res.json({"status": "fail", "message": "update conversation list fail"});
                    // Task updated successfully.
                } else {
                    req.session.user_id = null;
                    req.session.user_email = null;
                    req.session.user_name = null;
                    req.session.user_image_url = null;
                    req.session.user_type = null;

                    res.redirect("/");
                }
            });

        }
    });


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

    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', email);
    datastore.runQuery(query, function (err, entities) {
        if (err) {
            return res.json({"status": "fail", "message": "invalid account query error", "email": entities[0].data.email});
        }

        if (entities.length > 0) {
            res.json({"status": "email existed"})
        } else {
            var arr = email.split("@").map(function (val) {
                return val;
            });
            var hash_password = bcrypt.hashSync(password, salt);
            var new_user_id = utilities.generateUserId();
            var userinfo = {
                // Store a hash of the use
                user_id: new_user_id,
                user_name: arr[0],
                password: hash_password,
                validation_code: utilities.generateRandomString(),
                email: email,
                is_validated:'',
                first_name: arr[0],
                last_name: '',
                image_url: 'image/avt-default-1.png',
                friend_list: [],
                conversation_list: [],
                birthday: '',
                address: '',
                company: '',
                is_online: false,
                is_requested_user_list: [],
                do_requesting_user_list: [],
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
                    req.session.user_id = new_user_id;
                    req.session.user_email = email;
                    req.session.user_name = "";
                    req.session.user_image_url = "";
                    req.session.user_type = "account";

                    res.json({"status": "ok"})
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
                        req.session.user_id = entities[0].data.user_id;
                        req.session.user_email = email;
                        req.session.user_name = entities[0].data.user_name;
                        req.session.user_type = "account";
                        if(entities[0].data.image_url){
                            req.session.user_image_url = entities[0].data.image_url
                        }else{
                            req.session.user_image_url = "image/avt-default-1.png"
                        }

                        var user_info = entities[0].data;
                        user_info.is_online = true;

                        datastore.update({
                            key: entities[0].key,
                            data: user_info
                        }, function (update_err) {
                            if (update_err) {
                                res.json({"status": "fail", "message": "update conversation list fail"});
                                // Task updated successfully.
                            } else {
                                res.json({"status": "ok"});

                            }
                        });

                    }else {
                        return res.json({"status": "invalid account"});
                    }
                }

            });
        } else {
            //Email is not ok
            res.json({"status": "invalid account"});
            console.log("email wrong");
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
            //If account is existed, retrieve it's info
            req.session.user_id = entities[0].data.user_id;
            req.session.user_name = entities[0].data.user_name;
            req.session.user_email = email;
            req.session.user_type = "facebook";
            if(rows[0].image_url){
                req.session.user_image_url = entities[0].data.image_url
            }else{
                req.session.user_image_url = "image/avt-default-1.png"
            }

            var user_info = entities[0].data;
            user_info.is_online = true;

            datastore.update({
                key: entities[0].key,
                data: user_info
            }, function (update_err) {
                if (update_err) {
                    res.json({"status": "fail", "message": "update conversation list fail"});
                    // Task updated successfully.
                } else {
                    res.json({"status": "ok"});

                }
            });


        } else {
            var arr = email.split("@").map(function (val) {
                return val;
            });
            var new_user_id = utilities.generateUserId();

            var userinfo = {
                // Store a hash of the use
                user_id: new_user_id,
                user_name: arr[0],
                password: '',
                validation_code: utilities.generateRandomString(),
                email: email,
                is_validated:'',
                first_name: arr[0],
                last_name: '',
                image_url: '',
                friend_list: [],
                conversation_list: [],
                birthday: '',
                address: '',
                company: '',
                is_online: false,
                is_requested_user_list: [],
                do_requesting_user_list: [],
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
                    req.session.user_id = new_user_id;
                    req.session.user_email = email;
                    req.session.user_name = arr[0];
                    req.session.user_image_url = "image/avt-default-1.png";
                    req.session.user_type = "account";

                    res.json({"status": "ok"})
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
            //If account is existed, retrieve it's info
            req.session.user_id = entities[0].data.user_id;
            req.session.user_name = entities[0].data.user_name;
            req.session.user_email = email;
            req.session.user_type = "google";
            if(rows[0].image_url){
                req.session.user_image_url = entities[0].data.image_url
            }else{
                req.session.user_image_url = "image/avt-default-1.png"
            }

            var user_info = entities[0].data;
            user_info.is_online = true;

            datastore.update({
                key: entities[0].key,
                data: user_info
            }, function (update_err) {
                if (update_err) {
                    res.json({"status": "fail", "message": "update conversation list fail"});
                    // Task updated successfully.
                } else {
                    res.json({"status": "ok"});

                }
            });

        } else {
            var arr = email.split("@").map(function (val) {
                return val;
            });
            var new_user_id = utilities.generateUserId();

            var userinfo = {
                // Store a hash of the use
                user_id: new_user_id,
                user_name: arr[0],
                password: '',
                validation_code: utilities.generateRandomString(),
                email: email,
                is_validated:'',
                first_name: arr[0],
                last_name: '',
                image_url: 'image/avt-default-1.png',
                friend_list: [],
                conversation_list: [],
                birthday: '',
                address: '',
                company: '',
                is_online: false,
                is_requested_user_list: [],
                do_requesting_user_list: [],
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
                    req.session.user_id = new_user_id;
                    req.session.user_email = email;
                    req.session.user_name = arr[0];
                    req.session.user_image_url = "image/avt-default-1.png";
                    req.session.user_type = "account";

                    res.json({"status": "ok"})
                }
            });
        }
    });


});



app.get("/main-space", function (req, res) {

    if (req.session.user_id) {


        var user_query = datastore.createQuery('UserInfo')
            .filter('email', '=', req.session.user_email);

        //Query logged in user info from UserInfo table
        datastore.runQuery(user_query, function (err, user_entities) {
            var user_conversation_list = user_entities[0].data.conversation_list;
            var user_friend_list = user_entities[0].data.friend_list;
            if (err) {
                return res.json({"status": "db error", "error": "invalid account query error"});
            }

            if (user_conversation_list.length > 0) {

                //Get conversation info on conversation_list
                var conversation_query = datastore.createQuery('Conversation');

                datastore.runQuery(conversation_query, function (err, conversation_entities) {
                    if(conversation_entities.length > 0){

                        var user_conversation_info = [];
                        conversation_entities.forEach(function (val,i) {
                            if(user_conversation_list.indexOf(val.data.conversation_id) != -1){
                                var con_info = {};
                                con_info.conversation_title = val.data.conversation_title;
                                con_info.conversation_image_url = val.data.conversation_image_url;
                                con_info.conversation_id = val.data.conversation_id;

                                var message_query = datastore.createQuery('message_info')
                                    .filter('message_conversation_id', '=' ,val.data.conversation_id);
                                datastore.runQuery(message_query, function (err, message_entities) {
                                    var message_array = [];

                                    message_entities.forEach(function (val,i) {
                                        message_array.push(val.data);
                                    });

                                    utilities.sortByKey(message_array,'created_date').reverse();

                                    con_info.last_message = message_array[0].content;
                                    con_info.last_message_id = message_array[0].message_id;
                                    con_info.is_read_by_user_email = message_array[0].is_read_by;
                                    con_info.sender_user_name = message_array[0].sender_name;
                                    con_info.sender_image_url = message_array[0].sender_image_url;
                                    con_info.last_message_created_date = message_array[0].created_date;

                                    user_conversation_info.push(con_info);

                                    if(user_conversation_info.length == user_conversation_list.length){
                                        utilities.sortByKey(user_conversation_info,'last_message_created_date').reverse();

                                        //Get user info on friend_list
                                        var friend_user_query = datastore.createQuery('UserInfo');

                                        datastore.runQuery(friend_user_query, function (err, friend_user_entities) {
                                            var user_friend_info = [];
                                            friend_user_entities.forEach(function (val) {
                                                if(user_friend_list.indexOf(val.data.email) != -1){
                                                    var user_info = {};
                                                    user_info.user_name = val.data.user_name;
                                                    user_info.user_email = val.data.email;
                                                    user_info.is_online = val.data.is_online;
                                                    if (val.data.image_url) {
                                                        user_info.image_url = val.data.image_url;
                                                    } else {
                                                        user_info.image_url = "/image/avt-default-1.png"
                                                    }
                                                    user_friend_info.push(user_info)

                                                }

                                            });

                                            //Render the page after queries is completed
                                            getExternalIp(function (externalIp) {
                                                res.render("main_space", {
                                                    user_email: req.session.user_email,
                                                    user_name: req.session.user_name,
                                                    user_id: req.session.user_id,
                                                    user_image_url: req.session.user_image_url,
                                                    user_type: req.session.user_type,
                                                    user_first_name: user_entities[0].data.first_name,
                                                    user_last_name: user_entities[0].data.last_name,
                                                    user_address: user_entities[0].data.address,
                                                    user_company: user_entities[0].data.company,
                                                    user_friend_list: user_friend_list,
                                                    user_conversation_info: user_conversation_info,
                                                    user_conversation_list: user_conversation_list,
                                                    user_friend_info: user_friend_info,
                                                    externalIp: externalIp,
                                                    emoji_smiles: images_smiles,
                                                    emoji_animals: images_animals
                                                });
                                            });

                                        });

                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                //Get user info on friend_list
                var friend_user_query = datastore.createQuery('UserInfo');

                datastore.runQuery(friend_user_query, function (err, friend_user_entities) {
                    var user_friend_info = [];
                    friend_user_entities.forEach(function (val) {
                        if(user_friend_list.indexOf(val.data.email) != -1){
                            var user_info = {};
                            user_info.user_name = val.data.user_name;
                            user_info.user_email = val.data.email;
                            user_info.is_online = val.data.is_online;
                            if (val.data.image_url) {
                                user_info.image_url = val.data.image_url;
                            } else {
                                user_info.image_url = "/image/avt-default-1.png"
                            }
                            user_friend_info.push(user_info)

                        }

                    });

                    //Render the page after queries is completed
                    getExternalIp(function (externalIp) {
                        res.render("main_space", {
                            user_email: req.session.user_email,
                            user_name: req.session.user_name,
                            user_id: req.session.user_id,
                            user_image_url: req.session.user_image_url,
                            user_type: req.session.user_type,
                            user_first_name: user_entities[0].data.first_name,
                            user_last_name: user_entities[0].data.last_name,
                            user_address: user_entities[0].data.address,
                            user_company: user_entities[0].data.company,
                            user_friend_list: user_friend_list,
                            user_conversation_info: [],
                            user_conversation_list: user_conversation_list,
                            user_friend_info: user_friend_info,
                            externalIp: externalIp,
                            emoji_smiles: images_smiles,
                            emoji_animals: images_animals
                        });
                    });

                });


            }


        });


    }
    else {
        res.redirect("/");
    }

});

app.post("/send-a-message", jsonParser, function (req, res) {
    var sender_email = req.body.sender_email;
    var sender_name = req.body.sender_name;
    var sender_image_url = req.body.sender_image_url;
    var receiver = req.body.receiver;
    var conversation_id = req.body.conversation_id;
    var conversation_title = req.body.conversation_title;
    var message_text = req.body.message_text;
    var user_conversation_list = req.body.user_conversation_list.split(",");
    var message_id = req.body.message_id;


    //If this is a new conversation
    if(user_conversation_list.indexOf(conversation_id) == -1){

        var member_array = receiver.split(",");
        member_array.push(sender_email);
        if (member_array.length == 2){
            var query_user = datastore.createQuery('UserInfo')
            .filter('email', '=', member_array[0].trim());
            datastore.runQuery(query_user, function (receiver_image_err, receiver_image_entities) {
                var current_receiver = receiver_image_entities[0].data.image_url;
                //Create new conversation into database
                var conversation = {
                    // Store a hash of the use
                    conversation_id: conversation_id,
                    organizer: sender_email,
                    member: member_array,
                    conversation_image_url: current_receiver,
                    conversation_title: conversation_title,
                    memo: '',
                    todo: '',
                    created_date: new Date()
                };

                datastore.save({
                    key: datastore.key('Conversation'),
                    data: conversation
                }, function (save_err) {

                });
            });
        } else {

            //Create new conversation into database
            var conversation = {
                // Store a hash of the use
                conversation_id: conversation_id,
                organizer: sender_email,
                member: member_array,
                conversation_image_url: '',
                conversation_title: conversation_title,
                memo: '',
                todo: '',
                created_date: new Date()
            };

            datastore.save({
                key: datastore.key('Conversation'),
                data: conversation
            }, function (save_err) {

            });
        }

        //Update conversation list to sender
//        var query = datastore.createQuery('UserInfo')
//            .filter('email', '=', sender_email);
//        datastore.runQuery(query, function (sender_err, sender_entities) {
//            var current_conversation_list = sender_entities[0].data.conversation_list;
//            if (current_conversation_list.indexOf(conversation_id) == -1) {
//                //Update sender conversation list
//                current_conversation_list.push(conversation_id);
//                var new_user = sender_entities[0].data;
//                new_user.conversation_list = current_conversation_list;
//
//                datastore.update({
//                    key: sender_entities[0].key,
//                    data: new_user
//                }, function (update_err) {
//                    if (update_err) {
//                        res.json({"status": "fail", "message": "update conversation list fail"});
//                        // Task updated successfully.
//                    } else {
//
//                    }
//                });
//            }
//        });

        // update conversation list to receiver
        var receiver_array = receiver.split(",");
        var receiver_query = datastore.createQuery('UserInfo');
        datastore.runQuery(receiver_query, function (receiver_err, entities_receiver) {
            entities_receiver.forEach(function (val, i) {
                if (sender_email.indexOf(val.data.email) != -1) {
                    var current_conversation_list = val.data.conversation_list;
                    if (current_conversation_list.indexOf(conversation_id) == -1) {
                        //Update sender conversation list
                        current_conversation_list.push(conversation_id);
                        var new_user = val.data;
                        new_user.conversation_list = current_conversation_list;

                        datastore.update({
                            key: val.key,
                            data: new_user
                        }, function (update_err) {
                            if (update_err) {
                                res.json({status: "fail", message: "update conversation list fail"});
                                // Task updated successfully.
                            }
                        });
                    }
                }

                if (receiver_array.indexOf(val.data.email) != -1) {
                    var receiver_conversation_list = val.data.conversation_list;
                    if (receiver_conversation_list.indexOf(conversation_id) == -1) {
                        receiver_conversation_list.push(conversation_id);

                        var new_user_receiver = val.data;
                        new_user_receiver.conversation_list = receiver_conversation_list;

                        //Update user friend list
                        datastore.update({
                            key: val.key,
                            data: new_user_receiver
                        }, function (update_receiver_err) {

                        });

                    }
                }

            })
        })

    }

    //Finally add this message to database
    var message_info = {
        // Store a hash of the use
        message_id: message_id,
        message_conversation_id: conversation_id,
        content: message_text,
        sender_email: sender_email,
        sender_name: sender_name,
        sender_image_url: sender_image_url,
        receiver: receiver.split(","),
        is_read_by: sender_email.split(","),
        created_date: new Date()
    };

    datastore.save({
        key: datastore.key('message_info'),
        data: message_info
    }, function (msg_err) {
        if (msg_err) {
            res.json({
                status: "fail",
                message: "conversation input fail",
                error: "save datastore conversation error"
            });
        } else {
            res.json({
                status: "message delivered"
            });
        }
    });
});


app.post("/continue-conversation", jsonParser, function (req, res) {
    var conversation_id = req.body.conversation_id;

    var query = datastore.createQuery('Conversation')
        .filter('conversation_id', '=', conversation_id);
    datastore.runQuery(query, function (con_err, con_entities) {

        var conversation_title = con_entities[0].data.conversation_title;
        var organizer = con_entities[0].data.organizer;
        var member =  con_entities[0].data.member;

        var query_message = datastore.createQuery('message_info')
            .filter('message_conversation_id', '=', conversation_id);
        datastore.runQuery(query_message, function (msg_err, message) {
            var message_list = [];
                message.forEach(function (val) {
                    var message_info = {};
                    message_info.content = val.data.content;
                    message_info.message_id = val.data.message_id;
                    message_info.sender = val.data.sender_email;
                    message_info.sender_user_image_url = val.data.sender_image_url;
                    message_info.created_date = val.data.created_date;
                    message_list.push(message_info)
                });

                utilities.sortByKey(message_list,'created_date');

                res.json({message_list: message_list , organizer: organizer , member: member, conversation_title: conversation_title, conversation_id: conversation_id});
        });

    });

});

app.post("/mark-as-read", jsonParser, function (req, res) {
    var message_id = req.body.message_id;
    var is_read_user_email = req.body.is_read_user_email;

    //Query sender user info from UserInfo table
    var query_message = datastore.createQuery('message_info')
        .filter('message_id', '=', message_id);
    datastore.runQuery(query_message, function (message_err, message) {
        if (!message_err) {
            if (message.length > 0) {
                var current_is_read_by = message[0].data.is_read_by;

                if (current_is_read_by.indexOf(is_read_user_email) == -1) {
                    current_is_read_by.push(is_read_user_email);

                    var new_message_info = message[0].data;
                    new_message_info.is_read_by = current_is_read_by;

                    datastore.update({
                        key: message[0].key,
                        data: new_message_info
                    }, function (update_err) {
                        if (update_err) {
                            res.json({status: "fail", message: "update conversation list fail"});
                            // Task updated successfully.
                        } else {
                            res.json({status: "success", message: "update", update_value: message[0]});
                        }
                    });

                }
            } else {
                res.json({status: "fail", message: "message fail length"});
            }
        } else {
            res.json({status: "fail", message: "message fail"});
        }
    });

    res.json({status: "ok"});
});



app.post("/get-add-user-list", jsonParser, function (req, res) {
    var user_friend_list = req.body.user_friend_list.split(",");
    var user_mail = req.body.user_mail;
    var add_user_list = [];
    //Not get it own email and emails on friend list
    //Query sender user info from UserInfo table


    var query_user = datastore.createQuery('UserInfo');

    datastore.runQuery(query_user, function (user_err, user) {
        user.forEach(function (val) {
            //Retrieve only user IS NOT in user_friend_list and not his self
            if(val.data.email != user_mail && user_friend_list.indexOf(val.data.email) == -1){
                var add_user_info = {};
                add_user_info.add_user_email = val.data.email;
                if(val.data.user_name){
                    add_user_info.add_user_name = val.data.user_name;
                }else{
                    add_user_info.add_user_name = val.data.email;
                }

                if(val.data.image_url){
                    add_user_info.add_user_image_url = val.data.image_url;
                }else{
                    add_user_info.add_user_image_url = "image/avt-default-1.png"
                }

                if(val.data.company){
                    add_user_info.add_user_company = val.data.company;
                }else{
                    add_user_info.add_user_company = "";
                }

                add_user_list.push(add_user_info)


            }

        });

        res.json({
            add_user_list: add_user_list

        });

    });

});

app.post("/add-friend-request", jsonParser, function (req, res) {
    var did_request_user_email = req.body.did_request_user_email; //Example: test@gmail.com
    var is_requested_user_email = req.body.is_requested_user_email; //Example: huutri1983@gmail.com

    //Query is_requested_user_email user info from UserInfo table
    var is_requested_user_query = datastore.createQuery('UserInfo')
        .filter('email', '=', is_requested_user_email);
    datastore.runQuery(is_requested_user_query, function (user_err, user) {
        var is_requested_user_list_array = user[0].data.is_requested_user_list;
        if(is_requested_user_list_array.indexOf(did_request_user_email) == -1){
            is_requested_user_list_array.push(did_request_user_email);
        }

        var new_user = user[0].data;
        new_user.is_requested_user_list = is_requested_user_list_array;

        //Update is_requested_user_list of is_requested_user_email
        datastore.update({
            key: user[0].key,
            data: new_user
        }, function (update_err) {
            if (update_err) {
                res.json({"status": "fail", "message": "update conversation list fail"});
                // Task updated successfully.
            } else {
                //Query did_request_user_email user info from UserInfo table
                var did_request_user_query = datastore.createQuery('UserInfo')
                    .filter('email', '=', did_request_user_email);
                datastore.runQuery(did_request_user_query, function (user_err, user) {
                    var do_requesting_user_list_array = user[0].data.do_requesting_user_list;
                    if(do_requesting_user_list_array.indexOf(is_requested_user_email) == -1){
                        do_requesting_user_list_array.push(is_requested_user_email);
                    }
                    var new_user = user[0].data;
                    new_user.do_requesting_user_list = do_requesting_user_list_array;

                    //Update is_requested_user_list of is_requested_user_email
                    datastore.update({
                        key: user[0].key,
                        data: new_user
                    }, function (update_err) {
                        if (update_err) {
                            res.json({status: "fail", message: "update conversation list fail"});
                            // Task updated successfully.
                        } else {
                            res.json({
                                status: "success"
                            });
                        }
                    });

                });
            }
        });

    });
});

app.post("/get-friend-request", jsonParser, function (req, res) {
    var user_email = req.body.user_email;


    //Query did_request_user_email user info from UserInfo table
    var user_query = datastore.createQuery('UserInfo')
        .filter('email', '=', user_email);
    datastore.runQuery(user_query, function (user_err, user) {
        var is_requested_user_list = user[0].data.is_requested_user_list;
        var do_requesting_user_list = user[0].data.do_requesting_user_list;

        if (is_requested_user_list.length >0){
            //Query did_request_user_email user info from UserInfo table
            var user_query_2 = datastore.createQuery('UserInfo');
            is_requested_user_list.forEach(function (val) {
                if(val != ""){
                    user_query_2.filter('email', '=', val);
                }

            });

            datastore.runQuery(user_query_2, function (user_err, user) {
                var is_requested_user_info = [];

                user.forEach(function (val) {

                    if(is_requested_user_list.indexOf(val.data.email) != -1){
                        var requesting_user = {};
                        if(val.data.user_name){
                            requesting_user.request_user_name = val.data.user_name;
                        }else{
                            requesting_user.request_user_name = val.data.email;
                        }

                        requesting_user.request_user_email = val.data.email;

                        if(val.data.image_url){
                            requesting_user.request_user_image_url = val.data.image_url
                        }else{
                            requesting_user.request_user_image_url = "image/avt-default-1.png"
                        }

                        is_requested_user_info.push(requesting_user)
                    }


                });

                res.json({
                    is_requested_user_info : is_requested_user_info,
                    do_requesting_user_list: do_requesting_user_list,
                    is_requested_user_list: is_requested_user_list,
                    query_user_info: user
                });


            });

        }else {
            res.json({
                is_requested_user_info : [],
                do_requesting_user_list: do_requesting_user_list,
                is_requested_user_list: is_requested_user_list
            });
        }
    });
});

app.post("/deny-add-user", jsonParser, function (req, res) {
    var request_user_email = req.body.request_user_email;
    var login_user_email = req.body.login_user_email;

    //Remove request_user_email from is_requested_user_list
    var user_query = datastore.createQuery('UserInfo')
        .filter('email', '=', login_user_email);
    datastore.runQuery(user_query, function (user_err, user) {
        var current_is_requested_user_list = user[0].data.is_requested_user_list;
        var new_is_requested_user_list = [];
        current_is_requested_user_list.forEach(function (val,i) {
            if(val != request_user_email){
                new_is_requested_user_list.push(val);
            }
        });

        var new_user_info = user[0].data;
        new_user_info.is_requested_user_list = new_is_requested_user_list;


        datastore.update({
            key: user[0].key,
            data: new_user_info
        }, function (update_err) {
            if (update_err) {
                res.json({"status": "fail", "message": "update conversation list fail"});
                // Task updated successfully.
            } else {
                //Remove login_user_email from do_requesting_user_list
                var request_user_query = datastore.createQuery('UserInfo')
                    .filter('email', '=', request_user_email);
                datastore.runQuery(request_user_query, function (user_err, user) {
                    var current_do_requesting_user_list= user[0].data.do_requesting_user_list
                    var new_do_requesting_user_list = [];
                    current_do_requesting_user_list.forEach(function (val,i) {
                        if(val != login_user_email){
                            new_do_requesting_user_list.push(val);
                        }
                    });

                    var new_user_info = user[0].data;
                    new_user_info.do_requesting_user_list = new_do_requesting_user_list;

                    datastore.update({
                        key: user[0].key,
                        data: new_user_info
                    }, function (update_err) {
                        if (update_err) {
                            res.json({"status": "fail", "message": "update conversation list fail"});
                            // Task updated successfully.
                        } else {
                            res.json({
                                status: "success"
                            })
                        }
                    });
                });
            }
        });
    });
});

app.post("/approve-add-user", jsonParser, function (req, res) {
    var request_user_email = req.body.request_user_email;
    var login_user_email = req.body.login_user_email;
    var current_friend_list_array = [];

    //Remove request_user_email from is_requested_user_list and add request_user_email to friend_list
    var user_query = datastore.createQuery('UserInfo')
        .filter('email', '=', login_user_email);
    datastore.runQuery(user_query, function (user_err, user) {
        var current_is_requested_user_list = user[0].data.is_requested_user_list
        var new_is_requested_user_list = []
        current_is_requested_user_list.forEach(function (val,i) {
            if(val != request_user_email){
                new_is_requested_user_list.push(val);
            }
        });

        var current_friend_list_array = user[0].data.friend_list;

        if (current_friend_list_array.indexOf(request_user_email) == -1){
            current_friend_list_array.push(request_user_email)
        }

        var new_user_info = user[0].data;
        new_user_info.is_requested_user_list = new_is_requested_user_list;
        new_user_info.friend_list = current_friend_list_array;


        datastore.update({
            key: user[0].key,
            data: new_user_info
        }, function (update_err) {
            if (update_err) {
                res.json({"status": "fail", "message": "update conversation list fail"});
                // Task updated successfully.
            } else {
                //Remove login_user_email from do_requesting_user_list
                var request_user_query = datastore.createQuery('UserInfo')
                    .filter('email', '=', request_user_email);
                datastore.runQuery(request_user_query, function (user_err, user) {
                    var current_do_requesting_user_list= user[0].data.do_requesting_user_list
                    var new_do_requesting_user_list = []
                    current_do_requesting_user_list.forEach(function (val,i) {
                        if(val != login_user_email){
                            new_do_requesting_user_list.push(val);
                        }
                    });

                    var current_friend_list_array = user[0].data.friend_list;
                    if (current_friend_list_array.indexOf(login_user_email) == -1){
                        current_friend_list_array.push(login_user_email)
                    }

                    var new_user_info = user[0].data;
                    new_user_info.do_requesting_user_list = new_do_requesting_user_list;
                    new_user_info.friend_list = current_friend_list_array;


                    datastore.update({
                        key: user[0].key,
                        data: new_user_info
                    }, function (update_err) {
                        if (update_err) {
                            res.json({"status": "fail", "message": "update conversation list fail"});
                            // Task updated successfully.
                        } else {
                            res.json({
                                status: "success"
                            });
                        }
                    });
                });
            }
        });
    });
});

app.post("/update-conversation-member", jsonParser, function (req, res) {
    var new_receiver_email = req.body.new_receiver_email;
    var do_update_user_email = req.body.do_update_user_email;
    var conversation_id = req.body.conversation_id;

    var new_member_array = new_receiver_email.split(",");
    new_member_array.push(do_update_user_email);

    //Remove login_user_email from do_requesting_user_list
    var conversation_query = datastore.createQuery('Conversation')
        .filter('conversation_id', '=', conversation_id);
    datastore.runQuery(conversation_query, function (conversation_err, conversation) {
        if(conversation.length > 0){
            var new_conversation_info = conversation[0].data;
            new_conversation_info.member = new_member_array;


            datastore.update({
                key: conversation[0].key,
                data: new_conversation_info
            }, function (update_err) {
                if (update_err) {
                    res.json({"status": "fail", "message": "update conversation list fail"});
                    // Task updated successfully.
                } else {
                    res.json({
                        status: "success"
                    });
                }
            });

        }else{
            res.json({
                status: "success"
            });
        }
    });
});


app.post("/do-edit-user-profile", jsonParser, function (req, res) {
    var user_email = req.body.user_email;
    var user_first_name = req.body.user_first_name;
    var user_last_name = req.body.user_last_name;
    var user_address = req.body.user_address;
    var user_company = req.body.user_company;

    //Query user Info from datastore
    var user_query = datastore.createQuery('UserInfo')
        .filter('email', '=', user_email);
    datastore.runQuery(user_query, function (user_err, user) {

        //Update user profile
        var new_user_info = user[0].data;
        new_user_info.first_name = user_first_name;
        new_user_info.last_name = user_last_name;
        new_user_info.address = user_address;
        new_user_info.company = user_company;


        datastore.update({
            key: user[0].key,
            data: new_user_info
        }, function (update_err) {
            if (update_err) {
                res.json({"status": "fail", "message": "update conversation list fail"});
                // Task updated successfully.
            } else {
                res.json({
                    status: "success"
                })

            }
        });
    });

});

app.post("/do-change-user-password", jsonParser, function (req, res) {
    var user_email = req.body.user_email;
    var current_password = req.body.current_password;
    var new_password = req.body.new_password;
    var new_password_again = req.body.new_password_again;

    if (new_password != new_password_again){
        res.json({
            status: "new_password not match"
        })

    }else{
        //Query user Info from datastore
        var user_query = datastore.createQuery('UserInfo')
            .filter('email', '=', user_email);
        datastore.runQuery(user_query, function (user_err, user) {

            bcrypt.compare(current_password, user[0].data.password, function (com_err, matches) {
                if (!com_err) {
                    if (matches) {

                        var hash_password = bcrypt.hashSync(new_password, salt);
                        //Update new password
                        var new_user_info = user[0].data;
                        new_user_info.password = hash_password;

                        datastore.update({
                            key: user[0].key,
                            data: new_user_info
                        }, function (update_err) {
                            if (update_err) {
                                res.json({"status": "fail", "message": "update conversation list fail"});
                                // Task updated successfully.
                            } else {
                                res.json({
                                    status: "success"
                                })

                            }
                        });

                    }else {
                        res.json({"status": "invalid current password"});
                    }
                }

            });

        });
    }



});

app.post('/upload-user-image', multer.single('user_image_file'), function (req, res, next) {
    if (!req.file) {
        res.json({
            "status": "not ok",
            "message": "アップロードファイルはありません！"
        })
    }

    // Create a new blob in the bucket and upload the file data.
    var blob = bucket.file(req.file.originalname);
    var blobStream = blob.createWriteStream();

    blobStream.on('error', function (err) {
        return next(err);
    });

    blobStream.on('finish', function () {

        // The public URL can be used to directly access the file via HTTP.
        var publicUrl = format(
            'http://storage.googleapis.com/%s/%s',
            bucket.name, blob.name);
        //Query user Info from datastore
        var user_query = datastore.createQuery('UserInfo')
            .filter('email', '=', req.session.user_email);
        datastore.runQuery(user_query, function (user_err, user) {
            var file_location = user[0].data.image_file_name

            //Delete current image_url on cloud storage
            bucket.deleteFiles({ prefix: file_location }, function(err) {})

            //Update user profile
            var new_user_info = user[0].data;
            new_user_info.image_url = publicUrl;
            new_user_info.image_file_name = blob.name

            datastore.update({
                key: user[0].key,
                data: new_user_info
            }, function (update_err) {
                if (update_err) {

                    // Task updated successfully.
                } else {
                    req.session.user_image_url = publicUrl
                    res.json({
                        image_url: publicUrl,
                        status : "uploaded success"
                    })

                }
            });
        });


    });

    blobStream.end(req.file.buffer);
});


app.post('/upload-chat-image', multer.single('chat_image'), function (req, res, next) {
    if (!req.file) {
        res.json({
            "status": "not ok",
            "message": "アップロードファイルはありません！"
        })
    }

    // Create a new blob in the bucket and upload the file data.
    var blob = bucket.file(req.file.originalname);
    var blobStream = blob.createWriteStream();

    blobStream.on('error', function (err) {
        return next(err);
    });

    blobStream.on('finish', function () {

        // The public URL can be used to directly access the file via HTTP.
        var publicUrl = format(
            'http://storage.googleapis.com/%s/%s',
            bucket.name, blob.name);
        res.json({
            chat_image_url: publicUrl,
            chat_image_file_name: blob.name,
            status : "uploaded success"
        })

    });

    blobStream.end(req.file.buffer);
});

app.post('/delete-uploaded-chat-image', jsonParser, function (req, res, next) {

    var chat_image_file_name = req.body.chat_image_file_name


    //Delete current image_url on cloud storage
    bucket.deleteFiles({ prefix: chat_image_file_name }, function(err) {
       if(!err){
           res.json({
               status: "success"
           })
       }
    });

});

app.get("/render-image", function (req, res) {

    var chat_image_url = req.query.image_url;

    res.render('render_image',{
        image_url: chat_image_url
    });

});



//Socket.io zone

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

var users = {};


io.sockets.on('connection', function (socket) {

    //TODO send the message to only conversation's member
    socket.on("send a message", function (data) {
        // var room = "room numner 1";
        // socket.join(room);
        var all_user_receive = data.receiver.split(',');
        all_user_receive.push(data.sender);
        var value = [];
        for (var key in users) {
            value.push(key);
        }

        all_user_receive.forEach(function (val) {
            if (value.indexOf(val) !== -1) {
                io.sockets.connected[users[val]].emit("notify a new message", {
                    sender: data.sender,
                    sender_user_name: data.sender_user_name,
                    sender_user_image_url: data.sender_user_image_url,
                    receiver: data.receiver,
                    message_text: data.message_text,
                    message_id: data.message_id,
                    conversation_id: data.conversation_id,
                    conversation_title: data.conversation_title
                });
            }
        });
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

    socket.on("user logged in",function (data) {
        io.sockets.emit("logged in notify",{
            email: data.email
        });

    });

    socket.on("user logged out",function (data) {
        io.sockets.emit("logged out notify",{
            email: data.email
        });

    });

    socket.on("new add friend request",function (data) {
        io.sockets.emit("new add friend request notify",{
            did_request_user_email: data.did_request_user_email,
            did_request_user_user_name: data.did_request_user_user_name,
            did_request_user_user_image_url: data.did_request_user_user_image_url,
            is_requested_user_email: data.is_requested_user_email
        });

    });

    socket.on("new add user approval",function (data) {
        io.sockets.emit("new add user approval notify",{
            new_user_friend_info: data.new_user_friend_info
        });


    });

    socket.on("check user", function (data) {
        socket.nick_name = data.email;
        users[data.email] = socket.id;
    });

    socket.on('disconnect', function(){
        if (!socket.nick_name) return;
        delete users[socket.nick_name];
    });

});

//End socket.io zone


