var redirect_url = null;

function GoogleLogout()
{
    gapi.auth.signOut();
    location.reload();
}

function onLoadCallback()
{
    gapi.client.setApiKey('AIzaSyDyGW6BnT_AeFqJ33vdmDY3Zb_rZbAIicw'); //set your API KEY
    gapi.client.load('plus', 'v1',function(){});//Load Google + API
}

function GoogleLogin() {
    var myParams = {
        'clientid': '713589055067-mrq68sea8m9minugb8lqmgnnvqqqqa84.apps.googleusercontent.com', //You need to set client id
        'cookiepolicy': 'single_host_origin',
        'callback': 'loginCallback', //callback function
        'approvalprompt': 'force',
        'scope': 'https://www.googleapis.com/auth/plus.login ' +
            'https://www.googleapis.com/auth/plus.profile.emails.read ' + "https://www.google.com/m8/feeds"
    };
    gapi.auth.signIn(myParams);
}

function loginCallback(result)
{
    if (result['status']['signed_in']) {
        fetch(gapi.auth.getToken());
    }
}

function fetch(token) {
    $.ajax({
        url: "https://www.google.com/m8/feeds/contacts/default/full?access_token=" + token.access_token + "&alt=json",
        dataType: "jsonp",
        success: function (data) {
            // display all your data in console
            var contact_list = data.feed.entry;
            for (var i = 0; i < contact_list.length; i++) {
                console.log(contact_list[i]['gd$email'][0].address);
                console.log(contact_list[i]['title']['$t']);
            }
        }
    });
}
// End Test google contact in saterato business chat