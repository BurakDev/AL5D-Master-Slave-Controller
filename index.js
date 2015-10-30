/*

 Call the next ssc32u.write in the previous callback
 
 
 Notice that the numbers are coming back in the right order, just in different call.
 Create a variable to keep track of which servo was last updated and then just loop it.
*/


var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var WebSocketServer = require('ws').Server;

var clockID;

var blocked = false;

  var ssc32u = new SerialPort("/dev/cu.usbserial-A5044F99", {
    baudrate: 9600
  });
  
  
  var logPorts = function(){
    console.log('Logging ports: ')
    serialport.list(function(err,ports){
      ports.forEach(function(singlePort){
        console.log(singlePort.comName);
      })
    });
  };
  
 
  var showPortOpen = function() {
    ssc32u.on('data', receiveSerialData);
    ssc32u.on('close', showPortClose);
    ssc32u.on('error', showError);
    
    clockID = setInterval(function(){
      if(!blocked)
      {
        ssc32u.write("VH VG VF \r", function(){
          ssc32u.drain(function(){
            blocked = false;
          })
          });
        blocked = true;
      }
      
    },1000);
  }
  
  var receiveSerialData = function(buff) {
    for(var i = 0; i < buff.length; i++){
      var val = buff.readUInt8(i);
      var pwm = parseInt(500 + val * (2000/255));
     // broadcast(JSON.stringify({servo: i, reading: val}));
      console.log("Servo: " + i + ", Reading : " + val);
      //moveServo(i, pwm);
    }
  };
  
  var showPortClose = function() {
    console.log('port closed.');
    clearInterval(clockID);
  };
 
  var showError = function(error) {
     console.log('Serial port error: ' + error);
  };

  var moveServo = function(sevoNum, pwm) {
    if(typeof pwm !== 'number')
      return;
    data = Math.min(pwm,2500);
    data = Math.max(pwm,500);
    console.log("sending to serial: " + pwm);
    if(!!ssc32u){
      ssc32u.write("#" + sevoNum + "P" + pwm + "S1000\r", function(err,results){
        if(!!err)
          console.log("error: ", err);
        console.log('results: ',results);
      });
    }
  };

  var readPot = function (data){
    console.log('reading pot');
    ssc32u.write('VH VG VF\r', function(err,result) {
      if(err != undefined) 
        console.log('readPot error : ' + err);
      if(result != undefined)
        console.log('readPot result : ' + typeof result);
    });
    //ssc32u.write('VG\r');
    //ssc32u.write('VF\r');
  };
  
  ssc32u.on('open', showPortOpen);

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
//   console.log("New Connection"); // you have a new client
//   connections.push(client); // add this client to the connections array
//
//   client.on('message', handleMessage); // when a client sends a message,
//
//   client.on('close', function() { // when a client closes its connection
//   console.log("connection closed");// print it out
//   ssc32u.write("#0P1500S500T1500\r");
//    var position = connections.indexOf(client); // get the client's position in the array
//   connections.splice(position, 1); // and delete it from the array
//   });
//  }
//  
//  var handleMessage = function(data) {
//    console.log('handling message from client');
//    readPot();
//  };
//  
//  wss.on('connection', handleConnection);
