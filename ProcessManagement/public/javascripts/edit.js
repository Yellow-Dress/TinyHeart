
var ue = UE.getEditor('editor');

ue.addListener("ready", function () { 
	var value = $('#inputContent').val();
	ue.setContent(value); 
});


function editProcess(){
    var data = {
        title: $("#title").val(),
        content: ue.getContent()
    };             
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


function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}