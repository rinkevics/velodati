#!/bin/bash

rm tmp.js
rm src/main.js

cat src/main1.js > tmp.js

aboutUs=`md5sum public/about-us.html`
IFS=" "
ary=($aboutUs)
aboutUs=${ary[0]}

v1=`sed "s/{{aboutUs}}/${aboutUs}/g" tmp.js`


bigImage=`md5sum public/big-image.html`
IFS=" "
ary=($bigImage)
bigImage=${ary[0]}

v1=`sed  "s/{{bigImage}}/${bigImage}/g"  <<< $v1 `


choosePlace=`md5sum public/choose-place.html`
IFS=" "
ary=($choosePlace)
choosePlace=${ary[0]}

v1=`sed  "s/{{choosePlace}}/${choosePlace}/g"  <<< $v1 `


report=`md5sum public/report.html`
IFS=" "
ary=($report)
report=${ary[0]}

v1=`sed  "s/{{report}}/${report}/g"  <<< $v1 `


start=`md5sum public/start.html`
IFS=" "
ary=($start)
start=${ary[0]}

v1=`sed  "s/{{start}}/${start}/g"  <<< $v1 `


voteTop=`md5sum public/vote-top.html`
IFS=" "
ary=($voteTop)
voteTop=${ary[0]}

v1=`sed  "s/{{voteTop}}/${voteTop}/g"  <<< $v1 `


finishMessage=`md5sum public/finish-message.html`
IFS=" "
ary=($finishMessage)
finishMessage=${ary[0]}

v1=`sed  "s/{{finishMessage}}/${finishMessage}/g"  <<< $v1 `


echo $v1 > src/main.js


npm run build

hashjs=`md5sum public/bundle.js`
IFS=" "
ary=($hashjs)
hashjs=${ary[0]}

hashcss=`md5sum public/main.css`
IFS=" "
ary=($hashcss)
hashcss=${ary[0]}

echo $hashcss
echo $hashjs

cat index1.html | sed  "s/{{hashjs}}/${hashjs}/g" | sed "s/{{hashcss}}/${hashcss}/g" > index.html
