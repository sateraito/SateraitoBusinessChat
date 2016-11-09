
$(function() {
    /* The external ip is determined by app.js and passed into the template. */
//    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp + ':65080';

    /* Establish the WebSocket connection and register event handlers. */
    var socket = io(webSocketUri);

    //Login process
//    $("#login_btn").on("click",function () {
//        console.log('chat');
//        var email = $("#login_email").val();
//        var password = $("#login_password").val();
//
//        $(".login_error_message").text("");
//
//        if (!isValidateEmail(email)) {
//            $(".login_error_message").text("不正なメールアドレスです！")
//            return false;
//
//        } else if (!$.trim(password)) {
//            $(".login_error_message").text("パスワードは必須です。");
//
//            return false;
//        }
//
//        // call signin AJAX
//        $.ajax({
//            url: "/user-login",
//            method: "POST",
//            dataType: "JSON",
//            data: '&email=' + encodeURIComponent(email) + '&password=' + encodeURIComponent(password),
//            async: false,
//            success: function (respone) {
//                console.log(respone);
//                if (respone.status == "invalid email" || respone.status == "invalid password") {
//                    $(".login_error_message").text("不正なアカウント情報です。");
//                    return false;
//                } else if (respone.status == "success") {
//                    $(location).attr("href", "/main-space");
//
//                }
////                if(respone.status == "fail"){
////                    $(".login_error_message").text("不正なアカウント情報です。");
////                    return false;
////                } else {
////                    // Tell the server your username
////                    socket.emit('user login', email);
//////                    window.location.href = "/main-space";
////
////                    $(location).attr("href", "/main-space");
////                }
//            }
//        });
//    });

    $("#add_user_list").on("click", function () {
        var user_list_string = $("#chat_user_list").val();

        //call create chat AJAX
        // call signup AJAX
        $.ajax({
            url: "/add-user-list",
            method: "POST",
            dataType: "JSON",
            data: '&member_list=' + encodeURIComponent(user_list_string),
            async: false,
            success: function (respone) {
                console.log(respone);
                if (respone.status == "fail") {
                    return false;
                } else {

                    $("#add_user_modal").modal("hide");
                    $(location).attr("href", "/main-space")
                }
            }
        });

    });

    //Receiver new message
    socket.on("notify a new message", function (data) {
        if (user_email == data.receiver.trim() || user_email == data.sender.trim()) {
            var current_conversation = false;
            //Update conversation list
            if (user_conversation_list.split(",").indexOf(data.conversation_id) == -1) {
                var user_conversation_array = user_conversation_list.split(",");
                user_conversation_array.push(data.conversation_id);
                user_conversation_list = user_conversation_array.toString();

                var conversation_string = "<li><a href='javascript:void(0)' class='user_conversation_id' id='" + data.conversation_id + "'>" + data.conversation_id + "</a></li>";

                $(".user_conversation_list").append(conversation_string);

            }

            //TODO show the conversation popup and load the message
            $(".chat_screen_detail").each(function (i) {
                if ($(this).find(".conversation_id").val() == data.conversation_id) {
                    $(this).find(".chat_screen_body .chat_typing_icon").remove();

                    var message_string = "";
                    var chat_block_id = generateRandomString();
                    if (data.sender == user_email) {
                        message_string +=
                            "<div class='receiver_chat_message_wrapper'>" +
                            "<div class='chat_message_option' id='" + chat_block_id + "'>" +
                            "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\"" + chat_block_id + "\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;" +
                            "<a href='javascript:void(0)' class='edit_message_button' onclick='edit_message(\"" + chat_block_id + "\")'>編集</a>" +
                            "</div>" +
                            "<div class='receiver_chat_message'>" +
                            "<div class='receiver_chat_message_arrow'><img src='image/marker-chat-white.png'></div>" +
                            "<p class='chat_message_content'  onclick='show_chat_option(\"" + chat_block_id + "\")'>" + data.message_text + "</p>" +
                            "</div>" +
                            "</div>"
                    } else {
                        message_string +=
                            "<div class='sender_chat_message_wrapper'>" +
                            "<div class='chat_message_option' id='" + chat_block_id + "'>" +
                            "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\"" + chat_block_id + "\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;" +
                            "</div>" +
                            "<div class='sender_chat_message'>" +
                            "<a href='javascript:void(0)' class='chat_user_icon'><img src='image/avt-default-1.png'></a>" +
                            "<div class='sender_chat_message_arrow'><img src='image/marker-chat.png'></div>" +
                            "<p class='chat_message_content'  onclick='show_chat_option(\"" + chat_block_id + "\")'>" + data.message_text + "</p>" +
                            "</div>" +
                            "</div>"

                    }

                    //Add message into chat body

                    $(this).find(".chat_screen_body").append(message_string);

                    $(this).find(".chat_screen_header").css({"background": "#08a4da"});

                    //In case of message_text input is unfocused, the message is marked as unread
                    $("#" + data.conversation_id).parent().css({"background": "white"});
                    $("#" + data.conversation_id).find(".conversation_lastest_message").text(data.message_text);
                    $("#" + data.conversation_id).find(".conversation_lastest_message").css({"font-weight": "bold"});
                    var current_message_text = $(this).find(".message_text");
                    if (current_message_text.is(":focus")) {
                        $(this).parent().parent().parent().find(".chat_screen_header").css({"background": "#2f4375"});
                        $("#" + data.conversation_id).find(".conversation_lastest_message").css({"font-weight": "normal"});
                        $("#" + data.conversation_id).parent().css({"background": "#edf0f7"});
                    }
                    current_message_text.focusin(function () {
                        $(this).parent().parent().parent().find(".chat_screen_header").css({"background": "#2f4375"});
                        $("#" + data.conversation_id).find(".conversation_lastest_message").css({"font-weight": "normal"});
                        $("#" + data.conversation_id).parent().css({"background": "#edf0f7"});

                    });

                    current_conversation = true;
                    $(".chat_screen_body").scrollTop($(".chat_screen_body")[0].scrollHeight);
                    return false;

                }
            });

            //In case of new conversation
            if (!current_conversation) {
                //call continue conversation AJAX
                 $.ajax({
                     url: "/continue-conversation",
                     method: "POST",
                     dataType: "JSON",
                     data: '&conversation_id=' + encodeURIComponent(data.conversation_id),
                     async: false,
                     success: function (result) {
                         console.log(result);
//                         if (result.data.status != "ok"){
//                             return;
//                         }
//                        console.log(respone);
//                    }
//                });
//
//                $.post("/continue-conversation",
//                    {
//                        conversation_id: data.conversation_id
//                    },
//                    function (result) {
                         var message_list = result.message_list;
                         var receiver = [];
                         result.member.split(",").forEach(function (val, i) {
                             if (val != user_email) {
                                 receiver.push(val);
                             }

                         });

                         //message receiver list
                         receiver = receiver.toString();

                         var message_string = "";
                         message_list.forEach(function (val, i) {
                             var chat_block_id = generateRandomString();
                             if (val.sender == user_email) {
                                 message_string +=
                                     "<div class='receiver_chat_message_wrapper'>" +
                                     "<div class='chat_message_option' id='" + chat_block_id + "'>" +
                                     "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\"" + chat_block_id + "\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;" +
                                     "<a href='javascript:void(0)' class='edit_message_button' onclick='edit_message(\"" + chat_block_id + "\")'>編集</a>" +
                                     "</div>" +
                                     "<div class='receiver_chat_message'>" +
                                     "<div class='receiver_chat_message_arrow'><img src='image/marker-chat-white.png'></div>" +
                                     "<p class='chat_message_content'  onclick='show_chat_option(\"" + chat_block_id + "\")'>" + val.content + "</p>" +
                                     "</div>" +
                                     "</div>"
                             } else {
                                 message_string +=
                                     "<div class='sender_chat_message_wrapper'>" +
                                     "<div class='chat_message_option' id='" + chat_block_id + "'>" +
                                     "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\"" + chat_block_id + "\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;" +
                                     "</div>" +
                                     "<div class='sender_chat_message'>" +
                                     "<a href='javascript:void(0)' class='chat_user_icon'><img src='image/avt-default-1.png'></a>" +
                                     "<div class='sender_chat_message_arrow'><img src='image/marker-chat.png'></div>" +
                                     "<p class='chat_message_content'  onclick='show_chat_option(\"" + chat_block_id + "\")'>" + val.content + "</p>" +
                                     "</div>" +
                                     "</div>"

                             }

                         });
                         var chat_screen_friend = result.member.split(",");
                         chat_screen_friend.splice(chat_screen_friend.indexOf(user_email), 1);

                         //Show new chat screen
                         var screen_id = generateRandomString();
                         var html_string = "";
                         html_string += '<div class="chat_screen_detail" id="screen-' + screen_id + '">';
                         html_string += '<div class="chat_screen_header">';
                         html_string += '<div class="chat_screen_header_text">';
                         html_string += '<img src="image/conversation-icon-active.png">';
                         html_string += '<p class="chat_screen_friend">' + chat_screen_friend.toString() + '</p>';

                         html_string += '</div>';

                         html_string += '<div class="chat_screen_header_button">';
                         html_string += '<a href="javascript:void(0)" class="minimize_chat_screen" onclick="minimize_chat_screen(\'' + screen_id + '\')"><img src="image/minimum-box-chat.png"></a>';
                         html_string += '<a href="javascript:void(0)" class="maximize_chat_screen"><img src="image/new-finder-boxchat.png"></a>';
                         html_string += '<a href="javascript:void(0)" class="close_chat_screen" onclick="close_chat_screen(\'' + screen_id + '\')"><img src="image/close-icon.png"></a>';
                         html_string += '</div>';
                         html_string += '</div>';
                         html_string += '<div class="chat_screen_header_2">';
                         html_string += '<a class="add_user_chat_screen" href="javascript:void(0)">';
                         html_string += '<img src="image/add-people-normal.png">';
                         html_string += '</a>';
                         html_string += '<a class="chat_screen_option" href="javascript:void(0)">';
                         html_string += '<img src="image/setup-boxchat-active.png">';
                         html_string += '</a>';
                         html_string += '</div>';
                         html_string += '<div class="chat_screen_body" data-conversation-id="' + data.conversation_id + '">';
                         if (message_string) {
                             html_string += message_string;
                         }

                         html_string += '</div>';
                         html_string += '<div class="chat_screen_footer">';
                         html_string += '<input type="hidden" class="sender_email" value="' + user_email + '">';
                         html_string += '<input type="hidden" class="receiver_email" value="' + receiver + '">';

                         html_string += '<input type="hidden" class="conversation_id" value="' + data.conversation_id + '">';
                         html_string += '<div class="send_message_area">';
                         html_string += '<a href="javascript:void(0)" class="show_emotional_icon"><img src="image/amotion-icon-normail.png"></a>';
                         html_string += '<textarea class="message_text" name="message_text" placeholder="メッセージを送信"></textarea>';
                         html_string += '<a href="javascript:void(0)" class="chat_upload_image"><img src="image/send-image-icon-normal.png"></a>';
                         html_string += '</div>';
                         html_string += '</div>';
                         html_string += '</div>';

                         $('.chat_screen_area').append(html_string);

                         $(".chat_screen_body").scrollTop($(".chat_screen_body")[0].scrollHeight);


//                        $(".close_chat_screen").on("click",function () {
//                            $(this).parent().parent().remove();
//                        });

                         var timer = null;
                         //Send message
                         $('.message_text').keyup(function (e) {
                             clearTimeout(timer);
                             var receiver = $(this).parent().parent().find(".receiver_email").val();
                             var sender = user_email;
                             var conversation_id = $(this).parent().parent().find(".conversation_id").val();
                             var message_text = $(this).val();

                             socket.emit("typing", {
                                 sender: sender,
                                 receiver: receiver,
                                 conversation_id: conversation_id
                             });

                             if (e.keyCode == 13) {
                                 //Prevent white space only content
                                 if (!$.trim(message_text)) {
                                     return false;
                                 }

                                 if (e.shiftKey) {
                                     return false;
                                 }

                                 //Clear message from input first
                                 $('.message_text').val("");

                                 socket = io.connect(webSocketUri, {'forceNew': true });
                                 socket.on('connect', function (msg) {
                                     console.log(msg);
                                     //Emit a new message
                                     socket.emit("send a message", {
                                         sender: sender,
                                         receiver: receiver,
                                         conversation_id: conversation_id,
                                         message_text: message_text
                                     });
                                 });
                                 //Emit a new message
//                                 socket.emit("send a message", {
//                                     sender: user_email,
//                                     receiver: receiver,
//                                     conversation_id: conversation_id,
//                                     message_text: message_text
//                                 });

                                 //post send-a-message AJAX
                                 $.ajax({
                                     url: "/send-a-message",
                                     method: "POST",
                                     dataType: "JSON",
                                     data: '&sender=' + encodeURIComponent(user_email) + '&receiver=' + encodeURIComponent(receiver) +
                                         '&conversation_id=' + encodeURIComponent(conversation_id) + '&message_text=' + encodeURIComponent(message_text)
                                          + '&user_conversation_list=' + encodeURIComponent(user_conversation_list),
                                     async: false,
                                     success: function (respone) {
                                         console.log(respone);
                                     }
                                 });
                             }

                             timer = setTimeout(function () {
                                 socket.emit("stop typing", {
                                     sender: sender,
                                     receiver: receiver,
                                     conversation_id: conversation_id
                                 });

                             }, 2000);
                         });

                     }
                 });


            }


        }

    });

    //Switch between conversation_list and user_list
    $("#show_conversation_list").on("click", function () {
        $(".page_main_left_footer_icon").removeClass("footer_icon_active");
        $(this).addClass("footer_icon_active");

        $(".user_friend_list").hide();
        $(".user_conversation_list").show();


    });

    $("#show_user_list").on("click", function () {
        $(".page_main_left_footer_icon").removeClass("footer_icon_active");
        $(this).addClass("footer_icon_active");

        $(".user_conversation_list").hide();
        $(".user_friend_list").show();


    });

    //Listen user typing event
    socket.on("notify typing", function (data) {
//        if (user_email == data.receiver.trim()) {
            $(".chat_screen_detail .chat_screen_body").each(function (i) {
                if ($(this).attr("data-conversation-id") == data.conversation_id.trim()) {
                    if ($(this).find(".chat_typing_icon").length == 0) {
                        $(this).append("<img class='chat_typing_icon' src='image/typing-gif.gif' width='30' height='30' style='float: right;'/>");
                        $(this).scrollTop($(".chat_screen_body")[0].scrollHeight);
                    } else {
                        return false;
                    }
                }
            });
//        }

    });

    //Listen user typing event
    socket.on("notify stop typing", function (data) {
        console.log('notify stop typing');
        console.log(data);
//        if (user_email == data.receiver.trim()) {
            $(".chat_screen_detail .chat_screen_body").each(function (i) {
                console.log($(this).attr("data-conversation-id"));
                console.log(data.conversation_id);
                if ($(this).attr("data-conversation-id") == data.conversation_id) {
                    var selected_chat_screen = $(this);
                    if (selected_chat_screen.find(".chat_typing_icon").length > 0) {
                        selected_chat_screen.find(".chat_typing_icon").remove();
                    }

                }
            });
//        }
    });

    socket.on('connect', function(msg){
        console.log('connected ********');
    });
    socket.on("disconnect", function(){
        console.log("client disconnected from server *******");
    });
});

