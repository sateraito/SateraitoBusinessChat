var redirect_url = null;

//<script>
  window.fbAsyncInit = function() {
      FB.init({
          appId: '358391011159848',
          secret: 'a3d56e44405b38e7ba7751c8ab1b57db',
          xfbml: true,
          version: 'v2.8'
      });
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
//</script>

//function fbAsyncInit() {
////    FB.init({
////        appId: '1627722644145934',
////        status: true, // check login status
////        cookie: true, // enable cookies to allow the server to access the session
////        xfbml: true,  // parse XFBML
////        version: 'v2.5'
////    });
//
//    FB.init({
//        appId: '358391011159848',
//        status: true, // check login status
//        cookie: true, // enable cookies to allow the server to access the session
//        xfbml: true,  // parse XFBML
//        oauth: true,
//        version: 'v2.8'
//    });
//}

function sortMethod(a, b) {
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

function FacebookLogin() {
    FB.login(function(response) {
        if (response.authResponse) {
            FB.api('/me',{fields: 'id,name,first_name,last_name,email,friends'}, function (response) {
                console.log('me');
                console.log(response);
            });

            FB.api('/me/friends', function (response) {
                console.log('friends');
                console.log(response);
            }, {scope: 'user_friends'});

            FB.api('/me/taggable_friends?limit=100', function (response) {
                console.log('taggable_friends');
                console.log(response);
            });

        }
    }, {scope: 'user_friends, publish_actions'});

//     FB.login(
//         function (response){
//             console.log('test 3');
//             console.log(response.authResponse);
//             if (response.authResponse){
//                  // get friends
//                    FB.api('/me/friends?limit=100', function(response) {
//                        console.log('friends');
//                        console.log(response);
////                        var result_holder = document.getElementById('result_friends');
//                        var friend_data = response.data.sort(sortMethod);
//                        var results = '';
//                        for (var i = 0; i < friend_data.length; i++) {
////                            results += '<div><img src="https://graph.facebook.com/' + friend_data[i].id + '/picture">' + friend_data[i].name + '</div>';
//                            console.log(friend_data[i])
//                        }
//                        // and display them at our holder element
//                    });
//
//                    /* make the API call */
//                    FB.api(
//                        "/{user-id}/friends",
//                        function (response) {
//                          if (response && !response.error) {
//                            /* handle the result */
//                          }
//                        }
//                    );
//
//             }
//         }
//         function (response) {
//             console.log('test 1');
//             console.log(response);
//              if (response.status == 'connected') {
//                  FB.api('/me',{fields: 'id,name,first_name,last_name,email,friends'}, function (response) {
//                      console.log('me');
//                      console.log(response);
//                  }, {scope: 'user_friends'});
//
//                  FB.api('/me/friends', function(response) {
//                      console.log('test friends');
//                      console.log(response);
//                      if (response.data) {
//                          $.each(response.data, function (index, friend) {
//                              console.log(friend.name + ' has id:' + friend.id);
//                          });
//                      } else {
//                          alert("Error!");
//                      }
//                  });
//
//
//                  FB.api('/me/feed', function (response) {
////                  FB.api('/me/friends',{fields: 'name, id,location, birthday'}, function (response) {
//                      console.log('test feed');
//                      console.log(response);
//                  }, {scope: 'user_friends'});
//
//                  // get friends
////                FB.api('/me/invitable_friends', function(response) {
////                    console.log('invitable_friends');
////                    console.log(response);
////                    var result_holder = document.getElementById('result_friends');
////                    var friend_data = response.data.sort(sortMethod);
////
//////                    var results = '';
////                    for (var i = 0; i < friend_data.length; i++) {
//////                        results += '<div><img src="https://graph.facebook.com/' + friend_data[i].id + '/picture">' + friend_data[i].name + '</div>';
//////                        results +=  friend_data[i].id + friend_data[i].name;
////                        console.log('friend_data[i].id');
////                        console.log(friend_data[i].id);
////                        console.log('friend_data[i].name');
////                        console.log(friend_data[i].name);
////                    }
////
////                    // and display them at our holder element
//////                    result_holder.innerHTML = '<h2>Result list of your friends:</h2>' + results;
////                });
//              }
//
////             if (response.status == 'connected') {
////
////                 FB.api('/me', {fields: 'id,name,first_name,last_name,gender,age_range,link,locale,email'}, function (response) {
////
////
////                     var form = $('<form></form>');
////
////                     form.attr("method", "post");
////                     form.attr("action", "/general/facebook-sign-in");
////
////
////                     var email_field = $('<input></input>');
////
////                     email_field.attr("type", "hidden");
////                     email_field.attr("name", "email");
////                     email_field.attr("value", response.email);
////
////                     var last_name_field = $('<input></input>');
////
////                     last_name_field.attr("type", "hidden");
////                     last_name_field.attr("name", "last_name");
////                     last_name_field.attr("value", response.last_name);
////
////                     var first_name_field = $('<input></input>');
////                     first_name_field.attr("type", "hidden");
////                     first_name_field.attr("name", "first_name");
////                     first_name_field.attr("value", response.first_name);
////
////                     var sexual_field = $('<input></input>');
////                     sexual_field.attr("type", "hidden");
////                     sexual_field.attr("name", "sexual");
////                     sexual_field.attr("value", response.gender);
////
////                     var image_field = $('<input></input>');
////                     image_field.attr("type", "hidden");
////                     image_field.attr("name", "image_url");
////                     image_field.attr("value", "https://graph.facebook.com/" + response.id + "/picture?type=square");
////
////                     var time_offset_field = $('<input></input>');
////
////                     var offset = new Date().getTimezoneOffset() / 60;
////                     time_offset_field.attr("type", "hidden");
////                     time_offset_field.attr("name", "time_offset");
////                     time_offset_field.attr("value", offset);
////
////                     form.append(email_field);
////                     form.append(time_offset_field);
////                     form.append(last_name_field);
////                     form.append(first_name_field);
////                     form.append(image_field);
////                     form.append(sexual_field);
////
////
////                     // The form needs to be a part of the document in
////                     // order for us to be able to submit it.
////                     $(document.body).append(form);
////                     form.submit();
////
////                 });
////
////
////             }
//         },

//         {
//             scope: "email, user_friends"
//         }
//     );
 }

 function FacebookLogout() {
     FB.logout(function (response) {
//   //Removing access token form localStorage.
//   $('#loginBtn').show();
//   $('#logoutBtn').hide();
//   $('#userDetails').hide();
     });
 }

fbAsyncInit();