TiragSales.Views.init = {
    proto : function(options){
        options || (options={})
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
TiragSales.Views.item = {

    template:JST['sales/payms/assign_payms'],
    template_not_item:JST['sales/payms/not/item_payms'],
    tagName:"tr",

    _initialize:function (options) {
        this.model.on('sync', this.render, this);
        this.self = this.options.self;
    },
    events:{
    },
    render_not_item:function () {
        if (!_.isEmpty(this.model)) {
            var item = this.model.toJSON();
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
            var item = this.model.toJSON();
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
TiragSales.Views.item_with_delete = {
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
        url ? this.model.destroy({url :url()}) : this.model.destroy() ;
        this.model = null;
        return false;
    }

}
TiragSales.Views.drag_item = {
    events: {
        'save_to' : 'save_to'
    },
    save_to :function(a,other_list){
        if(_.isEmpty(this.model.nameModel)){
            console.log(' свойство nameModel модели должно быть определено');
            return false
        }

        var model=this.model.toJSON()
        model[this.model.nameModel+'_id']=model.id;
        delete model.id;
        $(other_list).trigger('save-from',model);
        this.remove();
    },

    _initialize: function(options) {
    }

}
TiragSales.Views.edit_item={


    _initialize: function(options){
        this.model.on('sync',this.render,this);
    },
    events: {
        "blur .js-value" : "set_value",
        "keypress .js-value" : "set_value_to_enter"
    },



    set_value_to_enter: function(a){
        if(a.which==13)
            this.set_(a)
    },
    set_value: function(a){
        var elem = $(a.currentTarget),
            value = parseFloat(elem.val()),
            name= elem.attr('name');
        if(value<1||_.isNaN(value) ){
            value=1.0;
        }
        var url= $.proxy(this.model['url_for_update_'+name],this.model);
        this.model.save({item_final_price : value},{url : url()})
        this.render();
    }
}
TiragSales.Views.list= {

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
TiragSales.Views.list_with_drag = {


    sortable:function(){
        this.$( ".js-list" ).sortable({
            connectWith: ".js-list",
            appendTo: '#page-flow',
            helper: 'clone',
            items: 'tr',
            cancel :'.not_draggable'
        });
    },



    _initialize: function(options) {
        this.sortable();
        if(options.drag_item){
            this[options.drag_item]=this[property].extend(TiragSales.Views.drag_item)
        }else{
            this['_item']=this['_item'].extend(TiragSales.Views.drag_item)
        }

    }

}
TiragSales.Views.list_with_drop = {
    events: {
        'save-from' : 'save_from'
    },

    sortable: function(){
        this.$( ".js-list" ).sortable({
            items: 'tr.selectable',
            receive: function(event, ui){
                ui.item.trigger('save_to',this)
            }
        });
    },

    save_from : function(a,model){
        this.collection.create(model,{at: 0, url : this.collection.url_update()});
    },

    _initialize: function(options) {
        this.sortable();

    }

}
TiragSales.Views.list_with_edit = {
    _initialize: function(options){
        this.extend_in('_item', TiragSales.Views.edit_item)
    }
}
TiragSales.Views.list_with_delete = {
    _initialize:function (options) {
        this.extend_in('_item', TiragSales.Views.item_with_delete)
    }
}
TiragSales.Views.list_with_select={
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


TiragSales.Views.list_with_relational = Backbone.View
    .extend(TiragSales.Views.list)
    .extend(TiragSales.Views.init)
    .extend({
        initialize: function(options){
            this.proto(options);
        },
        render: function() {
            this._render('.js-list',this.collection,this._item,'list');
            return this;
        },

        _item : Backbone.View
            .extend(TiragSales.Views.init)
            .extend(TiragSales.Views.item)
            .extend(TiragSales.Views.list)
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
                    .extend(TiragSales.Views.init)
                    .extend(TiragSales.Views.item)
                    .extend({

                        tagName:  "tr",

                        initialize: function(options){
                            this.proto(options);
                        }
                    })

            })

    });





//Класс списка
Backbone.ViewList = Backbone.View
    .extend(TiragSales.Views.list)
    .extend(TiragSales.Views.init)

//Класс элемента списка
Backbone.ViewItem = Backbone.View
    .extend(TiragSales.Views.item)
    .extend(TiragSales.Views.init)

//Класс элемента списка с подсписком
Backbone.ViewItemWithRelational = Backbone.View
    .extend(TiragSales.Views.item)
    .extend(TiragSales.Views.init)
    .extend(TiragSales.Views.list)
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
Backbone.ViewListWithDrag = Backbone.View
    .extend(TiragSales.Views.list)
    .extend(TiragSales.Views.init)
    .extend(TiragSales.Views.list_with_drag)

//Класс списка c Drop элементами
Backbone.ViewListWithDrop = Backbone.View
    .extend(TiragSales.Views.list)
    .extend(TiragSales.Views.init)
    .extend(TiragSales.Views.list_with_drop)

//Класс списка c редактируеммыми элементами
Backbone.ViewListWithEdit = Backbone.View
    .extend(TiragSales.Views.list)
    .extend(TiragSales.Views.init)
    .extend(TiragSales.Views.list_with_edit)

//Класс списка c удаляемыми элементами
Backbone.ViewListWithDelete = Backbone.View
    .extend(TiragSales.Views.list)
    .extend(TiragSales.Views.init)
    .extend(TiragSales.Views.list_with_delete)

//Класс списка c выбираемыми элементами
Backbone.ViewListWithSelect = Backbone.View
    .extend(TiragSales.Views.list)
    .extend(TiragSales.Views.init)
    .extend(TiragSales.Views.list_with_select)

