TiragSales.Models.User = BackList.Models.Basic.extend({
    nameModel:'user',

    url_for_update_name: function(){
        return 'users_name/1'
    },
    url_for_update_title: function(){
        return 'users/1'
    },
    url:function() {
        var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
        if (this.isNew()) return base;
        base=base.split('?')[0];
        return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    }
})


TiragSales.Models.UserWithRelational = BackList.Models.Basic.extend({
    nameModel: 'user',
    _phones: BackList.Collections.Basic.extend({
        model: BackList.Models.Basic.extend({
            nameModel: 'phone',
            url_for_update_phone: function(id){
                return 'phones'+'/'+this.id
            }
        })
    })
})





