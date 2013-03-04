
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

TiragSales.Views.UsersWithDeleteAndEdit = BackList.Views.List
                                        .extend(BackList.Mixins.list_with_delete)
                                        .extend(BackList.Mixins.list_with_edit)
                                        .extend({
    initialize:function () {
        this.proto();
    },
    render:function () {
        this._render(this.$el, this.collection, this._item, 'list');
        return this;
    },
    _item:BackList.Views.Item.extend({
        template:JST['users/item_with_all'],
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

TiragSales.Views.UsersWithRelational=
    Backbone.View
    .extend(BackList.Mixins.list)
    .extend(BackList.Mixins.init)
    .extend({
        initialize: function(options){
            this.proto(options);
        },
        render: function() {
            this._render(this.$el, this.collection,this._item,'list');
            return this;
        },

        _item : Backbone.View
            .extend(BackList.Mixins.init)
            .extend(BackList.Mixins.item)
            .extend(BackList.Mixins.list)
            .extend({
                template: JST['users/item_with_relational'],
                template_not_item: JST['users/not_item'],
                tagName:  "tr",
                c_line : [],
                initialize: function(options){
                    this.proto(options)
                    if(this.model!=null){
                        var phones=this.model.get_relational('phones')
                        phones.on('reset', this.render, this)
                               .on("sync", this.render, this);
                    }
                },
                render: function() {

                    if(this.model!=null){
                        var phones=this.model.get_relational('phones')
                        this._render_item();
                        this._render('.js-list-in',phones,this._item,'c_line');
                    }
                    return this;
                },

                _item : Backbone.View
                    .extend(BackList.Mixins.init)
                    .extend(BackList.Mixins.item)
                    .extend(BackList.Mixins.edit_item)
                    .extend({
                        template: JST['users/item_with_relational_phones'],
                        template_not_item: JST['users/not_item'],
                        tagName:  "div",

                        initialize: function(options){
                            this.proto(options);
                        }
                    })

            })

    });