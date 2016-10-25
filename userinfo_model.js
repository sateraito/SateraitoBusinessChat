/**
 * Created by nhutth on 10/19/16.
 */

//'use strict';
//var exports = module.exports = {};

var Datastore = require('@google-cloud/datastore');
var crypto = require('crypto');

// Instantiate a datastore client
var datastore = Datastore();

///**
// * Insert a user info record into the database.
// *
// * @param {object} user info The User record to insert.
// * @param {function} callback The callback function.
// */
var insertUserInfo = function (params, callback) {
    datastore.save({
        key: datastore.key('UserInfo'),
        data: params
    }, function (err) {
        if (err) {
            return callback(err);
        }
        return callback();
    })
};

///**
// * Retrieve the user records from the database.
// *
// * @param {function} callback The callback function.
// */
var getUserLists = function (params, callback) {
    var query = datastore.createQuery('UserInfo')
        .filter('email', '=', params);
//        .filter('email', '=', params.email);

    datastore.runQuery(query, function (err, entities) {
        if (err) {
            return callback(err);
        }
        var date = new Date();
        console.log('test');
        var userinfo = {
            // Store a hash of the use
//        id: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 9),
            id: generateUserId(),
//            user_name: arr(params.email)[0],
            user_name: '',
            password: params.password,
            validation_code: crypto.createHash('sha256').update(date).digest('hex').substr(0, 9),
            email: params.email,
//            first_name: arr(params.email)[0],
            first_name: '',
            last_name: '',
            image_url: '',
            friend_list: '',
            conversation_list: '',
            is_validated: '',
            birthday: '',
            address: '',
            company: '',
            website: '',
            modified: '',
            created_date: new Date(),
            updated_datetime: new Date()
        };

        console.log('**************');
        console.log(userinfo);
//        return callback(null, entities.map(function (entity) {
//            console.log(entity.length);
//        insertUserInfo(userinfo);
//        }));
    });

    //    var userinfo = {
//        // Store a hash of the use
////        id: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 9),
//        id: generateUserId(),
//        user_name: arr[0],
//        password: password,
//        validation_code: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 9),
//        email: email,
//        first_name: arr[0],
//        last_name: '',
//        image_url: '',
//        friend_list: '',
//        conversation_list: '',
//        is_validated: '',
//        birthday: '',
//        address: '',
//        company: '',
//        website: '',
//        modified: '',
//        created_date: new Date(),
//        updated_datetime: new Date()
//    };
};

var generateUserId = function (){
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

var arr = function(string) {
    string.split(",").map(function (val) {
        return val;
    });
};

module.exports = {
    insertUser: insertUserInfo,
    getUsers: getUserLists,
    generateID: generateUserId
};


//var kind = 'UserInfo';
// [END config]
// Translates from Datastore's entity format to
// the format expected by the application.
//
// Datastore format:
//   {
//     key: [kind, id],
//     data: {
//       property: value
//     }
//   }
//
// Application format:
//   {
//     id: id,
//     property: value
//   }
//function fromDatastore (obj) {
//    obj.data.id = obj.key.id;
//    return obj.data;
//}

// Translates from the application's format to the datastore's
// extended entity property format. It also handles marking any
// specified properties as non-indexed. Does not translate the key.
//
// Application format:
//   {
//     id: id,
//     property: value,
//     unindexedProperty: value
//   }
//
// Datastore extended format:
//   [
//     {
//       name: property,
//       value: value
//     },
//     {
//       name: unindexedProperty,
//       value: value,
//       excludeFromIndexes: true
//     }
//   ]
//function toDatastore (obj, nonIndexed) {
//  nonIndexed = nonIndexed || [];
//  var results = [];
//  Object.keys(obj).forEach(function (k) {
//    if (obj[k] === undefined) {
//      return;
//    }
//    results.push({
//      name: k,
//      value: obj[k],
//      excludeFromIndexes: nonIndexed.indexOf(k) !== -1
//    });
//  });
//  return results;
//}

// Lists all books in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, books, nextPageToken)``.
// [START list]
//function list (limit, token, cb) {
//  var q = ds.createQuery([kind])
//    .limit(limit)
//    .order('title')
//    .start(token);
//
//  ds.runQuery(q, function (err, entities, nextQuery) {
//    if (err) {
//      return cb(err);
//    }
//    var hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
//    cb(null, entities.map(fromDatastore), hasMore);
//  });
//}
// [END list]

//// Creates a new book or updates an existing book with new data. The provided
//// data is automatically translated into Datastore format. The book will be
//// queued for background processing.
//// [START update]
//function update (id, data, cb) {
//    var key;
////    console.log(data.user_name);
//    if (id) {
//        key = ds.key([kind, parseInt(id, 10)]);
//    } else {
//        key = ds.key(kind);
//    }
//
////    console.log('test');
//    var entity = {
//        key: key,
//        data: toDatastore(data, ['description'])
//    };
//
////    console.log('save to datastore');
//    ds.save(
//        entity,
//        function (err) {
//            data.id = entity.key.id;
//            cb(err, err ? null : data);
//        }
//    );
//}
//// [END update]
//
//function read (id, cb) {
//  var key = ds.key([kind, parseInt(id, 10)]);
//  ds.get(key, function (err, entity) {
//    if (err) {
//      return cb(err);
//    }
//    if (!entity) {
//      return cb({
//        code: 404,
//        message: 'Not found'
//      });
//    }
//    cb(null, fromDatastore(entity));
//  });
//}
//
//function _delete (id, cb) {
//  var key = ds.key([kind, parseInt(id, 10)]);
//  ds.delete(key, cb);
//}
//
////var exports = module.exports = {};
//// [START exports]
////exports.createUserInfo = function
////exports.create = function (data, callback){
////    console.log('call create user info');
////    update(null, data, cb);
////};
////
////exports.read = function (){
////    read();
//////    console.log('call create user info');
//////    update(null, data, cb);
////};
////
////exports.update = function (){
////    update();
//////    console.log('call create user info');
//////    update(null, data, cb);
////};
////
////exports.delete = function (){
////    _delete();
//////    console.log('call create user info');
//////    update(null, data, cb);
////};
////
////exports.list = function (){
////    list();
//////    console.log('call create user info');
//////    update(null, data, cb);
////};



//module.exports = {
//  create: function (data, cb) {
//      console.log('call create user info');
//    update(null, data, cb);
//  },
//  read: read,
//  update: update,
//  delete: _delete,
//  list: list
//};
// [END exports]