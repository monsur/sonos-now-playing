sonos-now-playing-nodejs
========================

Hacking around with the Sonos and Node.js. The grand plan is to build something to display the currently playing track from the Sonos. The steps to acheive this are:

* Install node.js and the code in this project on a Raspberry Pi.
* Poll the Sonos every ~1 second for the currently playing track.
* If the track changes, broadcast the details to any connected clients using the WebSockets API.
* The Raspberry Pi is hooked up to a TV (or some other display), and the details of the track are displayed in a browser.

Simple no? We'll see how this all works out in practice.
