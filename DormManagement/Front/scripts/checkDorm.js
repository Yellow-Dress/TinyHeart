Zepto(function($){

    var stuid = localStorage.getItem('stuid');

    var checkDorm_vm = new Vue({
        el: '#container',
        data: {
            studentName: '未知',
            studentNo: '',
            sex: '',
            multiFlag: false,
            validStudentList: [],
            max5: 0,
            max13: 0,
            max14: 0,
            building5: [],
            building13: [],
            building14: [],
            addBlockSwitch: false
        },
        methods: {
            toggleMulti: function(flag) {
                this.multiFlag = flag;
            },
            addParnterBtn: function() {
                var max = 0;

                switch($('select').val()) {
                    case "5":
                        max = checkDorm_vm._data.max5;
                        break;
                    case "13":
                        max = checkDorm_vm._data.max13;
                        break;
                    case "14":
                        max = checkDorm_vm._data.max14;
                        break;
                } 
                
                if (max == checkDorm_vm.validStudentList.length + 1) {
                    alert('已达到该楼可添加同住人数的上限')
                } else if (max < checkDorm_vm.validStudentList.length + 1) {
                    alert('已超过该楼可添加同住人数的上限');
                } else {
                    this.addBlockSwitch = true;
                    $('#newPartnerId').val('');
                }

            },
            selectChange: function() {
                var max = 0;

                switch($('select').val()) {
                    case "5":
                        max = checkDorm_vm._data.max5;
                        break;
                    case "13":
                        max = checkDorm_vm._data.max13;
                        break;
                    case "14":
                        max = checkDorm_vm._data.max14;
                        break;
                } 
                
                if (max == checkDorm_vm.validStudentList.length + 1) {
                    alert('已达到该楼可添加同住人数的上限');
                } else if (max < checkDorm_vm.validStudentList.length + 1) {
                    alert('已超过该楼可添加同住人数的上限');
                }
            },
            cancelNewPartner: function() {
                this.addBlockSwitch = false;
                $('#newPartnerId').val('');
            },
            removePartner: function(index) {
                var checkQuestion = confirm("是否确认移除" + this.validStudentList[index] + "?");

                if (checkQuestion == true) {
                    this.validStudentList.splice(index, 1);
                }
            },
            confirmNewPartner: function() {
                var stuid = $('#newPartnerId').val();

                var reg = /^\d{10}$/;

                if (reg.test(stuid)) {
                    if (this.validStudentList.indexOf(stuid) != -1) {
                        alert('您已添加过该同住人');
                        return;
                    }
                    var queryForCode = prompt("请输入学号" + stuid + "的校验码：");
                    
                    if (queryForCode != null && queryForCode != "") {
                        console.log(queryForCode)
                        var re = /^[0-9a-z]{6}$/;

                        if (re.test(queryForCode)) {
                            $.ajax({  
                                type: 'POST',
                                url: 'http://localhost:4000/validatePartner',
                                data: { stuid: stuid, code: queryForCode , sex: checkDorm_vm.sex},
                                dataType: 'json',
                                success: function(data){
                                    if (data.errcode != undefined) {
                                        alert(data.msg);
                                    } else {
                                        checkDorm_vm.validStudentList.push({studentNo: stuid, studentName: data.studentName});
                                        checkDorm_vm.addBlockSwitch = false;
                                        $('#newPartnerId').val('');
                                        alert('添加成功！');
                                        console.log(checkDorm_vm._data.validStudentList);
                                    }
                                },
                                error: function(xhr, type){
                                    console.log(xhr);
                                    alert('Ajax error!')
                                }
                            });                           
                        } else {
                            alert('校验码输入有误');
                        }
                    }
                } else {
                    alert('学号输入有误');
                }
            },
            confirmDistribute: function() {
                var max = 0;

                switch($('select').val()) {
                    case "5":
                        max = checkDorm_vm._data.max5;
                        break;
                    case "13":
                        max = checkDorm_vm._data.max13;
                        break;
                    case "14":
                        max = checkDorm_vm._data.max14;
                        break;
                } 
                
                if (max < checkDorm_vm.validStudentList.length + 1) {
                    alert('已超过该楼可添加同住人数的上限');
                    return;
                }  

                $('#loadingMsg').html('处理中');
                $('#loadingToast').css('opacity', 1);
                $('#loadingToast').show();

                var students = checkDorm_vm._data.validStudentList.concat();
                
                students.push({ studentNo: checkDorm_vm._data.studentNo, studentName: checkDorm_vm._data.studentName })

                $.ajax({  
                    type: 'POST',
                    url: 'http://localhost:4000/confirmDistribute',
                    data: { buildingNo: parseInt($('select').val()), sex: checkDorm_vm._data.sex, students: students },
                    dataType: 'json',
                    success: function(data){

                        if (data.errcode != undefined) {
                            alert(data.msg);

                            $('#loadingMsg').html('数据加载中');
                            $('#loadingToast').css('opacity', 1);
                            $('#loadingToast').show();
                            
                            $.ajax({  
                                type: 'POST',
                                url: 'http://localhost:4000/getAvailableDormStatus',
                                data: { sex: checkDorm_vm._data.sex },
                                dataType: 'json',
                                success: function(data){

                                    if (data.errcode != undefined) {
                                        alert(data.msg);
                                    } else {
                                        checkDorm_vm.max5 = data.status.max5;
                                        checkDorm_vm.max13 = data.status.max13;
                                        checkDorm_vm.max14 = data.status.max14;    
                                        checkDorm_vm.building5 = data.status.building5;
                                        checkDorm_vm.building13 = data.status.building13;
                                        checkDorm_vm.building14 = data.status.building14;        
                                        $('#loadingToast').css('opacity', 0);
                                        $('#loadingToast').hide();                                                                                                
                                    }

                                },
                                error: function(xhr, type){
                                    console.log(xhr);
                                    alert('Ajax error!')
                                }
                            }); 
                        } else {
                            $('#loadingToast').css('opacity', 0);
                            $('#loadingToast').hide();

                            window.location.href = "./success.html";                                               
                        }

                    },
                    error: function(xhr, type){
                        console.log(xhr);
                        alert('Ajax error!')
                    }
                });                
            }
        }
    });

    $('#loadingMsg').html('数据加载中');
    $('#loadingToast').css('opacity', 1);
    $('#loadingToast').show();

    if (stuid != null) {
        $.ajax({  
            type: 'POST',
            url: 'http://localhost:4000/fetchStudentDetail',
            data: { stuid: stuid },
            dataType: 'json',
            success: function(data){

                if (data.isSuccess == false) {
                    alert('查询失败！');
                } else {
                    checkDorm_vm.studentName = data.student.name;
                    checkDorm_vm.studentNo = data.student.studentid;
                    checkDorm_vm.sex = data.student.gender;   

                    $.ajax({  
                        type: 'POST',
                        url: 'http://localhost:4000/getAvailableDormStatus',
                        data: { sex: checkDorm_vm._data.sex },
                        dataType: 'json',
                        success: function(data){

                            if (data.errcode != undefined) {
                                alert(data.msg);
                            } else {
                                
                                checkDorm_vm.max5 = data.status.max5;
                                checkDorm_vm.max13 = data.status.max13;
                                checkDorm_vm.max14 = data.status.max14;    
                                checkDorm_vm.building5 = data.status.building5;
                                checkDorm_vm.building13 = data.status.building13;
                                checkDorm_vm.building14 = data.status.building14;        
                                $('#loadingToast').css('opacity', 0);
                                $('#loadingToast').hide();                                                                                                
                            }

                        },
                        error: function(xhr, type){
                            console.log(xhr);
                            alert('Ajax error!')
                        }
                    });                                                                  
                }

            },
            error: function(xhr, type){
                console.log(xhr);
                alert('Ajax error!')
            }
        });


    } else {
        alert('请从企业号进入！');
    }
});