

$(function() {
    console.log('main js');
//    var socket = io();
    var socket = io.connect();

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
        //call signup AJAX
        $.post("/user-login",
            {
                email: email,
                password: password


            },
            function (data) {

                if (data.status == "invalid account") {
                    $(".login_error_message").text("不正なアカウント情報です。");
                    return false;

                }else{
                    // Tell the server your username
                    socket.emit('user login', email);

                    $(location).attr("href","/chat-room");

                }

            }
        );



    });

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
        $.post("/do-sign-up",
            {
                email: email,
                password: password,
                password_again: password_again

            },
            function (data) {

                if (data.status == "email existed") {
                    $(".signup_error_message").text("メールアドレスは既に登録されます。他のメールアドレスを登録してください。");
                    return false;

                } else if(data.status == "db error") {
                    $(".signup_error_message").text("データベースへの接続はエラ発生です");
                    return false;


                }else if (data.status == "password error"){
                    $(".signup_error_message").text("パスワードとパスワード再入力は一致しません。");
                    return false;

                }else{
                    // Tell the server your username
                    socket.emit('user login', email);

                    $(location).attr("href","/chat-room");

                }

            }
        );



    });




});

function isValidateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
};



