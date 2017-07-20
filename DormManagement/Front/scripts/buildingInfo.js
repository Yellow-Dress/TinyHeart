Zepto(function($){

    var buildingInfo_vm = new Vue({
        el: '#buildingInfo',
        data: {
            buildingInfos: []
        },
        methods: {

        }
    }); 

    $.ajax({
        type: 'POST',
        url: 'http://localhost:4000/checkLogin',
        success: function(data){
            if (data.isSuccess == true) {
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:4000/getErrorMsg',
                    data: { from: 'student' },
                    dataType: 'json',
                    success: function(data){
                        if (data.hasContent == true) {
                            alert(data.errorMsg);
                        }
                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        alert('Ajax error!')
                    }
                });

                $.ajax({  
                    type: 'POST',
                    url: 'http://localhost:4000/getBuildingInfos',
                    dataType: 'json',
                    success: function(data){
                        if (data.isConnect == false) {
                            alert('数据库连接失败！');
                        } else {
                            if (data.isSuccess == false) {
                                alert('查询失败！');
                            } else {
                                buildingInfo_vm._data.buildingInfos = data.buildingInfos.concat();                           
                                // studentInfosBackup = data.studentInfos.concat();                                                          
                                // studentInfo_vm._data.alreadyCount = data.alreadyCount;
                            }
                        }
                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        alert('Ajax error!')
                    }
                });
            } else {
                window.location.href = './index.html';
            }
        },
        error: function(xhr, type){
            console.log(xhr);
            alert('Ajax error!')
        }
    });



    // 返回功能选择
    $('.js-func').on('click', function() {
        window.location.href = './chooseFunc.html';
    });

    // 注销并退出
    $('.js-logout').on('click', function() {
        var logoutCheck = confirm("确认退出吗？");
        if (logoutCheck == true) {
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/logout',
                dataType: 'json',
                success: function(data){
                    if (data.isSuccess == true) {
                        window.location.href = './index.html';
                    } else {
                        alert('注销失败，请重试！');
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });    
        }
    });

    // 冒泡捕获
    $('.js-tbody').on('click', function(e) {
        if (e.target.tagName == 'TD') {
            cancelChecked();
            $(e.target).parents('tr').find('.js-selectOne')[0].checked ? 
                $(e.target).parents('tr').find('.js-selectOne')[0].checked = false :
                $(e.target).parents('tr').find('.js-selectOne')[0].checked = 'checked';
            e.stopPropagation();
        }        
    });

    $('.js-status').on('click', function() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        if (checkboxs.length == 0) {
            alert("请选择一个宿舍楼！");
            return;
        }

        if (checkboxs.length > 1) {
            alert("只能选择一个宿舍楼！");
            return;
        }
        
        var buildingInfoBlock = $(checkboxs[0]).parents('tr');

        var index = buildingInfoBlock.data('index'),
            buildingInfoObj = buildingInfo_vm._data.buildingInfos[index],
            usableCheck;
        
        if (buildingInfoObj.status == 1) {
            usableCheck = confirm('确认置为不可见吗？');
        } else {
            usableCheck = confirm('确认置为可见吗？');
        }

        if (usableCheck == true) {
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/status',
                data: buildingInfoObj,
                dataType: 'json',
                success: function(data){
                    if (data.isConnect == false) {
                        alert('数据库连接失败！');
                    } else {
                        if (data.isSuccess == false) {
                            if (data['errorMsg'] != undefined) {
                                alert(data['errorMsg']);
                            } else {
                                alert('设置失败！');
                            }              
                        } else {

                            buildingInfoObj.status = buildingInfoObj.status ^ 1;
                            buildingInfo_vm._data.buildingInfos[index] = buildingInfoObj;

                            if (buildingInfoObj.usable == 1) {
                                alert('已将宿舍楼设置为可见！');
                            } else {
                                alert('已将宿舍楼设置为不可见！');
                            }            
                            cancelChecked();
                        }
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });            
        }
    });

    $('.js-delete').on('click', function() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        if (checkboxs.length == 0) {
            alert("请选择一个宿舍楼！");
            return;
        }

        if (checkboxs.length > 1) {
            alert("只能选择一个宿舍楼！");
            return;
        }
        
        var buildingInfoBlock = $(checkboxs[0]).parents('tr');

        var deleteCheck = confirm('确认删除吗？');
        if (deleteCheck == true) {
       
            var index = buildingInfoBlock.data('index'),
                buildingInfoObj = buildingInfo_vm._data.buildingInfos[index];
            
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/deleteBuilding',
                data: buildingInfoObj,
                dataType: 'json',
                success: function(data){
                    if (data.isConnect == false) {
                        alert('数据库连接失败！');
                    } else {
                        if (data.isSuccess == false) {
                            if (data['errorMsg'] != undefined) {
                                alert(data['errorMsg']);
                            } else {
                                alert('删除失败！');
                            }              
                        } else {
                            buildingInfo_vm._data.buildingInfos.splice(index, 1);

                            alert('已成功删除宿舍楼信息！');
                            cancelChecked();
                        }
                    }
                },
                error: function(xhr, type){
                    console.log(xhr);
                    alert('Ajax error!')
                }
            });            
        }
    })
  
    $('.js-add').on('click', function(e) {
        $('.modal').show();
        e.stopPropagation();
    });

    $('.js-cancel').on('click', function(e) {
        clearModal();
        $('.modal').hide();
        e.stopPropagation();
    });

    //清空模态框内容
    function clearModal() {
        $('.js-buildingNo').val('');
        $('.js-buildingName').val('');
    }

    $('.js-submit').on('click', function() {

        var buildingNo = $('.js-buildingNo').val().trim(),
            buildingName = $('.js-buildingName').val().trim();
        
        if (buildingNo.length == 0 || buildingName.length == 0) {
            alert('输入信息不完全！');
            return;
        }

        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/addBuilding',
            data: { buildingNo: buildingNo, buildingName: buildingName},
            dataType: 'json',
            success: function(data){
                if (data.isConnect == false) {
                    alert('数据库连接失败！');
                } else {
                    if (data.isSuccess == false) {
                        if (data['errorMsg'] != undefined) {
                            alert(data['errorMsg']);
                        } else {
                            alert('新增失败！');
                        }              
                    } else {
 
                        buildingInfo_vm._data.buildingInfos.push({ buildingNo: buildingNo, buildingName: buildingName, status: 1});

                        clearModal();
                        $('.modal').hide();
                        alert('新增宿舍楼成功！');
                    }
                }
            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });

    });


    
    function cancelChecked() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        });

        checkboxs.forEach(function(element) {
            element.checked = false;
        });  
    }
});
