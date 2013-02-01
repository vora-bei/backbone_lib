Backbone.View.AddItem = Backbone.View.extend({

    events: {
        "click .js-add-button": 'add',
        "click .js-minus-button": 'addClose',
        "click .js-save-add": 'save'
    },
    flag: [],
    initialize: function() {
        this.collection.on("sync", this.sync,this);
        this.collection.on("error", this.error,this);
    },
    add: function(a){
        this.display_add(null,a);
        return false;
    },

    display_add  : function(error,a){    //отображение формы ввода с ошибками или без
        var name={inn: 'Инн', kpp : 'Кпп', name : 'Название' }
        if(error!=null){
            var form=this.$('form','.js-add')
            $('.error',form).remove()
            _.each(error,function(val,key){
                _.each(_.uniq(val),function(value){
                    form.append('<p class="error">'+ name[key]+': '+ value+'</p>')
                },this)
            },this)

        }else{
            this.$('.js-add-button').addClass('hidden');
            this.$('.js-minus-button').removeClass('hidden');
            this.$('.js-add').slideDown("slow");
            $()
        }
    },

    addClose: function(a){
        $("input",".js-add").val('');
        this.$('.js-add').slideUp("slow");
        this.$('.js-add-button').removeClass('hidden');
        this.$('.js-minus-button').addClass('hidden');
        return false;
    },

    sync: function(a,b,c){
        this.addClose();
        this.block('save',true);
    },
    error: function(a,b,c){
        // alert(34)
    },
    block: function(param,bool){  //флаг на блокирование параметра
        if(bool!=undefined)
            this.flag[param]=bool;
        else
            return this.flag[param];
    },



    save: function(){
        var form=this.$('.js-add')
        var data={};
        $('input',form).add('textarea',form).each(function(){
            var $this=$(this);
            data[$this.attr('name')]=$this.val();
        })
        this.block('save',false)
        var $this = this;
        this.collection.create(data)



        return false;
    }


})

Backbone.View.Filter = Backbone.View.extend(TiragSales.Views.init).extend({
    template: JST['sales/module/filter'],
    timer : 0,
    events: {
        "keyup .js-filter": 'filter',
        "click .js-button-click": 'Timer'
    },
    name: 'filter',
    initialize: function(options) {
        !options.name||(this.name=options.name);
        if((options!=undefined)&&(options.filter!=undefined))
            this.filter_param=options.filter;
        this.proto();
        this.render();
    },
    render:function(){
        this.$el.append(this.template({name:this.name,filter: this.filter_param}));
        return this;
    },
    Timer: function(){
        this.collection.fetch();
        clearTimeout(this.timer)
    },
    filter: function(a){
        var val=this.$('.js-filter');
        this.collection.filter[val.attr('name')]=val.val();
        var $context=this;
        clearTimeout(this.timer)
        this.timer = setTimeout(function(){$context.Timer()}, 500)
        if(val.val().length>=6||val.val().length==0){

            this.collection.fetch();
            clearTimeout(this.timer)
        }
    }


});


Backbone.View.FilterDate = Backbone.View.extend(TiragSales.Views.init).extend({
    monthNames : ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    dayNamesMin:  ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    template : JST['module/date_picker'],
    events :{
        "select .js-filter": 'filter',
        "blur .js-filter": 'filter',
        'click .js-filter-button' : 'filterButton'
    },
    render:function () {
            var item = this.options.model || {};
            var template = $(this.template({data:item}))
            this.copyAttr(template, this.$el)
            this.$el.html(template.html())
            return this;
    },
    copyAttr:function (from, to) {
        var attributes = from.get(0).attributes
        var attr = {};
        _.each(attributes, function (item) {
            attr[item.nodeName] = item.value;
        }, this)
        to.attr(attr)
    },
    initialize : function() {
        this.render();
        this.$(".js-filter").datepicker({
            dateFormat:'dd.mm.yy',
            monthNames:this.monthNames,
            dayNamesMin:this.dayNamesMin,
            changeMonth: true,
            changeYear: true,
            showOtherMonths: true,
            selectOtherMonths: true,
            onSelect : function(dateText, inst) {$(this).trigger('select'); },
            monthNamesShort:this.monthNames
        });


    },
    filterButton : function(){
        this.$('.js-filter').trigger('focus');
    },
    filter: function(a){
        var currentTarget= $(a.currentTarget),
            val=currentTarget.val();
        if (val&&this.options.value!==val){
            this.options.value=val;
            this.collection
                .setFilter(currentTarget.attr('name'), val)
                .fetch();
        }
        return true
    }


});




