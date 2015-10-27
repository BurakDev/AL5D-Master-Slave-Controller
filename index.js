var serialport = require('serialport');
var SerialPort = serialport.SerialPort;

var WebSocketServer = require('ws').Server;

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
    ssc32u.on('data', sendSerialData);
    ssc32u.on('close', showPortClose);
    ssc32u.on('error', showError);
  };
  
  var sendSerialData = function(buff) {
    console.log('sendSerialData'); 
    for(var val = 0; val < buff.length; val++){
      var val = buff.readUInt8(val);
      console.log("readInt8: " + val);
      broadcast("" +val);
      var servoVal = 500 + val * (2000/255);
      moveServo(servoVal);
    }
  };
  
  var showPortClose = function() {
   console.log('port closed.');
  };
 
  var showError = function(error) {
     console.log('Serial port error: ' + error);
  };

  var moveServo = function(data) {
    if(typeof data !== 'number')
      return;
    data = Math.min(data,2500);
    data = Math.max(data,500);
    console.log("sending to serial: " + data);
    if(!!ssc32u){
      ssc32u.write("#0P" + data + "S600\r", function(err,results){
        if(!!err)
          console.log("error: ", err);
        console.log('results: ',results);
      });
    }
  };

  var readPot = function (data){
    console.log('reading pot');
    ssc32u.write('VG\r');
  };
  
  ssc32u.on('open', showPortOpen);

  
  var SERVER_PORT = 8081;
  var wss = new WebSocketServer({port: SERVER_PORT});
  var connections = new Array; 
  
  var broadcast = function (data) {
   for (myConnection in connections) {   // iterate over the array of connections
    connections[myConnection].send(data); // send the data to each connection
   }
  }


  var handleConnection = function(client) {
   console.log("New Connection"); // you have a new client
   connections.push(client); // add this client to the connections array

   client.on('message', handleMessage); // when a client sends a message,

   client.on('close', function() { // when a client closes its connection
   console.log("connection closed");// print it out
   ssc32u.write("#0P1500S500T1500\r");
    var position = connections.indexOf(client); // get the client's position in the array
   connections.splice(position, 1); // and delete it from the array
   });
  }
  
  var handleMessage = function(data) {
    console.log('handling message from client');
    readPot();
  };
  
  wss.on('connection', handleConnection);
