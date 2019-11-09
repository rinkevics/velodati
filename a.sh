#!/bin/bash
hashjs=`md5sum public/bundle.js`
IFS=" "
ary=($hashjs)
hashjs=${ary[0]}

hashcss=`md5sum main.css`
IFS=" "
ary=($hashcss)
hashcss=${ary[0]}

sed  "s/{{hashjs}}/${hashjs}/g" index1.html > index.html
sed  "s/{{hashcss}}/${hashcss}/g" index.html > index.html

npm run build
