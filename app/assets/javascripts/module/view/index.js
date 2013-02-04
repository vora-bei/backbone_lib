TiragSales.Views.know_base = Backbone.View.extend({


    events: {
        "click .js-add-button": 'add',
        "click .js-minus-button": 'addClose',
        "click .js-save-add": 'save'
    },


    initialize:function (options) {
        this.collection = options.collection;
        this.collection.current_branch.on('reset', this.render, this)
            .on('add', this.render, this)
            .on('sync', this.sync, this)
            .on('error', this.error, this);
        var $this = this
        window.dispatcher.on('know_base:change', function () {
            $this.collection.current_branch.fetch({success:this.reRender});
        }, this.$el.attr('id'));
    },

    render: function() {
       var $this=this
       setTimeout(function(){
           $this.$('.js-list').html('');
           $this.render_list();
       },100)

    },

    reRender: function() {
        var length = this.collection.length
        for(var i=0;i<length;i++)
            this.collection.render();

        return false;

    },
    resetRender: function(){
        var length = this.collection.length
        for(var i=0;i<length;i++)
            this.collection.pop()


    },

    render_list: function(){
        var view;
        this.list=[];
        _.each(this.collection.models,function(num,i){
                    if(this.collection.is_open(num)){
                     this.list[i]=new this._current({collection:this.collection, model:num});
                        this.$(".js-list").prepend(this.list[i].render().el);
                    }else{if(num.get('is_level')){
                        this.list[i]=new this._item({collection:this.collection, model:num});
                        this.$(".js-list").prepend(this.list[i].render().el);
                    }else{
                        this.list[i]=new this._sheet_item({collection:this.collection, model:num});
                        this.$(".js-list").prepend(this.list[i].render().el);
                    }}
            },this);
        this.$('.js-list-insert').slideDown("slow",function(){$(window).trigger('resize');});
    },


    block: function(param,bool){  //флаг на блокирование параметра
        if(bool!=undefined)
            this.flag[param]=bool;
        else
            return this.flag[param];
    },
    flag: {save : true},

    save: function(a){
        if(!this.block('save'))
            return false;
        var elem = $(a.currentTarget);
        var form=this.$('.js-add')
        var data = {elem: {}};
        $('input',form).each(function(){
            data.elem[$(this).attr('name')]=$(this).val();

        });
        $('input:checked',form).each(function(){
            data.elem[$(this).attr('name')]=$(this).val();
        });
        data.elem['is_level']=+data.elem['is_level']
        var id= this.collection.get_current().get('id');
        if(_.isNumber(id))
            data.elem['parent_id']=this.collection.get_current().get('id');
        else data.elem['is_unlinked']=false;
        this.collection.current_branch.create(data,{url:'/api/support/know_base/add_elem' });
        return false;
    },



    add: function(a){
        this.display_add(null,a);
        return false;
    },

    display_add  : function(error,a){    //отображение формы ввода с ошибками или без
        if(error!=null){
            _.each(error,function(val,key){
                $("input[name='"+key+"']",".js-add").val(val[0])
            },this)

        }else{
            this.$('.js-add-button').addClass('hidden');
            this.$('.js-minus-button').removeClass('hidden');
            this.$('.js-add').slideDown("fast");
            $()
        }
    },

    addClose: function(a){
        this.$("input",".js-add").not("[type='radio']").val('');
        $('input:checked').removeAttr('checked');
        this.$('.js-add').slideUp("fast");
        this.$('.js-add-button').removeClass('hidden');
        this.$('.js-minus-button').addClass('hidden');
        return false;
    },

    sync: function(a,b,c){
        this.render();
        this.addClose();
        this.block('save',true);
        //var id=a.cid
        //this.collection.getByCid(id).trigger('active');


    },
    error: function(a,b,c){
        if(a.attributes!=undefined){
            cid= a.cid
            this.collection.remove(this.collection.getByCid(cid))
            var error = eval('('+b.responseText+')')
            this.block('save',true)

                this.display_add(error);
        }
    },




    _sheet_item : Backbone.View.extend({

        template: JST['sales/know_base/sheet_item'],
        tagName:  "li",

        initialize: function(){
            this.$el.attr("data-href",this.model.get('url_issue'));
            this.className='hover arrow_to';
            this.model.on('remove',this.remove_lazy,this);
            this.model.on('active',this.edit,this);
        },
        events: {
            "click": 'active',
            "click a": 'active'
        },
        remove_lazy: function(){
            this.$el.slideUp('fast');
        },

        render: function() {
            var item =this.model;
            this.$el.html(this.template({data : item.toJSON()}))
            return this;
        },

        edit :function(a){
            this.$el.attr("data-href",this.model.get('podr_create_url'));
            this.$el.trigger('click',{mode : 'edit'})
            this.$el.attr("data-href",this.model.get('url'));
        }





    }),

    _item : Backbone.View.extend({

        template : JST['sales/know_base/item'],
        tagName:  "li",
        className : 'hover indent',
        initialize: function(){
            this.$el.attr("data-href",this.model.get('url_issue'));
            this.className='hover indent';
            this.model.on('remove',this.remove_lazy,this);
            this.model.on('active',this.edit,this);
        },
        events: {
            "click": 'change_current'
        },

        remove_lazy: function(){
            this.$el.slideUp('fast');
        },


        change_current: function(){
            this.collection.change_current(this.model);
            return false;
        },
        render: function() {
            var item =this.model;
            this.$el.html(this.template({data : item.toJSON()}))
            return this;
        },


        edit :function(a){
            this.$el.attr("data-href",this.model.get('podr_create_url'));
            this.$el.trigger('click',{mode : 'edit'})
            this.$el.attr("data-href",this.model.get('url'));
        }





    }),


    _current : Backbone.View.extend({

        template : JST['sales/know_base/list'],
        tagName:  "li",
        className : "hover indent active",

        initialize: function(){
            //this.className=this.options['className'];
            this.$el.attr("data-href",this.model.get('url'));
            this.model.on('remove',this.remove_lazy,this);
            this.model.on('active',this.edit,this);
            this.model.on('non-active',this.remove_lazy,this);
        },
        events: {
            "click": 'active',
            "click a": 'active'
        },

        remove_lazy: function(){
            this.$('.js-list-insert').slideUp('slow');
        },

        render: function() {
            var item =this.model;
            this.$el.html('')
            this.render_list();
            return this;
        },

        render_list: function(){
            var view;
            this.list=[];
            var sum='';
            var content = this.template({data: {title:this.model.get('title')}});
            this.$el.html(content);
            this.collection.current_branch.each(function(num,i){
                if(num.get('is_level')){
                    this.list[i]=new this._item({collection:this.collection, model:num});
                    sum=this.list[i].render().el
                }else{
                    this.list[i]=new this._sheet_item({collection:this.collection, model:num});
                    sum=this.list[i].render().el;
                }
                this.$('.js-list-insert').append(sum);
            },this);
        },


        active :function($this){

            return true;
        },
        edit :function(a){
            this.$el.attr("data-href",this.model.get('podr_create_url'));
            this.$el.trigger('click',{mode : 'edit'})
            this.$el.attr("data-href",this.model.get('url'));
        },
        _sheet_item : Backbone.View.extend({

            template: JST['sales/know_base/sheet_item'],
            tagName:  "li",
            className: 'arrow_to hover',
            initialize: function(){
                this.$el.attr("data-href",this.model.get('url_issue'));
                this.className='hover indent';
                this.model.on('remove',this.remove,this);
                this.model.on('active',this.edit,this);
            },
            events: {
                "click": 'active',
                "click a": 'active'
            },


            render: function() {
                var item =this.model;
                this.$el.html(this.template({data : item.toJSON()}))
                return this;
            },

            active :function($this){

                return true;
            },
            edit :function(a){
                this.$el.attr("data-href",this.model.get('podr_create_url'));
                this.$el.trigger('click',{mode : 'edit'})
                this.$el.attr("data-href",this.model.get('url'));
            }





        }),

        _item : Backbone.View.extend({

            template : JST['sales/know_base/item'],
            tagName:  "li",
            className : 'hover indent',
            initialize: function(){
                this.$el.attr("data-href",this.model.get('url_issue'));
                this.className='hover indent';
                this.model.on('remove',this.remove,this);
                this.model.on('active',this.edit,this);
            },
            events: {
                "click": 'next_current',
                "click a": 'active'
            },


            next_current: function(){
                this.collection.next_current(this.model);
                return false;
            },
            render: function() {
                var item =this.model;
                this.$el.html(this.template({data : item.toJSON()}))
                return this;
            },

            active :function($this){

                return true;
            },
            edit :function(a){
                this.$el.attr("data-href",this.model.get('podr_create_url'));
                this.$el.trigger('click',{mode : 'edit'})
                this.$el.attr("data-href",this.model.get('url'));
            }





        })





    })




});
