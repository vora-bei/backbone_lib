TiragSales.Models.User = Backbone.ModelBasic.extend({
    nameModel:'user',
    url:function() {
        var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
        if (this.isNew()) return base;
        base=base.split('?')[0];
        return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    }
})