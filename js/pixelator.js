(function() {       

    function pixelrateImageData(blockSize, imageData, height, width) {
        var data = [];

    	for (y = 0; y < height; y++) {
    		for (x = 0; x < width; x++) {
    			var i = x * 4 + y * 4 * width;
    			r = imageData.data[i]; // red
    			g = imageData.data[i+1]; // green
    			b = imageData.data[i+2]; // blue

    			if(r != 255 && g != 255 && b != 255) { 
    		        data.push( { x: x, y: y, color: "rgb(" +r + "," + g + "," + b +")" })
		        }

    			x = x + blockSize -1;
    		}
    		
    		y = y + blockSize -1;
    		
    	}
    	
    	return data;
    }
    
    Pixelator = {
        pixelrateImageData : pixelrateImageData
    }
    
})();

 
