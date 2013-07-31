$(document).ready(function() {
	//set body heigh and weight to ensure it has some value
	$("body").height($(window).height());
	$("body").width($(window).width());
	panel_width = 165;
	
	$( "#accordion" ).accordion(); 
  //var nav_tree = dhtmlXTreeFromHTML("nav_panel");

	$(".leftslidingmenu").width(panel_width);
	$(".rightslidingmenu").width(panel_width);
	
	var container = $("#container");
	container.width($(window).width() - panel_width*2 - $(".lefttrigger").width()*2 - 25);
	container.height($(window).height());
	container.css("left", panel_width+20);
	
	//register event triggers
	$(".lefttrigger").click(function(){
		$(".leftslidingmenu").slideToggleWidth();
		$(this).toggleClass("active");
		if($(this).hasClass("active")) {
			container.width(container.width()+panel_width);
			container.animate({
				left: parseInt(container.css("left"),10)-panel_width
			}, "slow");
		} else {
			container.width(container.width()-panel_width);
			container.animate({
				left: parseInt(container.css("left"),10)+panel_width
			}, "slow");
		}
		return false;
	});
	$(".righttrigger").click(function(){
		$(".rightslidingmenu").slideToggleWidth();
		$(this).toggleClass("active");
		if($(this).hasClass("active")) {
			container.width(container.width()+panel_width);
		} else {
			container.width(container.width()-panel_width);
		}
		return false;
	});
});

jQuery.fn.extend({
  slideShow: function() {
    return this.each(function() {
      jQuery(this).animate({width: 'show'});
    });
  },
  slideHide: function() {
    return this.each(function() {
      jQuery(this).animate({width: 'hide'});
    });
  },
  slideToggleWidth: function() {
    return this.each(function() {
      var el = jQuery(this);
      if (el.css('display') == 'none') {
        el.slideShow();
      } else {
        el.slideHide();
      }
    });
  }
});