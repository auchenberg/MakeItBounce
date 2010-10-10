var loadPixelData, loadImageUrl;

// Code forked from http://github.com/robhawkes/google-bouncing-balls

$(function() {
	var canvas = $("#c");
	var canvasHeight;
	var canvasWidth;
	var ctx;
	var dt = 0.1;
	var pixelBlockSize = 10;
	var pointCollection;
	var points;
	
	function init() {
		updateCanvasDimensions();
		initEventListeners();
		timeout();
		
		domCanvas = document.getElementById("c");
    	domCanvasContext = domCanvas.getContext("2d");
    	
    	var queryUrl = queryString("url");
    	var queryResolution =  queryString("r");
    	
    	if(queryUrl && queryResolution) {   
    	    loadImageUrl(decodeURIComponent(queryUrl), parseInt(queryResolution,10))
    	} else {     
    	    loadImageUrl("http://cdn.physorg.com/newman/gfx/news/hires/2009/googlelogo.jpg",10 )
    	}
	}
	
	function initEventListeners() {
		$(window).bind('resize', updateCanvasDimensions).bind('mousemove', onMove);
        window.addEventListener("hashchange", onHashChanged, false); 
		$('button').click(onSaveButtonClick);
		
		$('input[type=range]').change(onChangeChanged);
		
		//$('#attribution a').click(save);
		canvas.get(0).ontouchmove = function(e) {
			e.preventDefault();
			onTouchMove(e);
		};
		
		canvas.get(0).ontouchstart = function(e) {
			e.preventDefault();
		};
	}	
	
    function queryString(ji) {
        hu = window.location.hash.substring(1);
        gy = hu.split("&");
        for (i=0;i<gy.length;i++) {
            ft = gy[i].split("=");
            if (ft[0] == ji) {
            return ft[1];
            }
        }
    }
    	
	loadImageUrl = function(url, blockSize) {
	    pointCollection = null;
	    if(blockSize) {
	        pixelBlockSize = blockSize;
	    }
	    
	    $('input[type=text]').val(url);	    
	    var image = new Image();
        image.onload = onImageLoaded;
        image.src = "proxy.php?url=" + decodeURIComponent(url);
	}
	
	loadPixelData = function(stringData) {
	   	var newPoints = [];
	   	var data = (typeof(stringData) == "object") ? stringData : JSON.parse(stringData);
    
    	for (var i=0; i < data.length; i++) {
    	    newPoints.push(new Point(data[i].x, data[i].y, 0.0, pixelBlockSize / 2, data[i].color))
    	};
    	    
	   	pointCollection = new PointCollection();
		pointCollection.points = newPoints; 
	}
	
	function onHashChanged() {
    	var queryUrl = queryString("url");
    	var queryResolution =  queryString("r");
    	
    	if(queryUrl && queryResolution) {   
    	    loadImageUrl(decodeURIComponent(queryUrl), parseInt(queryResolution,10))
    	}
	} 
	
    function onImageLoaded(e) {
        domImage = e.target;
        
    	domCanvasContext.drawImage(domImage, 0, 0);
    	imageData = domCanvasContext.getImageData(0, 0, domImage.width, domImage.height);
    	    	      	    	
    	var data = Pixelator.pixelrateImageData(pixelBlockSize, imageData, domImage.height, domImage.width); 
		points = data; 
		
		loadPixelData(data); 	
    }
    
    function onSaveButtonClick() {
        var url = $('input[type=text]').val();
        var resolution = $('input[type=range]').val();
        pointCollection = null;
        
        location.href = '#url=' + encodeURIComponent(url) + "&r=" + resolution
    }
        		
	function updateCanvasDimensions() {
		canvas.attr({height: $(window).height(), width: $(window).width()});
		canvasWidth = canvas.width();
		canvasHeight = canvas.height();

		draw();
	};
	
	function onChangeChanged(e) {
	    pixelBlockSize = parseInt($(this).val(), 10);
	    onSaveButtonClick();
	}
		
	function onMove(e) {
		if (pointCollection)
			pointCollection.mousePos.set(e.pageX, e.pageY);
	};
	
	function onTouchMove(e) {
		if (pointCollection)
			pointCollection.mousePos.set(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
	};
	
	function timeout() {
		draw();
		update();
		
		setTimeout(function() { timeout() }, 30);
	};
	
	function draw() {
		var tmpCanvas = canvas.get(0);

		if (tmpCanvas.getContext == null) {
			return; 
		};
		
		ctx = tmpCanvas.getContext('2d');
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		if (pointCollection)
			pointCollection.draw();
	};
	
	function update() {		
		if (pointCollection)
			pointCollection.update();
	};
	
	function Vector(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
 
		this.addX = function(x) {
			this.x += x;
		};
		
		this.addY = function(y) {
			this.y += y;
		};
		
		this.addZ = function(z) {
			this.z += z;
		};
 
		this.set = function(x, y, z) {
			this.x = x; 
			this.y = y;
			this.z = z;
		};
	};
	
	
	function PointCollection() {
		this.mousePos = new Vector(0, 0);
		this.points = new Array();
		
		this.newPoint = function(x, y, z) {
			var point = new Point(x, y, z);
			this.points.push(point);
			return point;
		};
		
		this.update = function() {		
			var pointsLength = this.points.length;
			
			for (var i = 0; i < pointsLength; i++) {
				var point = this.points[i];
				
				if (point == null)
					continue;
				
				var dx = this.mousePos.x - point.curPos.x;
				var dy = this.mousePos.y - point.curPos.y;
				var dd = (dx * dx) + (dy * dy);
				var d = Math.sqrt(dd);
				
				if (d < 150) {
					point.targetPos.x = (this.mousePos.x < point.curPos.x) ? point.curPos.x - dx : point.curPos.x - dx;
					point.targetPos.y = (this.mousePos.y < point.curPos.y) ? point.curPos.y - dy : point.curPos.y - dy;
				} else {
					point.targetPos.x = point.originalPos.x;
					point.targetPos.y = point.originalPos.y;
				};
				
				point.update();
			};
		};
		
		this.draw = function() {
			var pointsLength = this.points.length;
			for (var i = 0; i < pointsLength; i++) {
				var point = this.points[i];
				
				if (point == null)
					continue;

				point.draw();
			};
		};
	};
	
	function Point(x, y, z, size, colour) {
		this.colour = colour;
		this.curPos = new Vector(x, y, z);
		this.friction = 0.8;
		this.originalPos = new Vector(x, y, z);
		this.radius = size;
		this.size = size;
		this.springStrength = 0.1;
		this.targetPos = new Vector(x, y, z);
		this.velocity = new Vector(0.0, 0.0, 0.0);
		
		this.update = function() {
			var dx = this.targetPos.x - this.curPos.x;
			var ax = dx * this.springStrength;
			this.velocity.x += ax;
			this.velocity.x *= this.friction;
			this.curPos.x += this.velocity.x;
			
			var dy = this.targetPos.y - this.curPos.y;
			var ay = dy * this.springStrength;
			this.velocity.y += ay;
			this.velocity.y *= this.friction;
			this.curPos.y += this.velocity.y;
			
			var dox = this.originalPos.x - this.curPos.x;
			var doy = this.originalPos.y - this.curPos.y;
			var dd = (dox * dox) + (doy * doy);
			var d = Math.sqrt(dd);
			
			this.targetPos.z = d/100 + 1;
			var dz = this.targetPos.z - this.curPos.z;
			var az = dz * this.springStrength;
			this.velocity.z += az;
			this.velocity.z *= this.friction;
			this.curPos.z += this.velocity.z;
			
			this.radius = this.size*this.curPos.z;
			if (this.radius < 1) this.radius = 1;
		};
		
		this.draw = function() {
			ctx.fillStyle = this.colour;
			ctx.beginPath();
			ctx.arc(this.curPos.x, this.curPos.y, this.radius, 0, Math.PI*2, true);
			ctx.fill();		
		};
	};
	
	init();
});