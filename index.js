function randVal(min, max) {
    return (Math.floor(Math.random() * (max - min + 1) + min));
}
function randFloat(min, max) {
    return Math.random() * (max - min) + min;
}
function randColor() {
    vec = "0123456789abcdef";
    color = "#";
    for (i = 0; i < 6; i++) {
        color += vec[randVal(0, vec.length - 1)];
    }
    return color;
}

function debugLog(msg){
    debug.innerHTML+=msg+"<br />";
}

function start() {
    with (document) {
        var canvas = getElementById("myCanvas");
        var btnLeft = getElementById("mobile_left");
        var btnRight = getElementById("mobile_right");
        var btnUp = getElementById("mobile_up");
        var btnDown = getElementById("mobile_down");
        var btnFire = getElementById("btnFire");
        var chkTrajectory = getElementById("chkTrajectory");
        var chkWind = getElementById("chkWind");
        var killShots = getElementById("killShots");
        var debug = getElementById("debug");
    }
    // initialize canvas
    widthRatio = 0.95;
    heightRatio = 0.6;
    canvas.width = window.innerWidth * widthRatio;
    canvas.height = window.innerHeight * heightRatio;
    ctx = canvas.getContext("2d");


    // game variables
    interval = null;
    frameRate = 33;
    targets = [];
    welcome = true;

    terrain = new Terrain(canvas, "green", "lightblue");
    terrain.generate();

    HUMAN_PLAYER = 0;
    AI_EASY = 1;
    AI_MED = 2;
    AI_HARD = 3;
    turnNumber = 0;
    
    
    
    // tanks = [new Tank(canvas, terrain, "red", HUMAN_PLAYER), new Tank(canvas, terrain, "blue", HUMAN_PLAYER), new Tank(canvas, terrain, "yellow", HUMAN_PLAYER)];
    
    tanks = [new Tank(canvas, terrain, "red", HUMAN_PLAYER, 20), new Tank(canvas, terrain, "blue", AI_EASY, canvas.width - 20)];

    tanks[turnNumber].setActive(true);

    var exp = new Explosion(ctx);
    keys = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false
    }
    actions = {
        FIRE:0,
        KILL_SHOTS:1,
        FIND_TRAJECTORY:2
    }

    // event handlers
    function handleKeyboardUp(key) {
        if (key === 38 || key === 87) {
            // move Up
            keys.up = false;
        }
        if (key === 40 || key === 83) {
            // move Down
            keys.down = false;
        }
        if (key === 37 || key === 65) {
            // move Left
            keys.left = false;
        }
        if (key === 39 || key === 68) {
            // move Right
            keys.right = false;
        }
    }
    function handleKeyboardDown(key) {
        // handle key pressed
        /* key codes
        32 - spacebar
        38 - Up Arrow
        40 - Down Arrow
        37 - Left Arrow
        39 - Right Arrow
        87 - W
        83 - S
        65 - A
        68 - D
        13 - Enter
        */
        if (key === 32) {
            // fire
            tankAction(actions.FIRE);
        }
        if (key === 13) {
            // enter pressed
            tankAction(actions.KILL_SHOTS);
        }
        if (key === 38 || key === 87) {
            // move Up
            keys.up = true;
        }
        if (key === 40 || key === 83) {
            // move Down
            keys.down = true;
        }
        if (key === 37 || key === 65) {
            // move Left
            keys.left = true;
        }
        if (key === 39 || key === 68) {
            // move Right
            keys.right = true;
        }
    }
    window.onkeyup = function (evt) {
        // keyboard event handler
        evt = evt || window.event;
        evt.preventDefault();
        handleKeyboardUp(evt.keyCode);
    }

    window.onkeydown = function (evt) {
        // keyboard event handler
        evt = evt || window.event;
        evt.preventDefault();
        handleKeyboardDown(evt.keyCode);
    }

    btnUp.addEventListener("touchstart", function (evt) { keys.up = true; }, false);
    btnUp.addEventListener("touchend", function (evt) { keys.up = false; }, false);
    btnDown.addEventListener("touchstart", function (evt) { keys.down = true; }, false);
    btnDown.addEventListener("touchend", function (evt) { keys.down = false; }, false);

    btnLeft.addEventListener("touchstart", function (evt) { keys.left = true; }, false);
    btnLeft.addEventListener("touchend", function (evt) { keys.left = false; }, false);
    btnRight.addEventListener("touchstart", function (evt) { keys.right = true; }, false);
    btnRight.addEventListener("touchend", function (evt) { keys.right = false; }, false);

    btnFire.addEventListener("touchstart", function (evt) { 
        tankAction(actions.FIRE);
    }, false);
    btnFire.onclick = function () {
        tankAction(actions.FIRE);
    }
    killShots.onclick = function () {
        tankAction(actions.KILL_SHOTS);
    }
    
    chkTrajectory.onclick = function () {

        // tankAction(actions.TOGGLE_TRAJECTORY);
        // terrain.toggleWind(chkWind.checked);
        // if (chkWind.checked) {
        //     tankAction(actions.FIND_TRAJECTORY);
        // }
    }
    
    chkWind.onclick = function () {
        terrain.toggleWind(chkWind.checked);
        if (chkWind.checked) {
            tankAction(actions.FIND_TRAJECTORY);
        }
    }
    // game functions

    function advanceTurn() {
        if(tanks.length === 0) { return; }
        tanks[turnNumber%tanks.length].setActive(false);
        tanks[++turnNumber%tanks.length].setActive(true);
        terrain.randomWind();
    }
    
    function tankAction(action) {
        for(i = 0; i < tanks.length; i++){
            // tank = tanks[i];
            if(tanks[i].getActive()){
                switch(action){
                    case actions.FIRE:
                        tanks[i].fireShot();
                    break;
                    case actions.KILL_SHOTS:
                        if(tanks[i].killShots(exp)){
                            advanceTurn();
                        }
                    break;
                    case actions.FIND_TRAJECTORY:
                        tanks[i].findTrajectory();
                    break;
                        
                    default:
                        console.log("INVALID ACTION!!!");
                    break;
                }
            }
        }
    }
    
    function drawCircle(x, y, r, col, stroke, lineWidth) {
        ctx.lineWidth = lineWidth || 1;
        ctx.fillStyle = col;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (stroke) {
            ctx.stroke();
        }
        ctx.closePath();
    }
    
    // drawing functions
    function drawTargets() {
        for (i = 0; i < targets.length; i++) {
            drawCircle(targets[i].x, targets[i].y, targets[i].size, "red", true, 3);
            drawCircle(targets[i].x, targets[i].y, targets[i].size * 0.6, "yellow", false);
            drawCircle(targets[i].x, targets[i].y, targets[i].size * 0.3, "blue", false);

            targets[i].x += targets[i].speed * targets[i].dir;
            if (targets[i].x < 0) {
                targets[i].dir = 1;
            }
            if (targets[i].x > canvas.width) {
                targets[i].dir = -1;
            }
        }
    }
    
    function drawBg() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function drawWelcome() {
        x = 70;
        ctx.fillStyle = "black";
        ctx.font = "30px Times New Roman";
        ctx.fillText("Welcome to the", x, 80);
        ctx.fillText("Shooting Range", x, 110);
        ctx.fillText("Controls:", x, 140);
        ctx.fillText("Left/Right: Aim", x, 170);
        ctx.fillText("Up/Down: Power", x, 200);
        ctx.fillText("Spacebar: Fire!", x, 230);
        ctx.font = "17px Times New Roman";
        ctx.fillText("CLR (Clear): self-destruct shots", x, 260);
    }


    function tanksDraw() {
        for(i=0;i<tanks.length;i++){
            tanks[i].drawTank();
        }
    }

    function tanksUpdate() {

        for(i=0;i<tanks.length;i++){
            if(tanks[i].update(chkTrajectory.checked, targets, tanks, exp)) {
                advanceTurn();
                
            }
        }
    }

    function tanksEvents() {
        for(i = 0; i < tanks.length; i++){
            // iterate all tanks and call each tank's function
            if(tanks[i].getActive()) {
                // only do for the active tank
            
                if (keys.up || keys.down || keys.left || keys.right) {
                    // control only active tank
                    tanks[i].moveCannon(keys);
                    welcome = false;
                }else if(tanks[i].getLevelAI() !== 0){
                    tanks[i].fireShotAI(tanks);
                }
            }
        }  
    }

    function draw() {
        drawBg();
        terrain.draw();
        drawTargets();
        tanksDraw();
        tanksUpdate();
        tanksEvents();
        
        exp.update(frameRate); // update explosions
        if (welcome) {
            // draw welcome message until user has made interaction
            drawWelcome();
        }
    }

    function spawnTarget() {
        if (targets.length < 3) {
            targets.push({
                x: randVal(0, canvas.width),
                y: randVal(0, canvas.height * 0.5),
                size: randVal(15, 25),
                speed: randVal(0, 10),
                dir: ((Math.random() < 0.5) ? 1 : -1),
                type: "Target"
            });
        }
    }

    gameInterval = setInterval(draw, frameRate);
    targetInterval = setInterval(spawnTarget, 1000);
}


