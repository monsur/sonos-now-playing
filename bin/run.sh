#!/bin/sh
/bin/sleep 3
cd /home/pi/Documents/sonos-now-playing/dest
node ./app.js --live true --speakerIp 192.168.86.49 &
response=0
while [ $response -ne 200 ]
do
  sleep 2
  response=$(curl --write-out %{http_code} --silent --output /dev/null http://localhost:8080/health)
done
chromium-browser --kiosk --incognito http://localhost:8080/index.html &
