!function(){"use strict";function t(t,e){var o=new XMLHttpRequest;o.open("GET",t,!1),o.onreadystatechange=function(){4===this.readyState&&200===this.status&&(document.getElementById(e).innerHTML=this.responseText)},o.send()}function e(t,e,o,n){var i="";if(o){var c=new Date;c.setTime(c.getTime()+24*o*60*60*1e3),i="; expires="+c.toUTCString()}var a="";n&&(a="; secure; HttpOnly"),document.cookie=t+"="+(e||"")+i+"; path=/"+a}function o(t){for(var e=t+"=",o=document.cookie.split(";"),n=0;n<o.length;n++){for(var i=o[n];" "==i.charAt(0);)i=i.substring(1,i.length);if(0==i.indexOf(e))return i.substring(e.length,i.length)}return null}function n(){document.getElementById("spinnerBox").style.display="none"}function i(){return new Promise((function(t,e){grecaptcha.ready((function(){grecaptcha.execute("6LdfLOEUAAAAAAGmzOyh5Kk08M98p5sWceMN9HVc",{action:"homepage"}).then((function(e){t(e)}))}))}))}function c(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function a(t,e){for(var o=0;o<e.length;o++){var n=e[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function s(t,e,o){return e&&a(t.prototype,e),o&&a(t,o),t}function r(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var l=function(){function t(e){c(this,t),this.init(),window.afterFBInit=e}return s(t,[{key:"init",value:function(){var t,e,o,n,i;window.loginfun=function(){var t=encodeURI(location.protocol+"//"+location.host+"/");window.location=encodeURI("https://www.facebook.com/dialog/oauth?client_id=273875460184611&redirect_uri="+t+"&response_type=token")},window.storeHttpOnlyCookie=function(t){return window.facebookService.storeHttpOnlyCookie(t)},window.fbAsyncInit=function(){FB.init({appId:"273875460184611",cookie:!0,status:!0,xfbml:!0,version:"v3.3"}),FB.AppEvents.logPageView(),FB.Event.subscribe("auth.authResponseChange",(function(t){console.log("The status of the session changed to: "+t.status)})),window.facebookService.onLogin()},t=document,e="script",o="facebook-jssdk",i=t.getElementsByTagName(e)[0],t.getElementById(o)||((n=t.createElement(e)).id=o,n.src="https://connect.facebook.net/lv_LV/sdk.js",i.parentNode.insertBefore(n,i))}},{key:"onLogin",value:function(){this.checkFBLoginStatus().then((function(t){return window.facebookService.storeHttpOnlyCookie(t)})).then((function(t){return window.voteService.fetchMyVotes(),t})).then((function(t){return window.loginCallback&&(window.loginCallback(t),window.loginCallback=null),t}),(function(){throw"FB not logged in"})).catch((function(t){console.log(t)}))}},{key:"loginIfNeeded",value:function(){return new Promise((function(t,e){$("#loginModal").modal("hide");window.facebookService.checkFBLoginStatus().then((function(){window.facebookService.onLogin(),t()}),(function(){window.loginCallback=function(e){$("#loginModal").modal("hide"),t(e)},$("#loginModal").modal("show")}))}))}},{key:"checkFBLoginStatus",value:function(){return new Promise((function(t,e){FB.getLoginStatus((function(o){if("connected"==o.status){var n=o.authResponse.accessToken;t(n)}else e(o)}))}))}},{key:"storeHttpOnlyCookie",value:function(t){return new Promise((function(e,o){$.ajax({url:"/app/login",type:"POST",processData:!1,crossDomain:!0,headers:{token:t},data:"",success:function(){e(t)},error:function(t,e,o){console.log("Error in storeHttpOnlyCookie: "+o)}})}))}}]),t}(),d=function(){function t(){c(this,t),this.data={},window.doVote=function(t){return window.voteService.doVote(t)}}return s(t,[{key:"fetchMyVotes",value:function(){fetch("/app/myvotes",{method:"GET",cache:"no-cache"}).then((function(t){return t.json()})).then((function(t){console.log("fetch my votes"),window.myvotes=t})).catch((function(t){console.log("ploblem fetching votes "+t)}))}},{key:"doVote",value:function(t){window.placeID=t,window.facebookService.loginIfNeeded().then((function(){var t=document.getElementById("btnLike"),e=!0;t.classList.contains("btn-success")&&(e=!1),e?(t.classList.remove("btn-outline-success"),t.classList.add("btn-success")):(t.classList.add("btn-outline-success"),t.classList.remove("btn-success")),window.voteService.vote(window.placeID,e,(function(t){var o=document.getElementById("voteCount"),n=t.votes;n<1&&(n=""),o.innerHTML=n,window.myvotes[window.placeID]=e,window.votes[window.placeID]=t.votes}),(function(t,e,o){alert("Error while saving vote: "+o)}))}))}},{key:"vote",value:function(t,e,o,n){i().then((function(i){$.ajax({url:"/app/vote",type:"POST",processData:!1,crossDomain:!0,headers:{"x-captcha":i},data:"place="+t+"&isUpvote="+e,success:function(t){o(t)},error:n})}))}},{key:"toggleVoteButton",value:function(){btnLike.classList.toggle("btn-outline-success"),btnLike.classList.toggle("btn-success")}}]),t}(),u=function(){function t(){c(this,t),$("#uploadimage").change((function(){window.setImg(this)}));var e=this;$(document).on("click","#choose-location-btn",(function(){e.showCrosshair(),e.setCurrentLocation()})),$(document).on("click","#select-location-btn",(function(){e.getCrosshairLocation(),$("#report").modal("show"),e.retrieveEmailFromCookie(),e.hideCrosshair()})),$(document).on("click","#cancel-btn",(function(){e.hideCrosshair()})),$("#myform").on("submit",(function(t){e.submitForm(t)}))}return s(t,[{key:"submitForm",value:function(t){document.getElementById("spinnerBox").style.display="block",this.storeEmailInCookie();var e=new FormData($("#myform")[0]);t.preventDefault(),i().then((function(t){var o;$.ajax((r(o={url:"/app/upload",type:"POST",contentType:"multipart/form-data",processData:!1},"contentType",!1),r(o,"crossDomain",!0),r(o,"headers",{"x-captcha":t}),r(o,"data",e),r(o,"success",(function(t){n(),alert("Paldies par veloslazdu!"),location.reload()})),r(o,"error",(function(t,e,o){n(),alert("Pārliecinies, vai esi pievienojis veloslazdam kategoriju un nosaukumu! Ja neizdodas pievienot punktu, raksti uz info@datuskola.lv")})),o))}))}},{key:"showCrosshair",value:function(){document.getElementById("color-codes").classList.add("d-none"),document.getElementById("report-btn").classList.add("d-none"),document.getElementById("report-btn-2").classList.add("d-none"),document.getElementById("crosshair").classList.remove("hidden"),document.getElementById("select-location-btn").classList.remove("d-none"),document.getElementById("cancel-btn").classList.remove("d-none"),this.centerCrosshair()}},{key:"centerCrosshair",value:function(){var t=document.getElementById("main"),e=document.getElementById("box1"),o=document.getElementById("top-row"),n=t.offsetTop,i=t.offsetLeft,c=e.offsetTop-o.offsetHeight,a=i+t.offsetWidth/2-20,s=n+c/2-20,r=document.getElementById("crosshair");r.style.left=a+"px",r.style.top=s+"px"}},{key:"getCrosshairLocation",value:function(){var t=$("#top-row").height(),e=document.getElementById("crosshair"),o=L.point(e.offsetLeft+20,e.offsetTop-t),n=window.mymap.containerPointToLatLng(o);document.getElementById("lat").value=n.lat,document.getElementById("lon").value=n.lng}},{key:"hideCrosshair",value:function(){document.getElementById("color-codes").classList.remove("d-none"),document.getElementById("report-btn").classList.remove("d-none"),document.getElementById("report-btn-2").classList.remove("d-none"),document.getElementById("crosshair").classList.add("hidden"),document.getElementById("select-location-btn").classList.add("d-none"),document.getElementById("cancel-btn").classList.add("d-none")}},{key:"setCurrentLocation",value:function(){navigator.geolocation.getCurrentPosition((function(t){var e=t.coords.latitude,o=t.coords.longitude;window.mymap.setView([e,o],window.mymap.getZoom())}))}},{key:"retrieveEmailFromCookie",value:function(){var t=document.getElementById("email"),e=o("email");e&&e.length>0&&(t.value=e)}},{key:"storeEmailInCookie",value:function(){e("email",document.getElementById("email").value,3,!1)}}]),t}();function m(t){if(t.files&&t.files[0]){var e=new FileReader;e.onload=function(t){$("#img-upload").attr("src",t.target.result)},e.readAsDataURL(t.files[0])}}function p(){$("#vote-top").modal("show"),fetch("/app/top",{method:"GET",cache:"no-cache"}).then((function(t){return t.json()})).then((function(t){for(var e=["Šaurība / nepārredzamība","Strauji pagriezieni","Segums (bedres, bīstamas apmales)","Cits"],o=document.getElementById("top-content"),n="",i=1;i<=4;i++){var c=i-1;if(t&&t[c]){for(var a="",s=0;s<3;s++){var r=t[c][s];if(r){for(var l=window.places,d=r[0],u=r[1],m=null,p=0;p<l.length;p++)l[p].id==d&&(m=l[p]);if(m){var g="/images/noimage.png",f="";m.img&&m.img.length>0&&(g="/app/files/2"+m.img,f="/app/files/"+m.img),a+='<div class="top-item">\n\t\t\t\t\t\t<div class="top-image-box">\n\t\t\t\t\t\t\t<img class="top-image" src=\''.concat(g,"' full-src='").concat(f,'\' />\n\t\t\t\t\t\t</div>\t\t\n\t\t\t\t\t\t<img id="top-zoom-in" src="/images/zoom-in.png" >\n\t\t\t\t\t\t<div class="top-vote-count">👍&nbsp;').concat(u,'</div>\t\t\n\t\t\t\t\t\t<div class="top-number">').concat(s+1,'</div>\n\t\t\t\t\t\t<div class="top-text">').concat(m.description,"</div>\n\t\t\t\t\t</div>")}}}a.length>0&&(n+='<div class="vote-top-title">'.concat(i,"- ").concat(e[c],'\n\t\t\t\t\t\t\t<div class="color-box-').concat(i,'">&nbsp;</div> \n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="vote-top-row" id="type').concat(i,'">\n\t\t\t\t\t\t\t').concat(a,"\n\t\t\t\t\t\t</div>"))}}o.innerHTML=n})).catch((function(t){return console.log("e1"+t)}))}$(window).on("load",(function(){t("html/start.html","start"),t("html/choose-place.html","choose-place"),t("html/report.html","report"),t("html/vote-top.html","vote-top"),t("html/about-us.html","about-us"),t("html/big-image.html","big-image-box"),o("visited")||($("#start").modal("show"),e("visited",!0,365));var n=location.toString().split("?")[1];n&&(window.isRedirectFromFB=n.substring(1).split("&").map((function(t){return t.split("=")})).filter((function(t){return"data_access_expiration_time"==t[0]})).reduce((function(t){return t+1}),0),console.log("isRedirectFromFB ".concat(isRedirectFromFB))),window.mymap=L.map("mapid",{zoomControl:!1}).setView([56.951259,24.112614],13),L.control.zoom({position:"bottomleft"}).addTo(window.mymap),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(window.mymap),window.group=L.markerClusterGroup({chunkedLoading:!0,spiderfyOnMaxZoom:!0}),fetch("/app/places").then((function(t){return t.json()})).then((function(t){window.votes=t.votes,window.places=t.places;var n=t.places,i=[],c=[91,99],a=[45,75],s=[-3,-76];i[1]=L.icon({iconUrl:"images/location.png",iconSize:c,iconAnchor:a,popupAnchor:s}),i[2]=L.icon({iconUrl:"images/location2.png",iconSize:c,iconAnchor:a,popupAnchor:s}),i[3]=L.icon({iconUrl:"images/location3.png",iconSize:c,iconAnchor:a,popupAnchor:s}),i[4]=L.icon({iconUrl:"images/location4.png",iconSize:c,iconAnchor:a,popupAnchor:s});var r=o("placeId");e("placeId",null,1,!1);for(var l=0;l<n.length;l++){var d=n[l].id,u=L.marker([n[l].lat,n[l].lon],{icon:i[n[l].placeType],place:n[l]});u.bindPopup((function(t){var o=t.options.place,n=window.votes[o.id];n||(n="");var i,c=null;window.myvotes&&(c=window.myvotes[o.id]),i=c?"btn-success":"btn-outline-success";var a="/images/noimage.png",s="popup-noimage";return o.img&&o.img.length>0&&(a="/app/files/"+o.img,s="popup-image"),e("placeId",o.id,1,!1),"<div id='popup' class='mycontainer'>\n\t\t\t\t\t\t\t\t<div class='gridbox-left'>\n\t\t\t\t\t\t\t\t\t<img id='small-image' src='".concat(a,"' class='").concat(s,"'/> \n\t\t\t\t\t\t\t\t\t<img id='small-zoom-in' src=\"/images/zoom-in.png\" >\n\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-left'>\n\t\t\t\t\t\t\t\t\t").concat(o.description,"</div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-right'>\n\t\t\t\t\t\t\t\t\tBalsot\n\t\t\t\t\t\t\t\t\t<button type='button' id='btnLike' class='btn ").concat(i,"'\n\t\t\t\t\t\t\t\t\t\tonclick='doVote(").concat(o.id,')\'>👍 <div id="voteCount">').concat(n,"</div></button>\n                    \t\t</div>")})),window.group.addLayer(u),window.isRedirectFromFB&&d&&d==r&&(window.markerPoupup=u,window.lat=n[l].lat,window.lon=n[l].lon)}window.mymap.addLayer(window.group),window.markerPoupup&&(window.markerPoupup.openPopup(),window.mymap.setView([window.lat,window.lon],13),history.replaceState(null,null,"/"),window.loginCallback=function(){window.voteService.doVote(r)},window.facebookService.onLogin())})).catch((function(t){console.log("e2 "+t)})),window.setImg=m,window.showVoteTop=p,window.voteService=new d,window.facebookService=new l,window.showBigImage=function(t){0!=t.length&&"/images/noimage.png"!=t&&(document.getElementById("big-image-src").setAttribute("src",t),$("#big-image-box").modal("show"))};new u;$(document).on("click","#small-image",(function(){var t=document.getElementById("small-image").getAttribute("src");window.showBigImage(t)})),$(document).on("click","#small-zoom-in",(function(){var t=document.getElementById("small-image").getAttribute("src");window.showBigImage(t)})),$(document).on("click",".top-image",(function(t){var e=t.target.getAttribute("full-src");window.showBigImage(e)})),$(document).on("click","#top-zoom-in",(function(t){var e=t.target.parentNode.getElementsByClassName("top-image")[0].getAttribute("full-src");window.showBigImage(e)}))}))}();
