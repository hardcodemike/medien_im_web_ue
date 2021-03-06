/*global THREE*/
/*global Stats*/
window.addEventListener('load', init, false);

var now = new Date().getTime();
var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var orbitControl;
var rollingGroundSphere;
var heroSphere;
var rollingSpeed=0.008;
var heroRollingSpeed;
var worldRadius=26;
var heroRadius=0.3;
var sphericalHelper;
var pathAngleValues;
var heroBaseY=1.9;
var bounceValue=0.1;
var gravity=0.005;
var leftLane=-1;
var rightLane=1;
var middleLane=0;
var currentLane;
var clock;
var jumping;
var cucumberReleaseInterval=0.5;
var cucumbersInPath;
var cucumberPool;
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;
var particles;
var stats;
var scoreText;
var scoreLabel;
var score;
var hasCollided;

function init() {
	// set up the scene
	createScene();

	//call game loop
	update();
}

function createScene(){
	hasCollided=false;
	score=9;
	cucumbersInPath=[];
	cucumberPool=[];
	clock=new THREE.Clock();
	clock.start();
	heroRollingSpeed=(rollingSpeed*worldRadius/heroRadius)/10;
	sphericalHelper = new THREE.Spherical();
	pathAngleValues=[1.52,1.57,1.62];
    sceneWidth=window.innerWidth-50;
    sceneHeight=window.innerHeight-50;
    scene = new THREE.Scene();//the 3d scene
    scene.fog = new THREE.FogExp2( 0xf0fff0, 0.14 );
    camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
    renderer.setClearColor(0xfffafa, 1);
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight );
    dom = document.getElementById('QuickMathsContainer');
	dom.appendChild(renderer.domElement);
	stats = new Stats();
	dom.appendChild(stats.dom);
	createCucumberPool();
	addWorld();
	addHero();
	addLight();
	addExplosion();

	camera.position.z = 6.5;
	camera.position.y = 3.5;
	orbitControl = new THREE.OrbitControls( camera, renderer.domElement );//helper to rotate around in scene
	orbitControl.addEventListener( 'change', render );
	//orbitControl.enableDamping = true;
	//orbitControl.dampingFactor = 0.8;
	orbitControl.noKeys = true;
	orbitControl.noPan = true;
	orbitControl.enableZoom = false;
	orbitControl.minPolarAngle = 1.1;
	orbitControl.maxPolarAngle = 1.1;
	orbitControl.minAzimuthAngle = -0.2;
	orbitControl.maxAzimuthAngle = 0.2;

	window.addEventListener('resize', onWindowResize, false);//resize callback

	document.onkeydown = handleKeyDown;

    //create the text for the lives
    scoreLabel = document.createElement('div');
    scoreLabel.style.position = 'absolute';
    scoreLabel.style.width = 50+ '%';
    scoreLabel.style.height = 100;
    scoreLabel.innerHTML = 'Lives left: ';
    scoreLabel.style.top = 1 + '%';
    scoreLabel.style.left = 46 +'%';
	scoreLabel.style.fontSize = 'larger';
    document.body.appendChild(scoreLabel);

	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	scoreText.style.width = 100;
	scoreText.style.height = 100;
	//scoreText.style.backgroundColor = "blue";
	scoreText.innerHTML = "9";
	scoreText.style.top = 1 + '%';
	scoreText.style.left = 51 + '%';
	scoreText.style.fontSize = 'larger';
	document.body.appendChild(scoreText);
}
function addExplosion(){
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push( vertex );
	}
	var pMaterial = new THREE.ParticleBasicMaterial({
	  color: 0xff0000,
	  size: 0.1
	});
	particles = new THREE.Points( particleGeometry, pMaterial );
	scene.add( particles );
	particles.visible=false;
}
function createCucumberPool(){
	var maxCucumbersInPool=10;
	var newCucumber;
	for(var i=0; i<maxCucumbersInPool;i++){
		newCucumber=createCucumber();
		cucumberPool.push(newCucumber);
	}
}
function handleKeyDown(keyEvent){
	if(jumping)return;
	var validMove=true;
	if ( keyEvent.keyCode === 37) {//left
		if(currentLane==middleLane){
			currentLane=leftLane;
		}else if(currentLane==rightLane){
			currentLane=middleLane;
		}else{
			validMove=false;
		}
	} else if ( keyEvent.keyCode === 39) {//right
		if(currentLane==middleLane){
			currentLane=rightLane;
		}else if(currentLane==leftLane){
			currentLane=middleLane;
		}else{
			validMove=false;
		}
	}else{
		if ( keyEvent.keyCode === 38){//up, jump
			bounceValue=0.1;
			jumping=true;
		}
		validMove=false;
	}
	//heroSphere.position.x=currentLane;
	if(validMove){
		jumping=true;
		bounceValue=0.06;
	}
}
function addHero(){

    var sphereGeometry = new THREE.DodecahedronGeometry( heroRadius, 1);
    var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xe5f2f2 ,shading:THREE.FlatShading} )
    jumping=false;
    heroSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
    heroSphere.receiveShadow = true;
    heroSphere.castShadow=true;
    scene.add( heroSphere );
    heroSphere.position.y=heroBaseY;
    heroSphere.position.z=4.8;
    currentLane=middleLane;
    heroSphere.position.x=currentLane;


    var loader = new THREE.JSONLoader();





    loader.load(
        'src/kitty.json',
        function ( geometry, materials ) {

        	scene.remove(heroSphere);
            var material = materials[ 0 ];
            jumping = false;
            heroSphere = new THREE.Mesh( geometry, material );
            heroSphere.scale.set(0.3,.3,.3);
            heroSphere.rotateY(1.60);
            heroSphere.receiveShadow = true;
            heroSphere.castShadow=true;
            scene.add( heroSphere );
            heroSphere.position.y=heroBaseY;
            heroSphere.position.z=4.8;
            currentLane=middleLane;
            heroSphere.position.x=currentLane;
        }
    );


}
function addWorld(){
	var sides=90;
	var tiers=90;


	var sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
	var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0x8B4513 ,shading:THREE.FlatShading} )

	var vertexIndex;
	var vertexVector= new THREE.Vector3();
	var nextVertexVector= new THREE.Vector3();
	var firstVertexVector= new THREE.Vector3();
	var offset= new THREE.Vector3();
	var currentTier=1;
	var lerpValue=0.5;
	var heightValue;
	var maxHeight=0.07;
	for(var j=1;j<tiers-2;j++){
		currentTier=j;
		for(var i=0;i<sides;i++){
			vertexIndex=(currentTier*sides)+1;
			vertexVector=sphereGeometry.vertices[i+vertexIndex].clone();
			if(j%2!==0){
				if(i==0){
					firstVertexVector=vertexVector.clone();
				}
				nextVertexVector=sphereGeometry.vertices[i+vertexIndex+1].clone();
				if(i==sides-1){
					nextVertexVector=firstVertexVector;
				}
				lerpValue=(Math.random()*(0.75-0.25))+0.25;
				vertexVector.lerp(nextVertexVector,lerpValue);
			}
			heightValue=(Math.random()*maxHeight)-(maxHeight/2);
			offset=vertexVector.clone().normalize().multiplyScalar(heightValue);
			sphereGeometry.vertices[i+vertexIndex]=(vertexVector.add(offset));
		}
	}
	rollingGroundSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	rollingGroundSphere.receiveShadow = true;
	rollingGroundSphere.castShadow=false;
	rollingGroundSphere.rotation.z=-Math.PI/2;
	scene.add( rollingGroundSphere );
	rollingGroundSphere.position.y=-24;
	rollingGroundSphere.position.z=2;
	addWorldCucumbers();
}
function addLight(){
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
	scene.add(hemisphereLight);
	sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
	sun.position.set( 12,6,-7 );
	sun.castShadow = true;
	scene.add(sun);
	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50 ;
}
function addPathCucumber(){
	var options=[0,1,2];
	var lane= Math.floor(Math.random()*3);
	addCucumber(true,lane);
	options.splice(lane,1);
	if(Math.random()>0.5){
		lane= Math.floor(Math.random()*2);
		addCucumber(true,options[lane]);
	}
}
function addWorldCucumbers(){
	var numCucumbers=36;
	var gap=6.28/36;
	for(var i=0;i<numCucumbers;i++){
		addCucumber(false,i*gap, true);
		addCucumber(false,i*gap, false);
	}
}
function addCucumber(inPath, row, isLeft){
	var newCucumber;
	if(inPath){
		if(cucumberPool.length==0)return;
		newCucumber=cucumberPool.pop();
		newCucumber.visible=true;
		//console.log("add cucumber");
		cucumbersInPath.push(newCucumber);
		sphericalHelper.set( worldRadius-0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x+4 );
	}else{
		newCucumber=createCucumber();
		var forestAreaAngle=0;//[1.52,1.57,1.62];
		if(isLeft){
			forestAreaAngle=1.68+Math.random()*0.1;
		}else{
			forestAreaAngle=1.46-Math.random()*0.1;
		}
		sphericalHelper.set( worldRadius-0.3, forestAreaAngle, row );
	}
	newCucumber.position.setFromSpherical( sphericalHelper );
	var rollingGroundVector=rollingGroundSphere.position.clone().normalize();
	var cucumberVektor=newCucumber.position.clone().normalize();
	newCucumber.quaternion.setFromUnitVectors(cucumberVektor,rollingGroundVector);
	newCucumber.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;

	rollingGroundSphere.add(newCucumber);
}
function createCucumber(){
	// CUCUMBER MAKING PROCCES BY HARDCODEMIKE
	// cucumber body
	var cucumberTrunkGeometry = new THREE.CylinderGeometry( 0.1, 0.1,0.6,12,1,false,0.1);
	var cucumberTrunkMaterial = new THREE.MeshStandardMaterial( { color: 0x33ff33,shading:THREE.FlatShading  } );
	var cucumberbody = new THREE.Mesh( cucumberTrunkGeometry, cucumberTrunkMaterial );
    cucumberbody.position.y=0.9;

	// cucumber head
	var cucumberhead = new THREE.CylinderGeometry( 0, 0.1, 0.1,12,1,false,0.1);
	var cucumberheadMaterial = new THREE.MeshStandardMaterial( { color: 0x33ff33,shading:THREE.FlatShading});
	var cucumberheadfinal = new THREE.Mesh( cucumberhead, cucumberheadMaterial);
	cucumberheadfinal.position.y=1.25;

	//cucumber feets
    var cucumberfeet = new THREE.CylinderGeometry( 0.1, 0, 0.1,12,1,false,0.1);
    var cucumberfeetMaterial = new THREE.MeshStandardMaterial( { color: 0x33ff33,shading:THREE.FlatShading});
    var cucumberfeetfinal = new THREE.Mesh( cucumberfeet, cucumberfeetMaterial);
    cucumberfeetfinal.position.y=0.55;


	var cucumber =new THREE.Object3D();
    cucumber.add(cucumberbody);
    cucumber.add(cucumberheadfinal);
    cucumber.add(cucumberfeetfinal);
	return cucumber;
}

