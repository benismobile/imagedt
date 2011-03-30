function Symbol(name, image)
{
    this.name   = name;
    this.image  = "images/" + image;
    this.hist   = {};
    this.coords = new Array();
}

function Coords(x, y)
{
    this.x = x;
    this.y = y;
}


var house         = new Symbol("Historic house",           "strategi_ti_hist-house.png");
var garden       = new Symbol("Garden",     "strategi_ti_garden.png");
var info          = new Symbol("Information centre",       "strategi_ti_info-c.png");
var golf      = new Symbol("Golf course",         "strategi_ti_golf.png");
var caravan      = new Symbol("Caravan",     "strategi_ti_caravan.png");
var star          = new Symbol("Other tourist attraction", "strategi_ti_other_tourist.png");
var parking       = new Symbol("Park and ride",            "strategi_ti_PnR.png");
var info_seasonal = new Symbol("Information centre(s)",    "strategi_ti_info-c_sznl.png");

var symbolMap = new Array();
symbolMap[house.name]          = house;
symbolMap[garden.name]        = garden;
symbolMap[info.name]           = info;
symbolMap[golf.name]       = golf;
symbolMap[caravan.name]       = caravan;
symbolMap[star.name]           = star;
symbolMap[parking.name]        = parking;
symbolMap[info_seasonal.name]  = info_seasonal;


var diffs = null;
var currentContext = null;

// dummy firebug functions
if(!("console" in window)) 
    window.console = {
        log: function() {},
        time: function(arg) {},
        timeEnd: function(arg) {}};

function init()
{
    // main map
    var img = new Image();
    img.src = "./images/osmap3.png";
    var canvas = document.getElementById("canvas");
    var canvasContext = canvas.getContext("2d");
    try{canvasContext.drawImage(img, 0, 0);}catch(error){alert(error.msg) ; }

    // cache symbols
     cacheSymbols(1);
   
    // current selection viewers
    currentContext =     document.getElementById("canvas-current").getContext("2d");

  //  canvas.onmousemove = function(e)
//    {
  //      calculate(e, canvas, canvasContext, diffs);
  //  };
}

// cache all symbols
function cacheSymbols(draw)
{
  
    var num = 2;
    var canvas = "canvas";

    for(var symbol in symbolMap)
    {
        cacheSymbol(symbolMap[symbol], canvas + num, draw);
        ++num;
    }
}

// cache a single symbol
function cacheSymbol(symbol, canvasId, draw)
{
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");

    if(draw)
    {
        var img = new Image();
        img.src = symbol.image;
        context.drawImage(img, 0, 0);
        canvas.onmousemove = function(e)
        {
           findSymbol(canvas);
        };
        
    }
    
     
}


function blueToBinary(colourCanvas, binaryCanvas)
{

      var binaryContext = binaryCanvas.getContext("2d");

      var dataitems = ((colourCanvas.width*4) * colourCanvas.height) ;

      var context = colourCanvas.getContext("2d") ;
      
      var canvasdata =  context.getImageData(0,
                                0,
                                colourCanvas.height, colourCanvas.width);


      for(var pix = 0; pix < dataitems -1 ; pix = pix + 4)
      {
        
    	var r = canvasdata.data[pix] ;
		var g = canvasdata.data[pix+1] ;
		var b = canvasdata.data[pix+2] ;
		red = 81 ;
		green = 169 ;
		blue = 220 ;		
		var error = 85 ;

		if( (red < r-error || red > r+error ||
		    green < g-error || green > g+error || 
		   blue < b-error || blue > b+error ) )
		{
			 canvasdata.data[pix] = 255 ;
			 canvasdata.data[pix+1] = 255 ;
			canvasdata.data[pix+2] = 255 ;	
					 
		}
		else
		{
			canvasdata.data[pix] = 0 ;
			canvasdata.data[pix+1] = 0 ;
			canvasdata.data[pix+2] = 0 ;	

		}
	} 



	 binaryContext.putImageData(canvasdata, 0, 0);


}

function findSymbol(symbolCanvas)
{
    
      var searchCanvas = document.getElementById("canvas");
      var binaryCanvas = document.getElementById("binary") ;
      blueToBinary(searchCanvas, binaryCanvas) ;
      var binarySymbol = document.getElementById("binary_symbol") ;
      blueToBinary(symbolCanvas, binarySymbol) ; 
      binarySymbol.getContext("2d").scale(0.4, 0.4) ;
	  var dT = distanceTransform(binaryCanvas) ;
      var distanceCanvas = document.getElementById("distance") ;
      visualizeDistanceTransform(dT, binaryCanvas, distanceCanvas) ;
      locateSymbol(searchCanvas, distanceCanvas, binarySymbol,dT) ;
      
}


