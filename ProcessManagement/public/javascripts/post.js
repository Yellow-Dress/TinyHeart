$("#sendBtn").click(function(){
            
    var data = {
        title: $("#title").val(),
        content: UE.getEditor('editor').getContent()
    };             
    $.ajax({
         type: "post",
         url: "/postProcess",
         data: data,
         dataType: "json",
         success: function(data){
             if(data.type==1){
                 alert("发布成功");
                 window.location.href = "/home";
             }else{
                 alert("发布失败");
                 window.location.href = "/home";
             }
             
         }
     });
});
