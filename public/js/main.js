$(function() {
    console.log('main js');
//    var socket = io();
//    var socket = io.connect();
    /* The external ip is determined by app.js and passed into the template. */
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri =  webSocketHost + externalIp + ':65080';
    console.log(webSocketUri);
    console.log(externalIp != '<%= externalIp %>');

    var socket = io(webSocketUri);

    socket.on('chat_message', function(msg){
        console.log(msg);
        console.log('Msg from server: ' + msg);
    });

    socket.on('connect' ,function(msg){
        console.log('Connected to server: socketio');
    });

    socket.on('disconnect' ,function(msg){
        console.log('Disconnected from server: socketio');
    });

    $("#login_btn").on("click",function () {
        var email = $("#login_email").val();
        var password = $("#login_password").val();

        $(".login_error_message").text("");

        if(!isValidateEmail(email)){
            $(".login_error_message").text("不正なメールアドレスです！");
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
            success: function (respone){
                console.log(respone);
                if(respone.status == "fail"){
                    $(".login_error_message").text("不正なアカウント情報です。");
                    return false;
                } else {
                    // Tell the server your username
                    socket.emit('user login', email);
//                    window.location.href = "/main-space";

                    $(location).attr("href", "/main-space");
                }
            }
        });
    });

    $("#signup_btn").on("click",function () {
        var email = $("#signup_email").val();
        var password = $("#signup_password").val();
        var password_again = $("#signup_password_again").val();

        $(".signup_error_message").text("");

        if(!isValidateEmail(email)){
            $(".signup_error_message").text("不正なメールアドレスです！");
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
                if(respone.status == "fail"){
                    console.log(respone.message);
                    $(".login_error_message").text("不正なアカウント情報です。");
                    return false;
                } else {
                    // Tell the server your username
                    socket.emit('user login', email);
//                    window.location.href = "/main-space";

                    $(location).attr("href", "/main-space");
                }
            }
        });
//        $.post("/do-sign-up",
//            {
//                email: email,
//                password: password,
//                password_again: password_again
//            },
//            function (data) {
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
//                }else{
//                    // Tell the server your username
//                    socket.emit('user login', email);
//
//                    $(location).attr("href","/main-space");
//
//                }
//
//            }
//        );



    });




});

function isValidateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
};