function Tank(canvas, terrain, color, AI, x, y) {
    /*
    AI:
    0:      Human Player
    1 - 3:  Computer Player
    */
    this.type = "Tank";
    this.x = x || randVal(20, canvas.width - 20);
    this.y = y || Math.min(canvas.height,terrain.getHeight(this.x));
    this.color = color;
    this.AI = AI;
    this.size = 15;
    this.cannonAngle = ((this.x < canvas.width / 2) ? -45 : -125);
    this.cannonPower = 5;
    this.maxCannonPower = 15;
    this.g = 0.2;
    this.shots = [];
    this.trajectory = [];
    this.enableTrajectory = false;
    this.terrain = terrain;
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.active = false;
    this.health = 100;

    this.scoreInfo = {
        score: 0,
        hits: 0,
        fired: 0
    };
    this.cursor = {
        x: 0,
        y: 0
    }
    
    this.takeDamage = function(damage){
        this.health -= damage;
    }
    
    this.getHealth = function() {
        return this.health;
    }
    
    this.getActive = function() {
        return this.active;
    }
    
    this.setActive = function(active) {
        this.active = active;
    }

    this.getShotsCount = function() {
        return this.shots.length;
    }
    
    this.toggleTrajectory = function(enable){
        this.enableTrajectory = enable;
    }
    
    this.getLevelAI = function() {
        return this.AI;
    }
    
    this.getVectorsPower = function (power) {
        return {
            x: this.size * power * Math.cos(this.cannonAngle * Math.PI / 180),
            y: this.size * power * Math.sin(this.cannonAngle * Math.PI / 180)
        }
    }

    this.checkTargetsHits = function (targets, exp) {
        hit = false;
        if(this.shots.length === 0){ return; }
        
        for (i = 0; i < this.shots.length; i++) {
                x0 = this.shots[i].x;
                y0 = this.shots[i].y;
            for (j = 0; j < targets.length; j++) {

                r = targets[j].size;

                x1 = targets[j].x;
                y1 = targets[j].y;
                type = targets[j].type;
                if(type === "Tank"){
                    r*=1.3;
                }
                
                if (Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)) <= r) {
                    hit = true;
                    

                    this.shots.splice(i, 1);

                    exp.createExplosion(x1, y1, randColor());
                    
                    if(type === "Tank"){
                        targets[j].takeDamage(20);
                        if(targets[j].getHealth() <= 0){
                            AI = ((targets[j].AI === HUMAN_PLAYER)? HUMAN_PLAYER:AI_EASY);
                        exp.createBasicExplosion(x1,y1,targets[j].color, 30);
                            targets.splice(j, 1);
                            
                            targets.push(new Tank(canvas, terrain, randColor(), AI, randVal(20,canvas.width-20)));
                            return;
                        }
                        exp.createExplosion(x1,y1,"#525252");
                        exp.createExplosion(x1,y1,"#FFA318");
                        exp.createExplosion(x1,y1,"red");
                    }else{
                        this.scoreInfo.score += (targets[j].speed + 1);
                        this.scoreInfo.hits++;
                        targets.splice(j, 1);
                    }
                    this.findTrajectory();
                }
            }
        }
    }

    this.checkTerrainHits = function (exp) {
        if(this.shots.length === 0){ return; }
        for (i = 0; i < this.shots.length; i++) {
            x = Math.floor(this.shots[i].x);
            y = Math.floor(this.shots[i].y);
            // check if the shot is in range of the canvas
            if (x >= 0 && x < this.canvas.width) {
                // check if the shot is in height of terrain
                if (y > this.terrain.getHeight(x)) {
                    exp.createExplosion(x, y, "brown");
                    this.shots.splice(i, 1);
                    terrain.blastTerrain(x, y, 20);
                    if (this.y < terrain.getHeight(this.x)) {
                        this.y = Math.min(this.canvas.height, terrain.getHeight(this.x));
                    }
                }
            }
        }
    }

    this.findTrajectory = function () {
        // simulate shot and build the shot trajectory
        p = this.getVectorsPower(2); // the origin point of the shot
        d = this.getVectorsPower(this.cannonPower); // the power vectors of x and y
        this.trajectory = []; // array for coordinates of the trajectory
        // shot paramaters
        shot = {
            x: p.x + this.x,
            y: p.y + this.y,
            dx: d.x / 10,
            dy: d.y / 10,
        };
        
        // calculate the trajectory as long as the shot is above ground (the canvas height)
        while (shot.y < this.canvas.height) {
            this.trajectory.push({
                x: shot.x,
                y: shot.y
            });
            
            // simulate the shot movement
            shot.x += shot.dx;
            shot.y += shot.dy;
            // simulate gravity and wind effects
            shot.dy += this.g;
            shot.dx += terrain.getWind();
        }
    }

    this.update = function (showTrajectory, targets, tanks, exp) {
        flag = false;
        if(this.getActive()){
            this.drawInfo();
            if(this.getShotsCount() === 0 && showTrajectory){
                this.drawTrajectory();
            }
        }
        if(this.getShotsCount() > 0){
            
            this.drawShots();
            this.updateShots();
            this.checkTargetsHits(targets, exp);
            this.checkTargetsHits(tanks, exp);
            this.checkTerrainHits(exp);
            if(this.getShotsCount() === 0){
                flag = true;
            }
        }
        return flag;
    }

    this.drawTrajectory = function () {
        if(this.trajectory.length === 0){ return; }
        for (i = 0; i < this.trajectory.length; i++) {
            p = this.trajectory[i];
            this.drawShot(p.x, p.y, 1, "blue");
        }
    }

    this.fireShot = function() {
        if(this.AI !== HUMAN_PLAYER) {return; }
        if (this.shots.length >= 1) {
            return false;
        }
        p = this.getVectorsPower(2);
        d = this.getVectorsPower(this.cannonPower);
        this.shots.push({
            x: p.x + this.x,
            y: p.y + this.y,
            dx: d.x / 10,
            dy: d.y / 10
        });
        this.scoreInfo.fired++;
        return true;
    }
    
    this.fireShotAI = function(targets) {
        if (this.shots.length >= 1) {
            return false;
        }
        do{
            //select random target that isn't the tank instance itself 
            target = targets[randVal(0,targets.length-1)];
        
        }while(this.x === target.x && this.y === target.y)
        minAngle = ((this.x > target.x)? 90:0);
        maxAngle = ((this.x > target.x)? 180:90);
        
        
        this.cannonAngle = -randVal(minAngle, maxAngle);
        p = this.getVectorsPower(2);
        d = this.getVectorsPower(randVal(0, this.maxCannonPower));
        this.shots.push({
            x: p.x + this.x,
            y: p.y + this.y,
            dx: d.x / 10,
            dy: d.y / 10
        });
        this.scoreInfo.fired++;
        return true;
    }

    this.killShots = function (exp) {
        if(this.shots.length === 0){
            return false;
        }
        for (i = 0; i < this.shots.length; i++) {
            x = this.shots[i].x;
            y = this.shots[i].y;
            this.shots.splice(i, 1);
            exp.createExplosion(x, y, randColor());
        }
        return true;
    }

    this.drawShots = function () {
        if(this.shots.length === 0){ return; }
        for (i = 0; i < this.shots.length; i++) {
            this.drawShot(this.shots[i].x, this.shots[i].y, 5, "black");
            if (this.shots[i].y < 0 || this.shots[i].x < 0 || this.shots[i].x > this.canvas.width) {
                this.ctx.font = "15px Times New Roman";
                this.ctx.fillText("("+Math.abs(Math.floor(this.shots[i].x))+", "+Math.abs(Math.floor(this.shots[i].y - canvas.height))+")", Math.max(5, Math.min(canvas.width - 70, this.shots[i].x)), Math.max(15, this.shots[i].y));
            }
        }
    }

    this.drawShot = function(x, y, size, color){
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();
    }

    this.updateShots = function () {
        for (i = 0; i < this.shots.length; i++) {

            this.shots[i].x += this.shots[i].dx;
            this.shots[i].y += this.shots[i].dy;

            this.shots[i].dy += this.g;
            this.shots[i].dx += terrain.getWind();
            /*if(this.shots[i].x<-5||this.shots[i].x>canvas.width+5||this.shots[i].y>canvas.height+5)*/
            if (this.shots[i].y > this.canvas.height + 5) {
                this.shots.splice(i, 1);
            }
        }
        return this.shots.length === 0;
    }

    this.drawTank = function () {
        //draw tank cannon
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);

        // calculate x,y coordinates of cannon
        cannonEdge = this.getVectorsPower(2);
        this.ctx.lineTo(cannonEdge.x + this.x, cannonEdge.y + this.y);
        this.ctx.stroke();
        this.ctx.closePath();

        // draw cursor point
        this.ctx.beginPath();
        this.ctx.fillStyle = "grey";
        cannonCursor = this.getVectorsPower(3); ctx.arc(cannonCursor.x + this.x, cannonCursor.y + this.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        //draw tank body

        this.ctx.arc(this.x, this.y, this.size, Math.PI * 0.9, Math.PI * 2.1);

        this.ctx.fill();
        this.ctx.closePath();
        
        this.ctx.font = "15px Times New Roman";
        this.ctx.fillText(this.health+"%",this.x - this.size , this.y+this.size*1.5);
    }

    this.drawInfo = function () {
        this.ctx.fillStyle = "black";
        this.ctx.font = "10px Times New Roman";
        this.ctx.fillText("Power: " + Math.floor((this.cannonPower / this.maxCannonPower) * 100) + "%", 5, 10);
        this.ctx.fillText("Angle: " + (Math.abs(this.cannonAngle % 360)), 5, 20);
        this.ctx.fillText("Fire Ready: " + ((this.shots.length > 0) ? "✖" : "✔"), 5, 30);

        this.ctx.fillStyle = "black";
        this.ctx.font = "15px Times New Roman";
        this.ctx.fillText("Score: " + this.scoreInfo.score, 5, 45);
        this.ctx.fillText("Hit %: " + (Math.floor(this.scoreInfo.hits / this.scoreInfo.fired * 100) || 0), 5, 60);

        this.ctx.fillText("Wind: " + Math.abs(Math.round(terrain.getWind() * 1000) / 100) + " " + ((terrain.getWind() < 0) ? "⇦" : "⇨"), this.canvas.width * 0.3, 15);
        
        this.ctx.fillStyle = this.color;
        this.ctx.fillText("Health: "+this.health+"%",5 , 75);
        this.ctx.fillText("Player",5 , 90);
    }

    this.moveCannon = function (keyPress) {
        if(this.AI !== HUMAN_PLAYER) { return; }
        if (keyPress.up) {
            this.cannonPower = Math.min(this.maxCannonPower, this.cannonPower + 1);
        }
        if (keyPress.down) {
            this.cannonPower = Math.max(0, this.cannonPower - 1);
        }
        if (keyPress.left) {
            this.cannonAngle -= 1;
        }
        if (keyPress.right) {
            this.cannonAngle += 1;
        }
        this.findTrajectory();
    }
}

