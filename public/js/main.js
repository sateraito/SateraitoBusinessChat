
$(function() {
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    console.log(externalIp != '<%= externalIp %>');
    if (externalIp != '<%= externalIp %>'){
        externalIp = '<%= externalIp %>';
    }
    var webSocketUri =  webSocketHost + externalIp + ':65080';
    console.log(webSocketUri);


    var socket = io(webSocketUri);

    //Login process
    $("#login_btn").on("click",function () {
        var email = $("#login_email").val();
        var password = $("#login_password").val();

        $(".login_error_message").text("");

        if(!isValidateEmail(email)){
            $(".login_error_message").text("不正なメールアドレスです！")
            return false;

        }else if (!$.trim(password)) {
            $(".login_error_message").text("パスワードは必須です。");

            return false;
        }

        // call signin AJAX
        $.ajax({
            url: "/user-login",
            method: "POST",
            dataType: "JSON",
            data: '&email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password),
            async: false,
            success: function (respone) {
                console.log(respone);
                if (respone.status == "invalid email" || respone.status == "invalid password") {
                    $(".login_error_message").text("不正なアカウント情報です。");
                    return false;
                } else if (respone.status == "success") {
                    $(location).attr("href", "/main-space");

                }
//                if(respone.status == "fail"){
//                    $(".login_error_message").text("不正なアカウント情報です。");
//                    return false;
//                } else {
//                    // Tell the server your username
//                    socket.emit('user login', email);
////                    window.location.href = "/main-space";
//
//                    $(location).attr("href", "/main-space");
//                }
            }
        });

//        $.post("/user-login",
//            {
//                email: email,
//                password: password
//
//
//            },
//            function (data) {
//                if (data.status == "invalid email" || data.status == "invalid password") {
//                    $(".login_error_message").text("不正なアカウント情報です。");
//                    return false;
//                }else if (data.status == "success"){
//                    $(location).attr("href","/main-space");
//
//                }
//
//            }
//        );



    });

    $('.signin_form').keydown(function (e) {
        if (e.keyCode == 13) {
            var email = $("#login_email").val();
            var password = $("#login_password").val();

            $(".login_error_message").text("");

            if (!isValidateEmail(email)) {
                $(".login_error_message").text("不正なメールアドレスです！")
                return false;

            } else if (!$.trim(password)) {
                $(".login_error_message").text("パスワードは必須です。");

                return false;
            }

            $.ajax({
                url: "/user-login",
                method: "POST",
                dataType: "JSON",
                data: '&email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password),
                async: false,
                success: function (respone) {
                    console.log(respone);
                    if (respone.status == "invalid email" || respone.status == "invalid password") {
                        $(".login_error_message").text("不正なアカウント情報です。");
                        return false;
                    } else if (respone.status == "success") {
                        $(location).attr("href", "/main-space");

                    }
                }
            });

        }
    });



    //Signup proccess
    $("#signup_btn").on("click",function () {
        var email = $("#signup_email").val();
        var password = $("#signup_password").val();
        var password_again = $("#signup_password_again").val();

        $(".signup_error_message").text("");

        if(!isValidateEmail(email)){
            $(".signup_error_message").text("不正なメールアドレスです！")
            return false;

        }else if (password != password_again){
            $(".signup_error_message").text("パスワードとパスワード再入力は一致しません。");
            return false;

        }else if (!$.trim(password) || !$.trim(password_again)) {
            $(".signup_error_message").text("パスワードは必須です。");

            return false;
        }

        //call signup AJAX
        $.ajax({
            url: "/do-sign-up",
            method: "POST",
            dataType: "JSON",
            data: '&email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password) + '&password_again=' + encodeURIComponent(password_again),
            async: false,
            success: function (respone){
                console.log(respone);
                if (respone.status == "email existed") {
                    $(".signup_error_message").text("メールアドレスは既に登録されます。他のメールアドレスを登録してください。");
                    return false;

                } else if(respone.status == "db error") {
                    $(".signup_error_message").text("データベースへの接続はエラ発生です");
                    return false;


                }else if (respone.status == "password error"){
                    $(".signup_error_message").text("パスワードとパスワード再入力は一致しません。");
                    return false;

                }else if (respone.status == "success"){

                    $(location).attr("href","/main-space");

                }
            }
        });
//        $.post("/do-sign-up",
//            {
//                email: email,
//                password: password,
//                password_again: password_again
//
//            },
//            function (data) {
//
//                if (data.status == "email existed") {
//                    $(".signup_error_message").text("メールアドレスは既に登録されます。他のメールアドレスを登録してください。");
//                    return false;
//
//                } else if(data.status == "db error") {
//                    $(".signup_error_message").text("データベースへの接続はエラ発生です");
//                    return false;
//
//
//                }else if (data.status == "password error"){
//                    $(".signup_error_message").text("パスワードとパスワード再入力は一致しません。");
//                    return false;
//
//                }else if (data.status == "success"){
//
//                    $(location).attr("href","/main-space");
//
//                }
//
//            }
//        );



    });

    $('.signup_form').keydown(function (e) {
        if (e.keyCode == 13) {
            var email = $("#signup_email").val();
            var password = $("#signup_password").val();
            var password_again = $("#signup_password_again").val();

            $(".signup_error_message").text("");

            if (!isValidateEmail(email)) {
                $(".signup_error_message").text("不正なメールアドレスです！")
                return false;

            } else if (password != password_again) {
                $(".signup_error_message").text("パスワードとパスワード再入力は一致しません。");
                return false;

            } else if (!$.trim(password) || !$.trim(password_again)) {
                $(".signup_error_message").text("パスワードは必須です。");

                return false;
            }

            //call signup AJAX
            $.ajax({
                url: "/do-sign-up",
                method: "POST",
                dataType: "JSON",
                data: '&email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password) + '&password_again=' + encodeURIComponent(password_again),
                async: false,
                success: function (respone) {
                    console.log(respone);
                    if (respone.status == "email existed") {
                        $(".signup_error_message").text("メールアドレスは既に登録されます。他のメールアドレスを登録してください。");
                        return false;

                    } else if (respone.status == "db error") {
                        $(".signup_error_message").text("データベースへの接続はエラ発生です");
                        return false;


                    } else if (respone.status == "password error") {
                        $(".signup_error_message").text("パスワードとパスワード再入力は一致しません。");
                        return false;

                    } else if (respone.status == "success") {

                        $(location).attr("href", "/main-space");

                    }
                }
            });
        }
    });
});

function isValidateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
};

function login_page_load() {
    var screen_height = $(window).height();
    $(".login_container").css({"height":screen_height});

}


//Login with Facebook
function fbAsyncInit() {
    FB.init({
        appId      : '1460862620609106',
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true,  // parse XFBML
        version    : 'v2.8'
    });
}
function FacebookLogin() {
    FB.login(
        function(response) {
            if (response.status== 'connected') {

                FB.api('/me', {fields: 'id,name,first_name,last_name,gender,age_range,link,locale,email'},function(response) {
                    //TODO save facebook account into UserInfo
                    // call signup AJAX
                    $.post("/user-login-facebook",
                        {
                            email: response.email
                        },
                        function (data) {

                            if (data.status == "success") {
                                $(location).attr("href","/main-space");

                            }else{
                                console.log("error occured",data.error)

                            }

                        }
                    );



                });



            }
        },

        {
            scope: "email"
        }
    );
}



fbAsyncInit();

//End login with facebook

//Login with Google

function onLoadCallback()
{
    gapi.client.setApiKey('AIzaSyDyGW6BnT_AeFqJ33vdmDY3Zb_rZbAIicw'); //set your API KEY
    gapi.client.load('plus', 'v1',function(){});//Load Google + API
}


function GoogleLogin()
{
    var myParams = {
        'clientid' : '713589055067-mrq68sea8m9minugb8lqmgnnvqqqqa84.apps.googleusercontent.com', //You need to set client id
        'cookiepolicy' : 'single_host_origin',
        'callback' : 'loginCallback', //callback function
        'approvalprompt':'force',
        'scope' : 'https://www.googleapis.com/auth/plus.login ' +
        'https://www.googleapis.com/auth/plus.profile.emails.read' + "https://www.google.com/m8/feeds"
    };
    gapi.auth.signIn(myParams);
}

function loginCallback(result)
{

    console.log("google result",result);
    console.log("gapi.client", gapi.client);
    console.log("gapi.client.plus", gapi.client.plus);

    if(result['status']['signed_in'])

    {
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
//        var request = gapi.client.plus.people.get(
//            {
//                'userId': 'me'
//            });
//        request.execute(function (resp)
//        {
//
//            var email = '';
//            if(resp['emails'])
//            {
//                for(i = 0; i < resp['emails'].length; i++)
//                {
//                    if(resp['emails'][i]['type'] == 'account')
//                    {
//                        email = resp['emails'][i]['value'];
//                    }
//                }
//            }
//
//            // call signup AJAX
//            $.post("/user-login-google",
//                {
//                    email: email
//                },
//                function (data) {
//                    if (data.status == "ok") {
//                        $(location).attr("href","/main-space");
//
//                    }
//
//                }
//            );
//
//
//
//
//        });

    }

}


//End login with Google






