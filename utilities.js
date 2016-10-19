var exports = module.exports = {};
var mysql      = require('mysql');
var pg = require('pg');
pg.defaults.ssl = true;

var connectionString = process.env.DATABASE_URL || 'postgres://jrcjlraniylldp:UBsJBmkl7_6QD0OkXMmaevdrv7@ec2-54-221-234-118.compute-1.amazonaws.com:5432/df0csmnbi5m9qd';



exports.getPGConnection = function () {

    var client = new pg.Client(connectionString);
    client.connect();
    return client;
};

exports.runPGQuery = function(queryString, callback) {
    // connect to postgres database
    pg.connect(connectionString,function(err,client,done) {
        // if error, stop here
        if (err) {console.error(err); done(); callback(); return;}
        // execute queryString
        client.query(queryString,function(err,result) {
            // if error, stop here
            if (err) {console.error(err+'\nQuery: '+queryString); done(); callback(); return;}
            // callback to close connection
            done();
            // callback with results
            callback(result.rows);
        });
    });
}





exports.getMySqlConnection = function () {
    //config MYSQL
    // var connection = mysql.createConnection({
    //     host     : 'localhost',
    //     user     : 'root',
    //     password : 'Search2007,,',
    //     database : 'sateraito_business_chat',
    //     socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
    // });

    var connection = mysql.createConnection({
        host     : '127.0.0.1',
        user     : 'nathavnb_tri',
        password : 'namanh1309',
        database : 'nathavnb_chat',
        socketPath: '/var/lib/mysql/mysql.sock'
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

exports.generateMessageId = function () {
    Date.prototype.yyyymmdd = function() {
        var mm = this.getMonth() + 1; // getMonth() is zero-based
        var dd = this.getDate();

        return [this.getFullYear(), !mm[1] && '', mm, !dd[1] && '0', dd].join(''); // padding
    };

    var date = new Date();


    var user_id = "thread_" + date.yyyymmdd();

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        user_id += possible.charAt(Math.floor(Math.random() * possible.length));

    return user_id;


};




