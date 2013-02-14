/*
@author Vorobyov Nikita Aleksandrovich
 */

BackList={Models: {}, Collections: {}, Views: {}, Routes: {}, Mixins: {}};

BackList.Mixins.init = {
    proto : function(options){
        options || (options=this.options) || (options={})
        this.proto_events();
        this.proto_init(options);
    },
    extend_in: function(property,obj){
        if(this[property]){
            this[property]=this[property].extend(obj)
        }
    },

    proto_events : function(){
        var proto = this.__proto__;
        while(!_.isEmpty(proto)){
            this.events=_.clone(_.extend(this.events ,proto.events));
            proto = proto.__proto__
        }
    },
    proto_init : function(options){
        var proto = this.__proto__;
        while(!_.isEmpty(proto)){
            if(_.isFunction(proto._initialize)){
                proto._initialize.call(this, options)
            }
            proto = proto.__proto__
        }
    }

}
BackList.Mixins.item = {

    tagName:"tr",

    _initialize:function (options) {
        this.model.on('sync', this.render, this);
        this.self = this.options.self;
    },
    events:{
    },
    render_not_item:function () {
        if (!_.isEmpty(this.model)) {
            var item = this.model.toJSON()[this.model.nameModel];
            var template = $(this.template_not_item({data:item}))
            this.copyAttr(template, this.$el)
            this.$el.html(template.html())
            return this;
        }
    },

    render:function () {
        this._render_item()
        return this
    },

    _render_item:function () {
        if (!_.isEmpty(this.model)) {
            var item = this.model.toJSON()[this.model.nameModel];
            var template = $(this.template({data:item}))
            this.copyAttr(template, this.$el)
            this.$el.html(template.html())
            return this;
        }
    },
    copyAttr:function (from, to) {
        var attributes = from.get(0).attributes
        var attr = {};
        _.each(attributes, function (item) {
            attr[item.nodeName] = item.value;
        }, this)
        to.attr(attr)
    }
}
BackList.Mixins.item_with_delete = {
    _initialize:function () {
        this.model.on('remove', this.lazy_remove, this);
    },

    events:{
        "click .js-delete":'delete'
    },

    lazy_remove:function () {
        this.$el.slideUp('slow');
        this.$el.html('');
        this.self.render()
    },

    delete:function () {
        if(this.model['url_for_delete'])
            var url= $.proxy(this.model['url_for_delete'],this.model);
        url ? this.model.destroy({url :url('item_with_delete')}) : this.model.destroy() ;
        this.model = null;
        return false;
    }

}
BackList.Mixins.item_with_showModal = {
    events:{
        'click':'showModal'
    },
    showModal:function () {
        this.model.collection.trigger('showModal', this.model)
    },
    _initialize:function (options) {

    }
}
BackList.Mixins.drag_item = {
    events: {
        'save_to' : 'save_to'
    },
    save_to :function(a,other_list){
        if(_.isEmpty(this.model.nameModel)){
            console.log(' свойство nameModel модели должно быть определено');
            return false
        }

        var model=this.model.toJSON()[this.model.nameModel]
        model[this.model.nameModel+'_id']=model.id;
        delete model.id;
        $(other_list).trigger('save-from',model);
        this.remove();
    },

    _initialize: function(options) {
    }

}
BackList.Mixins.edit_item={


    _initialize: function(options){
        this.model.on('sync',this.render,this);
    },
    events: {
        "blur .js-value" : "set_value",
        "keypress .js-value" : "set_value_to_enter"
    },



    set_value_to_enter: function(a){
        if(a.which==13)
            this.set_value(a)
    },
    set_value: function(a){
        var elem = $(a.currentTarget),
            value = elem.val(),
            name= elem.attr('name');
        if(!name)
            throw new Error('у редактируемого элемента должно быть свойство name');
        var url= this.model['url_for_update_'+name] ? $.proxy(this.model['url_for_update_'+name],this.model) : $.proxy(this.model.url,this.model);
        var data={};
        data[name]=value;
        this.model.save(data,{url : url('item_with_edit')})
        this.render();
    }
}
BackList.Mixins.list= {

    _initialize:function (options) {
        this.collection.on('reset', this.render, this)
            .on("sync", this.render, this);
    },

    list : [],
    _render: function(elem,collection,item,list) {
        this.resetRender(list);
        this.renderList(elem,collection,item,list);
        $(window).trigger('resize');
        return this;
    },
    resetRender: function(list){
        var length = this[list].length
        for(var i=0;i<length;i++)
            this[list][i].remove();
        this[list]=[];
    },

    renderList: function(elem,collection,item,list){
        var coll = collection;
        if(!_.isEmpty(coll)&&!_.isEmpty(coll.models))
            coll.each(function(num,i){
                var    view = new item({model: num, self : this});
                this[list][i]=view;
                $(elem,this.$el).append(view.render().el);
            },this);
        else
        {

            var view = new item({model: new coll.model()});
            $(elem,this.$el).append(view.render_not_item().el);
            this[list][0]=view;
        }
    }
}
BackList.Mixins.list_with_drag = {


    sortable:function(options){
        this.$el.sortable({
            connectWith: options.connectWith || ".js-list",
            appendTo: 'body',
            helper: 'clone',
            items: options.items || 'tr',
            cancel :'.not_draggable'
        });
    },



    _initialize: function(options) {
        this.sortable(options);
        if(options.drag_item){
            this[options.drag_item]=this[property].extend(BackList.Mixins.drag_item)
        }else{
            this['_item']=this['_item'].extend(BackList.Mixins.drag_item)
        }

    }

}
BackList.Mixins.list_with_drop = {
    events: {
        'save-from' : 'save_from'
    },

    sortable: function(options){
        this.$el.sortable({
            items: options.items || 'tr',
            cancel :'.not_draggable',
            receive: function(event, ui){
                ui.item.trigger('save_to',this)
            }
        });
    },

    save_from : function(a,model){
        if(this.collection['url_create'])
            var url=$.proxy(this.collection['url_create'],this.collection)
        else
            var url=$.proxy(this.collection.url,this.collection);
        this.collection.create(model,{at: 0, url : url('item_with_drop')});
    },

    _initialize: function(options) {
        this.sortable(options);

    }

}
BackList.Mixins.list_with_edit = {
    _initialize: function(options){
        this.extend_in('_item', BackList.Mixins.edit_item)
    }
}
BackList.Mixins.list_with_delete = {
    _initialize:function (options) {
        this.extend_in('_item', BackList.Mixins.item_with_delete)
    }
}
BackList.Mixins.list_with_select={
    _initialize: function(options) {
        this.extend_in('_item',{
            _initialize: function(){

            },
            events :{'click  a.js-open' : 'active'},

            active :function(event){
                var $elem=this.find_or_create('a.js-hidden','<a class="js-hidden" style="display: none;"></a>')
                var $current=$(event.currentTarget)
                $elem.attr('href',$current.attr('data-href')).attr('title',$current.attr('title'));
                $elem.trigger('click');
                return true;
            },
            find_or_create : function(selector,item){
                var elem=this.$(selector);
                if(elem.length==0)
                    elem=$(item).appendTo(this.$el)
                return elem;
            }

        })
    }
}
BackList.Mixins.list_with_showModal={
    _initialize: function(options) {
        this.extend_in('_item',BackList.Mixins.item_with_showModal)
    }
}



