function caGraph(el, data) {
	// set up the D3 visualisation in the specified element
  el.data('artifact', 'graph');
	this.w = el.innerWidth();
	this.h = el.innerHeight();
	this.nodePair = {};

	this.force = d3.layout.force()
	.linkDistance(150)
	.charge(-500)
	.size([this.w, this.h]);

	this.nodes = this.force.nodes(),
	this.links = this.force.links();

	this.svg = d3.select(el[0]).append("svg:svg")
	.attr("width", this.w)
	.attr("height", this.h);

	this.div = d3.select('body').append('div')
	.attr('class', 'tooltip')
	.style('opacity', 0);

	if(data.relationlist.length > 0) {
		this.load(data);
	}
	// Make it all go
	this.update();

	$.subscribe('resize', this.resize.bind(this));
}

caGraph.prototype.resize = function(e, width, height) {
	this.svg.attr('width', width).attr('height', height);
	this.force.size([width, height]);
};

// Add and remove elements on the graph object
caGraph.prototype.addNode = function (id) {
	if(this.findNodeIndex(id) >-1) return true;
	this.nodes.push({"id":id});
	// this.update();
};

caGraph.prototype.removeNode = function (id) {
	var i = 0;
	var n = this.findNode(id);
	while (i < links.length) {
		if ((this.links[i]['source'] == n)||(this.links[i]['target'] == n)) this.links.splice(i,1);
		else i++;
	}
	this.nodes.splice(this.findNodeIndex(id),1);
	// this.update();
};

caGraph.prototype.addLink = function (source, target, typeid, type, facts) {
	var np = source + "_" + target;
	if(this.nodePair[np]) {
		this.nodePair[np][typeid] = {
			type: type,
			note: facts
		};
	} else {
		this.nodePair[np] = {};
		this.nodePair[np][typeid] = {
			type: type,
			note: facts
		};
		this.links.push({"source":this.findNode(source),"target":this.findNode(target)});
	}
	// this.update();
};

caGraph.prototype.removeLink = function (source, target, typeid) {
	var np = source+'_'+target;
	console.log('deleting '+np+typeid);
	delete this.nodePair[np][typeid];

	if(Object.keys(this.nodePair[np]).length <= 0) {
		delete this.nodePair[np];
		this.links.splice(this.findLinkIndex(source, target),1);
	}

	// this.update();
}

caGraph.prototype.findNode = function(id) {
	for (var i in this.nodes) {if (this.nodes[i]["id"] === id) return this.nodes[i]};
	return null;
};

caGraph.prototype.findNodeIndex = function(id) {
	for (var i in this.nodes) {if (this.nodes[i]["id"] === id) return i};
	return -1;
};

caGraph.prototype.findLink = function(source, target) {
	for (var i in this.links) {if (this.links[i].source == source && this.links[i].target == target) return this.links[i]};
	return null;
};

caGraph.prototype.findLinkIndex = function(source, target) {
	for (var i in this.links) {if (this.links[i].source == source && this.links[i].target == target) return i};
	return -1;
}

caGraph.prototype.moveTo = function(d) {
	return 'M'+d.source.x+','+d.source.y;
};

caGraph.prototype.lineTo = function(d) {
	return 'L'+d.target.x+','+d.target.y;
};

