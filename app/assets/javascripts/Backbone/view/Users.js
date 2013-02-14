
TiragSales.Views.Users = BackList.Views.List.extend({
    initialize:function () {
        this.proto();
    },
    render:function () {
        this._render(this.$el, this.collection, this._item, 'list');
        return this;
    },
    _item:BackList.Views.Item.extend({
            template:JST['users/item'],
            template_not_item:JST['users/not_item'],
            tagName:"tr",
            initialize:function (options) {
                this.proto(options);
            }
        })
});

TiragSales.Views.UsersWithModal = BackList.Views.List.extend({
    initialize:function () {
        this.proto();
    },
    render:function () {
        this._render(this.$el, this.collection, this._item, 'list');
        return this;
    },
    _item:BackList.Views.Item.extend({
        template:JST['users/item'],
        template_not_item:JST['users/not_item'],
        tagName:"tr",
        events : {
            'click' : 'showModal'
        },
        showModal : function(){
             this.model.collection.trigger('showModal',this.model)
        },
        initialize:function (options) {
            this.proto(options);
        }
    })
});

TiragSales.Views.UsersWithDelete = BackList.Views.ListWithDelete.extend({
    initialize:function () {
        this.proto();
    },
    render:function () {
        this._render(this.$el, this.collection, this._item, 'list');
        return this;
    },
    _item:BackList.Views.Item.extend({
        template:JST['users/item_with_delete'],
        template_not_item:JST['users/not_item'],
        tagName:"tr",
        initialize:function (options) {
            this.proto(options);
        }
    })
});

TiragSales.Views.UsersWithEdit = BackList.Views.ListWithEdit.extend({
    initialize:function () {
        this.proto();
    },
    render:function () {
        this._render(this.$el, this.collection, this._item, 'list');
        return this;
    },
    _item:BackList.Views.Item.extend({
        template:JST['users/item_with_edit'],
        template_not_item:JST['users/not_item'],
        tagName:"tr",
        initialize:function (options) {
            this.proto(options);
        }
    })
});

TiragSales.Views.UsersWithDrop = BackList.Views.ListWithDrop.extend({
    initialize:function () {
        this.proto();
    },
    render:function () {
        this._render(this.$el, this.collection, this._item, 'list');
        return this;
    },
    _item:BackList.Views.Item.extend({
        template:JST['users/item_with_drop'],
        template_not_item:JST['users/not_item'],
        tagName:"tr",
        initialize:function (options) {
            this.proto(options);
        }
    })
});
TiragSales.Views.UsersWithDrag = BackList.Views.ListWithDrag.extend({
    initialize:function () {
        this.proto();
    },
    render:function () {
        this._render(this.$el, this.collection, this._item, 'list');
        return this;
    },
    _item:BackList.Views.Item.extend({
        template:JST['users/item_with_drag'],
        template_not_item:JST['users/not_item'],
        tagName:"tr",
        initialize:function (options) {
            this.proto(options);
        }
    })
});

