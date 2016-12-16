//Start AngularJS

(function () {

    var app = angular.module('business-chat', ['ngFileUpload']);

    app.factory('socket', ['$rootScope', function($rootScope) {
        var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
        var webSocketUri = webSocketHost + externalIp +':65080';
        var socket = io(webSocketUri);

        return {
            on: function(eventName, callback){
                socket.on(eventName, callback);
            },
            emit: function(eventName, data) {
                socket.emit(eventName, data);
            }
        };
    }]);

    app.controller('ChatController', function($scope, $http, socket, $timeout,Upload) {
        //Angular onload
        socket.emit("check user", {
            email: user_email
        });

        // socket.on("check ok",function (data) {
        //     console.log("message", data.message)
        //
        // })


        //Conversation_list
        $scope.conversation = user_conversation_info;
        $scope.conversation_length = user_conversation_info.length;
        $scope.user_email = user_email;
        $scope.show_conversation_option = function (conversation_id) {
            if($("#"+conversation_id).parent().find(".conversation_option").is(":visible")){
                $("#"+conversation_id).parent().find(".conversation_option").hide();
            }else{
                $(".conversation_option").hide();
                $("#"+conversation_id).parent().find(".conversation_option").show();
            }

        }


        //user_friend list
        $scope.user_friend = user_friend_info
        $scope.user_friend_length = user_friend_info.length;

        $scope.templates = []
        $scope.continue_conversation = function (conversation_id) {
            //If chat_screen of this conversation is existing, do nothing
            var chat_screen = $("#screen-"+conversation_id);
            if(chat_screen.length > 0){
                return false;
            }

            //If not, continue conversation
            $http({
                url: '/continue-conversation',
                method: "POST",
                data: { conversation_id : conversation_id }
            }).then(function(response) {
                // success
                var member = response.data.member
                var receiver_number = member.length - 1;
                member.splice(member.indexOf(user_email),1);
                var receiver_array = member;
                var thread_image = ""
                if (receiver_number == 1) {
                    thread_image = "image/conversation-icon-active.png";
                }else{
                    thread_image = "image/contact-icon.png"
                }

                //Get receiver info
                var receiver_info = []
                user_friend_info.forEach(function (val,i) {
                    if (receiver_array.indexOf(val.user_email) != -1){
                        receiver_info.push(val)

                    }
                });
                //End get receiver info

                var conversation_info = {
                    conversation_title: response.data.conversation_title,
                    screen_id: "screen-"+response.data.conversation_id,
                    conversation_id : response.data.conversation_id,
                    group_member_number: receiver_number,
                    user_email: user_email,
                    receiver: receiver_array.toString(),
                    receiver_info: receiver_info,
                    thread_image: thread_image,
                    message_array: response.data.message_list,
                    message_array_length: response.data.message_list.length
                };
                $scope.templates.push(conversation_info);

                $timeout(function() {
                    $("#screen-"+response.data.conversation_id).find(".chat_screen_body").scrollTop($("#screen-"+response.data.conversation_id).find(".chat_screen_body")[0].scrollHeight);
                },20);

            }, function(response) { // optional
                // failed
            });




        }

        //Minimize chat_screen
        $scope.minimize_chat_screen = function (screen_id){
            var screen = $("#"+screen_id);
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

        //Close chat_screen
        $scope.close_chat_screen = function (screen_id) {
            var new_templates = []
            $scope.templates.forEach(function (val,i) {
                if(val.screen_id != screen_id){
                    new_templates.push(val)

                }
            })

            $scope.templates = new_templates

        }

        //Start new conversation with specified user
        $scope.start_user_conversation = function (chat_user_email) {

            var conversation_id = generateConversationId()
            var thread_image = "image/conversation-icon-active.png"

            //Get receiver info
            var receiver_info = []
            user_friend_info.forEach(function (val,i) {
                if (chat_user_email == val.user_email){
                    receiver_info.push(val)
                }
            });
            //End get receiver info

            var new_conversation_info = {
                conversation_title: chat_user_email,
                screen_id: "screen-"+conversation_id,
                conversation_id : conversation_id,
                group_member_number: 1,
                user_email: user_email,
                receiver: chat_user_email,
                receiver_info: receiver_info,
                thread_image: thread_image,
                message_array: [],
                message_array_length: 0
            }

            $scope.templates.push(new_conversation_info);

        }

        //Start group chat
        $scope.startNewChat = function () {

            var chat_title = $(".new_chat_title").val();
            if(!$.trim(chat_title)){
                chat_title = "チャットタイトル無し"
            }
            var chat_member = []
            $(".new_chat_user_detail").each(function (i) {
                chat_member.push($(this).attr("title"))
            });


            if(chat_member.length == 0){
                alert("参加者を入力してください！")
                return false;
            }

            var new_conversation_id = generateConversationId();

            hideNewChatScreen()
            var thread_image = ""
            if (chat_member.length == 1) {
                thread_image = "image/conversation-icon-active.png";
            }else{
                thread_image = "image/contact-icon.png"
            }

            //Get receiver info
            var receiver_info = []
            user_friend_info.forEach(function (val,i) {
                if (chat_member.indexOf(val.user_email) != -1){
                    receiver_info.push(val)
                }
            });
            //End get receiver info

            var conversation_info = {
                conversation_title: chat_title,
                screen_id: "screen-"+new_conversation_id,
                conversation_id : new_conversation_id,
                group_member_number: chat_member.length,
                user_email: user_email,
                receiver: chat_member.toString(),
                receiver_info: receiver_info,
                thread_image: thread_image,
                message_array: [],
                message_array_length: 0
            };

            $scope.templates.push(conversation_info);

        }

        var timer = null
        $scope.send_message = function (receiver, sender, conversation_id, conversation_title, $event) {
            var message_text_area =  $("#screen-" + conversation_id).find(".message_text");
            var message_text = message_text_area.val()


            socket.emit("typing", {
                sender: sender,
                receiver : receiver,
                conversation_id : conversation_id
            });
            if ($event.keyCode == 13) {

                //Prevent white space only content
                if(!$.trim(message_text)){
                    return false;
                }


                if($event.shiftKey){
                    return false;
                }

                var message_id = generateMessageId();
                clearTimeout(timer);

                message_text_area.val("")

                //DO send a message
                $http({
                    url: '/send-a-message',
                    method: "POST",
                    data:
                        {
                            sender_email: user_email,
                            sender_name: user_name,
                            sender_image_url: user_image_url,
                            receiver: receiver,
                            conversation_id : conversation_id,
                            conversation_title: conversation_title,
                            message_text : message_text,
                            message_id : message_id,
                            is_text_message: 'yes',
                            user_conversation_list : user_conversation_list.toString()
                        }
                }).then(function(data) {
                    //Emit a new message
                    socket.emit("send a message",{
                        sender: user_email,
                        sender_user_name: user_name,
                        sender_user_image_url: user_image_url,
                        receiver : receiver,
                        conversation_id : conversation_id,
                        conversation_title: conversation_title,
                        message_id: message_id,
                        message_text: $.trim(message_text).replace(/\n\r?/g, '<br />'),
                        is_text_message: "yes"
                    });

                }, function(data) { // optional
                    // failed
                });

                socket.emit("stop typing",{
                    sender: sender,
                    receiver : receiver,
                    conversation_id : conversation_id
                });


            }else{
                timer = setTimeout(function () {
                    socket.emit("stop typing",{
                        sender: sender,
                        receiver : receiver,
                        conversation_id : conversation_id
                    });

                },2000);
            }

        };



        //Listen new message
        socket.on('notify a new message', function(data) {
            var receiver_array = data.receiver.split(",");
            if(user_email == data.sender  || receiver_array.indexOf(user_email) != -1){

                //Update current conversation_list
                if(user_conversation_list.indexOf(data.conversation_id) == -1){
                    user_conversation_list.push(data.conversation_id)
                }

                //Check whether the chat_box of conversation is opened or not
                var existing_chat_box = checkJsonElementInArray($scope.templates,"conversation_id",data.conversation_id);

                //Then, in case of opening chat_box just update new message
                if(existing_chat_box){
                    var new_templates = []
                    $scope.templates.forEach(function (val,i) {
                        //In case of conversation chat_box opened already. Just update new message
                        if(data.conversation_id == val.conversation_id){
                            var new_message_info = {
                                content : data.message_text,
                                sender_user_image_url: data.sender_user_image_url,
                                sender: data.sender,
                                message_id : data.message_id,
                                is_text_message: data.is_text_message
                            }

                            val.message_array.push(new_message_info)
                            val.message_array_length = val.message_array_length + 1
                            new_templates.push(val)

                        }else{
                            new_templates.push(val)
                        }
                    });

                    //Update scope
                    $scope.$apply(function () {
                        $scope.templates = new_templates;
                    });

                    $timeout(function() {
                        $("#screen-"+data.conversation_id).find(".chat_screen_body").scrollTop($("#screen-"+data.conversation_id).find(".chat_screen_body")[0].scrollHeight);
                    },20);

                }
                //If not, open the chat_box with chat history and update conversation list
                else{

                    //Create new chat_box
                    $http({
                        url: '/continue-conversation',
                        method: "POST",
                        data: { 'conversation_id' : data.conversation_id }
                    }).then(function(response) {
                        // success
                        var member = response.data.member
                        var receiver_number = member.length - 1;
                        member.splice(member.indexOf(user_email),1);
                        var receiver_array = member;
                        var thread_image = ""
                        if (receiver_number == 1) {
                            thread_image = "image/conversation-icon-active.png";
                        }else{
                            thread_image = "image/contact-icon.png"
                        }

                        //Get receiver info
                        var receiver_info = []
                        user_friend_info.forEach(function (val,i) {
                            if (receiver_array.indexOf(val.user_email) != -1){
                                receiver_info.push(val)
                            }
                        });
                        //End get receiver info

                        var conversation_info = {
                            conversation_title: response.data.conversation_title,
                            screen_id: "screen-"+response.data.conversation_id,
                            conversation_id : response.data.conversation_id,
                            group_member_number: receiver_number,
                            user_email: user_email,
                            receiver: receiver_array.toString(),
                            receiver_info: receiver_info,
                            thread_image: thread_image,
                            message_array: response.data.message_list,
                            message_array_length: response.data.message_list.length
                        };

                        $scope.templates.push(conversation_info);

                        $timeout(function() {
                            $("#screen-"+response.data.conversation_id).find(".chat_screen_body").scrollTop($("#screen-"+response.data.conversation_id).find(".chat_screen_body")[0].scrollHeight);
                        },20);


                    }, function(response) { // optional
                    });
                }

                //Update conversation list

                var existing_thread = checkJsonElementInArray($scope.conversation,"conversation_id", data.conversation_id)

                var new_conversation = []
                if(existing_thread){
                    //Update latest message test
                    $scope.conversation.forEach(function (val,i) {
                        //In case of conversation chat_box opened already. Just update new message
                        if(data.conversation_id == val.conversation_id){

                            val.last_message = data.message_text;
                            val.is_text_message = data.is_text_message;
                            val.sender_user_name = data.sender_user_name;
                            new_conversation.push(val)
                        }else{
                            new_conversation.push(val)
                        }
                    });

                    $scope.$apply(function () {
                        $scope.conversation = new_conversation;
                    });
                }else{
                    //Create new thread in conversation list
                    var new_thread = {
                        conversation_id : data.conversation_id,
                        conversation_image_url : "image/avt-default-1.png",
                        conversation_title: data.conversation_title,
                        is_read_by_user_email: data.is_read_by_user_email,
                        is_read: false,
                        last_message: data.message_text,
                        last_message_id: data.message_id,
                        is_text_message: data.is_text_message,
                        sender_image_url: data.sender_user_image_url,
                        sender_user_id: data.sender,
                        sender_user_name: data.sender_user_name

                    }

                    //Update scope
                    if($scope.conversation_length == 0){
                        $scope.conversation_length = $scope.conversation_length + 1;
                    }

                    $scope.$apply(function () {
                        $scope.conversation.unshift(new_thread);
                    });

                }

            }
        });

        //Mark as read message
        $scope.mark_as_read = function (selected_conversation_id) {
            //Get lastest message of conversation
            var latest_message_id = "";
            $scope.conversation.forEach(function (val,i) {
                if(val.conversation_id == selected_conversation_id){
                    latest_message_id = val.last_message_id
                    //Mark selected conversation as is read
                    val.is_read = true;
                }
            });

            $http({
                url: '/mark-as-read',
                method: "POST",
                data:
                    {
                        is_read_user_email : user_email,
                        message_id: latest_message_id

                    }
            }).then(function(response) {
                //Mark selected conversation as is read


            }, function(response) { // optional
                // failed
            });


        }

        //Upload chat image
        $scope.UploadImageChat = function (file, conversation_id, drop_paste) {
            var selected_file = []
            if(drop_paste){
                var new_file_name = generalFileName()
                selected_file = new File(file, new_file_name);


            }else{
                 selected_file = file
            }
            var chat_box = $("#screen-" + conversation_id)
            // var chat_body = chat_box.find(".chat_screen_body");
            var receiver = chat_box.find(".receiver_email").val();
            var conversation_title = chat_box.find(".conversation_title").val();
            var message_id = generateMessageId();
            chat_box.mask('アップロード中。。。');
            Upload.upload({
                url: '/upload-chat-image',
                data: {chat_image: selected_file}
            }).progress(function(e) {
            }).then(function(data, status, headers, config) {
                if(data.status == 200){
                    chat_box.unmask();
                    var upload_image_url = data.data.chat_image_url
                    //Send image message
                    //DO send a message
                    $http({
                        url: '/send-a-message',
                        method: "POST",
                        data:
                            {
                                sender_email: user_email,
                                sender_name: user_name,
                                sender_image_url: user_image_url,
                                receiver: receiver,
                                conversation_id : conversation_id,
                                conversation_title: conversation_title,
                                message_text : upload_image_url,
                                message_id : message_id,
                                user_conversation_list : user_conversation_list.toString(),
                                is_text_message: 'no'
                            }
                    }).then(function(response) {
                        //Emit a new message
                        socket.emit("send a message",{
                            sender: user_email,
                            sender_user_name: user_name,
                            sender_user_image_url: user_image_url,
                            receiver : receiver,
                            conversation_id : conversation_id,
                            conversation_title: conversation_title,
                            message_id: message_id,
                            message_text: upload_image_url,
                            is_text_message: 'no'
                        });

                    }, function(response) { // optional
                        // failed
                    });

                }

            });

        }

        $scope.show_add_chat_member = function (group_member_number, conversation_id) {
            if(group_member_number == 1){
                $(".select_add_user_group_detail").remove();
                $("#add-group-"+conversation_id).show()
                $("#edit-group-"+conversation_id).hide()
            }else{
                $("#edit-group-"+conversation_id).show()
                $("#add-group-"+conversation_id).hide()
            }

        }

        $scope.close_add_group = function (conversation_id) {
            $("#add-group-"+conversation_id).hide()

        }

        $scope.close_edit_group = function (conversation_id) {
            $("#edit-group-"+conversation_id).hide()
        }

        $scope.select_add_user_group = function (conversation_id, user_id, user_email, user_name) {

            var current_checkbox = $("#screen-"+conversation_id).find("#add-group-"+user_id);
            if(current_checkbox.attr("data-is-checked") == "checked"){
                current_checkbox.attr("data-is-checked","");
                current_checkbox.parent().css({"background": "white"});

                current_checkbox.parent().parent().find(".select_add_user_group_detail").each(function () {
                    if($(this).attr("data-user-email") == user_email){
                        $(this).remove()
                    }

                })


            }else{
                current_checkbox.attr("data-is-checked","checked")
                current_checkbox.parent().css({"background": "#e1e6ef"})
                var html_string = "";
                html_string += "<div class='select_add_user_group_detail' data-user-email='"+user_email+"'>";
                if(user_name){
                    html_string += "<p data-user-email='"+user_email+"'>"+user_name+"</p>"
                }else{
                    html_string += "<p data-user-email='"+user_email+"'>"+user_email+"</p>"

                }
                html_string += '<a href="javascript:void(0)" onclick="remove_select_add_user(\''+conversation_id+'\',\''+user_id+'\',\''+user_email+'\')">x</a>'

                html_string += "</div>";

                current_checkbox.parent().parent().find(".add_user_group_chat_auto_input").before(html_string)
            }

        }

        $scope.do_add_user_group_chat = function(conversation_id, sender_email) {

            var current_receiver_email_array = $("#screen-"+conversation_id).find(".receiver_email").val().split(",");
            $("#screen-"+conversation_id).find(".select_add_user_group_detail p").each(function(i){
                current_receiver_email_array.push($(this).attr("data-user-email"));
            });

            //Get receiver info
            var receiver_info = []
            user_friend_info.forEach(function (val,i) {
                if (current_receiver_email_array.indexOf(val.user_email) != -1){
                    receiver_info.push(val)
                }
            });
            //End get receiver info

            //Update member property of conversation
            $http({
                url: '/update-conversation-member',
                method: "POST",
                data: {
                    do_update_user_email: sender_email,
                    new_receiver_email: current_receiver_email_array.toString(),
                    conversation_id: conversation_id
                }
            }).then(function(response) {
                var new_templates = []
                $scope.templates.forEach(function (val,i) {
                    if(val.conversation_id == conversation_id){
                        val.group_member_number = current_receiver_email_array.length;
                        val.receiver = current_receiver_email_array.toString()
                        val.receiver_info = receiver_info
                        new_templates.push(val)
                    }else{
                        new_templates.push(val)
                    }
                })

                //Update scope
                $scope.templates = new_templates;
                $("#add-group-"+conversation_id).hide();


            }, function(response) { // optional
            });

        }

        $scope.remove_user_chat_group = function(conversation_id,did_removed_user_email,is_removed_user_email) {
            //Remove confirmation
            var remove_confirm = confirm("会話からユーザーを削除します。よろしいでしょうか？")
            if (!remove_confirm) {
                return false;
            }
            var current_receiver_email_array = $("#screen-" + conversation_id).find(".receiver_email").val().split(",");
            //Remove email from receiver list
            current_receiver_email_array.splice(current_receiver_email_array.indexOf(is_removed_user_email), 1);

            //Get receiver info
            var receiver_info = []
            user_friend_info.forEach(function (val,i) {
                if (current_receiver_email_array.indexOf(val.user_email) != -1){
                    receiver_info.push(val)
                }
            });
            //End get receiver info


            $http({
                url: '/update-conversation-member',
                method: "POST",
                data: {
                    do_update_user_email: did_removed_user_email,
                    new_receiver_email: current_receiver_email_array.toString(),
                    conversation_id: conversation_id
                }
            }).then(function(response) {
                var new_templates = []
                $scope.templates.forEach(function (val,i) {
                    if(val.conversation_id == conversation_id){
                        val.group_member_number = current_receiver_email_array.length;
                        val.receiver = current_receiver_email_array.toString()
                        val.receiver_info = receiver_info
                        new_templates.push(val)
                    }else{
                        new_templates.push(val)
                    }
                })


            }, function(response) { // optional

            });



        }

    });

})();

//END AngularJS

function checkJsonElementInArray(array,element_name, element_value) {
    var result = false;
    array.forEach(function (val,i) {
        if(val[element_name] == element_value){
            result = true;
        }

    })

    return result;

}

function remove_select_add_user(conversation_id, user_id, user_email) {
    var current_checkbox = $("#screen-"+conversation_id).find("#add-group-"+user_id);
    current_checkbox.parent().css({"background": "white"});
    current_checkbox.attr("data-is-checked","");
    current_checkbox.prop('checked', false);


    current_checkbox.parent().parent().find(".select_add_user_group_detail").each(function () {
        if($(this).attr("data-user-email") == user_email){
            $(this).remove()
        }

    })
}


function mainSpaceLoad() {

    //Check online user
    //Start GAE socket definition
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp +':65080';
    var socket = io(webSocketUri);

    //Set main_chat_body height
    var viewport_height = $(window).height();
    //height of header_1 + header_2
    var other_height = 130 + 50;
    var main_chat_height = viewport_height - other_height;
    var main_chat_icon_height = 40;
    var list_chat_height = main_chat_height - main_chat_icon_height;
    //Set value
    // $(".page_main_left_wrapper").css({'height': main_chat_height});
    // $(".page_main_right_wrapper").css({'height': main_chat_height});
    $(".page_main_wrapper").css({'height': main_chat_height});

    $(".page_main_left_body").css({'height': list_chat_height});
    $(".page_main_left_footer").css({'height': main_chat_icon_height});

    //Make conversation list sortable
    $(".user_conversation_list").sortable({
        start: function (e, ui) {
            // creates a temporary attribute on the element with the old index
            $(this).attr('data-previndex', ui.item.index());

        },
        update: function (e, ui) {
            // gets the new and old index then removes the temporary attribute
            var newIndex = ui.item.index();
            var oldIndex = $(this).attr('data-previndex');
            $(this).removeAttr('data-previndex');

            var index_array = []
            $.each($(".ui-sortable-handle"), function (i, val) {

                var index_json = {
                    "index": i.toString(),
                    "conversation_id": $(this).find(".user_conversation_id").attr("id")
                };

                index_array.push(index_json)

            });

            console.log(index_array)

            //Change the category name
            $.post("/update-conversation-index",
                {
                    index_array: JSON.stringify(index_array),
                    user_email: user_email

                },
                function (data) {
                    console.log(data)

                }
            );
        }
    });
    $(".user_conversation_list").disableSelection();

    //End make conversation list sortable

    //Switch between conversation_list and user_list
    $("#show_conversation_list").on("click",function () {
        $(".page_main_left_footer_icon").removeClass("footer_icon_active");
        $(this).addClass("footer_icon_active");

        $(".user_friend_list").hide();
        $(".user_conversation_list").show();


    });


    $(".user_conversation_li").hover(function(){

        //If unread conversation, do nothing
        if($(this).attr("data-is-read-status") == "no"){
            return false;
        }

        //if not, change the background
        $(this).css({"background":"white"})
    },function () {
        //If unread conversation, do nothing
        if($(this).attr("data-is-read-status") == "no"){
            return false;
        }

        $(this).css({"background":"initial"})
    })


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

    // socket.on("check ok",function (data) {
    //     console.log("message", data.message)
    //
    // })

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

    $(".page_main_left_footer_icon").removeClass("footer_icon_active");
    $("#show_user_list").addClass("footer_icon_active");

    $(".user_conversation_list").hide();
    $(".user_friend_list").show();

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

function generalFileName() {
    var user_id = ""

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        user_id += possible.charAt(Math.floor(Math.random() * possible.length));

    return user_id;

}









