Zepto(function($){

    var dormInfosBackup = {};

    var dormInfo_vm = new Vue({
        el: '#dormInfo',
        data: {
            dormInfos: {}
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
                    data: { from: 'dorm' },
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
                    url: 'http://localhost:4000/getDormInfo',
                    dataType: 'json',
                    success: function(data){
                        if (data.isConnect == false) {
                            alert('数据库连接失败！');
                        } else {
                            if (data.isSuccess == false) {
                                alert('查询失败！');
                            } else {
                                dormInfo_vm._data.dormInfos = data.dormInfos.concat();                           
                                dormInfosBackup = data.dormInfos.concat();                                                          
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
        
    })

    // 上传要导入的excel文件
    $('.js-upload').on('click', function(e) {
        e.preventDefault();

        $('#uploadDormInfo').trigger('click');
    });

    $('#uploadDormInfo').on('change', function(e) {
        var path = $('#uploadDormInfo').val();

        var tempArr = path.split('\\');
        
        if (tempArr[tempArr.length - 1].indexOf('.xlsx') != -1) {
            $('#uploadDormInfoForm').submit();
        } else {
            alert('上传文件格式有误！');
        }
    })

    $('.js-delete').on('click', function() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        })

        if (checkboxs.length == 0) {
            alert("请选择一个学生！");
            return;
        }

        if (checkboxs.length > 1) {
            alert("只能选择一个学生！");
            return;
        }
        
        var dormInfoBlock = $(checkboxs[0]).parents('tr');

        var deleteCheck = confirm('确认删除吗？');
        if (deleteCheck == true) {
            // 校验是否能办理入住
            var index = dormInfoBlock.data('index'),
                dormInfoObj = dormInfo_vm._data.dormInfos[index];
            
            $.ajax({
                type: 'POST',
                url: 'http://localhost:4000/deleteDorm',
                data: dormInfoObj,
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
                            var backupIndex = dormInfosBackup.indexOf(dormInfoObj);
                            
                            dormInfo_vm._data.dormInfos.splice(index, 1);
                            dormInfosBackup.splice(backupIndex, 1);

                            alert('已成功删除该宿舍信息！');
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
        $('.js-roomNo').val('');
    }

    $('.js-submit').on('click', function() {

        var buildingNo = $('.js-buildingNo').val().trim(),
            roomNo = $('.js-roomNo').val().trim();
        
        if (buildingNo.length == 0 || roomNo.length == 0) {
            alert('输入信息不完全！');
            return;
        }

        var re = /^\d{1,2}$/;
        if (!re.test(buildingNo)) {
            alert('楼号输入有误。（5 或 13 或 14）')
            return;
        }

        buildingNo = parseInt(buildingNo);

        if ([5,13,14].indexOf(buildingNo) == -1) {
            alert('楼号输入有误。（5 或 13 或 14）')
            return;           
        }

        var re;
        switch(buildingNo) {
            case 5:
                re = /^5\d{3}$/;
                break;
            case 13:
                re = /^F\d{4}$/;
                break;
            case 14:
                re = /^E\d{4}$/;              
                break;           
        }

        if (!re.test(roomNo)) {
            alert('宿舍号输入有误。');
            return;
        }

        $.ajax({
            type: 'POST',
            url: 'http://localhost:4000/addDorm',
            data: { buildingNo: buildingNo, roomNo: roomNo },
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
 
                        dormInfo_vm._data.dormInfos.push({ buildingNo: buildingNo, roomNo: roomNo });
                        dormInfosBackup.push({ buildingNo: buildingNo, roomNo: roomNo });

                        clearModal();
                        $('.modal').hide();
                        alert('新增宿舍成功！');
                    }
                }
            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });

    });


    $('.js-roomNo-search').on('click', function() {
        var roomNo = $('#roomNo-input').val().trim();

        if (roomNo.length == 0) {
            dormInfo_vm._data.dormInfos = dormInfosBackup.concat();
            alert('请输入要查询的宿舍号。');
            return;
        }

        var dormInfos = dormInfo_vm._data.dormInfos.filter(function(elem) {
            return elem.roomNo.indexOf(roomNo) != -1;
        });

        if (dormInfos.length != 0) {
            dormInfo_vm._data.dormInfos = dormInfos;
        } else {
            alert('查无此宿舍号。');
        }
    });

    $('#roomNo-input').on('keypress', function(e) {
        var e = e || window.event;

        if (e.keyCode == 13) {
            $('.js-roomNo-search').trigger('click');
        } 

    });

    $('#roomNo-input').on('input', function(e) {
        console.log('change')
        var roomNoInput = $(this);

        if (roomNoInput.val().trim().length == 0) {
            dormInfo_vm._data.dormInfos = dormInfosBackup.concat();
        }
    })
    
    function cancelChecked() {
        var checkboxs = $('.js-selectOne').filter(function() {
            return this.checked == true;
        });

        checkboxs.forEach(function(element) {
            element.checked = false;
        });  
    }
});
