var exports = module.exports = {};
var mysql      = require('mysql');
var pg = require('pg');


exports.getPGConnection = function () {
    var connectionString = process.env.DATABASE_URL || 'postgres://cudcioesptipdc:xbNqUbvoI8xewRADT7iK4JXfS7@ec2-54-235-125-38.compute-1.amazonaws.com:5432/d68cmv6jh8ac58';

    var client = new pg.Client(connectionString);
    client.connect();
    return client;
};





exports.getMySqlConnection = function () {
    //config MYSQL
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'Search2007,,',
        database : 'sateraito_business_chat',
        socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
    });
    connection.connect();
    return connection;
};

exports.validateEmail = function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
    };

exports.generateUserId = function () {
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


};

exports.generateConversationId = function () {
    Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [this.getFullYear(), !mm[1] && '', mm, !dd[1] && '0', dd].join(''); // padding
    };

    var date = new Date();


    var user_id = "thread_" + date.yyyymmdd();

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        user_id += possible.charAt(Math.floor(Math.random() * possible.length));

    return user_id;


};



