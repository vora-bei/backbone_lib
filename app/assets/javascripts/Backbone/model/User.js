TiragSales.Models.User = Backbone.ModelBasic.extend({
    nameModel:'user',
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
    url:function() {
        var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
        if (this.isNew()) return base;
        base=base.split('?')[0];
        return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    }
})