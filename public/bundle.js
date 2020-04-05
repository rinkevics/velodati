(function () {
	'use strict';

	function includeHtml(url, id) {
	  var xhr = new XMLHttpRequest();
	  xhr.open('GET', url, false);

	  xhr.onreadystatechange = function () {
	    if (this.readyState !== 4) return;
	    if (this.status !== 200) return; // or whatever error handling you want

	    document.getElementById(id).innerHTML = this.responseText;
	  };

	  xhr.send();
	}
	function setCookie(name, value, days, isSecure) {
	  var expires = "";

	  if (days) {
	    var date = new Date();
	    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
	    expires = "; expires=" + date.toUTCString();
	  }

	  var secure = "";

	  if (isSecure) {
	    secure = "; secure; HttpOnly";
	  }

	  document.cookie = name + "=" + (value || "") + expires + "; path=/" + secure;
	}
	function getCookie(name) {
	  var nameEQ = name + "=";
	  var ca = document.cookie.split(';');

	  for (var i = 0; i < ca.length; i++) {
	    var c = ca[i];

	    while (c.charAt(0) == ' ') {
	      c = c.substring(1, c.length);
	    }

	    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
	  }

	  return null;
	}
	function hideSpinner() {
	  document.getElementById("cover").style.display = "none";
	}
	function showSpinner() {
	  document.getElementById("cover").style.display = "block";
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, {
	      value: value,
	      enumerable: true,
	      configurable: true,
	      writable: true
	    });
	  } else {
	    obj[key] = value;
	  }

	  return obj;
	}

	var FacebookService =
	/*#__PURE__*/
	function () {
	  function FacebookService(afterFBInit) {
	    _classCallCheck(this, FacebookService);

	    this.init();
	    window.afterFBInit = afterFBInit;
	  }

	  _createClass(FacebookService, [{
	    key: "init",
	    value: function init() {
	      window.storeHttpOnlyCookie = function (token) {
	        return window.facebookService.storeHttpOnlyCookie(token);
	      };

	      window.fbAsyncInit = function () {
	        FB.init({
	          appId: '273875460184611',
	          cookie: true,
	          status: true,
	          xfbml: true,
	          version: 'v3.3'
	        });
	        FB.AppEvents.logPageView();
	        FB.Event.subscribe('auth.authResponseChange', function (response) {
	          console.log('The status of the session changed to: ' + response.status);
	        });
	        window.facebookService.onLogin();
	      };

	      (function (d, s, id) {
	        var js,
	            fjs = d.getElementsByTagName(s)[0];

	        if (d.getElementById(id)) {
	          return;
	        }

	        js = d.createElement(s);
	        js.id = id;
	        js.src = "https://connect.facebook.net/lv_LV/sdk.js";
	        fjs.parentNode.insertBefore(js, fjs);
	      })(document, 'script', 'facebook-jssdk');
	    }
	  }, {
	    key: "onLogin",
	    value: function onLogin() {
	      this.checkFBLoginStatus().then(function (token) {
	        return window.facebookService.storeHttpOnlyCookie(token);
	      }).then(function (token) {
	        window.voteService.fetchMyVotes();
	        return token;
	      }).then(function (token) {
	        if (window.loginCallback) {
	          window.loginCallback(token);
	          window.loginCallback = null;
	        }

	        return token;
	      }, function () {
	        throw "FB not logged in";
	      }).catch(function (e) {
	        console.log(e);
	      });
	    }
	  }, {
	    key: "loginIfNeeded",
	    value: function loginIfNeeded() {
	      return new Promise(function (resolutionFunc, rejectionFunc) {
	        $('#loginModal').modal('hide');

	        var onLoggedIn = function onLoggedIn() {
	          window.facebookService.onLogin();
	          resolutionFunc();
	        };

	        var onNotLoggedIn = function onNotLoggedIn() {
	          window.loginCallback = function (token) {
	            $('#loginModal').modal('hide');
	            resolutionFunc(token);
	          };

	          $('#loginModal').modal('show');
	        };

	        window.facebookService.checkFBLoginStatus().then(onLoggedIn, onNotLoggedIn);
	      });
	    }
	  }, {
	    key: "checkFBLoginStatus",
	    value: function checkFBLoginStatus() {
	      return new Promise(function (resolutionFunc, rejectionFunc) {
	        FB.getLoginStatus(function (response) {
	          if (response.status == "connected") {
	            var token = response.authResponse.accessToken;
	            resolutionFunc(token);
	          } else {
	            rejectionFunc(response);
	          }
	        });
	      });
	    }
	  }, {
	    key: "storeHttpOnlyCookie",
	    value: function storeHttpOnlyCookie(token) {
	      return new Promise(function (resolutionFunc, rejectionFunc) {
	        $.ajax({
	          url: "/app/login",
	          type: "POST",
	          processData: false,
	          crossDomain: true,
	          headers: {
	            "token": token
	          },
	          data: "",
	          success: function success() {
	            resolutionFunc();
	          },
	          error: function error(jXHR, textStatus, errorThrown) {
	            console.log("Error in storeHttpOnlyCookie: " + errorThrown);
	          }
	        });
	      });
	    }
	  }]);

	  return FacebookService;
	}();

	var VoteService =
	/*#__PURE__*/
	function () {
	  function VoteService() {
	    _classCallCheck(this, VoteService);

	    this.data = {};

	    window.doVote = function (placeID) {
	      return window.voteService.doVote(placeID);
	    };
	  }

	  _createClass(VoteService, [{
	    key: "fetchMyVotes",
	    value: function fetchMyVotes() {
	      fetch('/app/myvotes', {
	        method: 'GET',
	        cache: 'no-cache'
	      }).then(function (response) {
	        return response.json();
	      }).then(function (data) {
	        console.log("fetch my votes");
	        window.myvotes = data;
	      }).catch(function (e) {
	        console.log("ploblem fetching votes " + e);
	      });
	    }
	  }, {
	    key: "doVote",
	    value: function doVote(placeID) {
	      window.placeID = placeID;
	      window.facebookService.loginIfNeeded().then(function () {
	        var btnLike = document.getElementById("btnLike");
	        var doUpvote = true;

	        if (btnLike.classList.contains('btn-success')) {
	          doUpvote = false;
	        }

	        if (doUpvote) {
	          btnLike.classList.remove('btn-outline-success');
	          btnLike.classList.add('btn-success');
	        } else {
	          btnLike.classList.add('btn-outline-success');
	          btnLike.classList.remove('btn-success');
	        }

	        window.voteService.vote(window.placeID, doUpvote, function (data) {
	          var voteCountElement = document.getElementById("voteCount");
	          var voteCount = data.votes;

	          if (voteCount < 1) {
	            voteCount = "";
	          }

	          voteCountElement.innerHTML = voteCount;
	          window.myvotes[window.placeID] = doUpvote;
	          window.votes[window.placeID] = data.votes;
	        }, function (jXHR, textStatus, errorThrown) {
	          alert("Error while saving vote: " + errorThrown);
	        });
	      });
	    }
	  }, {
	    key: "vote",
	    value: function vote(placeID, isUpvote, onSuccess, onError) {
	      $.ajax({
	        url: "/app/vote",
	        type: "POST",
	        processData: false,
	        crossDomain: true,
	        data: "place=" + placeID + "&isUpvote=" + isUpvote,
	        success: function success(data) {
	          onSuccess(data);
	        },
	        error: onError
	      });
	    }
	  }, {
	    key: "toggleVoteButton",
	    value: function toggleVoteButton() {
	      /*let voteCountElement = document.getElementById("voteCount");
	      voteCount = voteCountElement.getAttribute("voteCount");
	      const voteCountInt = Number.parseInt(voteCount);
	      		if(isUpvote) {
	      	voteCountElement.innerHTML = voteCountInt + 1;
	      } else {
	      	voteCountElement.innerHTML = voteCountInt - 1;
	      }*/
	      btnLike.classList.toggle('btn-outline-success');
	      btnLike.classList.toggle('btn-success');
	    }
	  }]);

	  return VoteService;
	}();

	var AddPlace =
	/*#__PURE__*/
	function () {
	  function AddPlace() {
	    _classCallCheck(this, AddPlace);

	    $("#uploadimage").change(function () {
	      window.setImg(this);
	    });
	    var that = this;
	    $(document).on("click", "#choose-location-btn", function (event) {
	      that.showCrosshair();
	      that.setCurrentLocation();
	    });
	    $(document).on("click", "#select-location-btn", function (event) {
	      that.getCrosshairLocation();
	      $('#report').modal('show');
	      that.hideCrosshair();
	    });
	    $(document).on("click", "#cancel-btn", function (event) {
	      that.hideCrosshair();
	    });
	    $('#myform').on('submit', function (e) {
	      that.submitForm(e);
	    });
	  }

	  _createClass(AddPlace, [{
	    key: "submitForm",
	    value: function submitForm(e) {
	      var _$$ajax;

	      var data = new FormData($('#myform')[0]);
	      e.preventDefault();
	      showSpinner();
	      $.ajax((_$$ajax = {
	        url: '/app/upload',
	        type: "POST",
	        contentType: 'multipart/form-data',
	        processData: false
	      }, _defineProperty(_$$ajax, "contentType", false), _defineProperty(_$$ajax, "crossDomain", true), _defineProperty(_$$ajax, "data", data), _defineProperty(_$$ajax, "success", function success(data) {
	        hideSpinner();
	        alert("Paldies par veloslazdu!");
	        location.reload();
	      }), _defineProperty(_$$ajax, "error", function error(jXHR, textStatus, errorThrown) {
	        hideSpinner();
	        alert("Pārliecinies, vai esi pievienojis veloslazdam kategoriju un nosaukumu!" + " Ja neizdodas pievienot punktu, raksti uz info@datuskola.lv");
	      }), _$$ajax));
	    }
	  }, {
	    key: "showCrosshair",
	    value: function showCrosshair() {
	      var element = document.getElementById("report-btn");
	      element.classList.add("d-none");
	      var element = document.getElementById("report-btn-2");
	      element.classList.add("d-none");
	      var crosshair = document.getElementById("crosshair");
	      crosshair.classList.remove("hidden");
	      var selectLocationButton = document.getElementById("select-location-btn");
	      selectLocationButton.classList.remove("d-none");
	      var cancelButton = document.getElementById("cancel-btn");
	      cancelButton.classList.remove("d-none");
	      this.centerCrosshair();
	    }
	  }, {
	    key: "centerCrosshair",
	    value: function centerCrosshair() {
	      var map = document.getElementById("main");
	      var turpinat = document.getElementById("box1");
	      var topRow = document.getElementById("top-row");
	      var top = map.offsetTop;
	      var left = map.offsetLeft;
	      var height = turpinat.offsetTop - topRow.offsetHeight;
	      var width = map.offsetWidth;
	      var x = left + width / 2 - 20;
	      var y = top + height / 2 - 20; //console.log(`x: ${x} y: ${y}`);

	      var crosshair = document.getElementById("crosshair");
	      crosshair.style.left = x + "px";
	      crosshair.style.top = y + "px";
	    }
	  }, {
	    key: "getCrosshairLocation",
	    value: function getCrosshairLocation() {
	      var topRowHeight = $('#top-row').height();
	      var crosshair = document.getElementById("crosshair");
	      var point = L.point(crosshair.offsetLeft + 20, crosshair.offsetTop - topRowHeight);
	      var latlon = window.mymap.containerPointToLatLng(point);
	      document.getElementById("lat").value = latlon.lat;
	      document.getElementById("lon").value = latlon.lng;
	    }
	  }, {
	    key: "hideCrosshair",
	    value: function hideCrosshair() {
	      var element = document.getElementById("report-btn");
	      element.classList.remove("d-none");
	      var element = document.getElementById("report-btn-2");
	      element.classList.remove("d-none");
	      var element2 = document.getElementById("crosshair");
	      element2.classList.add("hidden");
	      var selectLocationButton = document.getElementById("select-location-btn");
	      selectLocationButton.classList.add("d-none");
	      var cancelButton = document.getElementById("cancel-btn");
	      cancelButton.classList.add("d-none");
	    }
	  }, {
	    key: "setCurrentLocation",
	    value: function setCurrentLocation() {
	      navigator.geolocation.getCurrentPosition(function (pos) {
	        var lat = pos.coords.latitude;
	        var lon = pos.coords.longitude;
	        window.mymap.setView([lat, lon], window.mymap.getZoom());
	      });
	    }
	  }]);

	  return AddPlace;
	}();

	function initMap() {
	  window.mymap = L.map('mapid', {
	    zoomControl: false
	  }).setView([56.951259, 24.112614], 13);
	  L.control.zoom({
	    position: 'bottomleft'
	  }).addTo(window.mymap);
	  var layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    maxZoom: 18,
	    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	  }).addTo(window.mymap);
	  window.group = L.markerClusterGroup({
	    chunkedLoading: true,
	    //disableClusteringAtZoom: 17,
	    spiderfyOnMaxZoom: true
	  });
	  fetch('/app/places').then(function (response) {
	    return response.json();
	  }).then(function (data) {
	    window.votes = data.votes;
	    window.places = data.places;
	    var places = data.places;
	    var icons = [];
	    var iconSize = [91, 99]; // size of the icon

	    var iconAnchor = [45, 75]; // point of the icon which will correspond to marker's location

	    var popupAnchor = [-3, -76]; // point from which the popup should open relative to the iconAnchor

	    icons[1] = L.icon({
	      iconUrl: 'images/location.png',
	      iconSize: iconSize,
	      iconAnchor: iconAnchor,
	      popupAnchor: popupAnchor
	    });
	    icons[2] = L.icon({
	      iconUrl: 'images/location2.png',
	      iconSize: iconSize,
	      iconAnchor: iconAnchor,
	      popupAnchor: popupAnchor
	    });
	    icons[3] = L.icon({
	      iconUrl: 'images/location3.png',
	      iconSize: iconSize,
	      iconAnchor: iconAnchor,
	      popupAnchor: popupAnchor
	    });

	    for (var i = 0; i < places.length; i++) {
	      var voteCountInput = data.votes[places[i].id];
	      var voteCount = "";

	      if (voteCountInput) {
	        voteCount = "&nbsp;" + data.votes[places[i].id];
	      }

	      var marker = L.marker([places[i].lat, places[i].lon], {
	        icon: icons[places[i].placeType],
	        place: places[i]
	      });
	      marker.bindPopup(function (context) {
	        var place = context.options.place;
	        var voteCount = window.votes[place.id];

	        if (!voteCount) {
	          voteCount = "";
	        }

	        var isUpvote = null;

	        if (window.myvotes) {
	          isUpvote = window.myvotes[place.id];
	        }

	        var upvoteClass;

	        if (isUpvote) {
	          upvoteClass = "btn-success";
	        } else {
	          upvoteClass = "btn-outline-success";
	        }

	        var imgSrc = "/images/noimage.png";
	        var imgClass = "popup-noimage";

	        if (place.img && place.img.length > 0) {
	          imgSrc = "/app/files/" + place.img;
	          imgClass = "popup-image";
	        }

	        return "<div id='popup' class='mycontainer'>\n\t\t\t\t\t\t\t\t<div class='gridbox-left'> \n\t\t\t\t\t\t\t\t\t<img src='".concat(imgSrc, "' class='").concat(imgClass, "'/> </div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-left'>\n\t\t\t\t\t\t\t\t\t").concat(place.description, "</div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-right'>\n\t\t\t\t\t\t\t\t\tBalsot\n\t\t\t\t\t\t\t\t\t<button type='button' id='btnLike' class='btn ").concat(upvoteClass, "'\n\t\t\t\t\t\t\t\t\t\tonclick='doVote(").concat(place.id, ")'>\uD83D\uDC4D <div id=\"voteCount\">").concat(voteCount, "</div></button>\n                    \t\t</div>");
	      });
	      window.group.addLayer(marker);
	    }

	    window.mymap.addLayer(window.group);
	  }).catch(function (err) {
	    alert("e2 " + err);
	  });
	}

	function setImg(input) {
	  if (input.files && input.files[0]) {
	    var reader = new FileReader();

	    reader.onload = function (e) {
	      $('#img-upload').attr('src', e.target.result);
	    };

	    reader.readAsDataURL(input.files[0]);
	  }
	}

	function showVoteTop() {
	  $('#vote-top').modal('show');
	  fetch('/app/top', {
	    method: 'GET',
	    cache: 'no-cache'
	  }).then(function (response) {
	    return response.json();
	  }).then(function (data) {
	    var titles = ["Šaurība / nepārredzamība", "Strauji pagriezieni", "Segums (bedres, bīstamas apmales)"];
	    var contentElement = document.getElementById("top-content");
	    var result = "";

	    for (var type = 1; type <= 3; type++) {
	      var idx = type - 1;

	      if (!data || !data[idx]) {
	        continue;
	      }

	      var top3 = "";

	      for (var i = 0; i < 3; i++) {
	        var topPlace = data[idx][i];

	        if (!topPlace) {
	          continue;
	        }

	        var places = window.places;
	        var id = topPlace[0];
	        var voteCount = topPlace[1];
	        var place = null;

	        for (var j = 0; j < places.length; j++) {
	          if (places[j].id == id) {
	            place = places[j];
	          }
	        }

	        if (!place) {
	          continue;
	        }

	        var imgSrc = "/images/noimage.png";

	        if (place.img && place.img.length > 0) {
	          imgSrc = "/app/files/2" + place.img;
	        }
	        /*<div class="top-txt">${voteCount}</div>*/


	        top3 += "<div class=\"top-item\">\n\t\t\t\t\t\t<div class=\"top-image-box\">\n\t\t\t\t\t\t\t<img class=\"top-image\" src='".concat(imgSrc, "'/> \n\t\t\t\t\t\t</div>\t\t\t\t\n\t\t\t\t\t\t<div class=\"top-number\">").concat(i + 1, "</div>\n\t\t\t\t\t\t<div class=\"top-text\">").concat(place.description, "</div>\n\t\t\t\t\t</div>");
	      }

	      if (top3.length > 0) {
	        result += "<div class=\"vote-top-title\">".concat(type, "- ").concat(titles[idx], "</div>\n\t\t\t\t\t\t<div class=\"vote-top-row\" id=\"type").concat(type, "\">\n\t\t\t\t\t\t\t").concat(top3, "\n\t\t\t\t\t\t</div>");
	      }
	    }

	    contentElement.innerHTML = result;
	  }).catch(function (e) {
	    return alert("e1" + e);
	  });
	}

	$(window).on("load", function () {
	  includeHtml('html/start.html', 'start');
	  includeHtml('html/choose-place.html', 'choose-place');
	  includeHtml('html/report.html', 'report');
	  includeHtml('html/vote-top.html', 'vote-top');
	  includeHtml('html/about-us.html', 'about-us');
	  var visited = getCookie("visited");

	  if (!visited) {
	    $('#start').modal('show');
	    setCookie("visited", true, 365);
	  }

	  initMap();
	  window.setImg = setImg;
	  window.showVoteTop = showVoteTop;
	  window.voteService = new VoteService();
	  window.facebookService = new FacebookService();
	  var addPlace = new AddPlace();
	});

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiLCIuLi9zcmMvZmFjZWJvb2tTZXJ2aWNlLmpzIiwiLi4vc3JjL3ZvdGVTZXJ2aWNlLmpzIiwiLi4vc3JjL2FkZFBsYWNlLmpzIiwiLi4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSHRtbCh1cmwsIGlkKSB7XHJcblx0dmFyIHhocj0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0eGhyLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UpO1xyXG5cdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2U9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSE9PTQpIHJldHVybjtcclxuXHRcdGlmICh0aGlzLnN0YXR1cyE9PTIwMCkgcmV0dXJuOyAvLyBvciB3aGF0ZXZlciBlcnJvciBoYW5kbGluZyB5b3Ugd2FudFxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLmlubmVySFRNTD0gdGhpcy5yZXNwb25zZVRleHQ7XHJcblx0fTtcclxuXHR4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsdmFsdWUsZGF5cywgaXNTZWN1cmUpIHtcclxuXHR2YXIgZXhwaXJlcyA9IFwiXCI7XHJcblx0aWYgKGRheXMpIHtcclxuXHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIChkYXlzKjI0KjYwKjYwKjEwMDApKTtcclxuXHRcdGV4cGlyZXMgPSBcIjsgZXhwaXJlcz1cIiArIGRhdGUudG9VVENTdHJpbmcoKTtcclxuXHR9XHJcblx0bGV0IHNlY3VyZSA9IFwiXCI7XHJcblx0aWYgKGlzU2VjdXJlKSB7XHJcblx0XHRzZWN1cmUgPSBcIjsgc2VjdXJlOyBIdHRwT25seVwiO1xyXG5cdH1cclxuXHRkb2N1bWVudC5jb29raWUgPSBuYW1lICsgXCI9XCIgKyAodmFsdWUgfHwgXCJcIikgICsgZXhwaXJlcyArIFwiOyBwYXRoPS9cIiArIHNlY3VyZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvb2tpZShuYW1lKSB7XHJcblx0XHR2YXIgbmFtZUVRID0gbmFtZSArIFwiPVwiO1xyXG5cdFx0dmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XHJcblx0XHRmb3IodmFyIGk9MDtpIDwgY2EubGVuZ3RoO2krKykge1xyXG5cdFx0XHRcdHZhciBjID0gY2FbaV07XHJcblx0XHRcdFx0d2hpbGUgKGMuY2hhckF0KDApPT0nICcpIGMgPSBjLnN1YnN0cmluZygxLGMubGVuZ3RoKTtcclxuXHRcdFx0XHRpZiAoYy5pbmRleE9mKG5hbWVFUSkgPT0gMCkgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWVFUS5sZW5ndGgsYy5sZW5ndGgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKSB7XHJcblx0XHRkb2N1bWVudC5jb29raWUgPSBuYW1lKyc9OyBNYXgtQWdlPS05OTk5OTk5OTsnOyAgXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoaWRlU3Bpbm5lcigpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY292ZXJcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1NwaW5uZXIoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdmVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IHNldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihhZnRlckZCSW5pdCkge1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIHdpbmRvdy5hZnRlckZCSW5pdCA9IGFmdGVyRkJJbml0O1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgd2luZG93LnN0b3JlSHR0cE9ubHlDb29raWUgPSAodG9rZW4pID0+IHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uuc3RvcmVIdHRwT25seUNvb2tpZSh0b2tlbik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93LmZiQXN5bmNJbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIEZCLmluaXQoe1x0XHJcbiAgICAgICAgICAgICAgICBhcHBJZCAgIDogJzI3Mzg3NTQ2MDE4NDYxMScsXHJcbiAgICAgICAgICAgICAgICBjb29raWUgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN0YXR1cyAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgeGZibWwgICA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB2ZXJzaW9uIDogJ3YzLjMnIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIEZCLkFwcEV2ZW50cy5sb2dQYWdlVmlldygpO1xyXG5cclxuICAgICAgICAgICAgRkIuRXZlbnQuc3Vic2NyaWJlKCdhdXRoLmF1dGhSZXNwb25zZUNoYW5nZScsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhlIHN0YXR1cyBvZiB0aGUgc2Vzc2lvbiBjaGFuZ2VkIHRvOiAnK3Jlc3BvbnNlLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgd2luZG93LmZhY2Vib29rU2VydmljZS5vbkxvZ2luKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICAoZnVuY3Rpb24oZCwgcywgaWQpe1xyXG4gICAgICAgICAgICB2YXIganMsIGZqcyA9IGQuZ2V0RWxlbWVudHNCeVRhZ05hbWUocylbMF07XHJcbiAgICAgICAgICAgIGlmIChkLmdldEVsZW1lbnRCeUlkKGlkKSkge3JldHVybjt9XHJcbiAgICAgICAgICAgIGpzID0gZC5jcmVhdGVFbGVtZW50KHMpOyBqcy5pZCA9IGlkO1xyXG4gICAgICAgICAgICBqcy5zcmMgPSBcImh0dHBzOi8vY29ubmVjdC5mYWNlYm9vay5uZXQvbHZfTFYvc2RrLmpzXCI7XHJcbiAgICAgICAgICAgIGZqcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqcywgZmpzKTtcclxuICAgICAgICB9KGRvY3VtZW50LCAnc2NyaXB0JywgJ2ZhY2Vib29rLWpzc2RrJykpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG9uTG9naW4oKSB7XHJcbiAgICAgICAgdGhpcy5jaGVja0ZCTG9naW5TdGF0dXMoKVxyXG4gICAgICAgICAgICAudGhlbih0b2tlbiA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmZhY2Vib29rU2VydmljZS5zdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKTtcclxuICAgICAgICAgICAgfSkgXHJcbiAgICAgICAgICAgIC50aGVuKHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy52b3RlU2VydmljZS5mZXRjaE15Vm90ZXMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICB0b2tlbiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYod2luZG93LmxvZ2luQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvZ2luQ2FsbGJhY2sodG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJGQiBub3QgbG9nZ2VkIGluXCI7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvZ2luSWZOZWVkZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x1dGlvbkZ1bmMsIHJlamVjdGlvbkZ1bmMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICQoJyNsb2dpbk1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9nZ2VkSW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLm9uTG9naW4oKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTm90TG9nZ2VkSW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayA9IHRva2VuID0+IHsgXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2xvZ2luTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKHRva2VuKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAkKCcjbG9naW5Nb2RhbCcpLm1vZGFsKCdzaG93Jyk7IFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLmNoZWNrRkJMb2dpblN0YXR1cygpXHJcbiAgICAgICAgICAgICAgICAudGhlbihvbkxvZ2dlZEluLCBvbk5vdExvZ2dlZEluKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNoZWNrRkJMb2dpblN0YXR1cygpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXNvbHV0aW9uRnVuYywgcmVqZWN0aW9uRnVuYykgPT4ge1xyXG4gICAgICAgICAgICBGQi5nZXRMb2dpblN0YXR1cyhmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09IFwiY29ubmVjdGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG9rZW4gPSByZXNwb25zZS5hdXRoUmVzcG9uc2UuYWNjZXNzVG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmModG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3Rpb25GdW5jKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RvcmVIdHRwT25seUNvb2tpZSh0b2tlbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdXRpb25GdW5jLCByZWplY3Rpb25GdW5jKSA9PiB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmwgOiBcIi9hcHAvbG9naW5cIixcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0b2tlblwiOnRva2VuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogXCJcIixcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHV0aW9uRnVuYygpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIGluIHN0b3JlSHR0cE9ubHlDb29raWU6IFwiKyBlcnJvclRocm93bik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHRcclxufVxyXG4iLCJpbXBvcnQgeyBnZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgc2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IGVyYXNlQ29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVm90ZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmRhdGEgPSB7fTtcclxuXHRcdHdpbmRvdy5kb1ZvdGUgPSAocGxhY2VJRCkgPT4gd2luZG93LnZvdGVTZXJ2aWNlLmRvVm90ZShwbGFjZUlEKTtcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaE15Vm90ZXMoKSB7XHJcblx0XHRmZXRjaCgnL2FwcC9teXZvdGVzJyxcclxuXHRcdHtcclxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0Y2FjaGU6ICduby1jYWNoZSdcclxuXHRcdH0pXHJcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XHJcblx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKClcclxuXHRcdH0pXHJcblx0XHQudGhlbihkYXRhID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJmZXRjaCBteSB2b3Rlc1wiKTtcclxuICAgICAgICAgICAgd2luZG93Lm15dm90ZXMgPSBkYXRhO1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJwbG9ibGVtIGZldGNoaW5nIHZvdGVzIFwiICsgZSlcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZG9Wb3RlKHBsYWNlSUQpIHtcclxuXHRcdHdpbmRvdy5wbGFjZUlEID0gcGxhY2VJRDtcclxuXHRcdFx0XHRcclxuXHRcdHdpbmRvdy5mYWNlYm9va1NlcnZpY2UubG9naW5JZk5lZWRlZCgpXHJcblx0XHRcdC50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRjb25zdCBidG5MaWtlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG5MaWtlXCIpO1xyXG5cdFx0XHRcdGxldCBkb1Vwdm90ZSA9IHRydWU7XHJcblx0XHRcdFx0aWYoYnRuTGlrZS5jbGFzc0xpc3QuY29udGFpbnMoJ2J0bi1zdWNjZXNzJykpIHtcclxuXHRcdFx0XHRcdGRvVXB2b3RlID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGRvVXB2b3RlKSB7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1vdXRsaW5lLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHRcdGJ0bkxpa2UuY2xhc3NMaXN0LmFkZCgnYnRuLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QuYWRkKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1zdWNjZXNzJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHdpbmRvdy52b3RlU2VydmljZS52b3RlKFxyXG5cdFx0XHRcdFx0d2luZG93LnBsYWNlSUQsXHJcblx0XHRcdFx0XHRkb1Vwdm90ZSxcclxuXHRcdFx0XHRcdChkYXRhKSA9PiB7XHJcblx0XHRcdFx0XHRcdGxldCB2b3RlQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2b3RlQ291bnRcIik7XHJcblx0XHRcdFx0XHRcdGxldCB2b3RlQ291bnQgPSBkYXRhLnZvdGVzO1xyXG5cdFx0XHRcdFx0XHRpZih2b3RlQ291bnQgPCAxKSB7XHJcblx0XHRcdFx0XHRcdFx0dm90ZUNvdW50ID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR2b3RlQ291bnRFbGVtZW50LmlubmVySFRNTCA9IHZvdGVDb3VudDtcclxuXHRcdFx0XHRcdFx0d2luZG93Lm15dm90ZXNbd2luZG93LnBsYWNlSURdID0gZG9VcHZvdGU7XHJcblx0XHRcdFx0XHRcdHdpbmRvdy52b3Rlc1t3aW5kb3cucGxhY2VJRF0gPSBkYXRhLnZvdGVzO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdChqWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikgPT4ge1xyXG5cdFx0XHRcdFx0XHRhbGVydChcIkVycm9yIHdoaWxlIHNhdmluZyB2b3RlOiBcIisgZXJyb3JUaHJvd24pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHR2b3RlKHBsYWNlSUQsIGlzVXB2b3RlLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcdFx0XHRcdFx0XHJcblx0XHQkLmFqYXgoe1xyXG5cdFx0XHRcdHVybCA6IFwiL2FwcC92b3RlXCIsXHJcblx0XHRcdFx0dHlwZTogXCJQT1NUXCIsXHJcblx0XHRcdFx0cHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG5cdFx0XHRcdGNyb3NzRG9tYWluOiB0cnVlLFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGRhdGE6IFwicGxhY2U9XCIrIHBsYWNlSUQgKyBcIiZpc1Vwdm90ZT1cIiArIGlzVXB2b3RlLFxyXG5cdFx0XHRcdHN1Y2Nlc3M6IChkYXRhKSA9PiB7XHJcblx0XHRcdFx0XHRvblN1Y2Nlc3MoZGF0YSk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRlcnJvcjogb25FcnJvclxyXG5cdFx0XHR9KTtcclxuXHJcblx0fVxyXG5cdFx0XHJcblx0dG9nZ2xlVm90ZUJ1dHRvbigpIHtcclxuXHRcdC8qbGV0IHZvdGVDb3VudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZvdGVDb3VudFwiKTtcclxuXHRcdHZvdGVDb3VudCA9IHZvdGVDb3VudEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwidm90ZUNvdW50XCIpO1xyXG5cdFx0Y29uc3Qgdm90ZUNvdW50SW50ID0gTnVtYmVyLnBhcnNlSW50KHZvdGVDb3VudCk7XHJcblxyXG5cdFx0aWYoaXNVcHZvdGUpIHtcclxuXHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnRJbnQgKyAxO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnRJbnQgLSAxO1xyXG5cdFx0fSovXHJcblxyXG5cdFx0YnRuTGlrZS5jbGFzc0xpc3QudG9nZ2xlKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRidG5MaWtlLmNsYXNzTGlzdC50b2dnbGUoJ2J0bi1zdWNjZXNzJyk7XHJcblx0fVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBzaG93U3Bpbm5lciwgaGlkZVNwaW5uZXIgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBZGRQbGFjZSB7XHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgJChcIiN1cGxvYWRpbWFnZVwiKS5jaGFuZ2UoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgd2luZG93LnNldEltZyh0aGlzKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNjaG9vc2UtbG9jYXRpb24tYnRuXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgdGhhdC5zaG93Q3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Q3VycmVudExvY2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3NlbGVjdC1sb2NhdGlvbi1idG5cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICB0aGF0LmdldENyb3NzaGFpckxvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICQoJyNyZXBvcnQnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB0aGF0LmhpZGVDcm9zc2hhaXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI2NhbmNlbC1idG5cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICB0aGF0LmhpZGVDcm9zc2hhaXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgICQoJyNteWZvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB0aGF0LnN1Ym1pdEZvcm0oZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1Ym1pdEZvcm0oZSkge1xyXG4gICAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCQoJyNteWZvcm0nKVswXSk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNob3dTcGlubmVyKCk7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsIDogJy9hcHAvdXBsb2FkJyxcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScsXHJcbiAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGhpZGVTcGlubmVyKCk7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlBhbGRpZXMgcGFyIHZlbG9zbGF6ZHUhXCIpO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgIGhpZGVTcGlubmVyKCk7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlDEgXJsaWVjaW5pZXMsIHZhaSBlc2kgcGlldmllbm9qaXMgdmVsb3NsYXpkYW0ga2F0ZWdvcmlqdSB1biBub3NhdWt1bXUhXCIrXHJcbiAgICAgICAgICAgICAgICAgICAgXCIgSmEgbmVpemRvZGFzIHBpZXZpZW5vdCBwdW5rdHUsIHJha3N0aSB1eiBpbmZvQGRhdHVza29sYS5sdlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcG9ydC1idG5cIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0bi0yXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIGNyb3NzaGFpci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgc2VsZWN0TG9jYXRpb25CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdC1sb2NhdGlvbi1idG5cIik7XHJcbiAgICAgICAgc2VsZWN0TG9jYXRpb25CdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FuY2VsLWJ0blwiKTtcclxuICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jZW50ZXJDcm9zc2hhaXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBjZW50ZXJDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKTtcclxuICAgICAgICB2YXIgdHVycGluYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJveDFcIik7XHJcbiAgICAgICAgdmFyIHRvcFJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wLXJvd1wiKTtcclxuXHJcbiAgICAgICAgdmFyIHRvcCA9IG1hcC5vZmZzZXRUb3A7XHJcbiAgICAgICAgdmFyIGxlZnQgPSBtYXAub2Zmc2V0TGVmdDtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gdHVycGluYXQub2Zmc2V0VG9wIC0gdG9wUm93Lm9mZnNldEhlaWdodDtcclxuICAgICAgICB2YXIgd2lkdGggPSBtYXAub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIHZhciB4ID0gbGVmdCArICh3aWR0aCAvIDIpIC0gMjA7XHJcbiAgICAgICAgdmFyIHkgPSB0b3AgKyAoaGVpZ2h0IC8gMikgLSAyMDtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhgeDogJHt4fSB5OiAke3l9YCk7XHJcblxyXG4gICAgICAgIHZhciBjcm9zc2hhaXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyb3NzaGFpclwiKTtcclxuICAgICAgICBjcm9zc2hhaXIuc3R5bGUubGVmdCA9IHggKyBcInB4XCI7XHJcbiAgICAgICAgY3Jvc3NoYWlyLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3Jvc3NoYWlyTG9jYXRpb24oKSB7XHRcclxuICAgICAgICB2YXIgdG9wUm93SGVpZ2h0ID0gJCgnI3RvcC1yb3cnKS5oZWlnaHQoKTtcclxuICAgICAgICB2YXIgY3Jvc3NoYWlyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHBvaW50ID0gTC5wb2ludCggY3Jvc3NoYWlyLm9mZnNldExlZnQgKyAyMCwgY3Jvc3NoYWlyLm9mZnNldFRvcCAtIHRvcFJvd0hlaWdodCApO1xyXG4gICAgICAgIGNvbnN0IGxhdGxvbiA9IHdpbmRvdy5teW1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50KTtcclxuICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhdFwiKS52YWx1ZSA9IGxhdGxvbi5sYXQ7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb25cIikudmFsdWUgPSBsYXRsb24ubG5nO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcG9ydC1idG5cIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZC1ub25lXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXBvcnQtYnRuLTJcIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgZWxlbWVudDIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyb3NzaGFpclwiKTtcclxuICAgICAgICBlbGVtZW50Mi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgc2VsZWN0TG9jYXRpb25CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdC1sb2NhdGlvbi1idG5cIik7XHJcbiAgICAgICAgc2VsZWN0TG9jYXRpb25CdXR0b24uY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FuY2VsLWJ0blwiKTtcclxuICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDdXJyZW50TG9jYXRpb24oKSB7XHJcbiAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihcclxuICAgICAgICAgICAgcG9zID0+ICB7XHRcdFx0XHRcdFxyXG4gICAgICAgICAgICAgICAgY29uc3QgbGF0ID0gcG9zLmNvb3Jkcy5sYXRpdHVkZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxvbiA9IHBvcy5jb29yZHMubG9uZ2l0dWRlO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubXltYXAuc2V0VmlldyhbbGF0LCBsb25dLCB3aW5kb3cubXltYXAuZ2V0Wm9vbSgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgaW5jbHVkZUh0bWwgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgRmFjZWJvb2tTZXJ2aWNlIH0gZnJvbSAnLi9mYWNlYm9va1NlcnZpY2UuanMnO1xyXG5pbXBvcnQgeyBWb3RlU2VydmljZSB9IGZyb20gJy4vdm90ZVNlcnZpY2UuanMnO1xyXG5pbXBvcnQgeyBzZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IEFkZFBsYWNlIH0gZnJvbSAnLi9hZGRQbGFjZS5qcyc7XHJcblx0XHJcbmZ1bmN0aW9uIGluaXRNYXAoKSB7XHRcclxuXHRcdFx0XHRcclxuXHR3aW5kb3cubXltYXAgPSBMLm1hcChcclxuXHQgICAgJ21hcGlkJyxcclxuXHQgICAgeyB6b29tQ29udHJvbDogZmFsc2UgfVxyXG5cdCkuc2V0VmlldyhbNTYuOTUxMjU5LCAyNC4xMTI2MTRdLCAxMyk7XHJcblxyXG5cdEwuY29udHJvbC56b29tKHtcclxuICAgICAgICAgcG9zaXRpb246J2JvdHRvbWxlZnQnXHJcbiAgICB9KS5hZGRUbyh3aW5kb3cubXltYXApO1xyXG5cclxuXHRjb25zdCBsYXllciA9IEwudGlsZUxheWVyKCdodHRwczovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcclxuXHRcdG1heFpvb206IDE4LFxyXG5cdFx0YXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHBzOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycydcclxuXHR9KS5hZGRUbyh3aW5kb3cubXltYXApO1xyXG5cclxuXHR3aW5kb3cuZ3JvdXAgPSBMLm1hcmtlckNsdXN0ZXJHcm91cCh7XHJcblx0XHRjaHVua2VkTG9hZGluZzogdHJ1ZSxcclxuXHRcdC8vZGlzYWJsZUNsdXN0ZXJpbmdBdFpvb206IDE3LFxyXG5cdFx0c3BpZGVyZnlPbk1heFpvb206IHRydWVcclxuXHQgIH0pO1xyXG5cclxuXHRmZXRjaCgnL2FwcC9wbGFjZXMnKVxyXG5cdFx0LnRoZW4ocmVzcG9uc2UgPT4ge1xyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4oZGF0YSA9PiB7XHJcblx0XHRcdHdpbmRvdy52b3RlcyA9IGRhdGEudm90ZXM7XHJcblx0XHRcdHdpbmRvdy5wbGFjZXMgPSBkYXRhLnBsYWNlcztcclxuXHRcdFx0bGV0IHBsYWNlcyA9IGRhdGEucGxhY2VzO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0Y29uc3QgaWNvbnMgPSBbXTtcclxuXHJcblx0XHRcdGxldCBpY29uU2l6ZSA9IFs5MSwgOTldOyAvLyBzaXplIG9mIHRoZSBpY29uXHJcblx0XHRcdGxldCBpY29uQW5jaG9yID0gWzQ1LCA3NV07IC8vIHBvaW50IG9mIHRoZSBpY29uIHdoaWNoIHdpbGwgY29ycmVzcG9uZCB0byBtYXJrZXIncyBsb2NhdGlvblxyXG5cdFx0XHRsZXQgcG9wdXBBbmNob3IgPSBbLTMsIC03Nl07IC8vIHBvaW50IGZyb20gd2hpY2ggdGhlIHBvcHVwIHNob3VsZCBvcGVuIHJlbGF0aXZlIHRvIHRoZSBpY29uQW5jaG9yXHJcblxyXG5cdFx0XHRpY29uc1sxXSA9IEwuaWNvbih7XHJcbiAgICAgICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL2xvY2F0aW9uLnBuZycsXHJcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogICAgIGljb25TaXplLFxyXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogICBpY29uQW5jaG9yLFxyXG4gICAgICAgICAgICAgICAgcG9wdXBBbmNob3I6ICBwb3B1cEFuY2hvclxyXG5cdFx0XHR9KTtcclxuXHRcdFx0aWNvbnNbMl0gPSBMLmljb24oe1xyXG4gICAgICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9sb2NhdGlvbjIucG5nJyxcclxuICAgICAgICAgICAgICAgIGljb25TaXplOiAgICAgaWNvblNpemUsXHJcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiAgIGljb25BbmNob3IsXHJcbiAgICAgICAgICAgICAgICBwb3B1cEFuY2hvcjogIHBvcHVwQW5jaG9yXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRpY29uc1szXSA9IEwuaWNvbih7XHJcbiAgICAgICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL2xvY2F0aW9uMy5wbmcnLFxyXG4gICAgICAgICAgICAgICAgaWNvblNpemU6ICAgICBpY29uU2l6ZSxcclxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6ICAgaWNvbkFuY2hvcixcclxuICAgICAgICAgICAgICAgIHBvcHVwQW5jaG9yOiAgcG9wdXBBbmNob3JcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgcGxhY2VzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG5cdFx0XHRcdHZhciB2b3RlQ291bnRJbnB1dCA9IGRhdGEudm90ZXNbcGxhY2VzW2ldLmlkXTtcclxuXHRcdFx0XHR2YXIgdm90ZUNvdW50ID0gXCJcIjtcclxuXHRcdFx0XHRpZih2b3RlQ291bnRJbnB1dCkge1xyXG5cdFx0XHRcdCAgICB2b3RlQ291bnQgPSBcIiZuYnNwO1wiICsgZGF0YS52b3Rlc1twbGFjZXNbaV0uaWRdO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dmFyIG1hcmtlciA9IEwubWFya2VyKFxyXG5cdFx0XHRcdFx0W3BsYWNlc1tpXS5sYXQsIHBsYWNlc1tpXS5sb25dLCBcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0aWNvbjogaWNvbnNbcGxhY2VzW2ldLnBsYWNlVHlwZV0sIFxyXG5cdFx0XHRcdFx0XHRwbGFjZTogcGxhY2VzW2ldXHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0bWFya2VyLmJpbmRQb3B1cCggY29udGV4dCA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCBwbGFjZSA9IGNvbnRleHQub3B0aW9ucy5wbGFjZTtcclxuXHRcdFx0XHRcdGxldCB2b3RlQ291bnQgPSB3aW5kb3cudm90ZXNbcGxhY2UuaWRdO1xyXG5cdFx0XHRcdFx0aWYoIXZvdGVDb3VudCkge1xyXG5cdFx0XHRcdFx0XHR2b3RlQ291bnQgPSBcIlwiO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0bGV0IGlzVXB2b3RlID0gbnVsbDtcclxuXHRcdFx0XHRcdGlmKHdpbmRvdy5teXZvdGVzKSB7XHJcblx0XHRcdFx0XHRcdGlzVXB2b3RlID0gd2luZG93Lm15dm90ZXNbcGxhY2UuaWRdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0bGV0IHVwdm90ZUNsYXNzO1xyXG5cdFx0XHRcdFx0aWYoaXNVcHZvdGUpIHtcclxuXHRcdFx0XHRcdFx0dXB2b3RlQ2xhc3MgPSBcImJ0bi1zdWNjZXNzXCI7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR1cHZvdGVDbGFzcyA9IFwiYnRuLW91dGxpbmUtc3VjY2Vzc1wiO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGxldCBpbWdTcmMgPSBcIi9pbWFnZXMvbm9pbWFnZS5wbmdcIjtcclxuXHRcdFx0XHRcdGxldCBpbWdDbGFzcyA9IFwicG9wdXAtbm9pbWFnZVwiO1xyXG5cdFx0XHRcdFx0aWYocGxhY2UuaW1nICYmIHBsYWNlLmltZy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRcdGltZ1NyYyA9IFwiL2FwcC9maWxlcy9cIiArIHBsYWNlLmltZztcclxuXHRcdFx0XHRcdFx0aW1nQ2xhc3MgPSBcInBvcHVwLWltYWdlXCI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGA8ZGl2IGlkPSdwb3B1cCcgY2xhc3M9J215Y29udGFpbmVyJz5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9J2dyaWRib3gtbGVmdCc+IFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8aW1nIHNyYz0nJHtpbWdTcmN9JyBjbGFzcz0nJHtpbWdDbGFzc30nLz4gPC9kaXY+XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1sZWZ0Jz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0JHtwbGFjZS5kZXNjcmlwdGlvbn08L2Rpdj5cclxuXHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdncmlkYm94LXJpZ2h0Jz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0QmFsc290XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT0nYnV0dG9uJyBpZD0nYnRuTGlrZScgY2xhc3M9J2J0biAke3Vwdm90ZUNsYXNzfSdcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvbmNsaWNrPSdkb1ZvdGUoJHtwbGFjZS5pZH0pJz7wn5GNIDxkaXYgaWQ9XCJ2b3RlQ291bnRcIj4ke3ZvdGVDb3VudH08L2Rpdj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICBcdFx0PC9kaXY+YDtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR3aW5kb3cuZ3JvdXAuYWRkTGF5ZXIobWFya2VyKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0d2luZG93Lm15bWFwLmFkZExheWVyKHdpbmRvdy5ncm91cCk7XHJcblx0XHR9KVxyXG5cdFx0LmNhdGNoKGVyciA9PiB7XHJcblx0XHRcdGFsZXJ0KFwiZTIgXCIrIGVycik7XHJcblx0XHR9KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHNldEltZyhpbnB1dCkge1xyXG5cdGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xyXG5cdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblx0XHRcclxuXHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHQkKCcjaW1nLXVwbG9hZCcpLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dWb3RlVG9wKCkge1xyXG5cclxuXHQkKCcjdm90ZS10b3AnKS5tb2RhbCgnc2hvdycpO1xyXG5cdFxyXG5cdGZldGNoKCcvYXBwL3RvcCcsXHJcblx0XHR7XHJcblx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdGNhY2hlOiAnbm8tY2FjaGUnXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4ocmVzcG9uc2UgPT4ge1xyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4oZGF0YSA9PiB7XHJcblxyXG5cdFx0XHRsZXQgdGl0bGVzID0gW1xyXG5cdFx0XHRcdFwixaBhdXLEq2JhIC8gbmVwxIFycmVkemFtxKtiYVwiLFxyXG5cdFx0XHRcdFwiU3RyYXVqaSBwYWdyaWV6aWVuaVwiLFxyXG5cdFx0XHRcdFwiU2VndW1zIChiZWRyZXMsIGLEq3N0YW1hcyBhcG1hbGVzKVwiXHJcblx0XHRcdCBdO1xyXG5cdFx0XHRsZXQgY29udGVudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvcC1jb250ZW50XCIpO1xyXG5cdFx0XHRsZXQgcmVzdWx0ID0gXCJcIjtcclxuXHJcblx0XHRcdGZvcihsZXQgdHlwZSA9IDE7IHR5cGUgPD0gMzsgdHlwZSsrKSB7XHJcblx0XHRcdFx0bGV0IGlkeCA9IHR5cGUgLSAxO1xyXG5cclxuXHRcdFx0XHRpZighZGF0YSB8fCAhZGF0YVtpZHhdKSB7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGV0IHRvcDMgPSBcIlwiO1xyXG5cdFx0XHRcdGZvcihsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0bGV0IHRvcFBsYWNlID0gZGF0YVtpZHhdW2ldO1xyXG5cdFx0XHRcdFx0aWYoIXRvcFBsYWNlKSB7XHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGxldCBwbGFjZXMgPSB3aW5kb3cucGxhY2VzO1xyXG5cdFx0XHRcdFx0bGV0IGlkID0gdG9wUGxhY2VbMF07XHJcblx0XHRcdFx0XHRsZXQgdm90ZUNvdW50ID0gdG9wUGxhY2VbMV07XHJcblx0XHRcdFx0XHRsZXQgcGxhY2UgPSBudWxsO1xyXG5cdFx0XHRcdFx0Zm9yKGxldCBqID0gMDsgaiA8IHBsYWNlcy5sZW5ndGg7IGorKykge1xyXG5cdFx0XHRcdFx0XHRpZihwbGFjZXNbal0uaWQgPT1cdCBpZCkge1xyXG5cdFx0XHRcdFx0XHRcdHBsYWNlID0gcGxhY2VzW2pdO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYoIXBsYWNlKSB7XHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGxldCBpbWdTcmMgPSBcIi9pbWFnZXMvbm9pbWFnZS5wbmdcIjtcclxuXHRcdFx0XHRcdGlmKHBsYWNlLmltZyAmJiBwbGFjZS5pbWcubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0XHRpbWdTcmMgPSBcIi9hcHAvZmlsZXMvMlwiICsgcGxhY2UuaW1nO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdC8qPGRpdiBjbGFzcz1cInRvcC10eHRcIj4ke3ZvdGVDb3VudH08L2Rpdj4qL1xyXG5cclxuXHRcdFx0XHRcdHRvcDMgKz0gYDxkaXYgY2xhc3M9XCJ0b3AtaXRlbVwiPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidG9wLWltYWdlLWJveFwiPlxyXG5cdFx0XHRcdFx0XHRcdDxpbWcgY2xhc3M9XCJ0b3AtaW1hZ2VcIiBzcmM9JyR7aW1nU3JjfScvPiBcclxuXHRcdFx0XHRcdFx0PC9kaXY+XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRvcC1udW1iZXJcIj4ke2kgKyAxfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidG9wLXRleHRcIj4ke3BsYWNlLmRlc2NyaXB0aW9ufTwvZGl2PlxyXG5cdFx0XHRcdFx0PC9kaXY+YDtcclxuXHRcdFx0XHR9XHRcdFx0XHRcclxuXHJcblx0XHRcdFx0aWYodG9wMy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRyZXN1bHQgKz0gXHJcblx0XHRcdFx0XHRcdGA8ZGl2IGNsYXNzPVwidm90ZS10b3AtdGl0bGVcIj4ke3R5cGV9LSAke3RpdGxlc1tpZHhdfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidm90ZS10b3Atcm93XCIgaWQ9XCJ0eXBlJHt0eXBlfVwiPlxyXG5cdFx0XHRcdFx0XHRcdCR7dG9wM31cclxuXHRcdFx0XHRcdFx0PC9kaXY+YDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdFx0Y29udGVudEVsZW1lbnQuaW5uZXJIVE1MID0gcmVzdWx0O1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlID0+IGFsZXJ0KFwiZTFcIisgZSkpO1xyXG59XHJcblxyXG4kKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgaW5jbHVkZUh0bWwoJ2h0bWwvc3RhcnQuaHRtbCcsICdzdGFydCcpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL2Nob29zZS1wbGFjZS5odG1sJywgJ2Nob29zZS1wbGFjZScpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL3JlcG9ydC5odG1sJywgJ3JlcG9ydCcpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL3ZvdGUtdG9wLmh0bWwnLCAndm90ZS10b3AnKTtcclxuXHRpbmNsdWRlSHRtbCgnaHRtbC9hYm91dC11cy5odG1sJywgJ2Fib3V0LXVzJyk7XHJcblxyXG5cdGxldCB2aXNpdGVkID0gZ2V0Q29va2llKFwidmlzaXRlZFwiKTtcclxuXHRpZighdmlzaXRlZCkge1xyXG5cdFx0JCgnI3N0YXJ0JykubW9kYWwoJ3Nob3cnKTtcclxuXHRcdHNldENvb2tpZShcInZpc2l0ZWRcIiwgdHJ1ZSwgMzY1KTtcclxuXHR9XHRcclxuXHRcclxuXHRpbml0TWFwKCk7XHJcblxyXG5cdHdpbmRvdy5zZXRJbWcgPSBzZXRJbWc7XHJcblx0d2luZG93LnNob3dWb3RlVG9wID0gc2hvd1ZvdGVUb3A7XHJcblx0d2luZG93LnZvdGVTZXJ2aWNlID0gbmV3IFZvdGVTZXJ2aWNlKCk7XHJcblx0d2luZG93LmZhY2Vib29rU2VydmljZSA9IG5ldyBGYWNlYm9va1NlcnZpY2UoKTtcclxuXHJcblx0bGV0IGFkZFBsYWNlID0gbmV3IEFkZFBsYWNlKCk7XHJcbn0pO1xyXG4iXSwibmFtZXMiOlsiaW5jbHVkZUh0bWwiLCJ1cmwiLCJpZCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiaW5uZXJIVE1MIiwicmVzcG9uc2VUZXh0Iiwic2VuZCIsInNldENvb2tpZSIsIm5hbWUiLCJ2YWx1ZSIsImRheXMiLCJpc1NlY3VyZSIsImV4cGlyZXMiLCJkYXRlIiwiRGF0ZSIsInNldFRpbWUiLCJnZXRUaW1lIiwidG9VVENTdHJpbmciLCJzZWN1cmUiLCJjb29raWUiLCJnZXRDb29raWUiLCJuYW1lRVEiLCJjYSIsInNwbGl0IiwiaSIsImxlbmd0aCIsImMiLCJjaGFyQXQiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwiaGlkZVNwaW5uZXIiLCJzdHlsZSIsImRpc3BsYXkiLCJzaG93U3Bpbm5lciIsIkZhY2Vib29rU2VydmljZSIsImFmdGVyRkJJbml0IiwiaW5pdCIsIndpbmRvdyIsInN0b3JlSHR0cE9ubHlDb29raWUiLCJ0b2tlbiIsImZhY2Vib29rU2VydmljZSIsImZiQXN5bmNJbml0IiwiRkIiLCJhcHBJZCIsInhmYm1sIiwidmVyc2lvbiIsIkFwcEV2ZW50cyIsImxvZ1BhZ2VWaWV3IiwiRXZlbnQiLCJzdWJzY3JpYmUiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJvbkxvZ2luIiwiZCIsInMiLCJqcyIsImZqcyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiY3JlYXRlRWxlbWVudCIsInNyYyIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJjaGVja0ZCTG9naW5TdGF0dXMiLCJ0aGVuIiwidm90ZVNlcnZpY2UiLCJmZXRjaE15Vm90ZXMiLCJsb2dpbkNhbGxiYWNrIiwiY2F0Y2giLCJlIiwiUHJvbWlzZSIsInJlc29sdXRpb25GdW5jIiwicmVqZWN0aW9uRnVuYyIsIiQiLCJtb2RhbCIsIm9uTG9nZ2VkSW4iLCJvbk5vdExvZ2dlZEluIiwiZ2V0TG9naW5TdGF0dXMiLCJhdXRoUmVzcG9uc2UiLCJhY2Nlc3NUb2tlbiIsImFqYXgiLCJ0eXBlIiwicHJvY2Vzc0RhdGEiLCJjcm9zc0RvbWFpbiIsImhlYWRlcnMiLCJkYXRhIiwic3VjY2VzcyIsImVycm9yIiwialhIUiIsInRleHRTdGF0dXMiLCJlcnJvclRocm93biIsIlZvdGVTZXJ2aWNlIiwiZG9Wb3RlIiwicGxhY2VJRCIsImZldGNoIiwibWV0aG9kIiwiY2FjaGUiLCJqc29uIiwibXl2b3RlcyIsImxvZ2luSWZOZWVkZWQiLCJidG5MaWtlIiwiZG9VcHZvdGUiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInJlbW92ZSIsImFkZCIsInZvdGUiLCJ2b3RlQ291bnRFbGVtZW50Iiwidm90ZUNvdW50Iiwidm90ZXMiLCJhbGVydCIsImlzVXB2b3RlIiwib25TdWNjZXNzIiwib25FcnJvciIsInRvZ2dsZSIsIkFkZFBsYWNlIiwiY2hhbmdlIiwic2V0SW1nIiwidGhhdCIsIm9uIiwiZXZlbnQiLCJzaG93Q3Jvc3NoYWlyIiwic2V0Q3VycmVudExvY2F0aW9uIiwiZ2V0Q3Jvc3NoYWlyTG9jYXRpb24iLCJoaWRlQ3Jvc3NoYWlyIiwic3VibWl0Rm9ybSIsIkZvcm1EYXRhIiwicHJldmVudERlZmF1bHQiLCJjb250ZW50VHlwZSIsImxvY2F0aW9uIiwicmVsb2FkIiwiZWxlbWVudCIsImNyb3NzaGFpciIsInNlbGVjdExvY2F0aW9uQnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwiY2VudGVyQ3Jvc3NoYWlyIiwibWFwIiwidHVycGluYXQiLCJ0b3BSb3ciLCJ0b3AiLCJvZmZzZXRUb3AiLCJsZWZ0Iiwib2Zmc2V0TGVmdCIsImhlaWdodCIsIm9mZnNldEhlaWdodCIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJ4IiwieSIsInRvcFJvd0hlaWdodCIsInBvaW50IiwiTCIsImxhdGxvbiIsIm15bWFwIiwiY29udGFpbmVyUG9pbnRUb0xhdExuZyIsImxhdCIsImxuZyIsImVsZW1lbnQyIiwibmF2aWdhdG9yIiwiZ2VvbG9jYXRpb24iLCJnZXRDdXJyZW50UG9zaXRpb24iLCJwb3MiLCJjb29yZHMiLCJsYXRpdHVkZSIsImxvbiIsImxvbmdpdHVkZSIsInNldFZpZXciLCJnZXRab29tIiwiaW5pdE1hcCIsInpvb21Db250cm9sIiwiY29udHJvbCIsInpvb20iLCJwb3NpdGlvbiIsImFkZFRvIiwibGF5ZXIiLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJncm91cCIsIm1hcmtlckNsdXN0ZXJHcm91cCIsImNodW5rZWRMb2FkaW5nIiwic3BpZGVyZnlPbk1heFpvb20iLCJwbGFjZXMiLCJpY29ucyIsImljb25TaXplIiwiaWNvbkFuY2hvciIsInBvcHVwQW5jaG9yIiwiaWNvbiIsImljb25VcmwiLCJ2b3RlQ291bnRJbnB1dCIsIm1hcmtlciIsInBsYWNlVHlwZSIsInBsYWNlIiwiYmluZFBvcHVwIiwiY29udGV4dCIsIm9wdGlvbnMiLCJ1cHZvdGVDbGFzcyIsImltZ1NyYyIsImltZ0NsYXNzIiwiaW1nIiwiZGVzY3JpcHRpb24iLCJhZGRMYXllciIsImVyciIsImlucHV0IiwiZmlsZXMiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiYXR0ciIsInRhcmdldCIsInJlc3VsdCIsInJlYWRBc0RhdGFVUkwiLCJzaG93Vm90ZVRvcCIsInRpdGxlcyIsImNvbnRlbnRFbGVtZW50IiwiaWR4IiwidG9wMyIsInRvcFBsYWNlIiwiaiIsInZpc2l0ZWQiLCJhZGRQbGFjZSJdLCJtYXBwaW5ncyI6Ijs7O0NBQ08sU0FBU0EsV0FBVCxDQUFxQkMsR0FBckIsRUFBMEJDLEVBQTFCLEVBQThCO0NBQ3BDLE1BQUlDLEdBQUcsR0FBRSxJQUFJQyxjQUFKLEVBQVQ7Q0FDQUQsRUFBQUEsR0FBRyxDQUFDRSxJQUFKLENBQVMsS0FBVCxFQUFnQkosR0FBaEIsRUFBcUIsS0FBckI7O0NBQ0FFLEVBQUFBLEdBQUcsQ0FBQ0csa0JBQUosR0FBd0IsWUFBVztDQUNsQyxRQUFJLEtBQUtDLFVBQUwsS0FBa0IsQ0FBdEIsRUFBeUI7Q0FDekIsUUFBSSxLQUFLQyxNQUFMLEtBQWMsR0FBbEIsRUFBdUIsT0FGVzs7Q0FHbENDLElBQUFBLFFBQVEsQ0FBQ0MsY0FBVCxDQUF3QlIsRUFBeEIsRUFBNEJTLFNBQTVCLEdBQXVDLEtBQUtDLFlBQTVDO0NBQ0EsR0FKRDs7Q0FLQVQsRUFBQUEsR0FBRyxDQUFDVSxJQUFKO0NBQ0E7QUFFRCxDQUFPLFNBQVNDLFNBQVQsQ0FBbUJDLElBQW5CLEVBQXdCQyxLQUF4QixFQUE4QkMsSUFBOUIsRUFBb0NDLFFBQXBDLEVBQThDO0NBQ3BELE1BQUlDLE9BQU8sR0FBRyxFQUFkOztDQUNBLE1BQUlGLElBQUosRUFBVTtDQUNULFFBQUlHLElBQUksR0FBRyxJQUFJQyxJQUFKLEVBQVg7Q0FDQUQsSUFBQUEsSUFBSSxDQUFDRSxPQUFMLENBQWFGLElBQUksQ0FBQ0csT0FBTCxLQUFrQk4sSUFBSSxHQUFDLEVBQUwsR0FBUSxFQUFSLEdBQVcsRUFBWCxHQUFjLElBQTdDO0NBQ0FFLElBQUFBLE9BQU8sR0FBRyxlQUFlQyxJQUFJLENBQUNJLFdBQUwsRUFBekI7Q0FDQTs7Q0FD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
