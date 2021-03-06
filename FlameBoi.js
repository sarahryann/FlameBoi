var gl;
var numOfRows;
var block_per_row;
var num_of_blocks;
var txp;
var typ;
var Mtp;
var Mtb;
var n;
var MtpUniform;
var MtbUniform;
var program_player;
var program_blocks;
var program_ball;
var bufferIdPlayer;
var bufferIdBlocks;
var bufferIdBall;
var tyb;
var txb;
var xspeed;
var yspeed;
var speedx;
var speedy;
var angle;
var maxHeight;
var playing;
var bounding_box_ball;
var ballRightVertex;
var ballLeftVertex;
var colorChanged;
var blocksLeftInRow;
var myColor;
var vertexColor;
var iBuffer;
var indexList;
var livesLeft;

function initGL(){
	
	//Initialize Variables
	livesLeft = 3;
	numOfRows = 2;
	blocks_per_row = 5;
	num_of_blocks = numOfRows * blocks_per_row;
	txp = 0.0;
	typ = 0.0;
	txb = 0.0;
	tyb = 0.0;
	playing = 0;
	angle = Math.PI/2;
	xspeed = 0; // * Math.cos(Math.PI/2); //cos 0 = 1; cosPI/2 = 0
	yspeed = 0; // * -Math.sin(Math.PI/2); //sin0 = 0 sinPI/2 = 1
		
	Mtp = [
			1, 
			0,
			0,
			0,
			 
			0,
			1,
			0,
			0,
			
			0,
			0,
			1,
			0,
			
			0,
			0,
			0,
			1];
	Mtb= [
		1, 
		0,
		0, 
		0,
		
		0,
		1,
		0,
		0,
		
		0,
		0,
		1,
		0,
		
		0,
		0,
		0,
		1];
		
	colorChanged = [];
	blocksLeftInRow = [];
	for( var i = 0; i<num_of_blocks; i++ )
	{
		colorChanged[i] = 0;
	}
	
	for( var i = 0; i < blocks_per_row; i++ )
	{
		blocksLeftInRow[i] = numOfRows;
	}
		
	//Set up canvas
	var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	//Set up viewpoint & Clear background color
    gl.viewport( 0, 0, 512, 512);
    gl.clearColor( 0.0, 0.0, 1.0, 0.5 );
	
	//Force WebGl to clear color buffer
	gl.clear( gl.COLOR_BUFFER_BIT );
    
	//Initialize Shade programs
    program_player = 
	initShaders( gl, "vertex-shader-player", "fragment-shader-player" );
    
	program_blocks = 
	initShaders( gl, "vertex-shader-blocks", "fragment-shader-blocks" );
	
	program_ball = 
	initShaders( gl, "vertex-shader-ball", "fragment-shader-ball" );

	//Initialize player blocks
	var arrayOfPointsPlayerBlock= [];
	var p0 = vec4(-0.2, -0.95, 0, 1);
    var p1 = vec4(-0.2, -0.85, 0, 1);
	var p2 = vec4(0.2, -0.85, 0, 1);
    var p3 = vec4(0.2, -0.95, 0, 1);
	arrayOfPointsPlayerBlock.push(p0, p1, p2, p3);
	
	bufferIdPlayer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdPlayer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPointsPlayerBlock), gl.STATIC_DRAW );
	
	//Initialize blocks
	var arr_size = 10 * numOfRows; 
	var p0, p1, p2, p3;
	var arrayOfPointsBlocks = [];

	for(var i = 1.0; i > (1-(numOfRows/10)); i = i - .1){
		for(var j = -1.0; j < 1; j = j + .4){
			p0 = vec4( j + .025, i - .025, 0, 1);//top left
			p1 = vec4( j + .025, i - .1 + .025, 0 , 1);// bottom left
			p2 = vec4( j + .4 - .025, i - .1 + .025, 0, 1);//bottom right
			p3 = vec4( j + .4 - .025, i - .025, 0 , 1);//top right
			arrayOfPointsBlocks.push(p0, p1, p2, p3); 
		}
	}
	vertexColors= [];
	for(var i = 1.0; i > (1-(numOfRows/10)); i = i - .1){
		for(var j = -1.0; j < 1; j = j + .4){
			p0 = vec4(0.0, 1.0, 0.0, 0.4);//top left
			p1 = vec4(0.0, 1.0, 0.0, 0.4);// bottom left
			p2 = vec4(0.0, 1.0, 0.0, 0.4);//bottom right
			p3 = vec4(0.0, 1.0, 0.0, 0.4);//top right
			vertexColors.push(p0, p1, p2, p3);
		}
	}
	indexList=[];
	for(var i =0;i<numOfRows*num_of_blocks*4;i=i+4)
	{
		indexList.push(i,i+1,i+2,
					   i,i+2,i+3);
	}
	maxHeight =[1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10)];
	//finishCheck = [1, 1, 1, 1, 1];
	
	bufferIdBlocks = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBlocks );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPointsBlocks), gl.STATIC_DRAW );
	
	colorbufferblocks= gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferblocks);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );
	
	myColor = gl.getAttribLocation(program_blocks, "myColor");
	gl.vertexAttribPointer(myColor,4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( myColor );
	
	iBuffer= gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexList), gl.STATIC_DRAW );
	
	var thetastart = 0;
	var thetaend = 2 * Math.PI;
	n = 20;
	var thetastepsize = (thetaend - thetastart) / n;
	var i;
	var arrayOfPointsBall = [];
	
	for(i = 0; i < n; i++){
		var theta = thetastart + i * thetastepsize;
		var x = .05 * Math.cos(theta);
		var y = .05 * Math.sin(theta);
		var p = vec2(x,y);
		arrayOfPointsBall.push(p);
	}
	bufferIdBall = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBall );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPointsBall), gl.STATIC_DRAW );
	
	ballRightVertex=0;//this is the index value of the most right vertex of the ball
	ballLeftVertex=1; //this is the index value of the most left vertex of the ball
	
	leftTemp=arrayOfPointsBall[1][0];
	rightTemp=arrayOfPointsBall[0][0];
	
	//go through all ball verticies and find the values 
	for(i=0; i< arrayOfPointsBall.length; i++)
		{
			if(rightTemp<arrayOfPointsBall[i][0])
			{
				rightTemp=arrayOfPointsBall[i][0];
				ballRightVertex=i;
				
			}
			else if(leftTemp>arrayOfPointsBall[i][0])
			{
				leftTemp=arrayOfPointsBall[i][0];
				ballLeftVertex=i;
				
			}		
		}
	render();
}; 

