/* windows.js handles divs created on-the-fly */

//a function for google map. It's not likely to be called in most of the case.
(function() {
	var ua = navigator.userAgent,
		iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
		typeOfCanvas = typeof HTMLCanvasElement,
		nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
		textSupport = nativeCanvasSupport && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
	//I'm setting this based on the fact that ExCanvas provides text support for IE
	//and that as of today iPhone/iPad current text support is lame
	labelType = (!nativeCanvasSupport || (textSupport && !iStuff)) ? 'Native' : 'HTML';
	nativeTextSupport = labelType == 'Native';
	useGradients = nativeCanvasSupport;
	animate = !(iStuff || !nativeCanvasSupport);
})();

//utility function

function bringToTop(el) {
	if ($(el).css("visibility") == "hidden") $(el).css("visibility", "visible");
	var win = caWindows.active_win;
	if (win.id == el.id) return false;
	if (win.id) $("#" + win.id).css("z-index", win.zindex);
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

	if (typeof(link) == "string") href = link
	else href = link.href;

	var win;
	if (this.wins.indexOf(windowid) > -1) {
		win = $("#" + windowid);
	} else {
		width = width ? width : this.default_width;
		height = height ? height : this.default_height;
		width = width > this.parentdiv.width() ? this.parentdiv.width() : width;
		height = height > this.parentdiv.height() ? this.parentdiv.height() : height;
		var x = Math.random() * 20;
		var y = Math.random() * 20;
		win = this.createWindow(windowid, windowname, href, x, y, width, height);

		switch (type) {
		case 'annotation':
			$('<iframe/>', {
				id: "iframe_" + windowid,
				src: href,
				frameborder: 0,
				border: 0,
				cellspacing: 0,
				overflow: 'hidden',
				style: "border:0;width:100%;height:100%;"
			}).appendTo(win);
			break;
		case 'map':
			$.get(href, function(data) {
				camap = new caMap(win, data);
				_this.createFilter(windowid);
			})
			break;
		case 'cal':
			$.get(href, function(data) {
				cacalendar = new caCalendar(win, {
					events: data,
                    year: 2015,
                    month: 7,
                    date: 10
				});
				_this.createFilter(windowid);
			})
			break;
		case 'graph':
			$.get(href, function(data) {
				cagraph = new caGraph(win, data);
				_this.createFilter(windowid);
			})
			break;
		case 'notepad':
			win.html("<iframe name='embed_readwrite' src='http://localhost:9001/p/campustheftcase?showControls=true&showChat=true&showLineNumbers=true&useMonospaceFont=false' width=600 height=600></iframe>");
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
		id: "box_" + windowid,
		css: {
			"left": x,
			"top": y,
			"width": width + 310,
			"z-index": 1
		}
	}).appendTo(this.parentdiv);
	box.addClass("cabox");

	var header = $('<div/>', {
		id: "header_" + windowid,
		css: {
			"width": width + 292,
			"height": 20,
			"border": "1px solid black"
		},
		text: windowname
	}).appendTo(box);
	header.addClass("caheader");

	var closer = $('<a/>', {
		id: "closer_" + windowid
	}).appendTo(header);
	closer.addClass("closetrigger");

	var parker = $('<a/>', {
		id: "parker_" + windowid
	}).appendTo(header);
	parker.addClass("parktrigger");

	var win = $('<div/>', {
		id: windowid,
		css: {
			"width": width,
			"height": height,
			"overflow": "scroll",
			"border": "1px solid black"
		}
	}).appendTo(box);
	win.addClass("cawindow");

	var filterbar = $('<div/>', {
		id: "filterbar_" + windowid,
	}).appendTo(box);
	filterbar.addClass("filterbar");
	filterbar.css({
		height: win.height()
	})

	box.draggable({
		containment: this.parentdiv,
		handle: header,
		cancel: "#closer_" + windowid + "," + "#parker_" + windowid,
		drag: function(event, ui) {
			var container = $(".centerpanel");
			var sidepanel = $(".sidepanel");
			if ($(this).position().top > container.height() - $(this).height()) {
				container.height(container.height() + 800);
				sidepanel.height(sidepanel.height() + 800);
			}
		}
	});
	box.resizable({
		containment: this.parentdiv,
		//alsoResize: header
		resize: function(event, ui) {
			header.css({
				width: $(this).width() - 28
			});
			win.css({
				width: $(this).width() - 310,
				height: $(this).height() - header.height() - 20
			});
			filterbar.css({
				height: win.height()
			})
		}
	});

	//register event triggers
	parker.click(function() {
		win.slideToggle();
		parker.toggleClass("active");
		return false;
	});
	closer.click(function() {
		//box.css("visibility", "hidden");
		box.remove();
		_this.wins.splice(_this.wins.indexOf(windowid), 1);
		return false;
	});

	box.click(function() {
		if ($(this).is('.ui-draggable-dragging')) {
			return;
		}
		bringToTop(this);
	});

	this.wins.push(windowid);

	return win;
};

