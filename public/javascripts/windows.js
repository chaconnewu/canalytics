/* windows.js handles divs created on-the-fly */

//a function for google map. It's not likely to be called in most of the case.
(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

//utility function
function bringToTop(el) {
	if($(el).css("visibility") == "hidden") $(el).css("visibility", "visible");
	var win = caWindows.active_win;
	if(win.id == el.id) return false;
	if(win.id) $("#"+win.id).css("z-index", win.zindex);
	win.id = $(el).attr("id");
	win.zindex = $(el).css("z-index");
	$(el).animate({
		zIndex: 999
	}, "fast");
};

var caWindows = {};
caWindows.parentdiv = null; //parent is the id of the parent element that all ca windows will attach to	
caWindows.default_width = 640;
caWindows.default_height = 480;
caWindows.wins = [];
caWindows.active_win = {}; //keep record of some status of the current active window
	
caWindows.openWindow = function(link, windowid, windowname, type, width, height) {
		var href;
		var _this = this;
		
		if(typeof(link) == "string")
			href = link
		else
			href = link.href;
		
		var win;
		if(this.wins.indexOf(windowid)>-1) {
			win = $("#"+windowid);
		} else {
			width = width?width:this.default_width;
			height = height?height:this.default_height;
			width = width>this.parentdiv.width()?this.parentdiv.width():width;
			height = height>this.parentdiv.height()?this.parentdiv.height():height;
			var x = Math.random()*20;
			var y = Math.random()*20;
			win = this.createWindow(windowid, windowname, href, x, y, width, height);
			
			switch(type){
				case 'annotation':
					$('<iframe/>', {
						id: "iframe_"+windowid,
						src: href,
						frameborder: 0,
						border: 0,
						cellspacing: 0,
						overflow: 'hidden',
						style: "border:0;width:100%;height:100%;"
					}).appendTo(win);
					break;
				case 'map':
					$.get(href, function(data){
						camap = new caMap(win, data);
					})
					break;
				case 'cal':
					$.get(href, function(data){
						new caCalendar(win, {events: data});
					})
					break;
				case 'graph':
					$.get(href, function(data){
						cagraph = new caGraph(win, data);
					})
					break;
				default:
					break;
			}
		}
		
		bringToTop(win.parent()[0]);

		return false;
};
	
caWindows.createWindow = function(windowid, windowname, href, x, y, width, height) {
		var _this = this;
		var box = null;
		
		box = $('<div/>', {
			    id: "box_"+windowid,
					css: {"left":x, "top":y, "width":width+20, "z-index":1}
			}).appendTo(this.parentdiv);
		box.addClass("cabox");
		
		var header = $('<div/>', {
		    id: "header_"+windowid,
				css: {"width":width+10, "height":20},
				text: windowname
		}).appendTo(box);
		header.addClass("caheader");
		
		var closer = $('<a/>', {
			  id: "closer_"+windowid
		}).appendTo(header);
		closer.addClass("closetrigger");
		
		var parker = $('<a/>', {
			  id: "parker_"+windowid
		}).appendTo(header);
		parker.addClass("parktrigger");
		
		var win = $('<div/>', {
		    id: windowid,
				css: {"width":width, "height":height, "overflow":"hidden"}
		}).appendTo(box);
		win.addClass("cawindow");
		
		box.draggable({ 
			containment: this.parentdiv,
			handle: header,
			cancel: "#closer_"+windowid+","+"#parker_"+windowid,
			drag: function(event, ui) {
				var container = $(".centerpanel");
				var sidepanel = $(".sidepanel");
				if($(this).position().top > container.height()-$(this).height()) {
					container.height(container.height()+80);
					sidepanel.height(sidepanel.height()+80);
				}
			}
		});
		box.resizable({
			containment: this.parentdiv,
			//alsoResize: header
			resize: function(event, ui) {
				header.css({
					width: $(this).width()-10
				});
				win.css({
					width: $(this).width()-20,
					height: $(this).height()-header.height()-20
				})
			}
		});
		
		//register event triggers
		parker.click(function(){
			win.slideToggle();
			parker.toggleClass("active");
			return false;
		});
		closer.click(function(){
			//box.css("visibility", "hidden");
			box.remove();
			_this.wins.splice(_this.wins.indexOf(windowid), 1);
			return false;
		});
		
		box.click(function(){
			if($(this).is('.ui-draggable-dragging')) {
				return;
			}
			bringToTop(this);
		});

		this.wins.push(windowid);

		return win;
};

