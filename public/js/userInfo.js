/**
 * Created by nhutth on 10/19/16.
 */
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
var datastore = Datastore();
var exports = module.exports = {};

exports.createUserInfo = function (params) {
    update(null, data, cb);

    var query = datastore.createQuery('UserInfo')
        .filter('user_name', '=', params.user_name);
    datastore.runQuery(query, function (err, tasks) {
        if (!err) {
            // Task entities found.
            console.log('khong co tim thay');
        }
        else {
            console.log('test query info');
        }
    });
};

function update (id, data, cb) {
    var key;
    if (id) {
        key = datastore.key([String, parseInt(id, 10)]);
    } else {
        key = datastore.key(String);
    }

    var entity = {
        key: key,
        data: toDatastore(data, ['description'])
    };

    ds.save(
        entity,
        function (err) {
            data.id = entity.key.id;
            cb(err, err ? null : data);
        }
    );
}

function addTask (params, callback) {
  var userInfo = datastore.key('UserInfo');

//  datastore.save({
//    key: userInfo,
//    data: [
//      {
//        name: 'id',
//        value: String
//      },
//      {
//        name: 'user_name',
//        value: ,
//        excludeFromIndexes: true
//      },
//      {
//        name: 'done',
//        value: false
//      }
//    ]
//  }, function (err) {
//    if (err) {
//      return callback(err);
//    }
//
//    var taskId = taskKey.path.pop();
//    console.log('Task %d created successfully.', taskId);
//    return callback(null, taskKey);
//  });
}