$(function() {
    var socket = io();

    $("#enter_chat_btn").on("click",function () {
        var user_name = $("#user_name").val();
        // Tell the server your username
        socket.emit('add user', user_name);

        $("#enter_chat_room").submit();

    });





});