TiragSales.Views.UsersWithSelect = BackList.Views.ListWithSelect.extend({
    initialize:function () {
        this.proto();
    },
    render:function () {
        this._render(this.$el, this.collection, this._item, 'list');
        return this;
    },
    _item:BackList.Views.Item.extend({
        template:JST['users/item_with_select'],
        template_not_item:JST['users/not_item'],
        tagName:"tr",
        initialize:function (options) {
            this.proto(options);
        }
    })
});
 /*
TiragSales.Views.Drag_Users=TiragSales.Views.Users
    .extend(TiragSales.Views.drag_list_with_item).extend({
        initialize: function(options) {
            this.proto(options);
            this.extend_in('_item',{template:JST['sales/adm/user/drag_item']})
            this.collection.on('reset', this.render, this)
                .on("sync", this.render,this)
                .fetch();
        }
    })
TiragSales.Views.Drop_Users=TiragSales.Views.Users
    .extend(TiragSales.Views.drop_list)
    .extend(TiragSales.Views.list_with_delete_item).extend({
        _initialize: function(options) {this.extend_in('_item',{template:JST['sales/adm/user/drop_item']})}
    })


//____________________________________________________________________


TiragSales.Views.SalesTeam = Backbone.View.extend({
    initialize: function() {
        this.proto();
        this.collection.on('reset', this.render, this);
        this.collection.on("sync", this.render,this);
        this.collection.fetch();
    },
    render: function() {
        this._render('.js-list',this.collection,this._item,'list');
        return this;
    },

    _item:Backbone.View
        .extend(TiragSales.Views.item)
        .extend(TiragSales.Views.init)
        .extend({
            events : {},
            template:JST['sales/adm/sales_group/item'],
            template_not_item:JST['sales/adm/sales_group/not_item'],
            tagName:"tr",

            initialize:function (options) {
                this.proto(options);
                this.model.on("sync", this.render,this);
            }

        })


});
_.extend(TiragSales.Views.SalesTeam.prototype,TiragSales.Views.list);
_.extend(TiragSales.Views.SalesTeam.prototype,TiragSales.Views.init);

//____________________________________________________________________
TiragSales.Views.Groups = Backbone.View.extend(TiragSales.Views.list)
                                       .extend(TiragSales.Views.init)
                                       .extend({
    initialize: function(options) {
        this.proto(options);
        this.collection.on('reset', this.render, this);
        this.collection.on("sync", this.render,this);
        this.collection.fetch();
    },
    render: function() {
        this._render('.js-list',this.collection,this._item,'list');
        return this;
    },

    _item:Backbone.View
        .extend(TiragSales.Views.item)
        .extend(TiragSales.Views.init)
        .extend({

            template:JST['sales/adm/group/item'],
            template_not_item:JST['sales/adm/group/not_item'],
            tagName:"tr",

            initialize:function (options) {
                this.proto(options);
                this.model.on("sync", this.render,this);
            }

        })

});


TiragSales.Views.Drag_Groups=TiragSales.Views.Groups
        .extend(TiragSales.Views.drag_list_with_item).extend({
        initialize: function(options) {
            this.proto(options);
            this.extend_in('_item',{template:JST['sales/adm/group/drag_item']})
            this.collection.on('reset', this.render, this)
                .on("sync", this.render,this)
                    .fetch();
        }
})
TiragSales.Views.Drop_Groups=TiragSales.Views.Groups
    .extend(TiragSales.Views.drop_list)
    .extend(TiragSales.Views.list_with_delete_item)

TiragSales.Views.Groups_Add_Delete=TiragSales.Views.Groups
    .extend(TiragSales.Views.list_with_delete_item).extend({
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
    }).extend({
    _initialize: function(options) {
        this.extend_in('_item',{template:JST['sales/adm/group/main_item']})
    }
})



//____________________________________________________________________
TiragSales.Views.Permissions = Backbone.View.extend(TiragSales.Views.list)
    .extend(TiragSales.Views.init)
    .extend({
        initialize: function(options) {
            this.proto(options);
            this.collection.on('reset', this.render, this);
            this.collection.on("sync", this.render,this);
            this.collection.fetch();
        },
        render: function() {
            this._render('.js-list',this.collection,this._item,'list');
            return this;
        },

        _item:Backbone.View
            .extend(TiragSales.Views.item)
            .extend(TiragSales.Views.init)
            .extend({

                template:JST['sales/adm/permission/item'],
                template_not_item:JST['sales/adm/permission/not_item'],
                tagName:"tr",

                initialize:function (options) {
                    this.proto(options);
                    this.model.on("sync", this.render,this);
                }

            })

    });


TiragSales.Views.Drag_Permissions=TiragSales.Views.Permissions
    .extend(TiragSales.Views.drag_list_with_item).extend({
        initialize: function(options) {
            this.proto(options);
            this.extend_in('_item',{template:JST['sales/adm/permission/drag_item']})
            this.collection.on('reset', this.render, this)
                .on("sync", this.render,this)
                .fetch();
        }
    })
TiragSales.Views.Drop_Permissions=TiragSales.Views.Permissions
    .extend(TiragSales.Views.drop_list)
    .extend(TiragSales.Views.list_with_delete_item)

//TiragSales.Views.Permissions_Add_Delete=TiragSales.Views.Permissions
//    .extend(TiragSales.Views.list_with_delete_item).extend({
//        _initialize: function(options) {
//            this.extend_in('_item',{template:JST['sales/adm/permission/main_item']})
//        }
//    })
*/