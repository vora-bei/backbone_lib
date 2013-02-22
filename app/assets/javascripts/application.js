// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//= require jquery
//= require jquery_ujs
// =require init
//= require ../../../vendor/assets/javascripts/underscore
//= require_tree ../../../vendor/assets/javascripts
//= require_tree ../templates
//= require_tree ./module
//= require_tree ./Backbone/model
//= require_tree ./Backbone/collection
//= require_tree ./Backbone/view
// side bar

$(function () {
    var $window = $(window)
    setTimeout(function () {
        $('.bs-docs-sidenav').affix({
            offset: {
                top: function () {
                    return $window.width() <= 980 ? 250 : 170
                }, bottom: 270
            }
        })
    }, 100)
})