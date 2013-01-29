TiragSales.Collections.Basic = Backbone.Collection.extend({
    filter: {},
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
    url_delete: function(id){
        return  this.url_base+'/'+id;
    },
    url: function(){
        var url;

        if(!_.isEmpty(this.filter))
        {
            url =  _.reduce(this.filter,function(memo,value,key,list){
                if(value.indexOf('=')+1)
                    return memo+value+'&'
                return memo+key+'='+value+'&'
            },this.url_base+'?');
        }
        else
        {
            url=this.url_base+'?';
        }
        url+=this.category;

        return url;
    }


});