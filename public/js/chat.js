$(function() {

    var socket = io();
    socket.emit("hearing",{
        user_email: user_email
    });

    //TODO When loading main chat page, emit to check conversation list and unread message etc.

    //After login, check available conversation

    socket.emit("check available conversation",{
        user_email: user_email
    });

    socket.on("available conversation detected",function (data) {
        var chat_info_message = "";
        data.conversation_list.forEach(function (val,i) {
            chat_info_message += "Conversation_id : "+ val.id +", member_list : " + val.member_list + ", organizer_email : " + val.organizer + "\n"
        });
        //TODO do something after detected available conversation
        $(".chat_info_message").text(chat_info_message);

    });


    //Listen response from server that conversation is ready
    socket.on("conversation ready",function (data) {
        var chat_info_message = "Conversation_id : "+ data.conversation_id +", member_list : " + data.member_list + ", organizer_email : " + data.organizer_email
        //TODO do something when server response that conversation is ready
        $(".chat_info_message").text(chat_info_message);


    });

    $("#send_message").on("click",function () {
        var message_text = $(".message_text").val();
        //TODO send the message to only conversation's member
        socket.emit("send message",{
            user_email: user_email,
            message_text : message_text
        })

    })

    //TODO Only send message to users who are in conversation
    socket.on("new message",function (data) {
        console.log("new message from "+data.user_email+". Content is: '" + data.message_text +"'.");
        $(".message_text").val("");

        var chat_line_html = "";
        chat_line_html += "<div class='chat_line'>";
        chat_line_html += "<a href='javascript:void(0)' class='chat_line_user'>"+data.user_email+"</a>";
        chat_line_html += "<p class='chat_line_message'>"+data.message_text+"</p>";
        chat_line_html += "</div>";

        $(".chat_wrapper").append(chat_line_html);


    });

    $("#start_new_chat").on("click",function () {
        var user_list_string = $("#chat_user_list").val();
        var organizer_email = $("#chat_organizer").val();

        //call create chat AJAX
        $.post("/create-chat",
            {
                member_list: user_list_string,
                organizer_email: organizer_email

            },
            function (data) {

                if (data.status == "not ok") {
                    alert("エラ発生");
                    return false;

                }else{
                    var conversation_id = data.conversation_id;
                    // Start new conversation
                    socket.emit('start new conversation', {organizer_email: organizer_email, member_list: user_list_string, conversation_id: conversation_id});
                    //TODO do something after create new conversation
                    $("#create_new_chat").modal("hide");
                }

            }
        );

    });



});






//Create new chat
function createNewChat(){
    $("#create_new_chat").modal("show");

}