function update(){
	stats.update();
    //animate
    rollingGroundSphere.rotation.x += rollingSpeed;
	heroSphere.rotation.x -= heroRollingSpeed;
	if (heroSphere.position.y <= heroBaseY) {
		jumping = false;
		bounceValue = (Math.random() * 0.04) + 0.005;
	}
	heroSphere.position.y += bounceValue;
	heroSphere.position.x = THREE.Math.lerp(heroSphere.position.x, currentLane, 2 * clock.getDelta());//clock.getElapsedTime());

    bounceValue-=gravity;
    if(clock.getElapsedTime()>cucumberReleaseInterval){
    	clock.start();
    	addPathCucumber();
    	if(hasCollided && (new Date().getTime() > now + 500)){ //damit nicht 2 auf 1 mal abgezogen werden
    		now = new Date().getTime();
			score-=1.0;
			scoreText.innerHTML=score.toString();
			hasCollided=false;
		}
		if(score=== 0.0){
			rollingSpeed = 0;
			heroRollingSpeed = 0;
			gravity = 0;
            // if(sweetAlert("GAME OVER! \n\nTry again!")){}
            // else    window.location.reload();
			scoreText = 0;
            swal({
                    title: "Game Over!",
                    text: "Cat is dead! Goes to heaven now!",
                    type: "error",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Try (die) again!",
                    closeOnConfirm: true
                },
                function(isConfirm) {
                    if (isConfirm) {
                        window.location.reload();
                    }
                });
        }
    }
    doCucumberLogic();
    doExplosionLogic();
    render();
	requestAnimationFrame(update);//request next update
}