function locateSymbol(searchCanvas, distanceCanvas, binarySymbolCanvas, dT)
{
 
    var distanceContext = distanceCanvas.getContext("2d") ;
    var context = searchCanvas.getContext("2d") ;
    

	var minima = {"sum":270, "x":0, "y":0 } ;	

	distanceContext.lineWidth = 2;
	distanceContext.strokeStyle = 'rgb(255,0,0)';
	distanceContext.fillStyle = 'rgb(255,0,0)';
	context.lineWidth = 22;
	context.strokeStyle = 'rgb(255,0,0)';
	context.fillStyle = 'rgb(255,0,0)';



	for(var i = 0 ; i < distanceCanvas.height - 20 ; i++)
	{
		for(var j = 0 ; j < distanceCanvas.width - 20; j++)
		{
			
			
			var sumInBox = sumOfDistanceValues(binarySymbolCanvas, dT, j, i, 270) ;



			if(sumInBox < minima.sum)
			{
				minima.sum = sumInBox ;
				minima.x = j ;
				minima.y = i ;
				distanceContext.strokeRect(minima.x,minima.y,20,20) ;
			//	context.strokeRect(minima.x,minima.y,20,20) ;


			}
		}

	}

	//reset
	 minima.sum = 270 ; 

	distanceContext.lineWidth = 2;
	distanceContext.strokeStyle = 'rgb(0,255,0)';
	distanceContext.fillStyle = 'rgb(0,255,0)';
	context.lineWidth = 2;
	context.strokeStyle = 'rgb(0,255,0)';
	context.fillStyle = 'rgb(0,255,0)';
	distanceContext.strokeRect(minima.x,minima.y,20,20) ;
	context.strokeRect(minima.x,minima.y,20,20) ;

	
 
    
}


function visualizeDistanceTransform(dT, binaryCanvas, distanceCanvas)
{
    
       
   
    var distanceContext = distanceCanvas.getContext("2d") ;
    var context = binaryCanvas.getContext("2d") ;
    var canvasdata = context.getImageData(0,
                                0,
                                canvas.height, canvas.width);
                                
    // var canvasdata = distanceContext.createImageData(256, 256);

	var pix = 0 ;

	for(var i = 0 ; i < canvas.height ; i ++ )
      {

	  for(var j = 0 ; j < canvas.width ; j++ )
	  {
		var pixVal = 256 ;
		var distanceVal = dT[i][j] ; 

		if(distanceVal == 12 ) {pixVal = 240 ;} 
		if(distanceVal == 11 ) {pixVal = 220 ;} 
		if(distanceVal == 10 ) {pixVal = 200 ;} 
		if(distanceVal == 9 ) {pixVal = 180 ; } 
		if(distanceVal == 8 ) {pixVal = 160 ; } 
		if(distanceVal == 7 ) {pixVal = 140 ; } 
		if(distanceVal == 6 ) {pixVal = 120 ; } 
		if(distanceVal == 5 ) {pixVal = 100 ; } 
		if(distanceVal == 4 ) {pixVal = 80  ; } 
		if(distanceVal == 3 ) {pixVal =  60 ; } 
		if(distanceVal == 2 ) {pixVal =  40 ; } 
		if(distanceVal == 1 ) {pixVal = 20 ; } 
		if(distanceVal === 0 ) {pixVal = 0 ; } 
 
	

		canvasdata.data[pix] = pixVal  ;
		canvasdata.data[pix+1] = pixVal ;
		canvasdata.data[pix+2] = pixVal ;	
		pix= pix+4 ;
	   }
	}

	distanceContext.putImageData(canvasdata, 0, 0);
 

 
    
}


