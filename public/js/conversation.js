$(function() {

    var socket = io();
    socket.emit("hearing",{
        user_email: user_email
    });

    //TODO When loading main chat page, emit to check conversation list and unread message etc.



    $("#send_message").on("click",function () {
        var message_text = $(".message_text").val();
        //TODO send the message to only conversation's member
        socket.emit("send message",{
            user_email: user_email,
            message_text : message_text,
            conversation_id : conversation_id
        })

    })

    //TODO Only send message to users who are in conversation
    socket.on("new message",function (data) {
        if (data.conversation_id != conversation_id){
            return false
        }

        console.log("new message from "+data.user_email+". Content is: '" + data.message_text +"'.");
        $(".message_text").val("");

        var chat_line_html = "";
        chat_line_html += "<div class='chat_line'>";
        chat_line_html += "<a href='javascript:void(0)' class='chat_line_user'>"+data.user_email+"</a>";
        chat_line_html += "<p class='chat_line_message'>"+data.message_text+"</p>";
        chat_line_html += "</div>";

        $(".chat_wrapper").append(chat_line_html);


    });


});






//Create new chat
function createNewChat(){
    $("#create_new_chat").modal("show");

}



