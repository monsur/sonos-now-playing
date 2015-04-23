#!/bin/sh
cd /home/pi/Documents/sonos-now-playing/dest
/opt/node/bin/node ./app.js &
response=0
while [ $response -ne 200 ]
do
  sleep 2
  response=$(curl --write-out %{http_code} --silent --output /dev/null http://localhost:8080/health)
done
/usr/bin/chromium --kiosk --incognito http://localhost:8080/index.html &
