# AL5D-Master-Slave-Controller
Control a Lynxmotion AL5\* series Robot Arm with a master-slave system

#Introduction
This is currently a WIP, pre-Aplha project to control a [Lynxmotion AL5D Robot Arm](http://www.lynxmotion.com/c-130-al5d.aspx) with potentiometers. This is specific to the [SSC-32U microcontroller](http://www.lynxmotion.com/p-1032-ssc-32u-usb-servo-controller.aspx) but other microcontrollers may work and support for them is coming in the future (hopefully). 

## Getting Started
1. Install [Node.js](https://nodejs.org/en/), [websockets](https://www.npmjs.com/package/ws), [serialPort](https://www.npmjs.com/package/serialport)
2. Connect microcontroller to computer through USB
3. Open a terminal in the directory and run `node index.js`
4. Open the `index.html` page in your web browser
5. There is now a connection that runs like so

Client(index.html) **<->** WebSocket **<->** Node server(index.js) **<->** SerialPort **<->** Micro-controller(SSC-32U)