function Terrain(canvas, color, colorSky) {
    /* Terrain Generator algorithm taken from:
    http://gamedev.stackexchange.com/questions/93511/how-can-i-generate-a-2d-mountain-landscape-procedurally
    
    been modified by me to fit to the game needs
    */

    // javascript graphics boilerplate
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");

    // parameters - change to your liking
    var STEP_MAX = 0.5;
    var STEP_CHANGE = 2.5;
    var HEIGHT_MAX = this.canvas.height;

    // var HEIGHT_MIN = this.canvas.height*0.3;
    // var LIMIT = HEIGHT_MAX*0.5;

    var CLOUD_NUM = 15;
    var WIND_MULTIPLIER = 5.0;
    // starting conditions
    var height = Math.random() * HEIGHT_MAX * 0.1 + this.canvas.height * 0.75;
    // var height = Math.random() * randVal(HEIGHT_MIN,LIMIT)+HEIGHT_MIN;
    var slope = (Math.random() * STEP_MAX) * 2 - STEP_MAX;

    // wind variables
    this.wind = 0;
    this.windEnabled = true;

    this.terrain = [];
    this.clouds = [];
    this.generate = function () {
        this.generateTerrain();
        this.generateClouds();
    }
    this.generateTerrain = function () {
        // creating the landscape
        for (var i = 0; i < this.canvas.width; i++) {
            // change height and slope
            height += slope;
            slope += (Math.random() * STEP_CHANGE) * 2 - STEP_CHANGE;

            // clip height and slope to maximum
            if (slope > STEP_MAX) { slope = STEP_MAX };
            if (slope < -STEP_MAX) { slope = -STEP_MAX };

            if (height > HEIGHT_MAX) {
                height = HEIGHT_MAX;
                slope *= -1;
            }
            if (height < 0) {
                height = 0;
                slope *= -1;
            }
            this.terrain.push({
                x: i,
                y: height
            });
        }
    }
    this.generateClouds = function () {
        for (i = 0; i < CLOUD_NUM; i++) {
            this.clouds.push(this.generateCloud());
        }
    }

    this.generateCloud = function () {
        xOffset = randVal(20, 40);
        //xStart = ((this.wind < 0) ? (this.canvas.width + xOffset) : -xOffset);
        xStart=randVal(0,this.canvas.width);
    
        return {
            x: xStart,
            offset: xOffset,
            y: randVal(0, this.canvas.height * 0.6),
            dir: ((this.wind < 0) ? 1 : -1),
            speed: randFloat(0.1, 0.3),
            size: randVal(20, 50),
            alpha: randFloat(0.2, 0.9)
        }
    }

    this.getWind = function () {
        return this.wind;
    }

    this.toggleWind = function (enable) {
        this.windEnabled = enable;
        if (enable) {
            this.randomWind();
        } else {
            this.wind = 0;
        }
    }

    this.randomWind = function () {
        if (!this.windEnabled) {
            return;
        }
        this.wind = randFloat(0.0, 0.1);
        this.wind *= ((Math.random() < 0.5) ? 1 : -1);
    }

    this.blastTerrain = function (x0, y0, radius) {

        for (i = 0; i < this.terrain.length; i++) {
            x1 = this.terrain[i].x;
            y1 = this.terrain[i].y;

            dist = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
            if (dist <= radius) {
                this.terrain[i].y -= (dist - radius);
            }
        }
    }

    this.draw = function () {
        this.drawTerrain();
        this.drawClouds();
    }
    this.drawTerrain = function () {
        this.ctx.fillStyle = colorSky;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        for (i = 0; i < this.terrain.length; i++) {
            x = this.terrain[i].x;
            y = this.terrain[i].y
            // draw column
            ctx.beginPath();
            ctx.moveTo(x, HEIGHT_MAX);
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.closePath();
        }
    }
    this.drawClouds = function () {
        for (i = 0; i < this.clouds.length; i++) {
            //   this.ctx.globalAlpha=0.5;
            this.ctx.globalAlpha = this.clouds[i].alpha;
            this.ctx.fillStyle = "black";
            this.ctx.font = this.clouds[i].size + "px Times New Roman"; this.ctx.fillText("☁", this.clouds[i].x, this.clouds[i].y);
            // this.clouds[i].x+=this.clouds[i].speed*this.clouds[i].dir;
            this.clouds[i].x += this.wind * WIND_MULTIPLIER;

            if (this.clouds[i].x < (-1) * (this.clouds[i].size + this.clouds[i].offset) || this.clouds[i].x > (this.canvas.width + this.clouds[i].size + this.clouds[i].offset)) {
                this.clouds.splice(i, 1);
                this.clouds.push(this.generateCloud());
            }
        }
        this.ctx.globalAlpha = 1.0;
    }
    this.getHeight = function (x) {
        return this.terrain[x].y;
    }
}

window.onload = start;
