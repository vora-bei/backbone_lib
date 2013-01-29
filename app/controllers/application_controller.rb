class ApplicationController < ActionController::Base
  layout 'application'
  protect_from_forgery
  def index

  end
  def test
    render :layout => 'qunit'
  end
end