caGraph.prototype.update = function () {
	var _this = this;
	var link = this.svg.selectAll(".link")
	.data(this.force.links(), function(d){
		return d.source.id + '-' + d.target.id;
	});
	/*'/graphs', JSON.stringify(_this.nodePair[d.source.id+'_'+d.target.id].relations)*/
	var linkenter = link.enter().insert("line", ".node")
	.attr('class', 'link')
	.attr('style', function(d){
		var width = Object.keys(_this.nodePair[d.source.id+'_'+d.target.id]).length+1;
		return 'stroke-width:'+width; })
		.on('mouseover', function(d){
			d3.select(this).transition()
			.style('stroke', '#00B9D2');
			_this.div.html(formatTooltip(_this.nodePair[d.source.id+'_'+d.target.id]))
			.style('left', (d3.event.pageX) + 'px')
			.style('top', (d3.event.pageY-_this.div[0][0].offsetHeight) + 'px');

			_this.div.transition()
			.style('opacity', 0.7);
			calog({
				operation: 'show link info',
				artifact: 'graph',
				data: JSON.stringify({ link: d.id })
			});
		})
		.on('mouseout', function(d){
			d3.select(this).transition()
			.style('stroke', '#ccc');
			_this.div.transition()
			.style('opacity', 0);
			calog({
				operation: 'hide link info',
				artifact: 'graph',
				data: JSON.stringify({ link: d.id })
			});
		});
		var link_label = this.svg.selectAll('text')
		.data(this.links, function(d){
			return d.source.id + '-' + d.target.id;
		})
		.enter().append('text')
		.attr('class', 'linktext')
		// .attr("y", function(d) {
		// 	return (d.source.y + d.target.y) / 2;
		// })
		// .attr("x", function(d) { return (d.source.x + d.target.x) / 2; })
		.attr("text-anchor", "middle")
		// .attr('dx', 12)
		// .attr('dy', '.35em')
		.text(function(d) {
			var link = _this.nodePair[d.source.id + '_' + d.target.id];
			var rel = [];
			for (var key in link) {
				rel.push(link[key].type);
			}
			return rel.join(' / ');
		});

		link.exit().remove();
		//	    				.attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

		var node = this.svg.selectAll(".node")
		.data(this.force.nodes(), function(d){ return d.id; });

		this.force.drag().on('dragend', function(d) {
			calog({
				operation: 'drag node',
				artifact: 'graph',
				data: JSON.stringify({ node: d.id })
			});
			d.fixed = true;
		})


		var nodeenter = node.enter().append("svg:g")
			.attr("class", 'node')
			.call(this.force.drag)
		;
		nodeenter.append('svg:image')
			.attr('class', 'circle')
			.attr('xlink:xlink:href', '/imgs/icon_person.jpg')
			.attr('x', -8)
			.attr('y', -8)
			.attr('width', 20)
			.attr('height', 20)
		;

		nodeenter.append('svg:text')
			.attr('class', 'nodetext')
			.attr('dx', 12)
			.attr('dy', '.35em')
			.text(function(d) { return d.id })
		;

		node.exit().remove();

		// Restart the force layout.
		this.force.on("tick", function () {
			link.attr('x1', function(d){ return d.source.x; })
			.attr('y1', function(d){ return d.source.y; })
			.attr('x2', function(d){ return d.target.x; })
			.attr('y2', function(d){ return d.target.y; })
			link_label.attr("x", function(d) {
				return (d.source.x + d.target.x) / 2;
			})
			.attr("y", function(d) { return (d.source.y + d.target.y) / 2; })
			;

			node.attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')'; });
		});

		this.force.start();

		// Format json-style link data in clean way for display
		// A typical link looks like:
		// {"56":{"type":["related"],"facts":["New Event start: 2014-01-01T00:00:00 end: 2014-01-01T01:00:00 "]}}
		function formatTooltip(obj) {
			var str = '<ul>';
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (!parseInt(key)) { // if it is a number, it is id. Do not show
						str += '<li><span class="tooltip_key">' + capitaliseFirstLetter(key) + ":</span>";
					}
					if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
						str += formatTooltip(obj[key]);
					} else {
						str += obj[key];
					}
				}
			}
			str += "</ul>"

			function capitaliseFirstLetter(string)
			{
				return string.charAt(0).toUpperCase() + string.slice(1);
			}

			return str;
		}
	};

	caGraph.prototype.reload = function(data) {
		this.nodePair = {};

		this.force = d3.layout.force()
		.linkDistance(150)
		.charge(-500)
		.size([this.w, this.h]);

		this.nodes = this.force.nodes(),
		this.links = this.force.links();

		if(data.relationlist.length > 0) this.load(data);
		// Make it all go
		this.update();
	};

	caGraph.prototype.load = function(data) {
		var _this = this;
		var link = {};
		var relationlist = data.relationlist;
		for(var idx in relationlist) {
			var d = relationlist[idx];
			var did = d.id || d.rid;
			if(did){
				this.addNode(d.name);
				if(!link[did]) {
					link[did] = [];
					link[did].push(d.relation);
					var facts = '';
					if(d.text) facts += d.text + ' ';
					if(d.ca_location_location) facts += 'location: ' + d.ca_location_location + ' ';
					if(d.start) facts += 'start: ' + d.start + ' ';
					if(d.end) facts += 'end: ' + d.end + ' ';
					link[did].push(facts);
				}
				link[did].push(d.name);
			}
		}

		Object.keys(link).forEach(function(l){
			var lk = link[l];
			var r = lk.splice(0,1);
			var f = lk.splice(0,1);
			lk.sort();
			for(var i=0; i<lk.length; i++){
				for(var j=i+1; j<lk.length; j++){
					_this.addLink(lk[i],lk[j],l,r, f);
				}
			}
		})
	};

	caGraph.prototype.unload = function(id) {
		var _this = this;
		var rmlist = [];

		Object.keys(this.nodePair).forEach(function(np){
			var n = _this.nodePair[np];
			Object.keys(n).forEach(function(typeid){
				if(typeid == id){
					rmlist.push(np)
				}
			})
		})
		var source = "";
		var target = "";
		var source_target = [];
		for(var i in rmlist) {
			source_target = rmlist[i].split('_');
			source = source_target[0];
			target = source_target[1];
			this.removeLink(source, target, id);
		}
	};
