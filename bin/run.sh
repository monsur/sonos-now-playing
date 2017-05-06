#!/bin/sh
cd /home/pi/Documents/sonos-now-playing/dest
/home/pi/.nvm/versions/node/v7.10.0/bin/node ./app.js --live true --speakerIp `/home/pi/.nvm/versions/node/v7.10.0/bin/node ./findCoordinator.js` &
response=0
while [ $response -ne 200 ]
do
  sleep 2
  response=$(curl --write-out %{http_code} --silent --output /dev/null http://localhost:8080/health)
done
/usr/bin/chromium-browser --kiosk --incognito http://localhost:8080/index.html &