// calculate which symbol the mouse is currently hovering over
function calculate(e, canvas, context)
{
    var xy = getxy(e, canvas);    
    var pixdata = getPixelDataFromXY(xy.x, xy.y, context);

	

     if(pixdata != null)
      {
	  var red = pixdata.data[0] ;
	  var green = pixdata.data[1] ;
	  var blue = pixdata.data[2] ;

        document.getElementById("R").firstChild.nodeValue =  red ;
        document.getElementById("G").firstChild.nodeValue =  green ;
        document.getElementById("B").firstChild.nodeValue =  blue ;

	  var canvasdata =  context.getImageData(0,
                                0,
                                canvas.height, canvas.width);

	 
 	 var binaryContext = document.getElementById("binary").getContext("2d");
	 

	var dataitems = ((canvas.width*4) * canvas.height) ;

	for(var pix = 0; pix < dataitems -1 ; pix = pix + 4)
      {
        
		var r = canvasdata.data[pix] ;
		var g = canvasdata.data[pix+1] ;
		var b = canvasdata.data[pix+2] ;
		red = 81 ;
		green = 169 ;
		blue = 220 ;		
		var error = 85 ;

		if( (red < r-error || red > r+error ||
		    green < g-error || green > g+error || 
		   blue < b-error || blue > b+error ) )
		{
			 canvasdata.data[pix] = 255 ;
			 canvasdata.data[pix+1] = 255 ;
			canvasdata.data[pix+2] = 255 ;	
					 
		}
		else
		{
			canvasdata.data[pix] = 0 ;
			canvasdata.data[pix+1] = 0 ;
			canvasdata.data[pix+2] = 0 ;	

		}
	} 



	 binaryContext.putImageData(canvasdata, 0, 0);

	

		


	}

	var binaryCanvas = document.getElementById("binary") ;

	var dT = distanceTransform(binaryCanvas) ;

	var distanceCanvas = document.getElementById("distance") ;
	var distanceContext = distanceCanvas.getContext("2d") ;

	var pix = 0 ;

	for(var i = 0 ; i < canvas.height ; i ++ )
      {

	  for(var j = 0 ; j < canvas.width ; j++ )
	  {
		var pixVal = 256 ;
		var distanceVal = dT[i][j] ; 

		if(distanceVal == 12 ) {pixVal = 240 } ;
		if(distanceVal == 11 ) {pixVal = 220 } ;
		if(distanceVal == 10 ) {pixVal = 200 } ;
		if(distanceVal == 9 ) {pixVal = 180 } ;
		if(distanceVal == 8 ) {pixVal = 160 } ;
		if(distanceVal == 7 ) {pixVal = 140 } ;
		if(distanceVal == 6 ) {pixVal = 120 } ;
		if(distanceVal == 5 ) {pixVal = 100 } ;
		if(distanceVal == 4 ) {pixVal = 80 } ;
		if(distanceVal == 3 ) {pixVal =  60 } ;
		if(distanceVal == 2 ) {pixVal =  40 } ;
		if(distanceVal == 1 ) {pixVal = 20 } ;
		if(distanceVal == 0 ) {pixVal = 0 } ;
 
	

		canvasdata.data[pix] = pixVal  ;
		canvasdata.data[pix+1] = pixVal ;
		canvasdata.data[pix+2] = pixVal ;	
		pix= pix+4 ;
	   }
	}

	distanceContext.putImageData(canvasdata, 0, 0);
 

	var refimg = new Image() ;
	refimg.src =  "http://dlib-rainbow.ucs.ed.ac.uk/imagedt/images/info.png" ;	
//	refimg.src =  "http://dlib-rainbow.ucs.ed.ac.uk/imagedt/images/parking.png" ;	

//	refimg.src =  "http://dlib-rainbow.ucs.ed.ac.uk/imagedt/images/star.png" ;	
//	refimg.src =  "http://dlib-rainbow.ucs.ed.ac.uk/imagedt/images/manor_house.png" ; 
//	refimg.src =  "http://dlib-rainbow.ucs.ed.ac.uk/imagedt/images/info_seasonal.png" ; 
//	refimg.src =  "http://dlib-rainbow.ucs.ed.ac.uk/imagedt/images/golf.png" ; 
//	refimg.src =  "http://dlib-rainbow.ucs.ed.ac.uk/imagedt/images/country_park.png" ; 

	var red = 81 ;
	var green = 169 ;
	var blue = 220 ;		
	var binaryRefImageCanvas = convertToBinary(refimg , red, green, blue, 85) ;
	


	

	var minima = {"sum":270, "x":0, "y":0 } ;	

	distanceContext.lineWidth = 2;
	distanceContext.strokeStyle = 'rgb(255,0,0)';
	distanceContext.fillStyle = 'rgb(255,0,0)';
	context.lineWidth = 22;
	context.strokeStyle = 'rgb(255,0,0)';
	context.fillStyle = 'rgb(255,0,0)';



	for(var i = 0 ; i < distanceCanvas.height - 20 ; i++)
	{
		for(var j = 0 ; j < distanceCanvas.width - 20; j++)
		{
			
			


			var sumInBox = sumOfDistanceValues(binaryRefImageCanvas, dT, j, i, 270) ;



			if(sumInBox < minima.sum)
			{
				minima.sum = sumInBox ;
				minima.x = j ;
				minima.y = i ;
				distanceContext.strokeRect(minima.x,minima.y,20,20) ;
			//	context.strokeRect(minima.x,minima.y,20,20) ;


			}
		}

	}

	//reset
	 minima.sum = 270 ; 

	distanceContext.lineWidth = 2;
	distanceContext.strokeStyle = 'rgb(0,255,0)';
	distanceContext.fillStyle = 'rgb(0,255,0)';
	context.lineWidth = 2;
	context.strokeStyle = 'rgb(0,255,0)';
	context.fillStyle = 'rgb(0,255,0)';
	distanceContext.strokeRect(minima.x,minima.y,20,20) ;
	context.strokeRect(minima.x,minima.y,20,20) ;

	
	

    	var data = getDataFromXY(xy.x, xy.y, context);
    	var hit = null;

    if(data != null)
    {
        var hist = calculateHist(data.data);    
        hit = getBestHit(hist, false);

        addHistToPage("Current", hist, 'current-row');

        /*if(hit != null)
        {
            console.log("=> %d : %d", hit.edgesDiff, hit.edgesDist);
            }*/

        // update stats
        updateTables(hit, hist, diffs);

        // update current viewer
        currentContext.putImageData(data, 0, 0);
    }
    
    return hit;
}