function doCucumberLogic(){
	var oneCucumber;
	var cucumberPos = new THREE.Vector3();
	var cucumbersToRemove=[];
	cucumbersInPath.forEach( function ( element, index ) {
		oneCucumber=cucumbersInPath[ index ];
		cucumberPos.setFromMatrixPosition( oneCucumber.matrixWorld );
		if(cucumberPos.z>6 &&oneCucumber.visible){//gone out of our view zone
			cucumbersToRemove.push(oneCucumber);
		}else{//check collision
			if(cucumberPos.distanceTo(heroSphere.position)<=0.6){
				//console.log("hit");
				hasCollided=true;
				explode();
			}
		}
	});
	var fromWhere;
	cucumbersToRemove.forEach( function ( element, index ) {
		oneCucumber=cucumbersToRemove[ index ];
		fromWhere=cucumbersInPath.indexOf(oneCucumber);
		cucumbersInPath.splice(fromWhere,1);
		cucumberPool.push(oneCucumber);
		oneCucumber.visible=false;
	});
}
function doExplosionLogic(){
	if(!particles.visible)return;
	for (var i = 0; i < particleCount; i ++ ) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if(explosionPower>1.005){
		explosionPower-=0.001;
	}else{
		particles.visible=false;
	}
	particleGeometry.verticesNeedUpdate = true;
}
function explode(){
	particles.position.y=2;
	particles.position.z=4.8;
	particles.position.x=heroSphere.position.x;
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2+Math.random() * 0.4;
		vertex.y = -0.2+Math.random() * 0.4;
		vertex.z = -0.2+Math.random() * 0.4;
		particleGeometry.vertices[i]=vertex;
	}
	explosionPower=1.07;
	particles.visible=true;
}
function render(){
    renderer.render(scene, camera);//draw
}
function gameOver () {
  //cancelAnimationFrame( globalRenderID );
  //window.clearInterval( powerupSpawnIntervalID );
}
function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}