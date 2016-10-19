
$(function() {
    /* The external ip is determined by app.js and passed into the template. */
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri =  webSocketHost + externalIp + ':65080';
    console.log(webSocketUri);

    var socket = io(webSocketUri);


    $("#add_user_list").on("click",function () {
        var user_list_string = $("#chat_user_list").val();

        //call create chat AJAX
        $.post("/add-user-list",
            {
                member_list: user_list_string,
            },
            function (data) {

                if (data.status == "not ok") {
                    alert("エラ発生");
                    return false;

                }else{

                    $("#add_user_modal").modal("hide");
                    $(location).attr("href","/main-space")
                }

            }
        );

    });

    //Receiver new message
    socket.on("notify a new message",function (data) {
        console.log("rofsdsddasd", data.room);
        if(user_email == data.receiver || user_email == data.sender){
            var current_conversation = false;
            //Update conversation list
            if(user_conversation_list.split(",").indexOf(data.conversation_id) == -1){
                var user_conversation_array = user_conversation_list.split(",");
                user_conversation_array.push(data.conversation_id);
                user_conversation_list = user_conversation_array.toString();

                var conversation_string = "<li><a href='javascript:void(0)' class='user_conversation_id' id='"+data.conversation_id+"'>"+data.conversation_id+"</a></li>";

                $(".user_conversation_list").append(conversation_string);

            }

            //TODO show the conversation popup and load the message
            $(".chat_screen_detail").each(function (i) {
                if($(this).find(".conversation_id").val() == data.conversation_id){
                    $(this).find(".chat_screen_body .chat_typing_icon").remove();

                    var message_string = "<a href='#'>"+data.sender+"</a>&nbsp;&nbsp;<p>"+data.message_text+"</p>"

                    $(this).find(".chat_screen_body").append(message_string);
                    current_conversation = true;
                    $(".chat_screen_body").scrollTop($(".chat_screen_body")[0].scrollHeight);
                    return false;

                }
            });

            //In case of new conversation
            if (!current_conversation){
                //call continue conversation AJAX
                $.post("/continue-conversation",
                    {
                        conversation_id: data.conversation_id,
                    },
                    function (result) {
                        var message_list = result.message_list;
                        var receiver = [];
                        result.member.split(",").forEach(function (val,i) {
                            if (val != user_email){
                                receiver.push(val);
                            }

                        });

                        //message receiver list
                        receiver = receiver.toString();

                        var message_string = "";
                        message_list.forEach(function (val,i) {
                            message_string += "<a href='#'>"+val.sender+"</a>&nbsp;&nbsp;<p>"+val.content+"</p>";

                        });


                        //Show new chat screen
                        var html_string = "";
                        html_string += '<div class="chat_screen_detail">';
                        html_string +=   '<div class="chat_screen_header">';
                        html_string +=     '<p class="chat_screen_friend">'+receiver+'</p>'


                        html_string +=     '<a href="javascript:void(0)" class="close_chat_screen">X</a>';
                        html_string +=   '</div>';
                        html_string +=   '<div class="chat_screen_body" data-conversation-id="'+data.conversation_id+'">';
                        if(message_string){
                            html_string +=      message_string;
                        }

                        html_string +=   '</div>';
                        html_string +=   '<div class="chat_screen_footer">';
                        html_string +=     '<input type="hidden" class="sender_email" value="'+user_email+'">';
                        html_string +=     '<input type="hidden" class="receiver_email" value="'+receiver+'">';

                        html_string +=     '<input type="hidden" class="conversation_id" value="'+data.conversation_id+'">';
                        html_string +=     '<input type="text" class="message_text" name="message_text" placeholder="メッセージを送信">';
                        html_string +=   '</div>';
                        html_string += '</div>';

                        $('.chat_screen_area').append(html_string);

                        $(".chat_screen_body").scrollTop($(".chat_screen_body")[0].scrollHeight);


                        $(".close_chat_screen").on("click",function () {
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
                                receiver : receiver,
                                conversation_id : conversation_id
                            });
                            if (e.keyCode == 13) {
                                //Clear message from input first
                                $('.message_text').val("");

                                //Emit a new message
                                socket.emit("send a message",{
                                    sender: user_email,
                                    receiver : receiver,
                                    conversation_id : conversation_id,
                                    message_text: message_text
                                });

                                //post send-a-message AJAX
                                $.post("/send-a-message",
                                    {
                                        sender: user_email,
                                        receiver: receiver,
                                        conversation_id : conversation_id,
                                        message_text : message_text,
                                        user_conversation_list : user_conversation_list
                                    },
                                    function (data) {
                                    }
                                );


                            };

                            timer = setTimeout(function () {
                                socket.emit("stop typing",{
                                    sender: sender,
                                    receiver : receiver,
                                    conversation_id : conversation_id,
                                });

                            },2000);
                        });

                    }
                );


            }


        }

    })

    //Listen user typing event
    socket.on("notify typing",function (data) {
        if(user_email == data.receiver){
             $(".chat_screen_detail .chat_screen_body").each(function (i) {
                 if($(this).attr("data-conversation-id") == data.conversation_id){
                     if($(this).find(".chat_typing_icon").length == 0){
                         $(this).append("<img class='chat_typing_icon' src='image/typing-gif.gif' width='30' height='30'/>");
                         $(this).scrollTop($(".chat_screen_body")[0].scrollHeight);
                     }else{
                         return false;
                     }

                 }
             });


        }

    });

    //Listen user typing event
    socket.on("notify stop typing",function (data) {
        if(user_email == data.receiver){
            $(".chat_screen_detail .chat_screen_body").each(function (i) {
                if($(this).attr("data-conversation-id") == data.conversation_id){
                    var selected_chat_screen = $(this);
                    if(selected_chat_screen.find(".chat_typing_icon").length > 0){
                        selected_chat_screen.find(".chat_typing_icon").remove();
                    }

                }
            });

        }

    });


});