function convertToBinary(colourImg, red, green, blue, error)
{

	var canvas = document.createElement("canvas") ;
	canvas.width = 20 ;
	canvas.height = 20 ;
	var context = canvas.getContext("2d") ;
	var viewpoints = document.getElementById("view-points") ;
	viewpoints.appendChild(	canvas) ;


 
	context.drawImage(colourImg,0 ,0) ;


	
	var dataitems = ((canvas.width*4) * canvas.height) ;

	var canvasdata =  context.getImageData(0,
                                0,
                                canvas.height, canvas.width);

	



	for(var pix = 0; pix < dataitems -1 ; pix = pix + 4)
      {
        
		var r = canvasdata.data[pix] ;
		var g = canvasdata.data[pix+1] ;
		var b = canvasdata.data[pix+2] ;
		


		if( (red < r-error || red > r+error ||
		    green < g-error || green > g+error || 
		   blue < b-error || blue > b+error ) )
		{
			 canvasdata.data[pix] = 256 ;
			 canvasdata.data[pix+1] = 256 ;
			canvasdata.data[pix+2] = 256 ;	
					 
		}
		else
		{
			canvasdata.data[pix] = 0 ;
			canvasdata.data[pix+1] = 0 ;
			canvasdata.data[pix+2] = 0 ;	

		}
	} 



	context.putImageData(canvasdata, 0, 0);
	

	return canvas ;

}



function sumOfDistanceValues(refImageCanvas, distanceTransform, x, y, minimum)
{
 
	var refImageCtx = refImageCanvas.getContext("2d") ;	
	var refImgData = refImageCtx.getImageData(0,0,refImageCanvas.width, refImageCanvas.height) ;
	var sumOfDistances = 0 ;
	var sumOfForegroundPixels = 0 ;
	var sumOfForegroundColPixels = new Array(refImageCanvas.width)  ;
	var sumOfForegroundRowPixels = new Array(refImageCanvas.height) ;
	var sumOfDistancesColPixels = new Array(refImageCanvas.width) ;
	var sumOfDistancesRowPixels = new Array(refImageCanvas.height) ;


	for(var i = 0 ; i < refImageCanvas.width ; i++)
	{
		sumOfDistancesColPixels[i] = 0 ;
		sumOfForegroundColPixels[i] = 0 ;
	}

	for(var j = 0 ; j < refImageCanvas.height ; j++)
	{
		sumOfDistancesRowPixels[j] = 0 ;
		sumOfForegroundRowPixels[j] = 0 ;
	}


	for(var i = 0 ; i < refImageCanvas.width ; i++)
	{

		for(var j = 0 ; j < refImageCanvas.height ; j++)
		{
			var dataitem = (j*4) + (( refImageCanvas.width*4) * i)  ; 
			if( refImgData.data[dataitem ] == 0 ) // forground pixel in reference image
			{

			

			
				sumOfDistancesRowPixels[j] = sumOfDistancesRowPixels[j] +  	distanceTransform[y + i][x + j] ; 
            		sumOfDistancesColPixels[i] = sumOfDistancesRowPixels[i] +  	distanceTransform[y + i][x + j] ; 
				

		
			}
			else
			{
				if(distanceTransform[y + i][x + j]==0 )  // foreground pixel in target
				{ 
					sumOfForegroundRowPixels[j] = sumOfForegroundRowPixels[j] + 2 ; 
					sumOfForegroundColPixels[i] = sumOfForegroundRowPixels[i] + 2 ; 
				}


			}

		}

		sumOfDistances = sumOfDistances +  sumOfDistancesColPixels[i] + sumOfForegroundColPixels[i] ;

	}


	for(var j = 0 ; j < refImageCanvas.height ; j++)
	{
		if(sumOfDistancesRowPixels[j] > 0)
		{
			sumOfDistances = sumOfDistances + sumOfDistancesRowPixels[j] + sumOfForegroundRowPixels[j]   ;
		}
			
	}
	
	return sumOfDistances ;
}

