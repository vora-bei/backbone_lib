Backbone.CollectionBasic = Backbone.Collection.extend({
    filter: {},
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


    category : '',
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