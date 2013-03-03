sonos-now-playing-nodejs
========================

Hacking around with the Sonos and Node.js. The grand plan is to build something to display the currently playing track from the Sonos. The steps to acheive this are:

* Install node.js and the code in this project on a Raspberry Pi.
* The Raspberry Pi is hooked up to a TV (or some other display), and the details of the track are displayed in a browser.
* Poll the Sonos every ~1 second for the currently playing track.
* If the track changes, broadcast the details to any connected clients and update the browser UI.

Simple no? We'll see how this all works out in practice.

Some more technical details:

* Code consists of two parts: A node.js backend and HTMl/JS/CSS frontend.
* Backend uses Sonos SOAP API to poll for the currently playing track (Thanks to Rahim's SoCo project for the details: https://github.com/rahims/SoCo)
* If the currently playing track changes, the new track information is broadcast to any connected clients using the WebSockets API.
* The frontend uses Angular.js to display and update the UI.
* High-quality album art courtesy of the Last.fm API.

Screenshot:

![ScreenShot](https://raw.github.com/monsur/sonos-now-playing-nodejs/master/screenshot.png)