function calcMin(numbers)
{

	var min = numbers[0] ;
	for (var i = 0 ; i < numbers.length -1 ; i++)
	{		
		if(numbers[i] < min){  min = numbers[i] ; }
	}

	return min ;

}

function distanceTransform(binaryImageDataCanvas)
{
	// euclidean distance mask (scaled integer values)
	var ml1 = 3 ;
	var ml2 = 4 ;
	var ml3 = 3 ;
	var ml4 = 4 ;
	var mr1 = 3 ;
	var mr2 = 4 ;
	var mr3 = 3 ;
	var mr4 = 4 ;

	var canvas = binaryImageDataCanvas ;

	var context = canvas.getContext("2d");

	var canvasdata =  context.getImageData(0,
                                0,
                                canvas.height, canvas.width);

	var dataitems = ((canvas.width*4) * canvas.height) ;
	var rowlength = canvas.width*4 ;
	var pixelsInRow = canvas.width ;
	var numpixels = dataitems / 4 ;
	var distanceTransformArray = new Array(numpixels) ;
	// initialize foreground pixels to 0 

	var pixelcount = 0 ;

	for(var pix = 0; pix < dataitems-4 ; pix = pix + 4)
      {
		var r = canvasdata.data[pix] ;
		if(r==0) 
		{
			distanceTransformArray[pixelcount] = 0 ;				

		}
		else
		{
			distanceTransformArray[pixelcount] = 1 ;
		}
		pixelcount++ ;
	}

	//  L to R pass
	
	pixelcount = 0 ;

	for(var pix = 1; pix < dataitems-1 ; pix = pix + 4)
      {
	
		if(pix < rowlength  || pix > ( dataitems - rowlength  ) || ( pix % rowlength == 0 ) || ((pix+1) % rowlength ==0 ) )
		{
			distanceTransformArray[pixelcount] = 256 ;
			pixelcount++ ;
			continue ;
		}    

		var distances = new Array() ;

		if(distanceTransformArray[pixelcount] > 0)
		{
			distances[0] = ml1 + distanceTransformArray[pixelcount -1] ;
			distances[1] = ml2 + distanceTransformArray[pixelcount -1 - pixelsInRow] ;
			distances[2] = ml3 + distanceTransformArray[pixelcount  - pixelsInRow ] ;
			distances[3] = ml4 + distanceTransformArray[pixelcount  - pixelsInRow +1] ;
			var minimum = calcMin(distances) ;
			distanceTransformArray[pixelcount] = minimum ; 
			 
			
		} 			
		
		 
		pixelcount++ ;
	}

	//  R to L pass
	
	
	for(var pix = dataitems-1 ; pix > 0 ; pix = pix - 4)
      {
	
		if(pix < rowlength  || pix > ( dataitems - rowlength  ) || ( pix % rowlength == 0 ) || ((pix+1) % rowlength ==0 ) )
		{
				distanceTransformArray[pixelcount] = 256  ;
				pixelcount-- ;
				continue ;
		}    

		var distances = new Array(4) ;

		if(distanceTransformArray[pixelcount] > 0)
		{
			distances[0]  = mr1 + distanceTransformArray[pixelcount + 1] ;
			distances[1]  = mr2 + distanceTransformArray[pixelcount + 1 + pixelsInRow] ;
			distances[2]  = mr3 + distanceTransformArray[pixelcount + pixelsInRow ] ;
			distances[3] =  mr4 + distanceTransformArray[pixelcount + pixelsInRow -1] ;
			distances[4] = distanceTransformArray[pixelcount] ; 
			var minimum = calcMin(distances) ;
			distanceTransformArray[pixelcount] = minimum ; 
		
		} 			
		
		pixelcount-- ;
	}


	//convert distance transform into 2d array

	var dT = new Array(canvas.height) ;

	var pix = 0 ;	

	for ( var i = 0 ; i < canvas.height  ; i++ )
	{

		dT[i] = new Array(canvas.width) ;
	}



	for ( var i = 0 ; i < canvas.height  ; i++ )
	{
		for ( var j = 0 ; j < canvas.width  ; j++ )
		{
			
			dT[i][j] = distanceTransformArray[pix] ;
			pix++ ;
			
		}

	}


	return dT ;

}