function moveBlockKeys(event){
		var theKeyCode = event.keyCode;
		
		//console.log(theKeyCode);
		if( theKeyCode == 65 ){ //A
			txp = txp - 0.1;
		}else if(theKeyCode == 68 ){ //D
			txp = txp + 0.1;
		}
		else if(theKeyCode == 32){ //Space
			if(playing)
			{
				tyb = 0;    
				txb = 0;
				xspeed = 0;
				yspeed = 0;
				playing = 0;
			}
			else     
			{
				yspeed = -.1;
				playing = 1;
			}
				
		}
}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT);
	//Use player program first
	gl.useProgram(program_player);
	
	//update the transformation
	Mtp = [1.0, 
		   0.0,
		   0.0,
		   0.0,
		   0.0,
		   1.0,
		   0.0,
		   0.0,
		   0.0,
		   0.0,
		   1.0,
		   0.0,
		   txp,
		   typ,
		   0.0,
		   1.0];
	MtpUniform = gl.getUniformLocation( program_player, "Mt" );
	gl.uniformMatrix4fv( MtpUniform, false, flatten(Mtp) );
	
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdPlayer);
	
	var myPositionAttributePlayer = gl.getAttribLocation( program_player , "myPosition" );
    gl.vertexAttribPointer( myPositionAttributePlayer, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( myPositionAttributePlayer );
		
	gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
	
	
	//Use the block program second
	gl.useProgram(program_blocks);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdBlocks);
	
	var myPositionAttributeBlocks = gl.getAttribLocation( program_blocks , "myPosition" );
    gl.vertexAttribPointer( myPositionAttributeBlocks, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttributeBlocks );
	
	colorbufferblocks = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferblocks);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );
	
	myColor = gl.getAttribLocation(program_blocks, "myColor");
	gl.vertexAttribPointer(myColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( myColor );
		
	iBuffer= gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer);
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexList), gl.STATIC_DRAW );
	
	for(let i = 0; i<(blocks_per_row*numOfRows); i++)gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
	

	//Use the ball program third
	gl.useProgram(program_ball);
	
	yb = Mtb[13];
	xb = Mtb[12];
	xpl = Mtp[12] - .2;
	xpr = Mtp[12] + .2;
	
	if(yb <= -.8){ //Ball hit players paddle OR missed 
		if(xb >= xpl-.1 && xb <= xpr+.1){ // hit players pattle //changed this value so that it actually hits the full paddle
			yspeed = -yspeed;
			center = (xpl + xpr)/2;
			xspeed = xspeed + (xb-center)/4;
		}
		else{
			tyb = 0;
			txb = 0;
			xspeed = 0;
			yspeed = 0;
			livesLeft = livesLeft - 1;
			if(livesLeft <= 0 )
			{
				vertexColors= [];
				for(var i = 1.0; i > (1-(numOfRows/10)); i = i - .1){
					for(var j = -1.0; j < 1; j = j + .4){
						p0 = vec4(0.0, 1.0, 0.0, 0.4);//top left
						p1 = vec4(0.0, 1.0, 0.0, 0.4);// bottom left
						p2 = vec4(0.0, 1.0, 0.0, 0.4);//bottom right
						p3 = vec4(0.0, 1.0, 0.0, 0.4);//top right
						vertexColors.push(p0, p1, p2, p3);
					}
				}
				
				colorChanged = [];
				blocksLeftInRow = [];
				for( var i = 0; i<num_of_blocks; i++ )
				{
					colorChanged[i] = 0;
				}
				
				for( var i = 0; i < blocks_per_row; i++ )
				{
					blocksLeftInRow[i] = numOfRows;
				}
				livesLeft = 3;
				maxHeight =[1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10)];
				
						
				//pushes the entire array vertexColors into the vertexshader
				colorbufferblocks= gl.createBuffer();
				gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferblocks);
				gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );
				
				myColor = gl.getAttribLocation(program_blocks, "myColor");
				gl.vertexAttribPointer(myColor, 4, gl.FLOAT, false, 0, 0);
				gl.enableVertexAttribArray( myColor );
				
				iBuffer= gl.createBuffer();
				gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer);
				gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexList), gl.STATIC_DRAW );		
			}
		}
	}
	//this if block checks what block column the ball currently is 
	var currColumnIndex = 0;
	if(xb < -.6)
	{
		currColumnIndex = 0;
	}
	else if(xb < -0.2)
	{
		currColumnIndex = 1;
	}
	else if(xb < 0.2)
	{
		currColumnIndex = 2;
	}
	else if(xb < 0.6)
	{
		currColumnIndex = 3;
	}
	else if(xb < 1)
	{
		currColumnIndex = 4;
	}
		
	
	if(yb >= maxHeight[currColumnIndex])
	{
		yspeed = -yspeed;         
		var closestXVal=[0];
		
		maxHeight[currColumnIndex] = maxHeight[currColumnIndex]+.1;

		var arrIdx = currColumnIndex + ((blocksLeftInRow[currColumnIndex]-1)*5);
		blocksLeftInRow[currColumnIndex] = blocksLeftInRow[currColumnIndex] - 1;

		//changes the 4 verticies that are associated with the corresponding block
		vertexColors[arrIdx*4] = vec4(0.0, 0.0, 1.0, 0.5 ); //top left
		vertexColors[arrIdx*4+1] = vec4(0.0, 0.0, 1.0, 0.5 );//bottom left
		vertexColors[arrIdx*4+2] = vec4(0.0, 0.0, 1.0, 0.5 );//bottom right
		vertexColors[arrIdx*4+3] = vec4(0.0, 0.0, 1.0, 0.5 );//top right
		
		console.log(livesLeft);
		
		/*var p = -1;
		while(p < blocks_per_row)
		{
			p = p + 1;
			if(maxHeight[p] < .9)
					break;
		}
		*/
		var p = 0;
		for(var i = 0; i < blocks_per_row; i = i + 1)
		{
				if(maxHeight[i] > .9)
					p = p + 1;
		}
		
		if(p == blocks_per_row)
		{
			vertexColors= [];
			for(var i = 1.0; i > (1-(numOfRows/10)); i = i - .1){
				for(var j = -1.0; j < 1; j = j + .4){
					p0 = vec4(0.0, 1.0, 0.0, 0.4);//top left
					p1 = vec4(0.0, 1.0, 0.0, 0.4);// bottom left
					p2 = vec4(0.0, 1.0, 0.0, 0.4);//bottom right
					p3 = vec4(0.0, 1.0, 0.0, 0.4);//top right
					vertexColors.push(p0, p1, p2, p3);
				}
			}
			colorChanged = [];
			blocksLeftInRow = [];
			for( var i = 0; i<num_of_blocks; i++ )
			{
				colorChanged[i] = 0;
			}
			for( var i = 0; i < blocks_per_row; i++ )
			{
				blocksLeftInRow[i] = numOfRows;
			}
			livesLeft = 3;
			maxHeight =[1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10)];
			
			tyb = 0;
			txb = 0;
			xspeed = 0;
			yspeed = 0;
				
			/* //pushes the entire array vertexColors into the vertexshader
			colorbufferblocks= gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferblocks);
			gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );
			
			myColor = gl.getAttribLocation(program_blocks, "myColor");
			gl.vertexAttribPointer(myColor, 4, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray( myColor );
			
			iBuffer= gl.createBuffer();
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer);
			gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexList), gl.STATIC_DRAW ); */
		
		}
		
		//pushes the entire array vertexColors into the vertexshader
		colorbufferblocks= gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferblocks);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );
		
		myColor = gl.getAttribLocation(program_blocks, "myColor");
		gl.vertexAttribPointer(myColor, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray( myColor );
		
		iBuffer= gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexList), gl.STATIC_DRAW );

	}
	else if(yb>0.9)
	{
		//yspeed = -yspeed;
		tyb = 0;
		txb = 0;
		xspeed = 0;
		yspeed = 0;  
		livesLeft = livesLeft - 1;
		console.log(livesLeft);
		if(livesLeft <= 0 )
		{
			vertexColors= [];
			for(var i = 1.0; i > (1-(numOfRows/10)); i = i - .1){
				for(var j = -1.0; j < 1; j = j + .4){
					p0 = vec4(0.0, 1.0, 0.0, 0.4);//top left
					p1 = vec4(0.0, 1.0, 0.0, 0.4);// bottom left
					p2 = vec4(0.0, 1.0, 0.0, 0.4);//bottom right
					p3 = vec4(0.0, 1.0, 0.0, 0.4);//top right
					vertexColors.push(p0, p1, p2, p3);
				}
			}
			
			colorChanged = [];
			blocksLeftInRow = [];
			for( var i = 0; i<num_of_blocks; i++ )
			{
				colorChanged[i] = 0;
			}
			
			for( var i = 0; i < blocks_per_row; i++ )
			{
				blocksLeftInRow[i] = numOfRows;
			}
			livesLeft = 3;
			maxHeight =[1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10), 1-(numOfRows/10)];
			
					
			//pushes the entire array vertexColors into the vertexshader
			colorbufferblocks= gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, colorbufferblocks);
			gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );
			
			myColor = gl.getAttribLocation(program_blocks, "myColor");
			gl.vertexAttribPointer(myColor, 4, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray( myColor );
			
			iBuffer= gl.createBuffer();
			gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer);
			gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexList), gl.STATIC_DRAW );		
		}

		
	}
	
	
	if(xb <= -1 || xb >= 1)
		xspeed = -xspeed;
	
	
	txb += (.1 * xspeed);// * Math.cos(angle));
	tyb += (.1 * yspeed);// * -Math.sin(angle));
	
	
	Mtb = [1.0, 
		   0.0,
		   0.0,
		   0.0,
		   
		   0.0,
		   1.0,
	 	   0.0,
		   0.0,
		   
		   0.0,
		   0.0,
		   1.0,
		   0.0,
		   
		   txb,
		   tyb,
		   0.0,
		   1.0];
		   
	MtbUniform = gl.getUniformLocation( program_ball, "Mt" );
	gl.uniformMatrix4fv( MtbUniform, false, flatten(Mtb) );
	
	gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdBall);
		
	var myPositionAttributeBall = gl.getAttribLocation( program_ball , "myPosition" );
    gl.vertexAttribPointer( myPositionAttributeBall, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttributeBall );
	
	gl.drawArrays(gl.TRIANGLE_FAN, 0, n)
	
	requestAnimFrame(render);
	
}
