/*
 test servo:
  zero 1485 - 1492 
base zero 1465 1456(no sing) 1451
shoulder limit 630 - 2170
elbow limit 954 - 2319
wrist limit 500 - 2500 ?
gripper limit 743 - 2233

*/


var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var keypress = require('keypress')
  , tty = require('tty');

var WebSocketServer = require('ws').Server;

var clockID;

var zeroPWM = 1500;

function Joint (pot, servo,minByte,maxByte, minPWM, maxPWM){
  this.pot = pot;
  this.servo = servo;
  this.minByte = minByte || 0;
  this.maxByte = maxByte || 255;
  this.minPWM = minPWM || 500;
  this.maxPWM = maxPWM || 2500;
  this.mapRange = function (curByte){
    curByte = Math.max(curByte,this.minByte);
    curByte = Max.min(curByte,this.maxByte);
    return this.minPWM + curByte * ((this.maxPWM-this.minPWM)/this.maxByte);
  };
} 

var base = new Joint("VA",0);
var shoulder = new Joint("VB",1);
var elbow = new Joint("VC",2);
var wrist = new Joint("VD",3);
var gripper = new Joint("VE",4);

var joints = [base,shoulder,elbow,wrist,gripper];


var pots = ["VG"];
var servos = [0];
var potsString = "VG \r";//joints.reduce(function(prev,cur){return prev + cur.pot + " "},"") + " \r";
//console.log("potsString : " + potsString);
var curPot = 0;
var oldContPotVal = 1500;
var moveRight = false;
var moveLeft = false;

var blocked = false;

  var ssc32u = new SerialPort("/dev/cu.usbserial-A5044F99", {
    baudrate: 9600
  });
  
  
  var logPorts = function(){
    //console.log('Logging ports: ')
    serialport.list(function(err,ports){
      ports.forEach(function(singlePort){
        //console.log(singlePort.comName);
      })
    });
  };
  
 
  var showPortOpen = function() {
    ssc32u.on('data', receiveSerialData);
    ssc32u.on('close', showPortClose);
    ssc32u.on('error', showError);
    
//    clockID = setInterval(function(){
//      if(!blocked)
//      {
//        ssc32u.write("VH VG VF \r", function(){
//          ssc32u.drain(function(){
//            blocked = false;
//          })
//          });
//        blocked = true;
//      }
//      
//    },1000);
    clockID = setInterval(function(){ssc32u.write(potsString)}, 50);
  }
  
  var receiveSerialData = function(buff) {
    for(var i = 0; i < buff.length; i++){
      var val = buff.readUInt8(i);
      var pwm = parseInt(500 + val * (2000/255));
     // broadcast(JSON.stringify({servo: i, reading: val}));
      //console.log("Pot : " + pots[curPot] + ", Reading : " + pwm);
      
      if(servos[curPot] !== null){
        //moveServo(servos[curPot], zeroPWM);
        //console.log("zeroPWM : " + zeroPWM);
        moveContServo(val);
      }
      curPot++;
      if(curPot == pots.length)
        curPot = 0; 
    }
  };
  
  var showPortClose = function() {
    //console.log('port closed.');
    clearInterval(clockID);
  };
 
  var showError = function(error) {
     //console.log('Serial port error: ' + error);
  };

  var moveServo = function(sevoNum, pwm) {
    if(typeof pwm !== 'number')
      return;
    data = Math.min(pwm,2500);
    data = Math.max(pwm,500);
    //console.log("sending to serial: " + pwm);
    if(!!ssc32u){
      console.log("current PWM: " + pwm);
      ssc32u.write("#" + sevoNum + "P" + pwm + "\r");
    }
  };

  var moveContServo = function(curContPotVal){
    var deltaPot = curContPotVal-oldContPotVal;
    oldContPotVal = curContPotVal;
    console.log("deltaPot : " + deltaPot);
    var toSend = 1456 + (deltaPot * 20);
    toSend = Math.min(toSend,2500);
    toSend = Math.max(toSend,500);
    console.log('toSend: ' + toSend);
    
    //if(moveLeft){toSend = 1400;}
    //if(moveRight){toSend = 1540;}
    
    ssc32u.write("#0P" + toSend + "\r");
  }
  
ssc32u.on('open', showPortOpen);

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  //console.log('got "keypress"', key);
  if (key && key.name === "up") {
    zeroPWM++;
  } else if(key && key.name === "down"){
    zeroPWM--;
    moveLeft = false;
    moveRight = false;
  } else if(key && key.name === "left"){
    moveLeft = true;
    moveRight = false;
  }else if(key && key.name === "right"){
    moveLeft = false;
    moveRight = true;
  }
  if (key && key.ctrl && key.name == 'c') {
   process.exit();
  }
  //process.stdout.write( ch );
});

if (typeof process.stdin.setRawMode == 'function') {
  process.stdin.setRawMode(true);
} else {
  tty.setRawMode(true);
}
process.stdin.resume();

//  
//  var SERVER_PORT = 8081;
//  var wss = new WebSocketServer({port: SERVER_PORT});
//  var connections = new Array; 
//  
//  var broadcast = function (data) {
//   for (myConnection in connections) {   // iterate over the array of connections
//    connections[myConnection].send(data); // send the data to each connection
//   }
//  }
//
//
//  var handleConnection = function(client) {
//   ////console.log("New Connection"); // you have a new client
//   connections.push(client); // add this client to the connections array
//
//   client.on('message', handleMessage); // when a client sends a message,
//
//   client.on('close', function() { // when a client closes its connection
//   //console.log("connection closed");// print it out
//   ssc32u.write("#0P1500S500T1500\r");
//    var position = connections.indexOf(client); // get the client's position in the array
//   connections.splice(position, 1); // and delete it from the array
//   });
//  }
//  
//  var handleMessage = function(data) {
//    //console.log('handling message from client');
//    readPot();
//  };
//  
//  wss.on('connection', handleConnection);
