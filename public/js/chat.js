$(function() {

    var socket = io();
    socket.emit("hearing",{
        user_name: "huutri1983"
    });
    socket.on("joined", function(data){
       var message_string = "参加者数は"+data.numUsers+"名。詳細は";
        socket.user_name = data.user_name;
        $.each(data.user_list,function(i,val){
            message_string += val +", ";

        });

        $(".chat_info_message").text(message_string);

    })

    $("#send_message").on("click",function () {
        var message_text = $(".message_text").val();

        socket.emit("send message",{
            user_name: user_name,
            message_text : message_text
        })

    })

    socket.on("new message",function (data) {
        console.log("new message from "+data.user_name+". Content is: '" + data.message_text +"'.");
        $(".message_text").val("");

        var chat_line_html = "";
        chat_line_html += "<div class='chat_line'>";
        chat_line_html += "<a href='javascript:void(0)' class='chat_line_user'>"+data.user_name+"</a>";
        chat_line_html += "<p class='chat_line_message'>"+data.message_text+"</p>";
        chat_line_html += "</div>";

        $(".chat_wrapper").append(chat_line_html);


    })




});






//Create new chat
function createNewChat(){
    $("#create_new_chat").modal("show");

}


