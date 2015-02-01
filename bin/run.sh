/opt/node/bin/node /home/pi/Documents/sonos-now-playing/dest/app.js &
sleep 10
/usr/bin/chromium --kiosk --incognito http://localhost:8080/index.html &
