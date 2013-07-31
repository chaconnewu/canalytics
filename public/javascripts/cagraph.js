function caGraph(el, data) {
		// set up the D3 visualisation in the specified element
    this.w = el.innerWidth(),
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
																
		if(data.length > 0) this.load(data);
    // Make it all go
    this.update();
}

// Add and remove elements on the graph object
caGraph.prototype.addNode = function (id) {
	if(this.findNodeIndex(id) >-1) return true;
    this.nodes.push({"id":id});
  this.update();
};

caGraph.prototype.removeNode = function (id) {
	var i = 0;
  var n = this.findNode(id);
  while (i < links.length) {
		if ((this.links[i]['source'] == n)||(this.links[i]['target'] == n)) this.links.splice(i,1);
    else i++;
  }
  this.nodes.splice(this.findNodeIndex(id),1);
  this.update();
};

caGraph.prototype.addLink = function (source, target, typeid, type) {
	var np = source + "_" + target;
	if(this.nodePair[np]) {
		this.nodePair[np]['num']++;
		this.nodePair[np]['relations'].push(typeid);
	} else {
		this.nodePair[np] = {};
		this.nodePair[np]['num'] = 1;
		this.nodePair[np]['relations'] = [];
		this.nodePair[np]['relations'].push(typeid);
		this.links.push({"source":this.findNode(source),"target":this.findNode(target)});
	}
	this.update();
};

caGraph.prototype.removeLink = function (source, target, typeid, type) {
	var np = this.nodePair[source+'_'+target];
	this.nodePair[source+'_'+target].num--;
	np.relations.splice(np.relations.indexOf(typeid), 1);

	if(this.nodePair[source+'_'+target].num <= 0) {
		delete this.nodePair[source+'_'+target];
		this.links.splice(this.findLinkIndex(source, target),1);
	}
	this.update();
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
	    												.data(this.force.links(), function(d){ return d.source.id + '-' + d.target.id; });
	/*'/graphs', JSON.stringify(_this.nodePair[d.source.id+'_'+d.target.id].relations)*/
	var linkenter = link.enter().insert("line", ".node")
							.attr('class', 'link')
							.on('mouseover', function(d){
								d3.select(this).transition()
															 .style('stroke', '#00B9D2');
								_this.div.html(JSON.stringify(_this.nodePair[d.source.id+'_'+d.target.id].relations))
												  .style('left', (d3.event.pageX) + 'px')
													.style('top', (d3.event.pageY-_this.div[0][0].offsetHeight) + 'px');

								_this.div.transition()
												 .style('opacity', 0.7);
								})
							.on('mouseout', function(){
								d3.select(this).transition()
															 .style('stroke', '#ccc');
								_this.div.transition()
												 .style('opacity', 0);
								});

	link.exit().remove();
//	    				.attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

	var node = this.svg.selectAll(".node")
	    														.data(this.force.nodes(), function(d){ return d.id; });
	  
	var nodeenter = node.enter().append("svg:g")
	    					.attr("class", 'node');
								nodeenter.append('svg:image')
								.attr('class', 'circle')
								.attr('xlink:xlink:href', '/imgs/icon_person.jpg')
								.attr('x', -8)
								.attr('y', -8)
								.attr('width', 20)
								.attr('height', 20);
								nodeenter.append('svg:text')
										.attr('class', 'nodetext')
										.attr('dx', 12)
										.attr('dy', '.35em')
										.text(function(d) { return d.id });

  node.exit().remove();

  // Restart the force layout.
	this.force.on("tick", function () {
		link.attr('x1', function(d){ return d.source.x; })
				.attr('y1', function(d){ return d.source.y; })
				.attr('x2', function(d){ return d.target.x; })
				.attr('y2', function(d){ return d.target.y; })
				.attr('style', function(d){ 
					var width = _this.nodePair[d.source.id+'_'+d.target.id].num+1;
					return 'stroke-width:'+width; });
		
		node.attr('transform', function(d){ return 'translate(' + d.x + ',' + d.y + ')'; });
	});
	
  this.force.start();
};

caGraph.prototype.load = function(data) {
	var _this = this;
	var link = {};

	for(var idx in data) {
		var d = data[idx];
		this.addNode(d.name);
		var did = d.id;
		if(!link[did]) {
			link[did] = [];
			link[did].push(d.relationship);
		}
		link[did].push(d.name);
	}
	Object.keys(link).forEach(function(l){
		var lk = link[l];
		var r = lk.splice(0,1);
		lk.sort();
		for(var i=0; i<lk.length; i++){
			for(var j=i+1; j<lk.length; j++){
				_this.addLink(lk[i],lk[j],l,r);
			}
		}
	})
};

caGraph.prototype.unload = function(data) {
	var _this = this;
	var link = {};

	for(var idx in data) {
		var d = data[idx];
		var did = d.id;
		if(!link[did]) {
			link[did] = [];
			link[did].push(d.relationship);
		}
		link[did].push(d.name);
	}
	Object.keys(link).forEach(function(l){
		var lk = link[l];
		var r = lk.splice(0,1);
		lk.sort();
		for(var i=0; i<lk.length; i++){
			for(var j=i+1; j<lk.length; j++){
				_this.removeLink(lk[i],lk[j],l,r);
			}
		}
	})
};