BackList.Mixins.list_with_relational = Backbone.View
    .extend(BackList.Mixins.list)
    .extend(BackList.Mixins.init)
    .extend({
        initialize: function(options){
            this.proto(options);
        },
        render: function() {
            this._render('.js-list',this.collection,this._item,'list');
            return this;
        },

        _item : Backbone.View
            .extend(BackList.Mixins.init)
            .extend(BackList.Mixins.item)
            .extend(BackList.Mixins.list)
            .extend({
                c_line : [],
                initialize: function(options){
                    this.proto(options)
                },
                render: function() {
                    if(this.model!=null){
                        var contract_lines=this.model.get_relational('contract_lines')
                        this._render_item();
                        this._render('.js-contract-line',contract_lines,this._item,'paym_assign');
                        this.status();
                    }
                    return this;
                },

                _item : Backbone.View
                    .extend(BackList.Mixins.init)
                    .extend(BackList.Mixins.item)
                    .extend({

                        tagName:  "tr",

                        initialize: function(options){
                            this.proto(options);
                        }
                    })

            })

    });





//Класс списка
BackList.Views.List = Backbone.View
    .extend(BackList.Mixins.list)
    .extend(BackList.Mixins.init)

//Класс элемента списка
BackList.Views.Item = Backbone.View
    .extend(BackList.Mixins.item)
    .extend(BackList.Mixins.init)

//Класс элемента списка с подсписком
BackList.Views.ItemWithRelational = Backbone.View
    .extend(BackList.Mixins.item)
    .extend(BackList.Mixins.init)
    .extend(BackList.Mixins.list)
    .extend({
        render: function() {
            if(this.model!=null){
                var _lines=this.model.get_relational('_lines')
                this._render_item();
                this._render('.js-contract-line',contract_lines,this._item,'_lines');
                this.status();
            }
            return this;
        }
    })

//Класс списка c Drag элементами
BackList.Views.ListWithDrag = Backbone.View
    .extend(BackList.Mixins.list)
    .extend(BackList.Mixins.init)
    .extend(BackList.Mixins.list_with_drag)

