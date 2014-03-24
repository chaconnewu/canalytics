//to be revised...
getMarker = function(location) {
		  for (var i=0; i<window.markers.length; i++) {
		    if(window.markers[i].title === location) {
          var marker = window.markers[i];
		      window.map.setCenter(window.markers[i].getPosition());
		      return false;
	      }
		  }
		  return false;
};

generateUUID = function() {
  var d, uuid;
  d = new Date().getTime();
  return uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var f, r;
    r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    f = c === 'x' ? r : r & 0x7 | 0x8;
    return f.toString(16);
  });
};

$(document).ready(function() {
	//set body heigh and weight to ensure it has some value
	$("body").height($(window).height());
	$("body").width($(window).width());
	panel_width = 165;
	
	$(function() {
	  $( "#accordion" ).accordion({
		active:false,
		collapsible:true,
		heightStyle:'content'
		});
	});

	$(".leftslidingmenu").width(panel_width);
	//$(".rightslidingmenu").width(panel_width);
	
	var container = $("#container");
	container.width($(window).width() - panel_width - $(".lefttrigger").width() - 25);
	//container.width($(window).width() - panel_width*2 - $(".lefttrigger").width()*2 - 25);
	container.height($(window).height());
	container.css("left", panel_width+20);
	
	//initialize windows to hold modules, i.e. docs, map, calendar, relationship graph
	caWindows.parentdiv = $("#container");

	//initialize balloons
	$.balloon.defaults.classname = 'balloontip';
	$.balloon.defaults.css = null;
	$.balloon.defaults.position = 'right';
	$.balloon.defaults.hideDuration = 0;
	$.balloon.defaults.minLifetime = 0;
	
	//initialize caPeople
	capeople = new caPeople();
	
	//initialize caLocation
	calocation = new caLocation();
	
	//initialize google map service
	window.geocoder = new google.maps.Geocoder();
	window.mapOptions = {
        center: new google.maps.LatLng(40.7933, -77.8603),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
	
	//initialize dropdown lists
	window.dropdownlists = {};
	window.dropdownlists.locationlists = [];
	window.dropdownlists.peoplelists = [];
	window.dropdownlists.relationlists = [];

    // resize container when browser window resizes
    $(window).resize(function() {
        container.width($(window).width() - panel_width - $(".lefttrigger").width() - 25);
    })
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
	/*$(".righttrigger").click(function(){
		$(".rightslidingmenu").slideToggleWidth();
		$(this).toggleClass("active");
		if($(this).hasClass("active")) {
			container.width(container.width()+panel_width);
		} else {
			container.width(container.width()-panel_width);
		}
		return false;
	});*/
	
							
	/*scheduler.config.xml_date = "%Y-%m-%d %H:%i";
	scheduler.config.fist_hour = 8;
	scheduler.config.last_hour = 17;
	scheduler.config.start_on_monday = true;
	scheduler.init("cascheduler", null, "month");
	scheduler.load("/schedulers?uid="+scheduler.uid());
	
	var dp = new dataProcessor("/schedulers");
	dp.init(scheduler);*/
});

jQuery.fn.extend({
  slideShow: function() {
    return this.each(function() {
      jQuery(this).animate({width: 'show'},10);
    });
  },
  slideHide: function() {
    return this.each(function() {
      jQuery(this).animate({width: 'hide'},10);
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