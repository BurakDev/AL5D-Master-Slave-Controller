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
    ssc32u.on('data', this.sendSerialData);
    ssc32u.on('close', this.showPortClose);
    ssc32u.on('error', this.showError);
  };
  
  var sendSerialData = function(buff) {
    console.log('sendSerialData'); 
    for(var val = 0; val < buff.length; val++){
      console.log("readInt8: " + buff.readUInt8(val));
    }
  };
  
  var showPortClose = function() {
   console.log('port closed.');
  };
 
  var showError = function(error) {
     console.log('Serial port error: ' + error);
  };

  var moveServo = function(data) {
   console.log("sending to serial: " + data);
    if(typeof data !== 'number')
      return;
    data = Math.min(data,2500);
    data = Math.max(data,1500);
    if(!!this.port){
      ssc32u.write("#0P" + data + "S200T1500\r", function(err,results){
        console.log("error: ", err);
        console.log('results: ',results);
      });
    }
  };

  var readPot = function (){
    console.log('reading pot');
    ssc32u.write('VG\r', function(err, results){
      if(!!err){
        console.log('err',err);
      } else {
        //var value = parseInt(results,2).toString(10);
        console.log('results : ' + results);
        if(!!results){
          broadcast(value);
        }
       broadcast(value);
      }


    })
  };
  
  ssc32u.on('open', this.showPortOpen);

  
  var SERVER_PORT = '8081';
  var wss = new WebSocketServer({port: this.SERVER_PORT});
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
   console.log("connection closed"); // print it out
   var position = connections.indexOf(client); // get the client's position in the array
   connections.splice(position, 1); // and delete it from the array
   });
  }
  
  var handleMessage = function(data) {
    console.log('handling message from client');
    moveServo(data);
  };
  
  this.wss.on('connection', this.handleConnection);
