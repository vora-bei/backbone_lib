class User < ActiveRecord::Base
  attr_accessible :family, :name, :phone
end
