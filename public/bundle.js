!function(){"use strict";function t(t,e){var o=new XMLHttpRequest;o.open("GET",t,!1),o.onreadystatechange=function(){4===this.readyState&&200===this.status&&(document.getElementById(e).innerHTML=this.responseText)},o.send()}function e(t,e,o){var n="";if(o){var i=new Date;i.setTime(i.getTime()+24*o*60*60*1e3),n="; expires="+i.toUTCString()}document.cookie=t+"="+(e||"")+n+"; path=/"}function o(t){for(var e=t+"=",o=document.cookie.split(";"),n=0;n<o.length;n++){for(var i=o[n];" "==i.charAt(0);)i=i.substring(1,i.length);if(0==i.indexOf(e))return i.substring(e.length,i.length)}return null}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){for(var o=0;o<e.length;o++){var n=e[o];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function a(t,e,o){return e&&i(t.prototype,e),o&&i(t,o),t}function s(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var c=function(){function t(e){n(this,t),this.init(),window.afterFBInit=e}return a(t,[{key:"init",value:function(){var t,e,o,n,i;window.login=function(){return window.facebookService.login()},window.storeHttpOnlyCookie=function(t){return window.facebookService.storeHttpOnlyCookie(t)},window.fbAsyncInit=function(){var t=this;FB.init({appId:"273875460184611",cookie:!0,xfbml:!0,version:"v3.3"}),FB.AppEvents.logPageView(),FB.Event.subscribe("auth.authResponseChange",(function(t){console.log("The status of the session changed to: "+t.status)})),window.loginCallback=function(){return t.window.voteService.fetchMyVotes()},window.facebookService.login()},t=document,e="script",o="facebook-jssdk",i=t.getElementsByTagName(e)[0],t.getElementById(o)||((n=t.createElement(e)).id=o,n.src="https://connect.facebook.net/lv_LV/sdk.js",i.parentNode.insertBefore(n,i))}},{key:"loginIfNeeded",value:function(t){$("#loginModal").modal("hide"),null==o("token")?(window.loginCallback=t,$("#loginModal").modal("show")):(window.loginCallback=t,window.facebookService.login())}},{key:"login",value:function(){FB.getLoginStatus((function(t){if("connected"==t.status){var o=t.authResponse.accessToken;e("token",o,1),$("#loginModal").modal("hide"),window.storeHttpOnlyCookie(o)}}))}},{key:"storeHttpOnlyCookie",value:function(t){$.ajax({url:"/app/login",type:"POST",processData:!1,crossDomain:!0,headers:{token:t},data:"",success:function(t){window.loginCallback&&window.loginCallback(),window.loginCallback=null},error:function(t,e,o){alert("Error in storeHttpOnlyCookie: "+o)}})}}]),t}(),r=function(){function t(){n(this,t),this.data={},window.doVote=function(t){return window.voteService.doVote(t)}}return a(t,[{key:"fetchMyVotes",value:function(){fetch("/app/myvotes",{method:"GET",cache:"no-cache"}).then((function(t){return t.json()})).then((function(t){console.log("fetch my votes"),window.myvotes=t})).catch((function(t){return alert(t)}))}},{key:"doVote",value:function(t){window.placeID=t,window.facebookService.loginIfNeeded((function(){var t=document.getElementById("btnLike"),e=!0;t.classList.contains("btn-success")&&(e=!1),e?(t.classList.remove("btn-outline-success"),t.classList.add("btn-success")):(t.classList.add("btn-outline-success"),t.classList.remove("btn-success")),window.voteService.vote(window.placeID,e,(function(t){var o=document.getElementById("voteCount"),n=t.votes;n<1&&(n=""),o.innerHTML=n,window.myvotes[window.placeID]=e,window.votes[window.placeID]=t.votes}),(function(t,e,o){alert("Error while saving vote: "+o)}))}))}},{key:"vote",value:function(t,e,n,i){var a=o("token");null!=a&&""!=a&&$.ajax({url:"/app/vote",type:"POST",processData:!1,crossDomain:!0,headers:{token:a},data:"place="+t+"&isUpvote="+e,success:function(t){n(t)},error:i})}},{key:"toggleVoteButton",value:function(){btnLike.classList.toggle("btn-outline-success"),btnLike.classList.toggle("btn-success")}}]),t}(),l=function(){function t(){n(this,t),$("#myimg").change((function(){window.setImg(this)}));var e=this;$(document).on("click","#choose-location-btn",(function(t){e.showCrosshair(),e.setCurrentLocation()})),$(document).on("click","#select-location-btn",(function(t){e.getCrosshairLocation(),$("#report").modal("show"),e.hideCrosshair()})),$(document).on("click","#cancel-btn",(function(t){e.hideCrosshair()})),$("#myform").on("submit",(function(t){e.submitForm(t)}))}return a(t,[{key:"submitForm",value:function(t){var e,o=new FormData($("#myform")[0]);t.preventDefault(),$.ajax((s(e={url:"/app/up",type:"POST",contentType:"multipart/form-data",processData:!1},"contentType",!1),s(e,"crossDomain",!0),s(e,"data",o),s(e,"success",(function(t){alert("Paldies par veloslazdu!"),location.reload()})),s(e,"error",(function(t,e,o){alert("Pārliecinies, vai esi pievienojis veloslazdam kategoriju un nosaukumu! Ja neizdodas pievienot punktu, raksti uz info@datuskola.lv")})),e))}},{key:"showCrosshair",value:function(){document.getElementById("report-btn").classList.add("d-none"),document.getElementById("report-btn-2").classList.add("d-none"),document.getElementById("crosshair").classList.remove("hidden"),document.getElementById("select-location-btn").classList.remove("d-none"),document.getElementById("cancel-btn").classList.remove("d-none"),this.centerCrosshair()}},{key:"centerCrosshair",value:function(){var t=document.getElementById("main"),e=t.offsetTop,o=t.offsetLeft,n=t.offsetHeight,i=o+t.offsetWidth/2-20,a=e+n/2-20,s=document.getElementById("crosshair");s.style.left=i+"px",s.style.top=a+"px"}},{key:"getCrosshairLocation",value:function(){var t=$("#top-row").height(),e=($("#crosshair").offset(),document.getElementById("crosshair")),o=L.point(e.offsetLeft+20,e.offsetTop-t),n=window.mymap.containerPointToLatLng(o);document.getElementById("lat").value=n.lat,document.getElementById("lon").value=n.lng}},{key:"onCancel",value:function(){this.hideCrosshair()}},{key:"hideCrosshair",value:function(){document.getElementById("report-btn").classList.remove("d-none"),document.getElementById("crosshair").classList.add("hidden"),document.getElementById("select-location-btn").classList.add("d-none"),document.getElementById("cancel-btn").classList.add("d-none")}},{key:"setCurrentLocation",value:function(){navigator.geolocation.getCurrentPosition((function(t){var e=t.coords.latitude,o=t.coords.longitude;window.mymap.setView([e,o],window.mymap.getZoom())}))}}]),t}();function d(t){if(t.files&&t.files[0]){var e=new FileReader;e.onload=function(t){$("#img-upload").attr("src",t.target.result)},e.readAsDataURL(t.files[0])}}function u(){$("#vote-top").modal("show"),fetch("/app/top",{method:"GET",cache:"no-cache"}).then((function(t){return t.json()})).then((function(t){for(var e=1;e<=3;e++){for(var o=document.getElementById("type"+e),n="",i=0;i<3;i++){var a=t[e-1][i];if(a){for(var s=window.places,c=a[0],r=a[1],l=null,d=0;d<s.length;d++)s[d].id==c&&(l=s[d]);l&&(n+='<div class="image">\n\t\t\t\t\t\t<img class="vote-top-img" src=\'/app/files/2'.concat(l.img,'\' />\n\t\t\t\t\t\t<div class="vote-top-place">').concat(i+1,'</div>\n\t\t\t\t\t\t<div class="vote-top-count">').concat(r,'</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="vote-top-text">').concat(l.description,"</div>"))}}o.innerHTML=n}})).catch((function(t){return alert(t)}))}$(window).on("load",(function(){t("html/start.html","start"),t("html/choose-place.html","choose-place"),t("html/report.html","report"),t("html/vote-top.html","vote-top"),t("html/about-us.html","about-us"),o("visited")||($("#start").modal("show"),e("visited",!0,365)),window.mymap=L.map("mapid",{zoomControl:!1}).setView([56.951259,24.112614],13),L.control.zoom({position:"bottomleft"}).addTo(window.mymap),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(window.mymap),window.group=L.markerClusterGroup({chunkedLoading:!0,spiderfyOnMaxZoom:!0}),fetch("/app/places").then((function(t){return t.json()})).then((function(t){console.log(3.141593),window.votes=t.votes,window.places=t.places;for(var e=t.places,o=L.icon({iconUrl:"images/location.png",iconSize:[91,99],iconAnchor:[45,75],popupAnchor:[-3,-76]}),n=0;n<e.length;n++){t.votes[e[n].id]&&t.votes[e[n].id];var i=L.marker([e[n].lat,e[n].lon],{icon:o,place:e[n]});i.bindPopup((function(t){var e=t.options.place,o=window.votes[e.id];o||(o="");var n,i=null;return window.myvotes&&(i=window.myvotes[e.id]),n=i?"btn-success":"btn-outline-success","<div id='popup' class='mycontainer'>\n\t\t\t\t\t\t\t\t<div class='gridbox-left'> \n\t\t\t\t\t\t\t\t\t<img src='/app/files/".concat(e.img,"' id='popup-image'/> </div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-left'>\n\t\t\t\t\t\t\t\t\t").concat(e.description,"</div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-right'>\n\t\t\t\t\t\t\t\t\tBalsot\n\t\t\t\t\t\t\t\t\t<button type='button' id='btnLike' class='btn ").concat(n,"'\n\t\t\t\t\t\t\t\t\t\tonclick='doVote(").concat(e.id,')\'>👍 <div id="voteCount">').concat(o,"</div></button>\n                    \t\t</div>")})),window.group.addLayer(i)}window.mymap.addLayer(window.group)})).catch((function(t){alert(t)})),window.setImg=d,window.showVoteTop=u,window.voteService=new r,window.facebookService=new c;new l}))}();