// get colour data from a point on the map
function getDataFromXY(x, y, context)
{
    if(x < 10 || x > 245 || y < 10 || y > 245)
    {
        // mouse is too close to edge
        return null;
    }
    
    var size = 20;   
    return context.getImageData(x - (size / 2),
                                y - (size / 2),
                                size, size);
}

// obtain data for current pixel
function getPixelDataFromXY(x, y, context)
{
    return context.getImageData(x,
                                y,
                                1, 1);

}






// draw map legend
function drawLegend(hitTable)
{
    // delete existing legend first
    var legend = document.getElementById("images");
    while(legend.childNodes.length > 0)
    {
        legend.removeChild(legend.firstChild);
    }

    for(var hit in hitTable)
    {
        var div = document.createElement('div');
        var img = document.createElement('img');
       
        img.setAttribute('src', hitTable[hit].symbol.image);
        div.appendChild(img);

        // add events
        div.setAttribute("onmouseover", "javascript:inspectSymbol(\"" + hit + "\")");
        div.setAttribute("onmouseout", "javascript:restoreCanvas()");
        div.appendChild(document.createTextNode(hit));

        legend.appendChild(div);
    }
}

// hightlight symbols on the map
function inspectSymbol(symbolName)
{
    var symbol = symbolMap[symbolName];
    var canvas = document.getElementById("canvas");
    var canvasContext = canvas.getContext("2d");

    for(var i = 0; i < symbol.coords.length; i++)
    {
        canvasContext.strokeStyle = 'rgb(255, 0, 0)';
        canvasContext.strokeRect(symbol.coords[i].x - 10, symbol.coords[i].y - 10, 20, 20);
        canvasContext.strokeRect(symbol.coords[i].x - 9, symbol.coords[i].y - 9, 20, 20);
    }
}

// redraw map to original state
function restoreCanvas()
{
    var img = new Image();
    img.src = "images/wmsMap2.png";
    var canvas = document.getElementById("canvas");
    var canvasContext = canvas.getContext("2d");
    try{canvasContext.drawImage(img, 0, 0);}catch(error){}
}

// get current xy values of mouse
function getxy(e, o)
{
    //gets mouse position relative to object o
    var bo = getpos(o);
    var x = e.clientX - bo.x ;	//correct for canvas position, workspace scroll offset
    var y = e.clientY - bo.y ;									
    x += document.documentElement.scrollLeft;	//correct for window scroll offset
    y += document.documentElement.scrollTop;										
    return { x: x-.5, y: y-.5 }; //-.5 prevents antialiasing of stroke lines
}

// get current xy position of mouse 
function getpos(o)
{
    //gets position of object o
	var bo, x, y, b; x = y = 0;
	if(document.getBoxObjectFor) {	//moz
	    bo = o.getBoundingClientRect();
        x = bo.left; y = bo.top;
	} else if (o.getBoundingClientRect) { //ie (??)
		bo = o.getBoundingClientRect();
		x = bo.left; y = bo.top;
	} else { //opera, safari etc
		while(o && o.nodeName != 'BODY') {
			x += o.offsetLeft;
			y += o.offsetTop;
			b = parseInt(document.defaultView.getComputedStyle(o,null).getPropertyValue('border-width'));
			if(b > 0) { x += b; y +=b; }
			o = o.offsetParent;
		}
	}

	return { x:x, y:y }
}