caWindows.createFilter = function(windowid) {
	var filterbar_container = $('#filterbar_' + windowid);
    var filterbar = $('<div class="rightslidingmenu">').appendTo(filterbar_container);
    $('<a href="#" class="righttrigger">').appendTo(filterbar_container);

	$('<span>Filter:</span>').appendTo(filterbar);
		var apply_btn = $('<button type="button" style="margin: 20px; float: right">Apply</button><br><br>').appendTo(filterbar);
	var location_div = $('<div />').appendTo(filterbar);
	$('<input type="checkbox" name="check_location" value="check_location">').appendTo(location_div);
	var location_select = $('<select id="filterlocation" multiple placeholder="Select locations..." tabindex="6"/>').appendTo(location_div);
	var person_div = $('<div />').appendTo(filterbar);
	$('<input type="checkbox" name="check_person" value="check_person">').appendTo(person_div);
	var person_select = $('<select name="people" multiple placeholder="Select people..." tabindex="6"/>').appendTo(person_div);
	var relation_div = $('<div />').appendTo(filterbar);
	$('<input type="checkbox" name="check_relation" value="check_relation">').appendTo(relation_div);
	var relation_select = $('<select name="relation" multiple placeholder="Select relations..." tabindex="6"/>').appendTo(relation_div);
	var time_div = $('<div />').appendTo(filterbar);
	$('<input type="checkbox" name="check_time" value="check_time"><br>').appendTo(time_div);
	var div = $('<div />').appendTo(time_div);
	var time_from = $('<span>From: </span><input id="time_from" type="datetime-local" name="from" /><br>').appendTo(div);
	var time_to = $('<span>To: </span><input id="time_to" type="datetime-local" name="to" />').appendTo(div);
	
	var time;
	
	window.dropdownlists.locationlists.push(location_select.selectize({
		hideSelected: true,
		options: calocation.location_options
	}));
	
	window.dropdownlists.peoplelists.push(person_select.selectize({
		hideSelected: true,
		options: capeople.people_options
	}));

	window.dropdownlists.relationlists.push(relation_select.selectize({
		hideSelected: true,
		options: capeople.relation_options
	}));
	
	var data = {};

    $(".righttrigger").click(function(){
        $(this).siblings().slideToggleWidth();
        $(this).toggleClass("active");
        var container = $(this).parent().siblings()[1];
        container = $(container);
        var panel_width = 249;
        if($(this).hasClass("active")) {
            container.width(container.width()+panel_width);
            container.animate({
                right: parseInt(container.css("right"),10)-panel_width
            }, "slow");
        } else {
            container.width(container.width()-panel_width);
            container.animate({
                right: parseInt(container.css("right"),10)+panel_width
            }, "slow");
        }
        return false;
    });

	apply_btn.click(function(){
		var _this = this;
		data.ca_case_id = window.ca_case_id;
		if($('input[name="check_location"]').is(':checked')){
			data.location_select = location_select.val();
		}
		if($('input[name="check_person"]').is(':checked')){
			data.person_select = person_select.val();
		}
		if($('input[name="check_relation"]').is(':checked')){
			data.relation_select = relation_select.val();
		}
		if($('input[name="check_time"]').is(':checked')){
			data.time_from = $('#time_from').val();
			data.time_to = $('#time_to').val();
		}
		$.get('/filter', data, function(results){
			data = {};
			console.log(results);
			var module = $(_this).parent().attr('id');
			if(results){
				if(module.indexOf('map') > -1){
					window.camap.reload(results);
				}else if(module.indexOf('cal') > -1){
					var eid = [];
					for(var i in results){
						if(results[i].eid) eid.push(results[i].eid);
					}
					$.get('/calendars/search/'+window.ca_case_id, {eid: eid}, function(data){
						window.cacalendar.reload(data);
					})
				}else if(module.indexOf('graph') > -1){
					results.relationlist = results;
					window.cagraph.reload(results);
				}
			}
		});
	})
}
