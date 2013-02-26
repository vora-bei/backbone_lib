TiragSales.Models.User = BackList.Models.Basic.extend({
    nameModel:'user'
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


