/**
 * Created with JetBrains RubyMine.
 * User: aravak
 * Date: 29.01.13
 * Time: 20:22
 * To change this template use File | Settings | File Templates.
 */
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
//= require_tree ./Backbone
//=require qunit

test( "hello test", function() {
    ok( 1 == "1", "Passed!" );
});