//Create new chat
function addUserList(){
    $("#add_user_modal").modal("show");
}

function mainSpaceLoad() {
    /* The external ip is determined by app.js and passed into the template. */
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp + ':65080';

    /* Establish the WebSocket connection and register event handlers. */
    var socket = io(webSocketUri);

//    socket.on('connect', function(msg){
//        console.log('connected');
//    });
//    socket.on("disconnect", function(){
//        console.log("client disconnected from server");
//    });

    var html_string = "";
    user_friend_list.split(",").forEach(function (val, i) {
        html_string += "<li><a href='javascript:void(0)' class='user_friend_email' id='" + val + "'>" + val + "</a></li>";
    });

    $(".user_friend_list").append(html_string);

    var conversation_string = "";

    user_conversation_list.split(",").forEach(function (val, i) {
        conversation_string += "<li><a href='javascript:void(0)' class='user_conversation_id' id='" + val + "'>" + val + "</a></li>";
    });

    $(".user_conversation_list").append(conversation_string);

    //Start new conversation
    $(".user_friend_email").on("click", function () {
        // call signin AJAX
        var receiver_id = $(this).attr('id');

//        $.ajax({
//            url: "/get-conversation-content",
//            method: "POST",
//            dataType: "JSON",
//            data: '&sender=' + encodeURIComponent(user_email) + '&receiver=' + encodeURIComponent(receiver_id),
//            async: false,
//            success: function (response) {
//                console.log(response);
//                if (response.status == "success") {


        var new_conversation_id = generateConversationId();
        var html_string = "";
        html_string += '<div class="chat_screen_detail">';
        html_string += '<div class="chat_screen_header">';
        html_string += '<p class="chat_screen_friend">' + receiver_id + '</p>';
        html_string += '<a href="javascript:void(0)" class="close_chat_screen">X</a>';
        html_string += '</div>';
        html_string += '<div class="chat_screen_body" data-conversation-id="' + new_conversation_id + '"></div>'; // response.data.id
        html_string += '<div class="chat_screen_footer">';
        html_string += '<input type="hidden" class="sender_email" value="' + user_email + '">';
        html_string += '<input type="hidden" class="receiver_email" value="' + receiver_id + '">';
        html_string += '<input type="hidden" class="conversation_id" value="' + new_conversation_id + '">'; // response.data.id
        html_string += '<input type="text" class="message_text" name="message_text" placeholder="メッセージを送信">';
        html_string += '</div>';
        html_string += '</div>';

        $('.chat_screen_area').append(html_string);

        $(".close_chat_screen").on("click", function () {
            $(this).parent().parent().remove();
        });

        var timer = null;
        //Send message
        $('.message_text').keyup(function (e) {
            clearTimeout(timer);
            var receiver = $(this).parent().find(".receiver_email").val();
            var sender = user_email;
            var conversation_id = $(this).parent().find(".conversation_id").val();
            var message_text = $(this).val();
            var enter_keyboard = false;

            socket.emit("typing", {
                sender: sender,
                receiver: receiver,
                conversation_id: conversation_id
            });


            if (e.keyCode == 13) {
                //Clear message from input first
                $('.message_text').val("");

                socket = io.connect(webSocketUri, {'forceNew': true });
                socket.on('connect', function (msg) {
                    console.log(msg);
                    //Emit a new message
                    socket.emit("send a message", {
                        sender: sender,
                        receiver: receiver,
                        conversation_id: conversation_id,
                        message_text: message_text
                    });
                });

                // call signin AJAX
                $.ajax({
                    url: "/send-a-message",
                    method: "POST",
                    dataType: "JSON",
                    data: '&sender=' + encodeURIComponent(user_email) + '&receiver=' + encodeURIComponent(receiver) +
                        '&conversation_id=' + encodeURIComponent(conversation_id) + '&message_text=' + encodeURIComponent(message_text)
                        + '&user_conversation_list=' + encodeURIComponent(user_conversation_list),
                    async: false,
                    success: function (respone) {
                        console.log(respone);
//                    if(respone.status == "fail"){
//                        $(".login_error_message").text("不正なアカウント情報です。");
//                        return false;
//                    } else {
//                        // Tell the server your username
//                        socket.emit('user login', email);
//    //                    window.location.href = "/main-space";
//
//                        $(location).attr("href", "/main-space");
//                    }
                    }
                });
            }

            timer = setTimeout(function () {
                socket.emit("stop typing", {
                    sender: sender,
                    receiver: receiver,
                    conversation_id: conversation_id
                });

            }, 2000);
        });


//                }
//            }
//        });
    });

    $(".user_conversation_id").on("click", function () {
        var conversation_id = $(this).attr("id");
        var conversation_show = false;

        $(".chat_screen_detail .conversation_id").each(function (i) {
            if ($(this).val() == conversation_id) {
                conversation_show = true;
            }
        });

        if (conversation_show) {
            return false;
        }

        //call continue conversation AJAX
        $.post("/continue-conversation",
            {
                conversation_id: conversation_id
            },
            function (data) {
                var message_list = data.message_list;
                var receiver = [];
                data.member.split(",").forEach(function (val, i) {
                    if (val != user_email) {
                        receiver.push(val);
                    }

                });

                //message receiver list
                receiver = receiver.toString();

                var message_string = "";
                message_list.forEach(function (val, i) {
                    message_string += "<a href='#'>" + val.sender + "</a>&nbsp;&nbsp;<p>" + val.content + "</p>";

                });

                //Show new chat screen
                var html_string = "";
                html_string += '<div class="chat_screen_detail">';
                html_string += '<div class="chat_screen_header">';
                html_string += '<p class="chat_screen_friend">' + receiver + '</p>'


                html_string += '<a href="javascript:void(0)" class="close_chat_screen">X</a>';
                html_string += '</div>';
                html_string += '<div class="chat_screen_body" data-conversation-id="' + conversation_id + '">';
                if (message_string) {
                    html_string += message_string;
                }

                html_string += '</div>';
                html_string += '<div class="chat_screen_footer">';
                html_string += '<input type="hidden" class="sender_email" value="' + user_email + '">';
                html_string += '<input type="hidden" class="receiver_email" value="' + receiver + '">';

                html_string += '<input type="hidden" class="conversation_id" value="' + conversation_id + '">';
                html_string += '<input type="text" class="message_text" name="message_text" placeholder="メッセージを送信">';
                html_string += '</div>';
                html_string += '</div>';

                $('.chat_screen_area').append(html_string);

                $(".chat_screen_body").scrollTop($(".chat_screen_body")[0].scrollHeight);


                $(".close_chat_screen").on("click", function () {
                    $(this).parent().parent().remove();
                });

                var timer = null;
                //Send message
                $('.message_text').keyup(function (e) {
                    clearTimeout(timer);
                    var receiver = $(this).parent().find(".receiver_email").val();
                    var sender = user_email;
                    var conversation_id = $(this).parent().find(".conversation_id").val();
                    var message_text = $(this).val();

                    socket.emit("typing", {
                        sender: sender,
                        receiver: receiver,
                        conversation_id: conversation_id
                    });
                    if (e.keyCode == 13) {
                        //Clear message from input first
                        $('.message_text').val("");

                        //Emit a new message
                        socket.emit("send a message", {
                            sender: user_email,
                            receiver: receiver,
                            conversation_id: conversation_id,
                            message_text: message_text
                        });

                        //post send-a-message AJAX
                        $.ajax({
                            url: "/send-a-message",
                            method: "POST",
                            dataType: "JSON",
                            data: '&sender=' + encodeURIComponent(user_email) + '&receiver=' + encodeURIComponent(receiver) +
                                '&conversation_id=' + encodeURIComponent(conversation_id) + '&message_text=' + encodeURIComponent(message_text)
                                 + '&user_conversation_list=' + encodeURIComponent(user_conversation_list),
                            async: false,
                            success: function (respone) {
                                console.log(respone);
                            }
                        });
//                        $.post("/send-a-message",
//                            {
//                                sender: user_email,
//                                receiver: receiver,
//                                conversation_id: conversation_id,
//                                message_text: message_text,
//                                user_conversation_list: user_conversation_list
//                            },
//                            function (data) {
//                            }
//                        );


                    };

                    timer = setTimeout(function () {
                        socket.emit("stop typing", {
                            sender: sender,
                            receiver: receiver,
                            conversation_id: conversation_id
                        });

                    }, 2000);
                });


            }
        );

    });
}

