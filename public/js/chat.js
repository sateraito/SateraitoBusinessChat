


function mainSpaceLoad() {

    //Check online user
    //Start GAE socket definition
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp +':65080';
    var socket = io(webSocketUri);


    //Tab hover and click event
    $("#con_list_icon").hover(function () {
        if(!$(this).hasClass("active_tab")){
            $(this).find("img").attr("src","image/conversation-icon-active.png")
        }

    },function () {
        if(!$(this).hasClass("active_tab")){
            $(this).find("img").attr("src","image/conversation-icon-normal.png")
        }

    });

    $("#con_list_icon").on("click",function () {
        $(".page_main_wrapper").removeClass("active_tab");
        $(this).addClass("active_tab");
        $(this).find("img").attr("src","image/conversation-icon-active.png");
        $("#user_list_icon img").attr("src","image/contact-icon.png");
        $("#add_user_icon img").attr("src","image/addfriend-icon-normal.png");
        $("#favorite_icon img").attr("src","image/favorite-normal.png");

        $(".page_main_wrapper").hide();
        $("#conversation_main_page").show();
    });



    $("#user_list_icon").hover(function () {
        if(!$(this).hasClass("active_tab")){
            $(this).find("img").attr("src","image/contact-icon-active.png")
        }

    },function () {
        if(!$(this).hasClass("active_tab")){
            $(this).find("img").attr("src","image/contact-icon.png")
        }

    });

    $("#user_list_icon").on("click",function () {
        $(".page_main_wrapper").removeClass("active_tab");
        $(this).addClass("active_tab");
        $(this).find("img").attr("src","image/contact-icon-active.png");
        $("#con_list_icon img").attr("src","image/conversation-icon-normal.png");
        $("#add_user_icon img").attr("src","image/addfriend-icon-normal.png");
        $("#favorite_icon img").attr("src","image/favorite-normal.png");

        $(".page_main_wrapper").hide();
        $("#user_list_main_page").show();
    });



    $("#add_user_icon").hover(function () {
        if(!$(this).hasClass("active_tab")){
            $(this).find("img").attr("src","image/addfriend-icon-active.png")
        }

    },function () {
        if(!$(this).hasClass("active_tab")){
            $(this).find("img").attr("src","image/addfriend-icon-normal.png")
        }

    });





    $("#favorite_icon").hover(function () {
        if(!$(this).hasClass("active_tab")){
            $(this).find("img").attr("src","image/favorite-active.png")
        }

    },function () {
        if(!$(this).hasClass("active_tab")){
            $(this).find("img").attr("src","image/favorite-normal.png")
        }

    });

    $("#favorite_icon").on("click",function () {
        $(".page_main_wrapper").removeClass("active_tab");
        $(this).addClass("active_tab");
        $(this).find("img").attr("src","image/favorite-active.png")
        $("#con_list_icon img").attr("src","image/conversation-icon-normal.png");
        $("#user_list_icon img").attr("src","image/contact-icon.png");
        $("#add_user_icon img").attr("src","image/addfriend-icon-normal.png");


        $(".page_main_wrapper").hide();
        $("#favorite_main_page").show();
    });


    $("#user_option_icon").hover(function(){
            $(this).find("img").attr("src","image/option-active.png")
        },function (){
            $(this).find("img").attr("src","image/option-normal.png")

        }

    );

    $("#logout_button").on("click",function () {
        socket.emit("user logged out",{
            email : user_email
        });

        if($(this).attr("data-user-type") == "account"){
            $(location).attr("href","/logout")
        }

        if($(this).attr("data-user-type") == "facebook"){
            FacebookLogout();
            $(location).attr("href","/logout")
        }

        if($(this).attr("data-user-type") == "google"){
            GoogleLogout();
            $(location).attr("href","/logout")
        }
    });


    //Add user for new conversation

    //TODO check security issues of "notify a new message"
    //Receiver new message
    socket.on("notify a new message",function (data) {
        var receiver_array = data.receiver.split(",");

        if(user_email == data.sender  || receiver_array.indexOf(user_email) != -1){
            var current_conversation = false;
            //Check message content is text or image url
            //In case of image url
            var render_message_content = "";
            if(checkImageMessage(data.message_text)){
                render_message_content = "<a href='/render-image?image_url="+data.message_text+"' target='_blank' style='width: 100%'><img src='"+data.message_text+"' style='width: 100%'></a>"
            }else{
                render_message_content = data.message_text
            }

            var render_latest_message_content = ""
            if(checkImageMessage(data.message_text)){
                render_latest_message_content = "写真を送信済み"
            }else{
                render_latest_message_content = data.message_text
            }

            //Update conversation list
            if(user_conversation_list.indexOf(data.conversation_id) == -1){
                user_conversation_list.push(data.conversation_id);

                var conversation_string = "";
                conversation_string += "<li class='user_conversation_li'>"
                conversation_string += "<a href='javascript:void(0)' class='user_conversation_id' data-last-message-id='"+data.message_id+"' id='"+data.conversation_id+"'>";
                conversation_string += "<img src='image/avt-default-1.png'>";
                conversation_string += "<p>"
                conversation_string += "<span style='color: #3e3e3e' class='conversation_title'>"+data.conversation_title+"</span><br>"
                conversation_string +=  "<span style='color: #a7a7a7; font-size: 12px' class='conversation_lastest_message'><span class='lastest_message_sender'>"+data.sender_user_name+":  </span>"

                conversation_string += render_latest_message_content
                conversation_string += "</span>"

                conversation_string += "</p>"
                conversation_string += "</a>"
                conversation_string += '<a href="javascript:void(0)" class="glyphicon glyphicon-option-vertical user_conversation_action_button" onclick="show_conversation_option(\''+data.conversation_id+'\')"></a>'
                conversation_string += "<ul class='conversation_option'>"
                conversation_string += '<li><a href="javascript:void(0)" onclick="addMemberToConversation(\''+data.conversation_id+'\')">メンバーを追加する</a></li>'
                conversation_string += '<li><a href="javascript:void(0)" onclick="renameConversation(\''+data.conversation_id+'\')">チャットタイトルを編集する</a></li>'
                conversation_string += '<li><a href="javascript:void(0)" onclick="deleteConversation(\''+data.conversation_id+'\')">チャットを削除する</a></li>'
                conversation_string += '<li><a href="javascript:void(0)" onclick="markConversationAsRead(\''+data.conversation_id+'\')">既読をする</a></li>'
                conversation_string += "</ul>"
                conversation_string += "</li>";

                $(".empty_list").remove();
                $(".user_conversation_list").append(conversation_string);

            }

            //TODO show the conversation popup and load the message
            $(".chat_screen_detail").each(function (i) {
                if($(this).find(".conversation_id").val() == data.conversation_id){
                    $(this).find(".chat_screen_body .chat_typing_icon").remove();
                    var message_string = "";
                    var chat_block_id = generateRandomString();
                    if(data.sender == user_email){
                        message_string += "<div class='receiver_chat_message_wrapper' id='"+data.message_id+"'>"
                        message_string += "<div class='chat_message_option' id='"+chat_block_id+"'>"
                        message_string += "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\""+chat_block_id+"\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;"
                        message_string += "<a href='javascript:void(0)' class='edit_message_button' onclick='edit_message(\""+chat_block_id+"\")'>編集</a>"
                        message_string += "</div>"
                        message_string += "<div class='receiver_chat_message'>"
                        message_string += "<div class='receiver_chat_message_arrow'><img src='image/marker-chat-white.png'></div>"


                        message_string += "<p class='chat_message_content'  onclick='show_chat_option(\""+chat_block_id+"\")'>"+render_message_content+"</p>"
                        message_string += "</div>"
                        message_string += "</div>"
                    }else{
                        message_string += "<div class='sender_chat_message_wrapper'>"
                        message_string += "<div class='chat_message_option' id='"+chat_block_id+"'>"
                        message_string += "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\""+chat_block_id+"\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;"
                        message_string += "</div>"
                        message_string += "<div class='sender_chat_message'>"
                        message_string += "<a href='javascript:void(0)' class='chat_user_icon'><img src='"+data.sender_user_image_url+"'></a>"
                        message_string += "<div class='sender_chat_message_arrow'><img src='image/marker-chat.png'></div>"
                        message_string += "<p class='chat_message_content'  onclick='show_chat_option(\""+chat_block_id+"\")'>"+render_message_content+"</p>"
                        message_string += "</div>"
                        message_string += "</div>"

                    }

                    //Add message into chat body
                    $(this).find(".chat_screen_body").append(message_string);

                    $(this).find(".chat_screen_header").css({"background":"#08a4da"});

                    //In case of message_text input is unfocused, the message is marked as unread
                    $("#"+data.conversation_id).parent().css({"background":"white"});
                    $("#"+data.conversation_id).find(".conversation_lastest_message").empty().append("<span style='color: #a7a7a7; font-size: 12px' class='conversation_lastest_message'><span class='lastest_message_sender'>"+data.sender_user_name+":  </span>"+render_latest_message_content+"</span>");
                    $("#"+data.conversation_id).find(".conversation_lastest_message").css({"font-weight":"bold"});
                    var current_message_text = $(this).find(".message_text");
                    if(current_message_text.is(":focus")){
                        $(this).parent().parent().parent().find(".chat_screen_header").css({"background":"#2f4375"});
                        $("#"+data.conversation_id).find(".conversation_lastest_message").css({"font-weight":"normal"});
                        $("#"+data.conversation_id).parent().css({"background":"#edf0f7"});
                    }
                    current_message_text.focusin(function () {
                        $(this).parent().parent().parent().find(".chat_screen_header").css({"background":"#2f4375"});
                        $("#"+data.conversation_id).find(".conversation_lastest_message").css({"font-weight":"normal"});
                        $("#"+data.conversation_id).parent().css({"background":"#edf0f7"});

                        var last_message_id = $("#"+data.conversation_id).attr("data-last-message-id");
                        $.post("/mark-as-read",
                            {
                                message_id: last_message_id,
                                is_read_user_email: user_email
                            },
                            function (result) {


                            }
                        );

                    });



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
                        conversation_id: data.conversation_id
                    },
                    function (result) {
                        var message_list = result.message_list;
                        var receiver = [];
                        result.member.forEach(function (val,i) {
                            if (val != user_email){
                                receiver.push(val);
                            }

                        });

                        //message receiver list
                        var group_member_number = receiver.length ;
                        receiver = receiver.toString();

                        var message_string = "";
                        message_list.forEach(function (val,i) {
                            //Check message content is text or image url
                            //In case of image url
                            var current_render_message_content = "";
                            if(checkImageMessage(val.content)){
                                current_render_message_content = "<a href='/render-image?image_url="+val.content+"' target='_blank' style='width: 100%'><img src='"+val.content+"' style='width: 100%'></a>"
                            }else{
                                current_render_message_content = val.content
                            }


                            var chat_block_id = generateRandomString();
                            if(val.sender == user_email){
                                message_string += "<div class='receiver_chat_message_wrapper' id='"+val.message_id+"'>"
                                message_string +=   "<div class='chat_message_option' id='"+chat_block_id+"'>"
                                message_string +=       "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\""+chat_block_id+"\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;"
                                message_string +=       "<a href='javascript:void(0)' class='edit_message_button' onclick='edit_message(\""+chat_block_id+"\")'>編集</a>"
                                message_string +=   "</div>"
                                message_string +=   "<div class='receiver_chat_message'>"
                                message_string +=       "<div class='receiver_chat_message_arrow'><img src='image/marker-chat-white.png'></div>"
                                message_string +=       "<p class='chat_message_content'  onclick='show_chat_option(\""+chat_block_id+"\")'>"+current_render_message_content+"</p>"
                                message_string +=   "</div>"
                                message_string += "</div>"
                            }else{
                                message_string += "<div class='sender_chat_message_wrapper' id='"+val.message_id+"'>";
                                message_string +=   "<div class='chat_message_option' id='"+chat_block_id+"'>"
                                message_string +=       "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\""+chat_block_id+"\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;";
                                message_string +=   "</div>"
                                message_string +=   "<div class='sender_chat_message'>";
                                message_string +=       "<a href='javascript:void(0)' class='chat_user_icon'><img src='"+val.sender_user_image_url+"'></a>"
                                message_string +=       "<div class='sender_chat_message_arrow'><img src='image/marker-chat.png'></div>"
                                message_string +=       "<p class='chat_message_content'  onclick='show_chat_option(\""+chat_block_id+"\")'>"+current_render_message_content+"</p>"
                                message_string +=   "</div>";
                                message_string += "</div>";

                            }

                        });

                        var chat_screen_friend = result.member;
                        chat_screen_friend.splice(chat_screen_friend.indexOf(user_email),1);

                        //Show new chat screen
                        var screen_id = generateRandomString();
                        var html_string = "";
                        html_string += '<div class="chat_screen_detail" id="screen-'+screen_id+'">';
                        html_string +=   '<div class="chat_screen_header">';
                        html_string +=     '<div class="chat_screen_header_text">';
                        //check whether chat group or not
                        if(receiver_array.length == 1){
                            html_string +=       '<img src="image/conversation-icon-active.png">';
                        }else{
                            html_string +=       '<img src="image/contact-icon.png">'
                        }

                        html_string +=       '<p class="chat_screen_friend">'+result.conversation_title+'</p>'
                        html_string +=     '</div>';


                        html_string +=     '<div class="chat_screen_header_button">'
                        html_string +=       '<a href="javascript:void(0)" class="minimize_chat_screen" onclick="minimize_chat_screen(\''+screen_id+'\')"><img src="image/minimum-box-chat.png"></a>';
                        html_string +=       '<a href="javascript:void(0)" class="maximize_chat_screen"><img src="image/new-finder-boxchat.png"></a>';
                        html_string +=       '<a href="javascript:void(0)" class="close_chat_screen" onclick="close_chat_screen(\''+screen_id+'\')"><img src="image/close-icon.png"></a>';
                        html_string +=     '</div>'

                        html_string +=   '</div>';
                        html_string +=   '<div class="chat_screen_header_2">';
                        if(group_member_number == 1){
                            html_string +=      '<a class="add_user_chat_screen" href="javascript:void(0)" onclick="show_add_chat_member(\'screen-'+screen_id+'\',\''+data.conversation_id+'\')">';
                            html_string +=          '<img src="image/add-people-normal.png">'
                            html_string +=      '</a>';

                        }else{
                            html_string +=      '<a class="add_user_chat_screen" href="javascript:void(0)" onclick="show_add_chat_member(\'screen-'+screen_id+'\',\''+data.conversation_id+'\')">';
                            html_string +=          '<img src="image/member-boxchat-normal.png">';
                            html_string +=          '<span class="chat_group_number">'+group_member_number+'</span>'
                            html_string +=      '</a>';
                        }

                        html_string +=      '<a class="chat_screen_option" href="javascript:void(0)">';
                        html_string +=          '<img src="image/setup-boxchat-active.png">'
                        html_string +=      '</a>';
                        html_string +=   '</div>';

                        html_string +=   '<div class="chat_screen_body" data-conversation-id="'+result.conversation_id+'">';
                        if(message_string){
                            html_string +=      message_string;
                        }

                        html_string +=   '</div>';
                        html_string +=   '<div class="chat_screen_footer">';
                        html_string +=     '<input type="hidden" class="sender_email" value="'+user_email+'">';
                        html_string +=     '<input type="hidden" class="receiver_email" value="'+receiver+'">';
                        html_string +=     '<input type="hidden" class="conversation_title" value="'+data.conversation_title+'">';
                        html_string +=     '<input type="hidden" class="conversation_id" value="'+data.conversation_id+'">';
                        html_string +=     '<div class="send_message_area">'
                        html_string +=     '<a href="javascript:void(0)" class="show_emotional_icon"><img src="image/amotion-icon-normail.png"></a>'
                        html_string +=     '<textarea class="message_text" name="message_text" placeholder="メッセージを送信"></textarea>';
                        html_string +=     '<label class="chat_upload_image" style="cursor: pointer">'
                        html_string +=       "<form method='POST' action='/upload-chat-image' enctype='multipart/form-data' class='upload_chat_image' id='upload_chat_image_3'>"
                        html_string +=         '<input type="file" style="display: none" name="chat_image" class="upload_chat_image_btn" id="upload_chat_image_btn_3" onchange="UploadChatImage(\'upload_chat_image_3\',\''+data.conversation_id+'\',\''+receiver+'\',\''+data.conversation_title+'\')">'
                        html_string +=       "</form>"
                        html_string +=       '<img src="image/send-image-icon-normal.png">'
                        html_string +=     '</label>'
                        html_string +=     '</div>'
                        html_string +=   '</div>';
                        html_string += '</div>';

                        $('.chat_screen_area').append(html_string);

                        //Process unread chat marker
                        var selected_chat_screen = $("#screen-"+screen_id);
                        selected_chat_screen.find(".chat_screen_header").css({"background":"#08a4da"});

                        //In case of message_text input is unfocused, the message is marked as unread
                        $("#"+data.conversation_id).parent().css({"background":"white"});
                        $("#"+data.conversation_id).find(".conversation_lastest_message").empty().append("<span style='color: #a7a7a7; font-size: 12px' class='conversation_lastest_message'><span class='lastest_message_sender'>"+data.sender_user_name+":  </span>"+render_latest_message_content+"</span>");
                        $("#"+data.conversation_id).find(".conversation_lastest_message").css({"font-weight":"bold"});
                        var current_message_text = selected_chat_screen.find(".message_text");
                        if(current_message_text.is(":focus")){
                            $(this).parent().parent().parent().find(".chat_screen_header").css({"background":"#2f4375"});
                            $("#"+data.conversation_id).find(".conversation_lastest_message").css({"font-weight":"normal"});
                            $("#"+data.conversation_id).parent().css({"background":"#edf0f7"});
                        }
                        current_message_text.focusin(function () {
                            $(this).parent().parent().parent().find(".chat_screen_header").css({"background":"#2f4375"});
                            $("#"+data.conversation_id).find(".conversation_lastest_message").css({"font-weight":"normal"});
                            $("#"+data.conversation_id).parent().css({"background":"#edf0f7"});

                            var last_message_id = $("#"+data.conversation_id).attr("data-last-message-id");

                            //call continue conversation AJAX
                            $.post("/mark-as-read",
                                {
                                    message_id: last_message_id,
                                    is_read_user_email: user_email
                                },
                                function (result) {


                                }
                            );

                        });


                        $(".chat_screen_body").scrollTop($(".chat_screen_body")[0].scrollHeight);



                        var timer = null;
                        //Send message
                        $('.message_text').keyup(function (e) {
                            clearTimeout(timer);
                            var receiver = $(this).parent().parent().find(".receiver_email").val();
                            var sender = user_email;
                            var conversation_id = $(this).parent().parent().find(".conversation_id").val();
                            var conversation_title = $(this).parent().parent().find(".conversation_title").val();
                            var message_id = generateMessageId();

                            var message_text = $(this).val();



                            socket.emit("typing", {
                                sender: sender,
                                receiver : receiver,
                                conversation_id : conversation_id
                            });
                            if (e.keyCode == 13) {

                                //Prevent white space only content
                                if(!$.trim(message_text)){
                                    return false;
                                }


                                if(e.shiftKey){
                                    return false;
                                }

                                //Clear message from input first
                                $('.message_text').val("");


                                //post send-a-message AJAX
                                $.post("/send-a-message",
                                    {
                                        sender_email: user_email,
                                        sender_name: user_name,
                                        sender_image_url: user_image_url,
                                        receiver: receiver,
                                        conversation_id : conversation_id,
                                        conversation_title: conversation_title,
                                        message_text : message_text,
                                        message_id : message_id,
                                        user_conversation_list : user_conversation_list.toString()
                                    },
                                    function (data) {
                                        //Emit a new message
                                        socket.emit("send a message",{
                                            sender: user_email,
                                            sender_user_name: user_name,
                                            sender_user_image_url: user_image_url,
                                            receiver : receiver,
                                            conversation_id : conversation_id,
                                            conversation_title: conversation_title,
                                            message_id: message_id,
                                            message_text: $.trim(message_text).replace(/\n\r?/g, '<br />')
                                        });

                                    }
                                );


                            };

                            timer = setTimeout(function () {
                                socket.emit("stop typing",{
                                    sender: sender,
                                    receiver : receiver,
                                    conversation_id : conversation_id
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

        var receiver_array = data.receiver.split(",");
        if(receiver_array.indexOf(user_email) != -1){
            $(".chat_screen_detail .chat_screen_body").each(function (i) {
                if($(this).attr("data-conversation-id") == data.conversation_id){
                    if($(this).find(".chat_typing_icon").length == 0){
                        $(this).append("<img class='chat_typing_icon' src='image/typing.png' width='30' height='30'/>");
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
        var receiver_array = data.receiver.split(",");
        if(receiver_array.indexOf(user_email) != -1){
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

    //Listen user logged in
    socket.on("logged in notify",function (data) {
        //update online icon
        $("#"+escapeEmailString(data.email) + " .online_status_icon").css({"background": "#39b54a"});
        $("#chat-user-"+escapeEmailString(data.email) + " .online_status_icon").css({"background": "#39b54a"});

    });

    //Listen user logged out
    socket.on("logged out notify",function (data) {
        //update online icon
        $("#"+escapeEmailString(data.email) + " .online_status_icon").css({"background": "#e2e2e2"});
        $("#chat-user-"+escapeEmailString(data.email) + " .online_status_icon").css({"background": "#e2e2e2"});


    });

    socket.on("new add user approval notify",function (data) {
        //Update user_friend_info
        user_friend_info.splice(0,0,data.new_user_friend_info);

    });



    //End GAE socket definition

    // socket.emit("check online user",{
    //     email : user_email
    // });

    socket.emit("check user", {
        email: user_email
    });

    //Get add friend requesting
    //post send-a-message AJAX
    $.post("/get-friend-request",
        {
            user_email : user_email
        },
        function (data) {
            is_requested_user_info = data.is_requested_user_info
            do_requesting_user_list = data.do_requesting_user_list

            if(is_requested_user_info.length > 0){
                //Update is_requested_user_number
                var is_requested_user_number = is_requested_user_info.length;
                $("#add_user_requesting_number p").text(is_requested_user_number);
                $("#add_user_requesting_number").show();

            }else{
                $("#add_user_requesting_number").hide()
            }

        }
    );









    //Set main_chat_body height
    var viewport_height = $(window).height();
    //height of header_1 + header_2 +footer
    var other_height = 130 + 50 + 50;
    var main_chat_height = viewport_height - other_height;
    var main_chat_icon_height = 40;
    var list_chat_height = main_chat_height - main_chat_icon_height;
    //Set value
    // $(".page_main_left_wrapper").css({'height': main_chat_height});
    // $(".page_main_right_wrapper").css({'height': main_chat_height});
    $(".page_main_wrapper").css({'height': main_chat_height});

    $(".page_main_left_body").css({'height': list_chat_height});
    $(".page_main_left_footer").css({'height': main_chat_icon_height});



    var conversation_string = "";

    user_conversation_info.forEach(function (val,i) {
        var render_last_message = ""
        if(checkImageMessage(val.last_message)){
            render_last_message = "写真送信済み"
        }else{
            render_last_message = val.last_message

        }
            if(val){
                var conversation_image_string = "";
                if (val.conversation_image_url){
                    conversation_image_string = "<div class='conversation_image_wrapper'><img src='"+val.conversation_image_url+"'></div>"
                }else{
                    conversation_image_string = "<div class='conversation_image_wrapper'><img src='image/avt-default-1.png'></div>"

                }

                var is_read_by_array = val.is_read_by_user_email;
                if(is_read_by_array.indexOf(user_email) == -1){
                    conversation_string += "<li class='user_conversation_li' style='background: white;'>";
                }else{
                    conversation_string += "<li class='user_conversation_li'>";
                }

                conversation_string +=   "<a href='javascript:void(0)' class='user_conversation_id' data-last-message-id='"+val.last_message_id+"' id='"+val.conversation_id+"'>" +
                            conversation_image_string
                conversation_string +=   "<p>"
                conversation_string +=     "<span style='color: #3e3e3e' class='conversation_title'>"+val.conversation_title+"</span><br>"
                if(is_read_by_array.indexOf(user_email) == -1){
                    conversation_string +=     "<span style='color: #a7a7a7; font-size: 12px; font-weight: bold;' class='conversation_lastest_message'><span class='lastest_message_sender'>"+val.sender_user_name+":  </span>"+render_last_message+"</span>";
                }else{
                    conversation_string +=     "<span style='color: #a7a7a7; font-size: 12px' class='conversation_lastest_message'><span class='lastest_message_sender'>"+val.sender_user_name+":  </span>"+render_last_message+"</span>";
                }


                conversation_string +=   "</p>"
                conversation_string +=   "</a>"
                conversation_string += '<a href="javascript:void(0)" class="glyphicon glyphicon-option-vertical user_conversation_action_button" onclick="show_conversation_option(\''+val.conversation_id+'\')"></a>'
                conversation_string += "<ul class='conversation_option'>"
                conversation_string += '<li><a href="javascript:void(0)" onclick="addMemberToConversation(\''+val.conversation_id+'\')">メンバーを追加する</a></li>';
                conversation_string += '<li><a href="javascript:void(0)" onclick="renameConversation(\''+val.conversation_id+'\')">チャットタイトルを編集する</a></li>'
                conversation_string += '<li><a href="javascript:void(0)" onclick="deleteConversation(\''+val.conversation_id+'\')">チャットを削除する</a></li>'
                conversation_string += '<li><a href="javascript:void(0)" onclick="markConversationAsRead(\''+val.conversation_id+'\')">既読をする</a></li>'
                conversation_string += "</ul>"
                conversation_string += "</li>";

            }
        });
    if(user_conversation_info.length == 0){
        conversation_string += "<p class='empty_list'>チャット一覧は空です！</p>"
    }

    $(".user_conversation_list").append(conversation_string);



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
                data.member.forEach(function (val,i) {
                    if (val != user_email){
                        receiver.push(val);
                    }

                });

                //message receiver list

                var group_member_number = receiver.length ;
                receiver = receiver.toString();


                var message_string = "";
                message_list.forEach(function (val,i) {
                    //Check message content is text or image url
                    //In case of image url
                    var current_render_message_content = "";
                    if(checkImageMessage(val.content)){
                        current_render_message_content = "<a href='/render-image?image_url="+val.content+"' target='_blank' style='width: 100%'><img src='"+val.content+"' style='width: 100%'></a>"
                    }else{
                        current_render_message_content = val.content
                    }

                    var chat_block_id = generateRandomString();
                    if(val.sender == user_email){
                        message_string += "<div class='receiver_chat_message_wrapper' id='"+val.message_id+"'>"
                        message_string +=   "<div class='chat_message_option' id='"+chat_block_id+"'>"
                        message_string +=       "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\""+chat_block_id+"\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;"
                        message_string +=       "<a href='javascript:void(0)' class='edit_message_button' onclick='edit_message(\""+chat_block_id+"\")'>編集</a>"
                        message_string +=   "</div>";
                        message_string +=   "<div class='receiver_chat_message'>"
                        message_string +=       "<div class='receiver_chat_message_arrow'><img src='image/marker-chat-white.png'></div>"
                        message_string +=       "<p class='chat_message_content' onclick='show_chat_option(\""+chat_block_id+"\")'>"+current_render_message_content+"</p>"
                        message_string +=   "</div>"
                        message_string += "</div>"
                    }else{
                        message_string += "<div class='sender_chat_message_wrapper' id='"+val.message_id+"'>"
                        message_string +=   "<div class='chat_message_option' id='"+chat_block_id+"'>"
                        message_string +=       "<a href='javascript:void(0)' class='message_favorite_button' onclick='add_remove_message_favorite(\""+chat_block_id+"\")'><img src='image/heart-normal.png' data-status=''></a>&nbsp;&nbsp;"
                        message_string +=   "</div>";
                        message_string +=   "<div class='sender_chat_message'>"
                        message_string +=       "<a href='javascript:void(0)' class='chat_user_icon'><img src='"+val.sender_user_image_url+"'></a>"
                        message_string +=       "<div class='sender_chat_message_arrow'><img src='image/marker-chat.png'></div>"
                        message_string +=       "<p class='chat_message_content'  onclick='show_chat_option(\""+chat_block_id+"\")'>"+current_render_message_content+"</p>"
                        message_string +=   "</div>"
                        message_string += "</div>"

                    }
                });

                var conversation_title = data.conversation_title;
                //Show new chat screen
                var screen_id = generateRandomString();
                var html_string = "";
                html_string += '<div class="chat_screen_detail" id="screen-'+screen_id+'">';
                html_string +=   '<div class="chat_screen_header">';
                html_string +=     '<div class="chat_screen_header_text">';
                if(group_member_number == 1){
                    html_string +=       '<img src="image/conversation-icon-active.png">';
                }else{
                    html_string +=       '<img src="image/contact-icon.png">'
                }

                html_string +=       '<p class="chat_screen_friend">'+conversation_title+'</p>'
                html_string +=     '</div>';

                html_string +=     '<div class="chat_screen_header_button">'
                html_string +=       '<a href="javascript:void(0)" class="minimize_chat_screen" onclick="minimize_chat_screen(\''+screen_id+'\')"><img src="image/minimum-box-chat.png"></a>';
                html_string +=       '<a href="javascript:void(0)" class="maximize_chat_screen"><img src="image/new-finder-boxchat.png"></a>';
                html_string +=       '<a href="javascript:void(0)" class="close_chat_screen" onclick="close_chat_screen(\''+screen_id+'\')"><img src="image/close-icon.png"></a>';
                html_string +=     '</div>'
                html_string +=   '</div>';
                html_string +=   '<div class="chat_screen_header_2">';
                if(group_member_number == 1){
                    html_string +=      '<a class="add_user_chat_screen" href="javascript:void(0)" onclick="show_add_chat_member(\'screen-'+screen_id+'\',\''+conversation_id+'\')">';
                    html_string +=          '<img src="image/add-people-normal.png">'
                    html_string +=      '</a>';
                }else{
                    html_string +=      '<a class="add_user_chat_screen" href="javascript:void(0)" onclick="show_add_chat_member(\'screen-'+screen_id+'\',\''+conversation_id+'\')">';
                    html_string +=          '<img src="image/member-boxchat-normal.png">';
                    html_string +=          '<span class="chat_group_number">'+group_member_number+'</span>'
                    html_string +=      '</a>';
                }

                html_string +=      '<a class="chat_screen_option" href="javascript:void(0)">';
                html_string +=          '<img src="image/setup-boxchat-active.png">'
                html_string +=      '</a>';
                html_string +=   '</div>';
                html_string +=   '<div class="chat_screen_body" data-conversation-id="'+conversation_id+'">';
                if(message_string){
                    html_string +=  message_string;
                }

                html_string +=   '</div>';
                html_string +=   '<div class="chat_screen_footer">';
                html_string +=     '<input type="hidden" class="sender_email" value="'+user_email+'">';
                html_string +=     '<input type="hidden" class="receiver_email" value="'+receiver+'">';
                html_string +=     '<input type="hidden" class="conversation_title" value="'+data.conversation_title+'">';
                html_string +=     '<input type="hidden" class="conversation_id" value="'+conversation_id+'">';
                html_string +=     '<div class="send_message_area">'
                html_string +=     '<a href="javascript:void(0)" class="show_emotional_icon"><img src="image/amotion-icon-normail.png"></a>'
                html_string +=     '<textarea class="message_text" name="message_text" placeholder="メッセージを送信"></textarea>';
                html_string +=     '<label class="chat_upload_image" style="cursor: pointer">'
                html_string +=       "<form method='POST' action='/upload-chat-image' enctype='multipart/form-data' class='upload_chat_image' id='upload_chat_image_4'>"
                html_string +=         '<input type="file" style="display: none" name="chat_image" class="upload_chat_image_btn" id="upload_chat_image_btn_4" onchange="UploadChatImage(\'upload_chat_image_4\',\''+conversation_id+'\',\''+receiver+'\',\''+data.conversation_title+'\')">'
                html_string +=       "</form>"
                html_string +=       '<img src="image/send-image-icon-normal.png">'
                html_string +=     '</label>'
                html_string +=     '</div>'
                html_string +=   '</div>';
                html_string += '</div>';

                $('.chat_screen_area').append(html_string);

                $(".chat_screen_body").scrollTop($(".chat_screen_body")[0].scrollHeight);


                $(".message_text").focusin(function () {
                    $("#"+data.conversation_id).find(".conversation_lastest_message").css({"font-weight":"normal"});
                    $("#"+data.conversation_id).parent().css({"background":"#edf0f7"});

                    var last_message_id = $("#"+data.conversation_id).attr("data-last-message-id");

                    //call continue conversation AJAX
                    $.post("/mark-as-read",
                        {
                            message_id: last_message_id,
                            is_read_user_email: user_email
                        },
                        function (result) {

                        }
                    );

                });





                var timer = null;
                //Send message
                $('.message_text').keyup(function (e) {
                    clearTimeout(timer);
                    var receiver = $(this).parent().parent().find(".receiver_email").val();
                    var sender = user_email;
                    var conversation_id = $(this).parent().parent().find(".conversation_id").val();
                    var conversation_title = $(this).parent().parent().find(".conversation_title").val();
                    var message_id = generateMessageId();
                    var message_text = $(this).val();

                    socket.emit("typing", {
                        sender: sender,
                        receiver : receiver,
                        conversation_id : conversation_id
                    });
                    if (e.keyCode == 13) {
                        //Prevent white space only content
                        if(!$.trim(message_text)){
                            return false;
                        }


                        if(e.shiftKey){
                            return false;
                        }

                        //Clear message from input first
                        $('.message_text').val("");


                        //post send-a-message AJAX
                        $.post("/send-a-message",
                            {
                                sender_email: user_email,
                                sender_name: user_name,
                                sender_image_url: user_image_url,
                                receiver: receiver,
                                conversation_id : conversation_id,
                                message_text : message_text,
                                message_id: message_id,
                                user_conversation_list : user_conversation_list.toString()
                            },
                            function (data) {
                                //Emit a new message
                                socket.emit("send a message",{
                                    sender: user_email,
                                    sender_user_name: user_name,
                                    sender_user_image_url: user_image_url,
                                    receiver : receiver,
                                    conversation_id : conversation_id,
                                    conversation_title: conversation_title,
                                    message_id: message_id,
                                    message_text: $.trim(message_text).replace(/\n\r?/g, '<br />')
                                });
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

    //Switch between conversation_list and user_list
    $("#show_conversation_list").on("click",function () {
        $(".page_main_left_footer_icon").removeClass("footer_icon_active");
        $(this).addClass("footer_icon_active");

        $(".user_friend_list").hide();
        $(".user_conversation_list").show();


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


    var user_id = "message_" + date.yyyymmdd();

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
        user_id += possible.charAt(Math.floor(Math.random() * possible.length));

    return user_id;


};

function escapeEmailString(email){
    var mail = email.replace(/\./g, '').replace("@","");
    return mail
};

function recoverDoubleQuote(string){
    return string.replace(/(\r\n|\n|\r)/gm,"").replace(/&#34;/g, '"');
};


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


};

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

function GoogleLogout()
{
    gapi.auth.signOut();
    location.reload();
}


//End Google logout


function showNewChatScreen() {

    var html_string_new_chat = "";
    if(user_friend_info.length > 0){
        user_friend_info.forEach(function (val,i) {
            html_string_new_chat += "<li>"
            html_string_new_chat +=   '<a href="javascript:void(0)" class="new_chat_user_friend_email" id="chat-user-'+escapeEmailString(val.user_email)+'" title="'+val.user_name+'" onclick="add_user_to_new_chat(\''+val.user_email+'\')">';


            html_string_new_chat +=     "<img src='"+val.image_url+"'>"
            if(val.user_name){
                html_string_new_chat +=     "<p style='color: #3e3e3e;margin-top: 3px'>"+val.user_name+"<br><span class='add_user_chat_email'>"+val.user_email+"</span></p>"

            }else{
                html_string_new_chat +=     "<p style='color: #3e3e3e;margin-top: 10px'>"+val.user_email+"</p>"
            }

            if(val.is_online){
                html_string_new_chat +=     "<div class='online_status_icon' style='background: #39b54a'></div>"
            }else{
                html_string_new_chat +=     "<div class='online_status_icon' style='background: #e2e2e2'></div>"
            }
            html_string_new_chat +=   "</a>";
            html_string_new_chat += "</li>";
        });

    }else{
        html_string_new_chat += "<p class='empty_list'>友達一覧は空です！</p>"
    }

    $(".new_chat_friend_list").empty().append(html_string_new_chat);

    $("#start_chat_dialog").show();

}

function hideNewChatScreen() {
    $(".new_chat_title").val("");
    $(".typed_number").text("0");
    $(".remain_number").text("30");
    $(".new_chat_row_3_right").empty();
    $("#start_chat_dialog").hide();

}

function show_conversation_option(conversation_id) {
    if($("#"+conversation_id).parent().find(".conversation_option").is(":visible")){
        $("#"+conversation_id).parent().find(".conversation_option").hide();
    }else{
        $(".conversation_option").hide();
        $("#"+conversation_id).parent().find(".conversation_option").show();
    }

}



function add_user_to_new_chat(email) {

    var escape_email = escapeEmailString(email);

    if($("#new-chat-"+escape_email).length > 0){
        return false;
    }

    var user_string = "";
    user_string += "<div class='new_chat_user_detail' id='new-chat-"+escape_email+"' title='"+email+"'>";
    user_string +=   "<p>"+email+"</p>";
    user_string +=   '<a href="javascript:void(0)" onclick="close_chat_user_detail(\''+escape_email+'\')">x</a>';
    user_string += "</div>";

    $(".new_chat_row_3_right").append(user_string);



}

function close_chat_user_detail(escape_email) {
    $("#new-chat-"+escape_email).remove();

}

function startNewChat() {
    //Start GAE socket definition
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp +':65080';
    var socket = io(webSocketUri);

    //End GAE socket definition

    var chat_title = $(".new_chat_title").val();
    var chat_member = []
    $(".new_chat_user_detail").each(function (i) {
        chat_member.push($(this).attr("title"))
    });

    var chat_member_number = chat_member.length;

    if(chat_member.length == 0){
        alert("参加者を入力してください！")
        return false;
    }

    var new_conversation_id = generateConversationId();
    var screen_id = generateRandomString();
    var html_string = "";
    html_string += '<div class="chat_screen_detail" id="screen-'+screen_id+'">';
    html_string +=   '<div class="chat_screen_header">';
    html_string +=     '<div class="chat_screen_header_text">';
    //check whether chat group or not
    if(chat_member_number == 1){
        html_string +=       '<img src="image/conversation-icon-active.png">';
    }else{
        html_string +=       '<img src="image/contact-icon.png">'
    }

    if(chat_title){
        html_string +=       '<p class="chat_screen_friend">'+chat_title+'</p>'
    }else{
        html_string +=       '<p class="chat_screen_friend">チャットタイトル無し</p>'
    }

    html_string +=     '</div>';
    html_string +=     '<div class="chat_screen_header_button">'
    html_string +=       '<a href="javascript:void(0)" class="minimize_chat_screen" onclick="minimize_chat_screen(\''+screen_id+'\')"><img src="image/minimum-box-chat.png"></a>';
    html_string +=       '<a href="javascript:void(0)" class="maximize_chat_screen"><img src="image/new-finder-boxchat.png"></a>';
    html_string +=       '<a href="javascript:void(0)" class="close_chat_screen" onclick="close_chat_screen(\''+screen_id+'\')"><img src="image/close-icon.png"></a>';
    html_string +=     '</div>'
    html_string +=   '</div>';

    html_string +=   '<div class="chat_screen_header_2">';
    if(chat_member_number == 1){
        html_string +=      '<a class="add_user_chat_screen" href="javascript:void(0)" onclick="show_add_chat_member(\'screen-'+screen_id+'\',\''+new_conversation_id+'\')">';
        html_string +=          '<img src="image/add-people-normal.png">'
        html_string +=      '</a>';

    }else{
        html_string +=      '<a class="add_user_chat_screen" href="javascript:void(0)" onclick="show_add_chat_member(\'screen-'+screen_id+'\',\''+new_conversation_id+'\')">';
        html_string +=          '<img src="image/member-boxchat-normal.png">';
        html_string +=          '<span class="chat_group_number">'+chat_member_number+'</span>'
        html_string +=      '</a>';
    }


    html_string +=      '<a class="chat_screen_option" href="javascript:void(0)">';
    html_string +=          '<img src="image/setup-boxchat-active.png">'
    html_string +=      '</a>';
    html_string +=   '</div>';

    html_string +=   '<div class="chat_screen_body" data-conversation-id="'+new_conversation_id+'"></div>';
    html_string +=   '<div class="chat_screen_footer">';
    html_string +=     '<input type="hidden" class="sender_email" value="'+user_email+'">';
    html_string +=     '<input type="hidden" class="receiver_email" value="'+chat_member.toString()+'">';
    html_string +=     '<input type="hidden" class="conversation_id" value="'+new_conversation_id+'">';
    var conversation_title = "";
    if(chat_title){
        conversation_title = chat_title;
    }else{
        conversation_title = "チャットタイトル無し";
    }

    html_string +=     '<input type="hidden" class="conversation_title" value="'+conversation_title+'">';


    html_string +=     '<div class="send_message_area">'
    html_string +=       '<a href="javascript:void(0)" class="show_emotional_icon"><img src="image/amotion-icon-normail.png"></a>'
    html_string +=       '<textarea class="message_text" name="message_text" placeholder="メッセージを送信"></textarea>';
    html_string +=     '<label class="chat_upload_image" style="cursor: pointer">'
    html_string +=       "<form method='POST' action='/upload-chat-image' enctype='multipart/form-data' class='upload_chat_image' id='upload_chat_image_1'>"
    html_string +=         '<input type="file" style="display: none" name="chat_image" class="upload_chat_image_btn" id="upload_chat_image_btn_1" onchange="UploadChatImage(\'upload_chat_image_1\',\''+new_conversation_id+'\',\''+chat_member.toString()+'\',\''+conversation_title+'\')">'
    html_string +=       "</form>"
    html_string +=       '<img src="image/send-image-icon-normal.png">'
    html_string +=     '<label>'
    html_string +=     '</div>'
    html_string +=   '</div>';
    html_string += '</div>';


    hideNewChatScreen()
    $('.chat_screen_area').append(html_string);


    var timer = null;
    //Send message
    $('.message_text').keyup(function (e) {
        clearTimeout(timer);
        var receiver = $(this).parent().parent().find(".receiver_email").val();
        var sender = user_email;
        var conversation_id = $(this).parent().parent().find(".conversation_id").val();
        var conversation_title = $(this).parent().parent().find(".conversation_title").val();
        var message_id = generateMessageId();
        var message_text = $(this).val();

        socket.emit("typing", {
            sender: sender,
            receiver : receiver,
            conversation_id : conversation_id
        });
        if (e.keyCode == 13) {
            //Prevent white space only content
            if(!$.trim(message_text)){
                return false;
            }

            if(e.shiftKey){
                return false;
            }



            //Clear message from input first
            $('.message_text').val("");


            //post send-a-message AJAX
            $.post("/send-a-message",
                {
                    sender_email: user_email,
                    sender_name: user_name,
                    sender_image_url: user_image_url,
                    receiver: receiver,
                    conversation_id : conversation_id,
                    conversation_title:conversation_title,
                    message_text : message_text,
                    message_id: message_id,
                    user_conversation_list : user_conversation_list.toString()
                },
                function (data) {
                    //Emit a new message
                    socket.emit("send a message",{
                        sender: user_email,
                        sender_user_name: user_name,
                        sender_user_image_url: user_image_url,
                        receiver : receiver,
                        conversation_id : conversation_id,
                        conversation_title:conversation_title,
                        message_id: message_id,
                        message_text: $.trim(message_text).replace(/\n\r?/g, '<br />')
                    });
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


function deny_add_user_request(request_user_email, login_user_email) {
    //call create chat AJAX
    $.post("/deny-add-user",
        {
            request_user_email: request_user_email,
            login_user_email: login_user_email

        },
        function (data) {
            if (data.status == "success"){
                //Delete add_user_request row
                $("#request-"+escapeEmailString(request_user_email)).remove();

                if($(".is_requested_user_row").length == 0){
                    $(".is_requested_user_wrapper").hide()
                }

                //Update add_user_request_number
                var current_user_requesting_number = parseInt($("#add_user_requesting_number p").text());
                var new_user_requesting_number = current_user_requesting_number - 1;
                $("#add_user_requesting_number p").text(new_user_requesting_number.toString());
                if(!(new_user_requesting_number > 0)){
                    $("#add_user_requesting_number").hide()
                }

                //Update is_requested_user_info
                var new_is_requested_user_info = []
                is_requested_user_info.forEach(function (val,i) {
                    if(val.request_user_email != request_user_email){
                        new_is_requested_user_info.push(val);
                    }

                });

                is_requested_user_info = new_is_requested_user_info



            }
        }
    );

}


function approve_add_user_request(request_user_email, login_user_email, request_user_name, request_user_image_url) {
    //Start GAE socket definition
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp +':65080';
    var socket = io(webSocketUri);

    //End GAE socket definition

    //call create chat AJAX
    $.post("/approve-add-user",
        {
            request_user_email: request_user_email,
            login_user_email: login_user_email

        },
        function (data) {
            if (data.status == "success"){
                //Delete add_user_request row
                $("#request-"+escapeEmailString(request_user_email)).remove();

                if($(".is_requested_user_row").length == 0){
                    $(".is_requested_user_wrapper").hide()
                }

                //Update add_user_request_number
                var current_user_requesting_number = parseInt($("#add_user_requesting_number p").text());
                var new_user_requesting_number = current_user_requesting_number - 1;
                if(new_user_requesting_number > 0){
                    $("#add_user_requesting_number p").text(new_user_requesting_number.toString());
                }else{
                    $("#add_user_requesting_number").hide()
                }

                //update user_friend_info
                var new_user_friend_info = {}
                new_user_friend_info.user_name = request_user_name;
                new_user_friend_info.user_email = request_user_email;
                new_user_friend_info.image_url = request_user_image_url;

                socket.emit("new add user approval",{
                    new_user_friend_info: new_user_friend_info
                })


            }
        }
    );

}

function show_user_list() {

    //Start GAE socket definition
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp +':65080';
    var socket = io(webSocketUri);


    var html_string = "";
    if(user_friend_info.length > 0){
        user_friend_info.forEach(function (val,i) {
            html_string += "<li class='user_friend_li'>";
            if(val.user_name){
                html_string +=   "<a href='javascript:void(0)' class='user_friend_email' id='"+escapeEmailString(val.user_email)+"' title='"+val.user_name+"' data-user-email='"+val.user_email+"'>";
            }else{
                html_string +=   "<a href='javascript:void(0)' class='user_friend_email' id='"+escapeEmailString(val.user_email)+"' title='"+val.user_email+"' data-user-email='"+val.user_email+"'>";
            }

            html_string +=     "<img src='"+val.image_url+"'>"
            html_string +=     "<p>";
            if(val.user_name){
                html_string +=       "<span style='color: #3e3e3e' class='conversation_title'>"+val.user_name+"</span><br><span style='color: #a7a7a7; font-size: 12px' class='conversation_lastest_message'>"+val.user_email+"</span>"
            }else{
                html_string +=       "<span style='color: #3e3e3e;' class='conversation_title'>"+val.user_email+"</span>"
            }

            html_string +=     "</p>"
            if(val.is_online){
                html_string +=     "<div class='online_status_icon' style='background: #39b54a'></div>"
            }else{
                html_string +=     "<div class='online_status_icon' style='background: #e2e2e2'></div>"
            }

            html_string +=   "</a>"
            html_string +=   "<a href='javascript:void(0)' class='glyphicon glyphicon-option-vertical user_friend_action_button'></a>"
            html_string += "</li>";

        });

    }else{
        html_string += "<p class='empty_list'>友達一覧は空です！</p>"
    }


    $(".user_friend_list").empty().append(html_string);

    $(".page_main_left_footer_icon").removeClass("footer_icon_active");
    $("#show_user_list").addClass("footer_icon_active");

    $(".user_conversation_list").hide();
    $(".user_friend_list").show();


    //Start new conversation
    $(".user_friend_email").on("click",function () {
        var new_conversation_id = generateConversationId();
        var screen_id = generateRandomString();
        var html_string = "";
        html_string += '<div class="chat_screen_detail" id="screen-'+screen_id+'">';
        html_string +=   '<div class="chat_screen_header">';
        html_string +=     '<div class="chat_screen_header_text">';
        html_string +=       '<img src="image/conversation-icon-active.png">'
        html_string +=       '<p class="chat_screen_friend">'+$(this).attr("title")+'</p>'
        html_string +=     '</div>';
        html_string +=     '<div class="chat_screen_header_button">'
        html_string +=       '<a href="javascript:void(0)" class="minimize_chat_screen" onclick="minimize_chat_screen(\''+screen_id+'\')"><img src="image/minimum-box-chat.png"></a>';
        html_string +=       '<a href="javascript:void(0)" class="maximize_chat_screen"><img src="image/new-finder-boxchat.png"></a>';
        html_string +=       '<a href="javascript:void(0)" class="close_chat_screen" onclick="close_chat_screen(\''+screen_id+'\')"><img src="image/close-icon.png"></a>';
        html_string +=     '</div>'
        html_string +=   '</div>';

        html_string +=   '<div class="chat_screen_header_2">';
        html_string +=      '<a class="add_user_chat_screen" href="javascript:void(0)" onclick="show_add_chat_member(\'screen-'+screen_id+'\',\''+new_conversation_id+'\')">';
        html_string +=          '<img src="image/add-people-normal.png">'
        html_string +=      '</a>';
        html_string +=      '<a class="chat_screen_option" href="javascript:void(0)" onclick="show_add_chat_member(\'screen-'+screen_id+'\',\''+new_conversation_id+'\')">';
        html_string +=          '<img src="image/setup-boxchat-active.png">'
        html_string +=      '</a>';
        html_string +=   '</div>';

        html_string +=   '<div class="chat_screen_body" data-conversation-id="'+new_conversation_id+'"></div>';
        html_string +=   '<div class="chat_screen_footer">';
        html_string +=     '<input type="hidden" class="sender_email" value="'+user_email+'">';
        html_string +=     '<input type="hidden" class="receiver_email" value="'+$(this).attr("data-user-email")+'">';
        html_string +=     '<input type="hidden" class="conversation_title" value="チャットタイトル無し">';
        html_string +=     '<input type="hidden" class="conversation_id" value="'+new_conversation_id+'">';
        html_string +=     '<div class="send_message_area">'
        html_string +=     '<a href="javascript:void(0)" class="show_emotional_icon"><img src="image/amotion-icon-normail.png"></a>'
        html_string +=     '<textarea class="message_text" name="message_text" placeholder="メッセージを送信"></textarea>';
        html_string +=     '<label class="chat_upload_image" style="cursor: pointer">'
        html_string +=       "<form method='POST' action='/upload-chat-image' enctype='multipart/form-data' class='upload_chat_image' id='upload_chat_image_2'>"
        html_string +=         '<input type="file" style="display: none" name="chat_image" class="upload_chat_image_btn" id="upload_chat_image_btn_2" onchange="UploadChatImage(\'upload_chat_image_2\',\''+new_conversation_id+'\',\''+$(this).attr("data-user-email")+'\',\''+チャットタイトル無し+'\')">'
        html_string +=       "</form>"
        html_string +=       '<img src="image/send-image-icon-normal.png">'
        html_string +=     '</label>'
        html_string +=     '</div>'
        html_string +=   '</div>';
        html_string += '</div>';

        $('.chat_screen_area').append(html_string);


        var timer = null;
        //Send message
        $('.message_text').keyup(function (e) {
            clearTimeout(timer);
            var receiver = $(this).parent().parent().find(".receiver_email").val();
            var sender = user_email;
            var conversation_id = $(this).parent().parent().find(".conversation_id").val();
            var message_id = generateMessageId();
            var conversation_title = $(this).parent().parent().find(".conversation_title").val();
            var message_text = $(this).val();

            socket.emit("typing", {
                sender: sender,
                receiver : receiver,
                conversation_id : conversation_id
            });
            if (e.keyCode == 13) {
                //Prevent white space only content
                if(!$.trim(message_text)){
                    return false;
                }

                if(e.shiftKey){
                    return false;
                }



                //Clear message from input first
                $('.message_text').val("");

                //post send-a-message AJAX
                $.post("/send-a-message",
                    {
                        sender_email: user_email,
                        sender_name: user_name,
                        sender_image_url: user_image_url,
                        receiver: receiver,
                        conversation_id : conversation_id,
                        conversation_title:conversation_title,
                        message_text : message_text,
                        message_id: message_id,
                        user_conversation_list : user_conversation_list.toString()
                    },
                    function (data) {
                        //Emit a new message
                        socket.emit("send a message",{
                            sender: user_email,
                            sender_user_name: user_name,
                            sender_user_image_url: user_image_url,
                            receiver : receiver,
                            conversation_id : conversation_id,
                            conversation_title: conversation_title,
                            message_id: message_id,
                            message_text: $.trim(message_text).replace(/\n\r?/g, '<br />')
                        });
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

}

function show_add_chat_member(screen_id, conversation_id) {

    var receiver_email_array = $("#"+screen_id).find(".receiver_email").val().split(",");

    //In case of NOT a group chat
    if(receiver_email_array.length == 1){
        var add_user_group_chat_list = []

        user_friend_info.forEach(function (val,i) {
            if (val.user_email != user_email && receiver_email_array.indexOf(val.user_email) == -1){
                add_user_group_chat_list.push(val)

            }
        });

        var html_string = "";
        html_string += "<div class='add_user_group_chat_screen' id='add-user-group-"+screen_id+"'>";
        html_string +=   "<div class='add_user_group_chat_body' style='height: 215px'>";
        html_string +=     "<div class='add_user_group_chat_auto'>";
        html_string +=       "<input type='text' class='add_user_group_chat_auto_input'>";
        html_string +=     "</div>"
        add_user_group_chat_list.forEach(function (val,i) {
            var row_id = generateRandomString();
            html_string += "<div class='add_user_group_chat_row' id='add-user-group-row-"+row_id+"'>";
            html_string +=   '<input type="checkbox" data-is-checked="" class="add_user_group_chat_select" onclick="select_add_user_group(\''+row_id+'\',\''+val.user_email+'\',\''+val.user_name+'\')">';
            html_string +=   "<a href='javascript:void(0)'><img src='"+val.image_url+"'></a>";
            if(val.user_name){
                html_string +=   "<p>"+val.user_name+"</p>"
            }else{
                html_string +=   "<p>"+val.user_email+"</p>"
            }

            html_string += "</div>"

        });
        html_string += "</div>";

        html_string += "<p class='add_user_group_chat_des'>追加したユーザーは、このハングアウトの過去のメッセージをすべて見ることができます</p>";
        html_string += "<div class='add_user_group_chat_footer'>";
        html_string += '<a href="javascript:void(0)" onclick="close_add_user_group_chat(\''+screen_id+'\')" class="close_add_user_group_chat">キャンセル</a>'
        html_string += '<a href="javascript:void(0)" onclick="do_add_user_group_chat(\''+screen_id+'\',\''+user_email+'\',\''+receiver_email_array.toString()+'\',\''+conversation_id+'\')" class="do_add_user_group_chat">グループを作成</a>'
        html_string += "</div>";


        html_string += "</div>";

        $("#"+screen_id).append(html_string);

    }
    //In case of IS a group chat
    else{

        var current_group_user_list = []

        user_friend_info.forEach(function (val,i) {
            if (receiver_email_array.indexOf(val.user_email) != -1){
                current_group_user_list.push(val)

            }
        });

        var html_string = "";
        html_string += "<div class='add_user_group_chat_screen'id='add-user-group-"+screen_id+"'>";
        html_string += "<div class='add_user_group_chat_body' style='height:260px'>";

        current_group_user_list.forEach(function (val,i) {
            var row_id = generateRandomString();
            html_string += "<div class='add_user_group_chat_row' id='"+row_id+"' style='border-bottom: 1px solid #e5e7ee'>";
            html_string +=   "<a href='javascript:void(0)'><img src='"+val.image_url+"'></a>";
            if(val.user_name){
                html_string +=   "<p>"+val.user_name+"</p>"
            }else{
                html_string +=   "<p>"+val.user_email+"</p>"
            }

            html_string += '<a href="javascript:void(0)" class="remove_user_chat_group" onclick="remove_user_chat_group(\''+conversation_id+'\',\''+user_email+'\',\''+val.user_email+'\',\''+row_id+'\',\''+screen_id+'\')">X</a>'

            html_string += "</div>"

        });
        html_string += "</div>"

        html_string += "<div class='add_user_group_chat_footer' style='margin-top: 10px'>";
        html_string += '<a href="javascript:void(0)" onclick="close_add_user_group_chat(\''+screen_id+'\')" class="close_add_user_group_chat">キャンセル</a>'
        html_string += '<a href="javascript:void(0)" onclick="show_add_chat_member_2(\''+screen_id+'\',\''+conversation_id+'\')" class="do_add_user_group_chat">ユーザーを追加</a>'
        html_string += "</div>";

        html_string += "</div>";

        $("#"+screen_id).append(html_string);

    }





}

function show_add_chat_member_2(screen_id,conversation_id) {
    $("#add-user-group-"+screen_id).remove();


    var receiver_email_array = $("#"+screen_id).find(".receiver_email").val().split(",");
    var add_user_group_chat_list = []
    user_friend_info.forEach(function (val,i) {
        if (val.user_email != user_email && receiver_email_array.indexOf(val.user_email) == -1){
            add_user_group_chat_list.push(val)

        }
    });

    var html_string = "";
    html_string += "<div class='add_user_group_chat_screen' id='add-user-group-"+screen_id+"'>";
    html_string +=   "<div class='add_user_group_chat_body' style='height: 215px'>";
    html_string +=     "<div class='add_user_group_chat_auto'>";
    html_string +=       "<input type='text' class='add_user_group_chat_auto_input'>";
    html_string +=     "</div>"
    add_user_group_chat_list.forEach(function (val,i) {
        var row_id = generateRandomString();
        html_string += "<div class='add_user_group_chat_row' id='add-user-group-row-"+row_id+"'>";
        html_string +=   '<input type="checkbox" data-is-checked="" class="add_user_group_chat_select" onclick="select_add_user_group(\''+row_id+'\',\''+val.user_email+'\',\''+val.user_name+'\')">';
        html_string +=   "<a href='javascript:void(0)'><img src='"+val.image_url+"'></a>";
        if(val.user_name){
            html_string +=   "<p>"+val.user_name+"</p>"
        }else{
            html_string +=   "<p>"+val.user_email+"</p>"
        }

        html_string += "</div>"

    });
    html_string += "</div>";

    html_string += "<p class='add_user_group_chat_des'>追加したユーザーは、このハングアウトの過去のメッセージをすべて見ることができます</p>";
    html_string += "<div class='add_user_group_chat_footer'>";
    html_string += '<a href="javascript:void(0)" onclick="close_add_user_group_chat(\''+screen_id+'\')" class="close_add_user_group_chat">キャンセル</a>'
    html_string += '<a href="javascript:void(0)" onclick="do_add_user_group_chat(\''+screen_id+'\',\''+user_email+'\',\''+receiver_email_array.toString()+'\',\''+conversation_id+'\')" class="do_add_user_group_chat">グループを作成</a>'
    html_string += "</div>";


    html_string += "</div>";

    $("#"+screen_id).append(html_string);



}

function close_add_user_group_chat(screen_id) {
    $("#add-user-group-"+screen_id).remove();

    var current_receiver_email_array = $("#"+screen_id).find(".receiver_email").val().split(",");
    if(current_receiver_email_array.length == 1){
        $("#"+screen_id).find(".add_user_chat_screen").empty();
        $("#"+screen_id).find(".add_user_chat_screen").append("<img src='image/add-people-normal.png'>");
        $("#"+screen_id).find(".chat_screen_header_text img").attr("src","image/conversation-icon-active.png")


    }else{
        $("#"+screen_id).find(".add_user_chat_screen").empty();
        $("#"+screen_id).find(".add_user_chat_screen").append("<img src='image/member-boxchat-normal.png'>");

        $("#"+screen_id).find(".add_user_chat_screen").append('<span class="chat_group_number">'+current_receiver_email_array.length+'</span>')

        $("#"+screen_id).find(".chat_screen_header_text img").attr("src","image/contact-icon.png")
    }

}

function select_add_user_group(row_id, user_email, user_name) {

    var current_checkbox = $("#add-user-group-row-"+row_id).find("input:checkbox");
    if(current_checkbox.attr("data-is-checked")){
        current_checkbox.attr("data-is-checked","")
        $("#add-user-group-row-"+row_id).css({"background": "white"})
        current_checkbox.parent().parent().find(".add_user_group_chat_auto #select-add-user-"+row_id).remove();


    }else{
        current_checkbox.attr("data-is-checked","checked")
        $("#add-user-group-row-"+row_id).css({"background": "#e1e6ef"})
        var html_string = "";
        html_string += "<div class='select_add_user_group_detail' id='select-add-user-"+row_id+"'>";
        if(user_name){
            html_string += "<p data-user-email='"+user_email+"'>"+user_name+"</p>"
        }else{
            html_string += "<p data-user-email='"+user_email+"'>"+user_email+"</p>"

        }
        html_string += '<a href="javascript:void(0)" onclick="remove_select_add_user(\'select-add-user-'+row_id+'\',\'add-user-group-row-'+row_id+'\')">x</a>'

        html_string += "</div>";

        current_checkbox.parent().parent().find(".add_user_group_chat_auto_input").before(html_string)
    }


}

function remove_select_add_user(select_add_user_id, add_user_group_row_id) {
    var current_checkbox =  $("#"+add_user_group_row_id).find("input:checkbox");
    current_checkbox.attr("data-is-checked","");


    $("#"+select_add_user_id).remove();
    $("#"+add_user_group_row_id).css({"background":"white"});
    $("#"+add_user_group_row_id).find(".add_user_group_chat_select").prop("checked",false);
    
}

function do_add_user_group_chat(screen_id, sender_email, receiver_email, conversation_id) {

    var current_receiver_email_array = $("#"+screen_id).find(".receiver_email").val().split(",");
    $(".select_add_user_group_detail p").each(function(i){
        current_receiver_email_array.push($(this).attr("data-user-email"));
    });

    $.post("/update-conversation-member",
        {
            do_update_user_email: sender_email,
            new_receiver_email: current_receiver_email_array.toString(),
            conversation_id: conversation_id
        },
        function (result) {
            if(result.status == "success"){
                //Update receiver email list
                $("#"+screen_id).find(".receiver_email").val(current_receiver_email_array.toString());
                //Update receiver member number
                $("#"+screen_id).find(".add_user_chat_screen").empty();
                $("#"+screen_id).find(".add_user_chat_screen").append("<img src='image/member-boxchat-normal.png'>");

                $("#"+screen_id).find(".add_user_chat_screen").append('<span class="chat_group_number">'+current_receiver_email_array.length+'</span>');

                $("#"+screen_id).find(".chat_screen_header_text img").attr("src","image/contact-icon.png")

                $("#add-user-group-"+screen_id).remove();

            }

        }
    );


}


function remove_user_chat_group(conversation_id,did_removed_user_email, is_removed_user_email,row_id, screen_id) {
    //Remove confirmation
    var remove_confirm = confirm("会話からユーザーを削除します。よろしいでしょうか？")
    if (!remove_confirm) {
        return false;
    }
    var current_receiver_email_array = $("#" + screen_id).find(".receiver_email").val().split(",");
    //Remove email from receiver list
    current_receiver_email_array.splice(current_receiver_email_array.indexOf(is_removed_user_email), 1);

    $.post("/update-conversation-member",
        {
            do_update_user_email: did_removed_user_email,
            new_receiver_email: current_receiver_email_array.toString(),
            conversation_id: conversation_id
        },
        function (result) {
            if(result.status == "success"){
                $("#" + screen_id).find(".receiver_email").val(current_receiver_email_array.toString());
                $("#" + row_id).remove();
            }
        })
}

function deleteConversation(conversation_id) {

    var delete_confirmation = confirm("チャットを削除します。よろしいでしょうか？")
    if(!delete_confirmation){
        return false;
    }


    $.post("/delete-conversation",
        {
            did_delete_user_email: user_email,
            conversation_id: conversation_id
        },
        function (result) {
            if(result.status == "success"){
                $("#"+conversation_id).parent().remove();

            }
        })
}

function UploadChatImage(upload_div_id,image_conversation_id,receiver,conversation_title) {
    $('.upload_chat_image').ajaxForm({
        success: function(data, statusText, xhr) {
            if(data.status == "uploaded success"){
                $(".chat_screen_body").unmask();
                $(".chat_screen_body").each(function (i) {
                    if($(this).attr("data-conversation-id") == image_conversation_id){
                        var message_id = generateMessageId();
                        var message_string = "";
                        message_string += "<div class='receiver_chat_message_wrapper' id='"+message_id+"'>"
                        message_string += "<div class='receiver_chat_message'>"
                        message_string += "<div class='receiver_chat_message_arrow'><img src='image/marker-chat-white.png'></div>"
                        message_string += "<p class='chat_message_content'>"
                        message_string += "<a href='/render-image?image_url="+data.chat_image_url+"' target='_blank'>"
                        message_string += "<img src='"+data.chat_image_url+"' class='chat_image_content'>"
                        message_string += "</a>"
                        message_string += '<a href="javascript:void(0)" class="close_chat_image" onclick="close_chat_image(\''+message_id+'\',\''+data.chat_image_file_name+'\')">X</a>'
                        message_string += '<a href="javascript:void(0)" class="send_chat_image" onclick="send_chat_image(\''+image_conversation_id+'\',\''+data.chat_image_url+'\',\''+receiver+'\',\''+message_id+'\',\''+conversation_title+'\')">送信</a>'
                        message_string += "</p>"
                        message_string += "</div>"
                        message_string += "</div>"

                        $(this).append(message_string);

                    }
                });


            }

        }
    });


    $(".chat_screen_body").mask('アップロード中。。。');
    $("#"+upload_div_id).submit();

}

function close_chat_image(message_id,chat_image_file_name) {
    //Delete uploaded image from DB
    $.post("/delete-uploaded-chat-image",
        {
            chat_image_file_name: chat_image_file_name,
        },
        function (data) {
            if(data.status == "success"){
                $("#"+message_id).remove();
            }


        }
    );
}



function send_chat_image(conversation_id,message_image,receiver,message_id,conversation_title) {
    //Start GAE socket definition
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp +':65080';
    var socket = io(webSocketUri);

    //remove current image first
    $("#"+message_id).remove();

    //post send-a-message AJAX
    $.post("/send-a-message",
        {
            sender_email: user_email,
            sender_name: user_name,
            sender_image_url: user_image_url,
            receiver: receiver,
            conversation_id : conversation_id,
            conversation_title: conversation_title,
            message_text : message_image,
            message_id : message_id,
            user_conversation_list : user_conversation_list.toString()
        },
        function (data) {
            //Emit a new message
            socket.emit("send a message",{
                sender: user_email,
                sender_user_name: user_name,
                sender_user_image_url: user_image_url,
                receiver : receiver,
                conversation_id : conversation_id,
                conversation_title: conversation_title,
                message_id: message_id,
                message_text: message_image
            });

        }
    );

}

function checkImageMessage(message_text){
    var is_image_message = false;
    if (message_text.indexOf("http://storage.googleapis.com/") == 0){
        is_image_message = true;
    }

    return is_image_message;
}