Backbone.View.Checked = Backbone.View.extend(TiragSales.Views.init).extend({
    dog_type: '',
    events: {
        "click .js-btn-info": 'checked'
    },
    className: 'js-checked_category',
    template: JST['sales/module/checked_type_dog'],
    initialize: function(options) {
        !options.type||(this.type=options.type)
        options.template&&(this.template=options.template)
        this.render()
        this.proto();
    },
    type:'one',

    checked : function(a){
        if(this.type=='one')
            this.checked_one(a);
        else
            this.checked_many(a);
    },
    checked_one: function(a){
        var val = $(a.currentTarget);
        var cur_val=val.val();

        if(!val.hasClass('active')){
            this.$('.js-btn-info').removeClass('active')
            val.addClass('active');
            if(this.options.name){
                this.collection.filter[this.options.name]=cur_val;
            }
            else
                this.collection.category=cur_val;
        }
        else{
            this.$('.js-btn-info').removeClass('active')
            if(this.options.name){
                delete this.collection.filter[this.options.name]; //#todo  переписать контроллер на сервере
            }else
                this.collection.category='';
        }
        this.collection.fetch();
    },
    checked_many: function(a){
        var val = $(a.currentTarget);
        var cur_val=val.val();
        this.$('.js-btn-info').removeClass('active')
        val.addClass('active');
        this.collection.owner=cur_val; //#todo исправить алгоритм
        this.collection.fetch();
    },




    render: function() {
        this.$el.append(this.template())
        return this;
    }


});

Backbone.View.Modal = Backbone.View.extend({
    template:JST['sales/modalWindow/index_form'],
    $currentTarget:'',
    initialize:function () {

    },
    events:{
        'data':'initShow',
        'click .ok':'submit'

    },
    submit:function () {
        var $this,
            license={};
        this.$('form').find('input, textarea').each(function (i) {
            $this = $(this);
            license[$this.attr('name')] = $this.val();
        })
        var self=this;
        $.ajax({
            dataType:'json',
            data : license,
            url:"/api/sales/licenses/"+license.id+"/convert_to_multiple",
            type :'POST',
            success : $.proxy(function (data) {
                this.trigger('click')
                self.options.api.reloadPage();
            }, this.$currentTarget),
            error : $.proxy(function (a,b,c) {
                var error = eval('('+a.responseText+')')
                self.showError(error)

            }, this.$currentTarget)
        });

    },
    showError : function(error){
        var  name ={multiple_count : 'Ошибка'};
        if(error!=null){
            var form=this.$('form')
            $('.error',form).remove()
            _.each(error,function(val,key){
                _.each(_.uniq(val),function(value){
                    name[key]
                    form.append('<p class="error">'+ name[key]+': '+ value+'</p>')
                },this)
            },this)

        }
    },
    initShow:function (e, $current) {
        this.$currentTarget = $($current);
        this.$('.modal-body').html(this.template($($current).data('modal')))
    }
})



