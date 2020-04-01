#!/bin/bash
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
