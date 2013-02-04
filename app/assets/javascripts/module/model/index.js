Backbone.ModelBasic = Backbone.Model.extend({
    nameModel : 'model',
    get_relational: function (name){
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
    toJSON: function(){
        var hasWithRoot={};
        hasWithRoot[this.nameModel]=this.attributes;
        return _.clone(hasWithRoot);
    }

});