//Create new chat
function addUserList(){
    $("#add_user_modal").modal("show");

}

function mainSpaceLoad() {
    /* The external ip is determined by app.js and passed into the template. */
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri =  webSocketHost + externalIp + ':65080';
    console.log(webSocketUri);

    var socket = io(webSocketUri);


    var html_string = "";
    user_friend_list.split(",").forEach(function (val,i) {
        html_string += "<li><a href='javascript:void(0)' class='user_friend_email' id='"+val+"'>"+val+"</a></li>";

    });

    $(".user_friend_list").append(html_string);

    var conversation_string = "";
    user_conversation_list.split(",").forEach(function (val,i) {
        conversation_string += "<li><a href='javascript:void(0)' class='user_conversation_id' id='"+val+"'>"+val+"</a></li>";

    });

    $(".user_conversation_list").append(conversation_string);

    //Start new conversation
    $(".user_friend_email").on("click",function () {
        var new_conversation_id = generateConversationId();
        var html_string = "";
        html_string += '<div class="chat_screen_detail">';
        html_string +=   '<div class="chat_screen_header">';
        html_string +=     '<p class="chat_screen_friend">'+$(this).attr("id")+'</p>'
        html_string +=     '<a href="javascript:void(0)" class="close_chat_screen">X</a>';
        html_string +=   '</div>';
        html_string +=   '<div class="chat_screen_body" data-conversation-id="'+new_conversation_id+'"></div>';
        html_string +=   '<div class="chat_screen_footer">';
        html_string +=     '<input type="hidden" class="sender_email" value="'+user_email+'">';
        html_string +=     '<input type="hidden" class="receiver_email" value="'+$(this).attr("id")+'">';
        html_string +=     '<input type="hidden" class="conversation_id" value="'+new_conversation_id+'">';
        html_string +=     '<input type="text" class="message_text" name="message_text" placeholder="メッセージを送信">';
        html_string +=   '</div>';
        html_string += '</div>';

        $('.chat_screen_area').append(html_string);

        $(".close_chat_screen").on("click",function () {
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
                receiver : receiver,
                conversation_id : conversation_id
            });
            if (e.keyCode == 13) {
                //Clear message from input first
                $('.message_text').val("");

                //Emit a new message
                socket.emit("send a message",{
                    sender: user_email,
                    receiver : receiver,
                    conversation_id : conversation_id,
                    message_text: message_text
                });

                //post send-a-message AJAX
                $.post("/send-a-message",
                    {
                        sender: user_email,
                        receiver: receiver,
                        conversation_id : conversation_id,
                        message_text : message_text,
                        user_conversation_list : user_conversation_list
                    },
                    function (data) {
                    }
                );


            };

            timer = setTimeout(function () {
                socket.emit("stop typing",{
                    sender: sender,
                    receiver : receiver,
                    conversation_id : conversation_id,
                });

            },2000);
        });



    });

    $(".user_conversation_id").on("click",function () {
        var conversation_id = $(this).attr("id");
        var conversation_show = false;

        $(".chat_screen_detail .conversation_id").each(function (i) {
            if($(this).val() == conversation_id){
                conversation_show = true;
            }

        });

        if(conversation_show){
            return false;
        }

        //call continue conversation AJAX
        $.post("/continue-conversation",
            {
                conversation_id: conversation_id,
            },
            function (data) {
                var message_list = data.message_list;
                var receiver = [];
                data.member.split(",").forEach(function (val,i) {
                    if (val != user_email){
                        receiver.push(val);
                    }

                });

                //message receiver list
                receiver = receiver.toString();

                var message_string = "";
                message_list.forEach(function (val,i) {
                    message_string += "<a href='#'>"+val.sender+"</a>&nbsp;&nbsp;<p>"+val.content+"</p>";

                });

                //Show new chat screen
                var html_string = "";
                html_string += '<div class="chat_screen_detail">';
                html_string +=   '<div class="chat_screen_header">';
                html_string +=     '<p class="chat_screen_friend">'+receiver+'</p>'


                html_string +=     '<a href="javascript:void(0)" class="close_chat_screen">X</a>';
                html_string +=   '</div>';
                html_string +=   '<div class="chat_screen_body" data-conversation-id="'+conversation_id+'">';
                if(message_string){
                    html_string +=      message_string;
                }

                html_string +=   '</div>';
                html_string +=   '<div class="chat_screen_footer">';
                html_string +=     '<input type="hidden" class="sender_email" value="'+user_email+'">';
                html_string +=     '<input type="hidden" class="receiver_email" value="'+receiver+'">';

                html_string +=     '<input type="hidden" class="conversation_id" value="'+conversation_id+'">';
                html_string +=     '<input type="text" class="message_text" name="message_text" placeholder="メッセージを送信">';
                html_string +=   '</div>';
                html_string += '</div>';

                $('.chat_screen_area').append(html_string);

                $(".chat_screen_body").scrollTop($(".chat_screen_body")[0].scrollHeight);


                $(".close_chat_screen").on("click",function () {
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
                        receiver : receiver,
                        conversation_id : conversation_id
                    });
                    if (e.keyCode == 13) {
                        //Clear message from input first
                        $('.message_text').val("");

                        //Emit a new message
                        socket.emit("send a message",{
                            sender: user_email,
                            receiver : receiver,
                            conversation_id : conversation_id,
                            message_text: message_text
                        });

                        //post send-a-message AJAX
                        $.post("/send-a-message",
                            {
                                sender: user_email,
                                receiver: receiver,
                                conversation_id : conversation_id,
                                message_text : message_text,
                                user_conversation_list : user_conversation_list
                            },
                            function (data) {
                            }
                        );


                    };

                    timer = setTimeout(function () {
                        socket.emit("stop typing",{
                            sender: sender,
                            receiver : receiver,
                            conversation_id : conversation_id,
                        });

                    },2000);
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


};

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


};








