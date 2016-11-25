/**
 * Created by ME293 on 11/2/16.
 */
$(function () {
    //Start GAE socket definition
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp +':65080';
    var socket = io(webSocketUri);

    //End GAE socket definition

    $("#add_user_icon").on("click",function () {
        //Get add user list
        $.post("/get-add-user-list",
            {
                user_friend_list:user_friend_list.toString(),
                user_mail: user_email

            },
            function (result) {
                $(".page_main_wrapper").removeClass("active_tab");
                $("#add_user_icon").addClass("active_tab");
                $("#add_user_icon").find("img").attr("src","image/addfriend-icon-active.png")
                $("#con_list_icon img").attr("src","image/conversation-icon-normal.png");
                $("#user_list_icon img").attr("src","image/contact-icon.png");
                $("#favorite_icon img").attr("src","image/favorite-normal.png");

                $(".page_main_wrapper").hide();

                $(".add_user_wrapper").empty();

                var html_string = "";

                result.add_user_list.forEach(function (val,i) {
                    var is_in_requesting_list = false;
                    //Check whether user in is requesting_list
                    do_requesting_user_list.forEach(function (value,index){
                        if(val.add_user_email == value){
                            is_in_requesting_list = true;
                        }

                    });


                    html_string += "<div class='add_user_row' id='add-user-"+escapeEmailString(val.add_user_email)+"'>";
                    html_string +=   "<div class='add_user_row_left'>";
                    html_string +=     "<a href='javascript:void(0)' class='add_user_row_image'>"
                    html_string +=       "<img src='"+val.add_user_image_url+"'>";
                    html_string +=     "</a>";
                    html_string +=     "<div class='add_user_info_container'>";
                    html_string +=       "<p class='add_user_name'>"+val.add_user_name+"</p>";
                    html_string +=       "<p class='add_user_company'>"+val.add_user_company+"</p>";
                    html_string +=     "</div>";
                    html_string +=   "</div>";
                    html_string +=   "<div class='add_user_row_right'>";
                    if(is_in_requesting_list){
                        html_string += "<p class='add_user_requesting'>友達追加を申請中</p>"

                    }else{
                        html_string +=     '<a href="javascript:void(0)" class="add_user_button" onclick="add_user_to_list(\''+val.add_user_email+'\',\''+val.add_user_name+'\',\''+val.add_user_company+'\',\''+val.add_user_image_url+'\')">';
                        html_string +=       "<img src='image/add-people-normal.png'>";
                        html_string +=     "</a>"
                    }

                    html_string +=   "</div>";

                    html_string += "</div>";

                });

                $("#add_user_main_page .add_user_wrapper").append(html_string);

                $("#add_user_main_page").show();
            }
        );
    });

    socket.on("new add friend request notify",function (data) {
        if(user_email == data.is_requested_user_email){
            var new_requested_user_info = {
                request_user_email: data.did_request_user_email,
                request_user_image_url: data.did_request_user_user_image_url,
                request_user_name: data.did_request_user_user_name
            };

            //Update is_requested_user_info
            is_requested_user_info.splice(0,0,new_requested_user_info);

            //Update current_requesting_number
            var current_requesting_number = 0;
            var current_requesting_string = $("#add_user_requesting_number p").text();
            if(current_requesting_string){
                current_requesting_number = parseInt(current_requesting_string);
            }
            var new_requesting_number = current_requesting_number + 1;
            $("#add_user_requesting_number p").text(new_requesting_number.toString());
            $("#add_user_requesting_number").css({"display": "initial"});


        }

    });


});

function add_user_to_list(user_email, user_name, user_company, user_image_url) {
    $("#add_user_dialog").empty();

    var html_string = "";
    html_string += "<div class='add_user_dialog_header'>";
    html_string +=   "<p class='add_user_dialog_title'>友達追加申請</p>";
    html_string +=   "<div class='add_user_dialog_header_info'>";
    html_string +=     "<a href='javascript:void(0)'>"
    html_string +=       "<img src='"+user_image_url+"'>";
    html_string +=     "</a>";
    html_string +=     "<div class='add_user_dialog_header_info_wrapper'>";
    html_string +=       "<p class='add_user_name'>"+user_name+"</p>";
    html_string +=       "<p class='add_user_company'>"+user_company+"</p>";
    html_string +=     "</div>";
    html_string +=   "</div>";
    html_string += "</div>";

    html_string += "<div class='add_user_dialog_body'>";
    html_string +=   "<p class='add_user_dialog_body_des'>友達にメッセージを送信しましょう！</p>";
    html_string +=   "<textarea placeholder='招待のメッセージ'></textarea>";
    html_string +=   "<div class='add_user_button_row_wrapper'>";
    html_string +=     "<div class='add_user_button_row'>";
    html_string +=       "<a href='javascript:void(0)' class='cancel_add_user_button' onclick='close_add_user_dialog()'>キャンセル</a>";
    html_string +=       '<a href="javascript:void(0)" class="do_add_user_button" onclick="do_add_user_dialog(\''+user_email+'\')">送信</a>';
    html_string +=     "</div>";
    html_string +=   "</div>";
    html_string += "</div>";

    $("#add_user_dialog").append(html_string);
    $("#add_user_dialog").show();
}

function close_add_user_dialog() {
    $("#add_user_dialog").empty();
    $("#add_user_dialog").hide();

}

function do_add_user_dialog(friend_email) {
    //Start GAE socket definition
    var webSocketHost = location.protocol === 'https:' ? 'wss://' : 'ws://';
    var webSocketUri = webSocketHost + externalIp +':65080';
    var socket = io(webSocketUri);

    //End GAE socket definition

    $.post("/add-friend-request",
        {
            did_request_user_email: user_email,
            is_requested_user_email: friend_email
        },
        function (data) {
            if(data.status == "success"){
                //Emit new add_friend_request
                socket.emit("new add friend request",{
                    did_request_user_email: user_email,
                    did_request_user_user_name: user_name,
                    did_request_user_user_image_url: user_image_url,
                    is_requested_user_email: friend_email

                });

                $("#add_user_dialog").hide();

                var current_add_user = $("#add-user-"+escapeEmailString(friend_email)).find(".add_user_row_right");
                current_add_user.empty().append("<p class='add_user_requesting'>友達追加を申請中</p>");
            }
        }
    );

}

function show_add_user_request() {

    if($(".is_requested_user_wrapper").is(":visible")){
        $(".is_requested_user_wrapper").hide()
    }else {

        //prepare is_requested_user_info
        var html_string = "";
        is_requested_user_info.forEach(function (val,i) {
            html_string += "<div class='is_requested_user_row' id='request-"+escapeEmailString(val.request_user_email)+"'>";
            html_string += "<div class='is_requested_user_row_left'>";
            html_string += "<img src='"+val.request_user_image_url+"'>";
            html_string += "<p>"+val.request_user_name+"</p>";
            html_string += "</div>";
            html_string += "<div class='is_requested_user_row_right'>";
            html_string += '<a href="javascript:void(0)" class="deny_request_button" onclick="deny_add_user_request(\''+val.request_user_email+'\',\''+user_email+'\')">却下する</a>';
            html_string += '<a href="javascript:void(0)" class="approve_request_button" onclick="approve_add_user_request(\''+val.request_user_email+'\',\''+user_email+'\',\''+val.request_user_name+'\',\''+val.request_user_image_url+'\')">承認する</a>';
            html_string += "</div>";


            html_string += "</div>";


        });

        $(".is_requested_user_body").empty().append(html_string);

        $(".is_requested_user_wrapper").show();

    }



}