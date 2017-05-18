// $(document).ready(function(){

// 	// var value = $('#inputContent').val();
// 	// console.log(value);
// 	setContent();
// });

var ue = UE.getEditor('editor');

ue.addListener("ready", function () { 
	//var value = $('#inputContent').val();
	//console.log(value);
	$.ajax({
         type: "get",
         url: "/getProcess",
         success: function(data){
             if(data.type==1){
                 alert("发布成功");
                 window.location.href = "/home";
             }else{
                 alert("发布失败");
                 window.location.href = "/home";
             }
             
         }
     })
	ue.setContent(); 
});


function setContent(isAppendTo) {
    var arr = [];
    arr.push("使用editor.setContent('欢迎使用ueditor')方法可以设置编辑器的内容");
    UE.getEditor('editor').setContent('欢迎使用ueditor', isAppendTo);
    alert(arr.join("\n"));
}