//Класс списка c Drop элементами
BackList.Views.ListWithDrop = Backbone.View
    .extend(BackList.Mixins.list)
    .extend(BackList.Mixins.init)
    .extend(BackList.Mixins.list_with_drop)

//Класс списка c редактируеммыми элементами
BackList.Views.ListWithEdit = Backbone.View
    .extend(BackList.Mixins.list)
    .extend(BackList.Mixins.init)
    .extend(BackList.Mixins.list_with_edit)

//Класс списка c удаляемыми элементами
BackList.Views.ListWithDelete = Backbone.View
    .extend(BackList.Mixins.list)
    .extend(BackList.Mixins.init)
    .extend(BackList.Mixins.list_with_delete)

//Класс списка c выбираемыми элементами
BackList.Views.ListWithSelect = Backbone.View
    .extend(BackList.Mixins.list)
    .extend(BackList.Mixins.init)
    .extend(BackList.Mixins.list_with_select)

/*
 * Компоненты управления списком
 * */


BackList.Views.Filter = Backbone.View
    .extend(BackList.Mixins.init)
    .extend({
        template:JST['module/filter'],
        timer:0,
        events:{
            "keyup .js-filter":'filter',
            "click .js-button-click":'Timer'
        },
        initialize:function (options) {
            this.proto();
            this.render();
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

        Timer:function () {
            this.collection.fetch();
            clearTimeout(this.timer)
        },
        filter:function (a) {
            var val = this.$('.js-filter');
            this.collection.setFilter(val.attr('name'),val.val());
            var $context = this;
            clearTimeout(this.timer)
            this.timer = setTimeout(function () {
                $context.Timer()
            }, 500)
            if (val.val().length >= 6 || val.val().length == 0) {

                this.collection.fetch();
                clearTimeout(this.timer)
            }
        }


    });


BackList.Views.FilterDate = Backbone.View.extend(BackList.Mixins.init).extend({
    monthNames : ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    dayNamesMin:  ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    template : JST['module/filter_date'],
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
        if (this.options.value!==val){
            this.options.value=val;
            this.collection
                .setFilter(currentTarget.attr('name'), val)
                .fetch();
        }
        return true
    }


});

BackList.Views.Checked = Backbone.View.extend(BackList.Mixins.init).extend({
    events: {
        "click .js-btn-info": 'checked'
    },
    className: 'js-checked_category',
    template: JST['module/checked'],
    initialize: function(options) {
        this.init_options();
        this.render()
        this.proto();
    },
    init_options: function(){
        var is_has=false
        var model=this.options.model;
        model.type = model.type || 'checkbox';
        model.items = model.items || [];

        if (model.type === 'radio') {
            model.items = _.map(model.items,
                function (val) {
                    if (val.active){
                        if(!is_has){
                            is_has=true;
                        }else{
                            val.active=false
                        }
                    }
                    return val;
                }, this);
            if(!is_has&&model.items.length!=0){
                model.items[0].active=true
            }
        }
    },
    checked: function(a){
        if(this.options.model.type=='radio')
            return this.checked_radio(a);
        else
            this.checked_checkbox(a);
    },
    checked_radio: function(a){
        var cur = $(a.currentTarget);
        var cur_val=cur.val();

        if(!cur.hasClass('active')){
            this.collection.setFilter(this.options.model.name,cur_val)
                .fetch();
            return true;
        }
        else{
            cur.removeClass('active')
            this.collection.setFilter(this.options.model.name,'')
                .fetch();
            return false;
        }

    },
    checked_checkbox: function(a){
        var cur = $(a.currentTarget);
        var cur_val=cur.val();
        var value=this.collection.getFilter(this.options.model.name);
        value = _.isArray(value) ? value : [];
        if(!cur.hasClass('active')){
            value.push(cur_val)
            value=_.uniq(value)
        }else{
            value=_.without(value,cur_val);

        }
        this.collection.setFilter(this.options.model.name, value)
            .fetch();
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
    }
});

