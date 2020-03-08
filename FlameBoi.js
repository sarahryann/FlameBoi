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
var tyb;
var xspeed;
var yspeed;
var speedx;
var speedy;
var angle;
var maxHeight;
var playing;

function initGL(){
	
	//Initialize Variables
	numOfRows = 1;
	blocks_per_row = 5;
	txp = 0.0;
	typ = 0.0;
	txb = 0.0;
	tyb = 0.0;
	playing = 0;
	maxHeight = 1;
	angle = Math.PI/2;
	xspeed = 0; // * Math.cos(Math.PI/2); //cos 0 = 1; cosPI/2 = 0
	yspeed = 0; // * -Math.sin(Math.PI/2); //sin0 = 0 sinPI/2 = 1
	
	speed = .1;
	Mtp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	Mtb= [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	IM = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	//Set up canvas
	var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	//Set up viewpoint & Clear background color
    gl.viewport( 0, 0, 512, 512);
    gl.clearColor( 0.0, 0.0, 1.0, 1.0 );
	
	//Force WebGl to clear color buffer
	gl.clear( gl.COLOR_BUFFER_BIT );
    
	//Initialize Shade programs
    program_player = 
	initShaders( gl, "vertex-shader-player", "fragment-shader-player" );
    
	program_blocks = 
	initShaders( gl, "vertex-shader-blocks", "fragment-shader-blocks" );
	
	program_ball = 
	initShaders( gl, "vertex-shader-ball", "fragment-shader-ball" );

	var arrayOfPointsPlayerBlock= [];
	//Initialize player blocks
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
			p0 = vec4( j + .025, i - .025, 0, 1);
			p1 = vec4( j + .025, i - .1 + .025, 0 , 1);
			p2 = vec4( j + .4 - .025, i - .1 + .025, 0, 1);
			p3 = vec4( j + .4 - .025, i - .025, 0 , 1);
			arrayOfPointsBlocks.push(p0, p1, p2, p3);
		}
	}
	
	maxHeight = 1-(numOfRows/10);
	
	bufferIdBlocks = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBlocks );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPointsBlocks), gl.STATIC_DRAW );
			
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
	console.log(arrayOfPointsBall);
	bufferIdBall = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdBall );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPointsBall), gl.STATIC_DRAW );
	
	
	render();
}; 

function moveBlockKeys(event){
		var theKeyCode = event.keyCode;
		
		//console.log(theKeyCode);
		if( theKeyCode == 65 ){ //A
			txp = txp - 0.1;
			console.log("HereA");

		}else if(theKeyCode == 68 ){ //D
			txp = txp + 0.1;
			console.log("HereB");
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
	
	for(let i = 0; i<(blocks_per_row*numOfRows); i++)gl.drawArrays(gl.TRIANGLE_FAN, i*4, 4);
	

	//Use the block program second
	gl.useProgram(program_ball);
	
	yb = Mtb[13];
	xb = Mtb[12];
	xpl = Mtp[12] - .2;
	xpr = Mtp[12] + .2;
	
	if(yb <= -.8){ //Ball hit players paddle OR missed 
		if(xb >= xpl && xb <= xpr){ // hit players pattle
			yspeed = -yspeed;
			center = (xpl + xpr)/2;
			xspeed = xspeed + (xb-center)/7;
		}
		else{
			tyb = 0;
			txb = 0;
			xspeed = 0;
			yspeed = 0;
		}
	}
	
	if(yb >= maxHeight)
	{
		yspeed = -yspeed;
		//center = (xpl + xpr)/2;
		//xspeed = xspeed + (xb-center)/7;
		
	}
	
	if(xb <= -1 || xb >= 1)
		xspeed = -xspeed;
	
	
	txb += (.1 * xspeed);// * Math.cos(angle));
	tyb += (.1 * yspeed);// * -Math.sin(angle));
	console.log(angle);
	
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
