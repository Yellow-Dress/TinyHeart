function editProcess(){
    var title = $("#title").val();
    var content = $("#inputContent").val();
    //输入校验
    var judge = 1;
    if(title.length<=0||content.length<=0){
        judge = 0;
    }
    var data = {
        title: title,
        content: content
    };  
    if(judge){         
        $.ajax({
             type: "post",
             url: "/editProcess",
             data: data,
             dataType: "json",
             success: function(data){
                 // if(data.type==1){
                 //     alert("修改成功");
                 //     window.location.href = "/home";
                 // }else{
                 //     alert("修改失败");
                 //     window.location.href = "/home";
                 // }
                 window.location.href = "/home";
             }
         });
    }

}


function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}