Backbone.View.FormToJson = Backbone.View.extend({
    events: {
        //"click a" : "selectMenu"
    },
    err:{},
    initialize: function(options) {
        this.el=options.el;
        this.app=options.app;
        this.section =  this.$el.closest('section');
        //this.model= new Backbone.Model();
        this.model= new Backbone.Model();
        this.model.on('change add', this.render, this);
        //this.model.on('error', this.error, this);
        //this.model.on('success', this.success, this);
        if(options.data!=undefined)
            this.mode=options.data.mode;
        else
        {
            if(this.$el.data('mode')=='edit')
                this.mode='edit';
            else
                this.mode='text';
        }
        this.reRenderForm();
        /*this.model.validate=function(attrs,options) {
         if(options.mode=='save') return false;
         } */
    },
    render: function() {
        // this.$el.html('');
        // удаляем ошибки
        if(_.isEmpty(this.err)){
            $('span.help-inline',this.section).empty();
            $('div.control-group',this.section).removeClass('error');
        }
        var $this=this;
        if(this.mode=='edit'){
            this.$el.removeClass('text').addClass('edit');
        }else{
            this.$el.removeClass('edit').addClass('text');
            this.changeItem();
        }
        // прорисовываем чекбоксы и радио
        this.$el.find('input').each(function(){
            if($(this).attr('type')=='checkbox' || $(this).attr('type')=='radio'){
                this.disabled= ($this.mode=='text'?true:false);
            }
        });
        return this;
    },
    changeItem:function(){
        var $this=this;
        var formData={};
        this.$el.find('input,select,textarea').each(function(){
            //alert( $(this).attr('name'));
            var name=$(this).attr('name');
            if ($(this).attr('type') != 'hidden') {
                if (this.nodeName == 'INPUT') {
                    var type_input={'text':1,'number':1,'email':1,'tel': 1, 'password' :1};
                    if (type_input[$(this).attr('type')]) {
                        if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData);//$this.model.set(name, $(this).val(), {silent:true});
                        $(this).next().html($(this).val());
                    }
                    if ($(this).attr('type') == 'checkbox') {
                        if(!$(this).attr('disabled')){
                            var val=this.checked?$(this).val():'0';
                            formData=$this.parseName(name,val,formData);
                        }
                    }
                    if($(this).attr('type') == 'radio') {
                        if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData);
                    }
                }
                if (this.nodeName == 'TEXTAREA') {
                    if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData);//$this.model.set(name, $(this).val(), {silent:true});
                    $(this).next().html($(this).val());
                }
                if (this.nodeName == 'SELECT') {
                    var $select = $(this);
                    if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData);//$this.model.set(name, $select.val(), {silent:true});
                    $(this).next().html($(this).find('option[value=' + $select.val() + ']').html());
                }
            } else if ($(this).attr('type') == 'hidden') {
                if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData);//$this.model.set($(this).attr('name'), $(this).val(), {silent:true});
                if($(this).attr('name')=='_method'){
                    if($(this).val()=='put')$this.model.id=true;
                }
            }
        });
        $this.model.set(this.paramToObject(this.$el.serialize()),{silent:true});
    },
    paramToObject : function(url) {
        var request = {};
        var pairs = url.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            var names=decodeURIComponent(pair[0]).match(/([0-9a-z_\-]+)(\[([^\]]*)\]*)?(\[([^\]]*)\]*)?/i);
            // console.log(names);
            if(names[2]===undefined && names[4]===undefined && names[1]!==undefined)
            {
                request[names[1]] = decodeURIComponent(pair[1]).replace(/\+/g, ' ');
            }else if(names[2]!==undefined && names[4]===undefined)
            {
                if(names[3]==undefined || names[3]=='')
                {
                    if(request[names[1]]==undefined || typeof(request[names[1]])!='object' )request[names[1]]=[];
                    request[names[1]].push(decodeURIComponent(pair[1]).replace(/\+/g, ' '));
                }else{
                    if(request[names[1]]==undefined || typeof(request[names[1]])!='object' )request[names[1]]={};
                    request[names[1]][names[3]] = decodeURIComponent(pair[1]).replace(/\+/g, ' ');
                }
            }
            else if(names[2]!=undefined && names[4]!=undefined)
            {
                if(names[3]==undefined || names[3]=='')
                {
                    if(request[names[1]]==undefined || typeof(request[names[1]])!='object' )request[names[1]]=[];
                }else{
                    if(request[names[1]]==undefined || typeof(request[names[1]])!='object' )request[names[1]]={};
                }

                if(names[5]==undefined || names[5]=='')
                {
                    if(request[names[1]][names[3]]==undefined || typeof(request[names[1]][names[3]])!=='object')request[names[1]][names[3]]=[];
                    request[names[1]][names[3]].push(decodeURIComponent(pair[1]).replace(/\+/g, ' '));
                }else{
                    if(request[names[1]][names[3]]==undefined || typeof(request[names[1]][names[3]])!=='object')request[names[1]][names[3]]={};
                    request[names[1]][names[3]][names[5]] = decodeURIComponent(pair[1]).replace(/\+/g, ' ');
                }
            }
        }
        return request;
    },
    reRenderForm : function() {
        var $this=this;
        var editButton=$('<span class="pointer btn btn-small btn-primary">Редактировать</span>').click(function(){
            $this.mode= $this.mode=='text'?'edit':'text';
            $this.render();
        });
        var tabindex=0;
        this.$el.find('input,select,textarea').each(function(){
            console.log($(this).attr('name'));
            if ($(this).attr('type') != 'hidden' ) {
                $(this).attr('tabindex',tabindex++);

                $(this).keypress(function(event) {
                    if ( event.which == 13 ) {
                        event.preventDefault();
                        $this.$el.find('[tabindex='+ (parseInt($(this).attr('tabindex'))+1)+']').focus();

                    }
                });

            }
        })

        this.$el.submit(function(e){
            e.preventDefault();
            $this.changeItem();
            $this.model.url=$(this).attr('action');
            var xhr=$this.model.save(null,{
                error:function(model, response){
                    if(xhr.status==401){
                        // нет авторизации
                        document.location.href='/users/sign_in/'+'?return='+document.location.href;
                    }else if (xhr.status==422){
                        // форма заполнена с ошибками
                        eval('var err='+xhr.responseText);// если заголовок json то response уже объект
                        $this.err=err;
                        $this.showErrors();
                    }else{
                        alert(xhr.responseText);
                    }
                    $this.model.clear();
                },
                success:function(model, response){
                    $this.err={};
                    var contentType = xhr.getResponseHeader('Content-Type').split(';')[0];
                    if(contentType=='application/json'){
                        eval('var ret='+xhr.responseText);// если заголовок json то response уже объект
                        if(ret.status=='ok'){
                            if($this.$el.data('success'))
                            {
                                $this.mode='text';
                                eval($this.$el.data('success'));
                                $this.render();
                            }else{
                                $this.mode='text';
                                $this.render();
                            }
                        }
                    }else if (contentType=='text/html'){
                        $this.$el.closest('div.content').html(xhr.responseText);
                        $(window).trigger('resize');
                    }
                    $this.model.clear();
                    return false;
                },
                mode:'save',
                validate:function(){alert('validate');return false;}
            });
            /*$.ajax({
             type: "POST",
             url: $this.model.url,
             data: $this.model.toJSON(),
             success: function(response,ststus,xhr){
             var contentType = xhr.getResponseHeader('Content-Type').split(';')[0];
             if(contentType=='application/json'){
             var ret=eval(response);// если заголовок json то response уже объект
             if(ret.func){
             eval('(' + ret.func + ')(ret)');
             }else{
             alert('json no func');
             }

             }else if (contentType=='text/html'){
             var section =  $this.$el.closest('section');
             $this.$el.closest('div.content').html(response);
             $(window).trigger('resize');
             /* $('form.to_json',section).each(function(){
             new TiragSales.Views.FormToJson({app : $this.app,el : this});
             })* /
             }
             },
             error: function(xhr,response,status){
             if(xhr.status==401){
             // нет авторизации
             document.location.href='/users/sign_in/'+'?return='+document.location.href;
             }else if (xhr.status==422){
             // форма заполнена с ошибками
             /* TODO Сделать обработку ошибок * /
             alert(response);

             }else{
             alert(response);
             }
             },
             });*/
        });
        this.$el.before(editButton);
        var formData={};
        this.$el.find('input,select,textarea').each(function(){
            //alert( $(this).attr('name'));
            var name=$(this).attr('name');
            if( $(this).attr('type')!='hidden' ){
                if(this.nodeName =='INPUT'){
                    if($(this).attr('type')=='text' || $(this).attr('type')=='tel' || $(this).attr('type')=='email'){
                        if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData); //$this.model.set(name,$(this).val(),{silent:true});
                        $(this).addClass('edit').after('<span class="text">'+$(this).val()+'</span><span class="help-inline"></span>');
                    }
                    if($(this).attr('type')=='checkbox' || $(this).attr('type')=='radio'){
                        if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData);// $this.model.set(name,this.checked?1:0,{silent:true});
                        //this.disabled= $this.mode=='text'?true:false;
                        // $(this).after('<span class="err edit"></span>');
                    }
                    if($(this).attr('type')=='submit'){
                        $(this).addClass('edit');
                    }
                }
                if(this.nodeName =='TEXTAREA'){
                    if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData);//$this.model.set(name,$(this).val(),{silent:true});
                    $(this).addClass('edit').after('<span class="text">'+$(this).val()+'</span><span class="help-inline"></span>');
                }
                if(this.nodeName =='SELECT'){
                    var $select=$(this);
                    if(!$(this).attr('disabled')) formData=$this.parseName(name,$(this).val(),formData);//$this.model.set(name,$select.val(),{silent:true});
                    $(this).addClass('edit').after('<span class="text">'+$(this).find('option[value='+$select.val()+']').html() +'</span><span class="help-inline"></span>');
                }

            }
        });
        $this.model.set(this.paramToObject(this.$el.serialize()),{silent:true});
        $this.render();
    },
    showErrors:function(){
        $('div.control-group',this.section).removeClass('error');
        $('span.help-inline',this.section).empty();
        var $this=this;
        var is_first=true;
        _.each(this.err,function(v,k){
            if(_.isObject(v)){
                _.each(v,function(vv,kk){
                    if(is_first){
                        $('.container',$this.section).css("top",0);
                        $('[name="'+k+'['+kk+']"]',$this.section).focus();
                    }
                    $('[name="'+k+'['+kk+']"]',$this.section).nextAll('span.help-inline').html(vv.join('')).closest('div.control-group').addClass('error');
                })
            }else{
                if(is_first){
                    $('.container',$this.section).css("top",0);
                    $('[name='+k+']',$this.section).focus();
                }
                $('[name='+k+']',$this.section).next('span.help-inline').html(v.join('')).closest('div.control-group').addClass('error');
            }
            is_first=false;
        })
    },
    parseName:function(name,val,obj){
        // разбор имен формы
        var re = /^([^\[]+)\[([^\]]+)]/;

        var found = name.match(re);
        if(!_.isNull(found) && found.length==3){
            if(!_.isObject(obj[found[1]]))obj[found[1]]={}
            obj[found[1]][found[2]]=val ;
        }else{
            obj[name]=val ;
        }
        return obj;
    }
});