var exports = module.exports = {};

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


    var user_id = "message_" + date.yyyymmdd();

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        user_id += possible.charAt(Math.floor(Math.random() * possible.length));

    return user_id;


};


exports.generateRandomString = function() {
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


//Sort array by key with ascending order by date
exports.sortByKey = function(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
};


