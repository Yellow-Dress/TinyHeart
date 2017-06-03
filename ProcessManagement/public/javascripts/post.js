var ue = UE.getEditor('editor');
$("#sendBtn").click(function(){
    var type = 1;
    var title = $("#title").val();
    var content = UE.getEditor('editor').getContent();
    //输入校验
    var judge = 1;
    if(title.length<=0||content.length<=0){
        judge = 0;
    }
    //判断是否选中，未选中为1 选中为0
    if($('#type').is(':checked')){
        type = 0;
    }     
    var data = {
        'title': title,
        'content': content,
        'type': type
    };  
    if(judge){
       $.ajax({
            type: "post",
            url: "/postProcess",
            data: data,
            dataType: "json",
            success: function(data){
                window.location.href = "/home";
            }
        }); 
    }
    
});