BackList.Views.FormToJson = Backbone.View.extend({
    events: {
        //"click a" : "selectMenu"
    },
    err:{},
    initialize: function(options) {
        this.el=options.el;
        this.app=options.app;
        this.section =  this.$el.closest('section');
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

BackList.Views.Modal = Backbone.View.extend({
    template:JST['module/modal'],
    template_body :_.template(''),
    $currentTarget:'',
    initialize:function (options) {
        this.template_body=options.template || this.template_body;
        this.collection.on('showModal',this.showModal,this)
            .on("sync", this.sync,this)
            .on("error", this.error,this);
        this.render();
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

    events:{
        'click .ok':'save'
    },
    save:function () {
        var form=this.$('form'),
            data={},
            model = this.currentModel;
        $('input',form).add('textarea',form).each(function(){
            var $this=$(this);
            data[$this.attr('name')]=$this.val();
        })
        $('input:checked',form).each(function(){
            data.elem[$(this).attr('name')]=$(this).val();
        });
        var url= model['url_for_update'] ? $.proxy(model['url_for_update_'+name],model) : $.proxy(model.url,model);
        model.save(data,{url : url('modal')})



    },
    sync : function (data) {
        this.$el.modal('hide')
    },
    error : function (a,b,c) {
        var error = eval('('+a.responseText+')')
        this.showError(error)

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
    showModal:function (model) {
        this.currentModel=model;
        this.$('.modal-body').html(this.template_body({data : model.toJSON()[model.nameModel],model :this.model}))
        this.$el.modal('show')
    }
})

BackList.Views.AddItem = Backbone.View.extend({
    template:JST['module/add_item'],
    template_body :_.template(''),
    events: {
        "click .js-add-button": 'add',
        "click .js-minus-button": 'addClose',
        "submit form": 'save'
    },
    flag: [],
    initialize: function(options) {
        this.template_body=options.template || this.template_body;
        this.collection.on("sync", this.sync,this)
            .on("error", this.error,this);
        this.render();
    },
    render:function () {
        var item = this.options.model || {};
        var template = $(this.template({data:item,template_body :this.template_body({data:item})}))
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
    add: function(a){
        this.display_add(null,a);
        return false;
    },

    display_add  : function(error,a){    //отображение формы ввода с ошибками или без
        var name={inn: 'Инн', kpp : 'Кпп', name : 'Название' }
        if(error!=null){
            var form=this.$('form')
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
        this.collection.create(data)



        return false;
    }


})



/*@constructor
* Конструктор модели списка самого общего вида для данного приложения
* */

BackList.Models.Basic = Backbone.Model.extend({
    nameModel : 'model',// Название модели участвует при отправке на сервер модели для оборачивания параметров

    /**
     * Метод для оборачивание подсписков в коллекцию this[_+'name'], дает работ с подсписками как с коллекциями,
     * а не как с массивами
     * @param {String} name  имя переменной содержащей подсписок
     * @return {Backbone.Collection}
     */
    get_relational: function (name){ //
        if(_.isEmpty(this.collection[name]))
            this.collection[name]={};
        var id=this.id;
        if(_.isEmpty(this.collection[name][id])){
            this.collection[name][id]=new this['_'+name](this.get(name),{belongs_to: this})
            delete this.attributes[name]
        }
        else{
            if(this.get(name)){
                this.collection[name][id]['belongs_to']=this;
                this.collection[name][id].reset(this.get(name))
                delete this.attributes[name]
            }
        }
        return this.collection[name][id];
    },
    /*
     url_for_delete : function(){
     при определении этой функции переопределяется урл для удаления элемента
     },
     */
    /*
     url_for_update_name: function(){
     при определении генерирует урл для апдейта конкретного параметра модели
     этот например для апдейта параметра 'name'
     url_for_update_email() для апдейта параметра email
     },
     */
    /**
     * Метод для оборачивания параметров при отправке модели на сервер
     * @return {Object}
     */
    toJSON: function(){
        var hasWithRoot={};
        hasWithRoot[this.nameModel]=this.attributes;
        return _.clone(hasWithRoot);
    }

});



//@constructor
BackList.Collections.Basic = Backbone.Collection.extend({
    filter: {},//переменная с массивом параметров переданных на сервер
    getFilter: function(name){
        return this.filter[name];
    },
    setFilter: function(name, value){
        if(_.isEmpty(value))
            delete this.filter[name];
        else
            this.filter[name]=value;
        return this;
    },


    initialize: function(models,options){
        this.filter= {};
        if((options!=undefined)&&(options.url!=undefined))
            this.url_base=options.url;
        if((options!=undefined)&&(options.filter!=undefined))
            this.filter['filter']=options.filter;
        var self =this;
        if(_.isEmpty(models))
            this.fetch();
        else
            setTimeout(function(){self.trigger('reset')},100)

    },
    url_base : "",
    model: TiragSales.Models.Basic,
    /*
     url_create: function(){
     определив ее переопределяется урл для создания нового элемента списка
     },
     */
    url: function(){
        var url;

        if(!_.isEmpty(this.filter))
        {
            url =  _.reduce(this.filter,function(memo,value,key,list){
                if(_.isArray(value))
                    return memo+key+'[]='+value.join('&'+key+'[]=')+'&'
                return memo+key+'='+value+'&'
            },this.url_base+'?');
        }
        else
        {
            url=this.url_base+'?';
        }
        var last=url.charAt(url.length-1);
        if(last==='?'|| last==='&')
            url=url.slice(0,-1)
        return url;
    }


});