function generateConversationId() {
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
}

function generateMessageId() {
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


}


function generateRandomString() {
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


}

function minimize_chat_screen(screen_id){
    var screen = $("#screen-"+screen_id);
    var screen_body = screen.find(".chat_screen_body");
    if(screen_body.is(":visible")){
        screen.find(".chat_screen_body").hide();
        screen.find(".send_message_area").hide();
        screen.css({"margin-top": "308px"});
    }else{
        screen.find(".chat_screen_body").show();
        screen.find(".send_message_area").show();
        screen.css({"margin-top": "0px"});

    }

}

function close_chat_screen(screen_id) {
    $("#screen-"+screen_id).remove();

}

function show_chat_option(chat_block_id) {
    if($("#"+chat_block_id).is(":visible")){
        $("#"+chat_block_id).hide();
    }else{
        $("#"+chat_block_id).show();
    }

}

function add_remove_message_favorite(chat_block_id){
    var fav_button = $("#"+chat_block_id).find(".message_favorite_button img");
    if (fav_button.attr("data-status") == "active"){
        fav_button.attr("src","image/heart-normal.png");
        fav_button.attr("data-status","");
        //TODO save active status on database
    }else{
        fav_button.attr("src","image/heart-active.png");
        fav_button.attr("data-status","active");

    }

}

function edit_message() {

}

function show_user_option_list() {
    if($(".user_option_list").is(":visible")){
        $(".user_option_list").hide()
    }else{
        $(".user_option_list").show();
    }

}

function do_logout(user_type) {
    if(user_type == "account"){
        $(location).attr("href","/logout")
    }

    if(user_type == "facebook"){
        FacebookLogout();
        $(location).attr("href","/logout")
    }

    if(user_type == "google"){
        GoogleLogout();
        $(location).attr("href","/logout")
    }


}


//Facebook logout
function fbAsyncInit() {
    FB.init({
        appId      : '1460862620609106',
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        xfbml      : true,  // parse XFBML
        version    : 'v2.8'
    });
}

fbAsyncInit();

function FacebookLogout() {
    FB.logout(function (response) {



//   //Removing access token form localStorage.
//   $('#loginBtn').show();
//   $('#logoutBtn').hide();
//   $('#userDetails').hide();
    });
}

//End facebook logout

//Google logout

function GoogleLogout(){
    gapi.auth.signOut();
    location.reload();
}


//End Google logout







