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

	var FacebookService = /*#__PURE__*/function () {
	  function FacebookService(afterFBInit) {
	    _classCallCheck(this, FacebookService);

	    this.init();
	    window.afterFBInit = afterFBInit;
	  }

	  _createClass(FacebookService, [{
	    key: "init",
	    value: function init() {
	      window.loginfun = function () {
	        var uri = encodeURI("https://localhost/");
	        window.location = encodeURI("https://www.facebook.com/dialog/oauth?client_id=273875460184611&redirect_uri=" + uri + "&response_type=token");
	      };

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
	            resolutionFunc(token);
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

	var VoteService = /*#__PURE__*/function () {
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

	var AddPlace = /*#__PURE__*/function () {
	  function AddPlace() {
	    _classCallCheck(this, AddPlace);

	    $("#uploadimage").change(function () {
	      window.setImg(this);
	    });
	    var that = this;
	    $(document).on("click", "#choose-location-btn", function () {
	      that.showCrosshair();
	      that.setCurrentLocation();
	    });
	    $(document).on("click", "#select-location-btn", function () {
	      that.getCrosshairLocation();
	      $('#report').modal('show');
	      that.retrieveEmailFromCookie();
	      that.hideCrosshair();
	    });
	    $(document).on("click", "#cancel-btn", function () {
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

	      this.storeEmailInCookie();
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
	      var y = top + height / 2 - 20;
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
	  }, {
	    key: "retrieveEmailFromCookie",
	    value: function retrieveEmailFromCookie() {
	      var emailElement = document.getElementById("email");
	      var email = getCookie("email");

	      if (email && email.length > 0) {
	        emailElement.value = email;
	      }
	    }
	  }, {
	    key: "storeEmailInCookie",
	    value: function storeEmailInCookie() {
	      var email = document.getElementById("email");
	      setCookie("email", email.value, 3, false);
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
	    var openPlaceId = getCookie("placeId");
	    setCookie("placeId", null, 1, false);

	    for (var i = 0; i < places.length; i++) {
	      var placeId = places[i].id;
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

	        setCookie("placeId", place.id, 1, false);
	        return "<div id='popup' class='mycontainer'>\n\t\t\t\t\t\t\t\t<div class='gridbox-left'> \n\t\t\t\t\t\t\t\t\t<img src='".concat(imgSrc, "' class='").concat(imgClass, "'/> </div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-left'>\n\t\t\t\t\t\t\t\t\t").concat(place.description, "</div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-right'>\n\t\t\t\t\t\t\t\t\tBalsot\n\t\t\t\t\t\t\t\t\t<button type='button' id='btnLike' class='btn ").concat(upvoteClass, "'\n\t\t\t\t\t\t\t\t\t\tonclick='doVote(").concat(place.id, ")'>\uD83D\uDC4D <div id=\"voteCount\">").concat(voteCount, "</div></button>\n                    \t\t</div>");
	      });
	      window.group.addLayer(marker);

	      if (window.isRedirectFromFB && placeId && placeId == openPlaceId) {
	        window.markerPoupup = marker;
	        window.lat = places[i].lat;
	        window.lon = places[i].lon;
	      }
	    }

	    window.mymap.addLayer(window.group);

	    if (window.markerPoupup) {
	      window.markerPoupup.openPopup();
	      window.mymap.setView([window.lat, window.lon], 13);
	      history.replaceState(null, null, '/');

	      window.loginCallback = function () {
	        window.voteService.doVote(openPlaceId);
	      };

	      window.facebookService.onLogin();
	    }
	  }).catch(function (err) {
	    console.log("e2 " + err);
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
	    return console.log("e1" + e);
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

	  var url = location.toString().split("?")[1];

	  if (url) {
	    window.isRedirectFromFB = url.substring(1).split("&").map(function (parameter) {
	      return parameter.split("=");
	    }).filter(function (parameterValue) {
	      return parameterValue[0] == "data_access_expiration_time";
	    }).reduce(function (accumulator) {
	      return accumulator + 1;
	    }, 0);
	    console.log("isRedirectFromFB ".concat(isRedirectFromFB));
	  }

	  initMap();
	  window.setImg = setImg;
	  window.showVoteTop = showVoteTop;
	  window.voteService = new VoteService();
	  window.facebookService = new FacebookService();
	  var addPlace = new AddPlace();
	});

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiLCIuLi9zcmMvZmFjZWJvb2tTZXJ2aWNlLmpzIiwiLi4vc3JjL3ZvdGVTZXJ2aWNlLmpzIiwiLi4vc3JjL2FkZFBsYWNlLmpzIiwiLi4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSHRtbCh1cmwsIGlkKSB7XHJcblx0dmFyIHhocj0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0eGhyLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UpO1xyXG5cdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2U9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSE9PTQpIHJldHVybjtcclxuXHRcdGlmICh0aGlzLnN0YXR1cyE9PTIwMCkgcmV0dXJuOyAvLyBvciB3aGF0ZXZlciBlcnJvciBoYW5kbGluZyB5b3Ugd2FudFxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLmlubmVySFRNTD0gdGhpcy5yZXNwb25zZVRleHQ7XHJcblx0fTtcclxuXHR4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlLCBkYXlzLCBpc1NlY3VyZSkge1xyXG5cdHZhciBleHBpcmVzID0gXCJcIjtcclxuXHRpZiAoZGF5cykge1xyXG5cdFx0dmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0ZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKGRheXMqMjQqNjAqNjAqMTAwMCkpO1xyXG5cdFx0ZXhwaXJlcyA9IFwiOyBleHBpcmVzPVwiICsgZGF0ZS50b1VUQ1N0cmluZygpO1xyXG5cdH1cclxuXHRsZXQgc2VjdXJlID0gXCJcIjtcclxuXHRpZiAoaXNTZWN1cmUpIHtcclxuXHRcdHNlY3VyZSA9IFwiOyBzZWN1cmU7IEh0dHBPbmx5XCI7XHJcblx0fVxyXG5cdGRvY3VtZW50LmNvb2tpZSA9IG5hbWUgKyBcIj1cIiArICh2YWx1ZSB8fCBcIlwiKSAgKyBleHBpcmVzICsgXCI7IHBhdGg9L1wiICsgc2VjdXJlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29va2llKG5hbWUpIHtcclxuXHRsZXQgbmFtZUVRID0gbmFtZSArIFwiPVwiO1xyXG5cdGxldCBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xyXG5cdGZvciAobGV0IGk9MDsgaSA8IGNhLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRsZXQgYyA9IGNhW2ldO1xyXG5cdFx0d2hpbGUgKGMuY2hhckF0KDApPT0nICcpIGMgPSBjLnN1YnN0cmluZygxLGMubGVuZ3RoKTtcclxuXHRcdGlmIChjLmluZGV4T2YobmFtZUVRKSA9PSAwKSByZXR1cm4gYy5zdWJzdHJpbmcobmFtZUVRLmxlbmd0aCxjLmxlbmd0aCk7XHJcblx0fVxyXG5cdHJldHVybiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXJhc2VDb29raWUobmFtZSkge1xyXG5cdFx0ZG9jdW1lbnQuY29va2llID0gbmFtZSsnPTsgTWF4LUFnZT0tOTk5OTk5OTk7JzsgIFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGlkZVNwaW5uZXIoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdmVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dTcGlubmVyKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3ZlclwiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZEdldFBhcmFtZXRlcihwYXJhbWV0ZXJOYW1lKSB7XHJcbiAgICB2YXIgcmVzdWx0ID0gbnVsbCxcclxuICAgICAgICB0bXAgPSBbXTtcclxuICAgIGxvY2F0aW9uLnNlYXJjaFxyXG4gICAgICAgIC5zdWJzdHIoMSlcclxuICAgICAgICAuc3BsaXQoXCImXCIpXHJcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcclxuICAgICAgICAgIHRtcCA9IGl0ZW0uc3BsaXQoXCI9XCIpO1xyXG4gICAgICAgICAgaWYgKHRtcFswXSA9PT0gcGFyYW1ldGVyTmFtZSkgcmVzdWx0ID0gZGVjb2RlVVJJQ29tcG9uZW50KHRtcFsxXSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG59IiwiaW1wb3J0IHsgZ2V0Q29va2llLCBzZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1NlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoYWZ0ZXJGQkluaXQpIHtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB3aW5kb3cuYWZ0ZXJGQkluaXQgPSBhZnRlckZCSW5pdDtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHdpbmRvdy5sb2dpbmZ1biA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHVyaSA9IGVuY29kZVVSSShcImh0dHBzOi8vbG9jYWxob3N0L1wiKTtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZW5jb2RlVVJJKFwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2RpYWxvZy9vYXV0aD9jbGllbnRfaWQ9MjczODc1NDYwMTg0NjExJnJlZGlyZWN0X3VyaT1cIit1cmkrXCImcmVzcG9uc2VfdHlwZT10b2tlblwiKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aW5kb3cuc3RvcmVIdHRwT25seUNvb2tpZSA9ICh0b2tlbikgPT4gd2luZG93LmZhY2Vib29rU2VydmljZS5zdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKTtcclxuICAgICAgICBcclxuICAgICAgICB3aW5kb3cuZmJBc3luY0luaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgRkIuaW5pdCh7XHRcclxuICAgICAgICAgICAgICAgIGFwcElkICAgOiAnMjczODc1NDYwMTg0NjExJyxcclxuICAgICAgICAgICAgICAgIGNvb2tpZSAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzICA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB4ZmJtbCAgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gOiAndjMuMycgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgRkIuQXBwRXZlbnRzLmxvZ1BhZ2VWaWV3KCk7XHJcblxyXG4gICAgICAgICAgICBGQi5FdmVudC5zdWJzY3JpYmUoJ2F1dGguYXV0aFJlc3BvbnNlQ2hhbmdlJywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGUgc3RhdHVzIG9mIHRoZSBzZXNzaW9uIGNoYW5nZWQgdG86ICcrcmVzcG9uc2Uuc3RhdHVzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLm9uTG9naW4oKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIChmdW5jdGlvbihkLCBzLCBpZCl7XHJcbiAgICAgICAgICAgIHZhciBqcywgZmpzID0gZC5nZXRFbGVtZW50c0J5VGFnTmFtZShzKVswXTtcclxuICAgICAgICAgICAgaWYgKGQuZ2V0RWxlbWVudEJ5SWQoaWQpKSB7cmV0dXJuO31cclxuICAgICAgICAgICAganMgPSBkLmNyZWF0ZUVsZW1lbnQocyk7IGpzLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIGpzLnNyYyA9IFwiaHR0cHM6Ly9jb25uZWN0LmZhY2Vib29rLm5ldC9sdl9MVi9zZGsuanNcIjtcclxuICAgICAgICAgICAgZmpzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGpzLCBmanMpO1xyXG4gICAgICAgIH0oZG9jdW1lbnQsICdzY3JpcHQnLCAnZmFjZWJvb2stanNzZGsnKSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgb25Mb2dpbigpIHtcclxuICAgICAgICB0aGlzLmNoZWNrRkJMb2dpblN0YXR1cygpXHJcbiAgICAgICAgICAgIC50aGVuKHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLnN0b3JlSHR0cE9ubHlDb29raWUodG9rZW4pO1xyXG4gICAgICAgICAgICB9KSBcclxuICAgICAgICAgICAgLnRoZW4odG9rZW4gPT4ge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LnZvdGVTZXJ2aWNlLmZldGNoTXlWb3RlcygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZih3aW5kb3cubG9naW5DYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2dpbkNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkZCIG5vdCBsb2dnZWQgaW5cIjtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9naW5JZk5lZWRlZCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXNvbHV0aW9uRnVuYywgcmVqZWN0aW9uRnVuYykgPT4ge1xyXG5cclxuICAgICAgICAgICAgJCgnI2xvZ2luTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc3Qgb25Mb2dnZWRJbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uub25Mb2dpbigpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmMoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Ob3RMb2dnZWRJbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2dpbkNhbGxiYWNrID0gdG9rZW4gPT4geyBcclxuICAgICAgICAgICAgICAgICAgICAkKCcjbG9naW5Nb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmModG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICQoJyNsb2dpbk1vZGFsJykubW9kYWwoJ3Nob3cnKTsgXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdpbmRvdy5mYWNlYm9va1NlcnZpY2UuY2hlY2tGQkxvZ2luU3RhdHVzKClcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uTG9nZ2VkSW4sIG9uTm90TG9nZ2VkSW4pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2hlY2tGQkxvZ2luU3RhdHVzKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdXRpb25GdW5jLCByZWplY3Rpb25GdW5jKSA9PiB7XHJcbiAgICAgICAgICAgIEZCLmdldExvZ2luU3RhdHVzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT0gXCJjb25uZWN0ZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHJlc3BvbnNlLmF1dGhSZXNwb25zZS5hY2Nlc3NUb2tlbjtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHV0aW9uRnVuYyh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdGlvbkZ1bmMocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x1dGlvbkZ1bmMsIHJlamVjdGlvbkZ1bmMpID0+IHtcclxuICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgIHVybCA6IFwiL2FwcC9sb2dpblwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInRva2VuXCI6dG9rZW5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKHRva2VuKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBpbiBzdG9yZUh0dHBPbmx5Q29va2llOiBcIisgZXJyb3JUaHJvd24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTsgICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFx0XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IHNldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBlcmFzZUNvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZvdGVTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5kYXRhID0ge307XHJcblx0XHR3aW5kb3cuZG9Wb3RlID0gKHBsYWNlSUQpID0+IHdpbmRvdy52b3RlU2VydmljZS5kb1ZvdGUocGxhY2VJRCk7XHJcbiAgICB9XHJcblxyXG4gICAgZmV0Y2hNeVZvdGVzKCkge1xyXG5cdFx0ZmV0Y2goJy9hcHAvbXl2b3RlcycsXHJcblx0XHR7XHJcblx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdGNhY2hlOiAnbm8tY2FjaGUnXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4ocmVzcG9uc2UgPT4ge1xyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4oZGF0YSA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiZmV0Y2ggbXkgdm90ZXNcIik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5teXZvdGVzID0gZGF0YTtcclxuXHRcdH0pXHJcblx0XHQuY2F0Y2goZSA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwicGxvYmxlbSBmZXRjaGluZyB2b3RlcyBcIiArIGUpXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGRvVm90ZShwbGFjZUlEKSB7XHJcblx0XHR3aW5kb3cucGxhY2VJRCA9IHBsYWNlSUQ7XHJcblx0XHRcdFx0XHJcblx0XHR3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLmxvZ2luSWZOZWVkZWQoKVxyXG5cdFx0XHQudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgYnRuTGlrZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuTGlrZVwiKTtcclxuXHRcdFx0XHRsZXQgZG9VcHZvdGUgPSB0cnVlO1xyXG5cdFx0XHRcdGlmKGJ0bkxpa2UuY2xhc3NMaXN0LmNvbnRhaW5zKCdidG4tc3VjY2VzcycpKSB7XHJcblx0XHRcdFx0XHRkb1Vwdm90ZSA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRpZihkb1Vwdm90ZSkge1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QucmVtb3ZlKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5hZGQoJ2J0bi1zdWNjZXNzJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGJ0bkxpa2UuY2xhc3NMaXN0LmFkZCgnYnRuLW91dGxpbmUtc3VjY2VzcycpO1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QucmVtb3ZlKCdidG4tc3VjY2VzcycpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR3aW5kb3cudm90ZVNlcnZpY2Uudm90ZShcclxuXHRcdFx0XHRcdHdpbmRvdy5wbGFjZUlELFxyXG5cdFx0XHRcdFx0ZG9VcHZvdGUsXHJcblx0XHRcdFx0XHQoZGF0YSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRsZXQgdm90ZUNvdW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidm90ZUNvdW50XCIpO1xyXG5cdFx0XHRcdFx0XHRsZXQgdm90ZUNvdW50ID0gZGF0YS52b3RlcztcclxuXHRcdFx0XHRcdFx0aWYodm90ZUNvdW50IDwgMSkge1xyXG5cdFx0XHRcdFx0XHRcdHZvdGVDb3VudCA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnQ7XHJcblx0XHRcdFx0XHRcdHdpbmRvdy5teXZvdGVzW3dpbmRvdy5wbGFjZUlEXSA9IGRvVXB2b3RlO1xyXG5cdFx0XHRcdFx0XHR3aW5kb3cudm90ZXNbd2luZG93LnBsYWNlSURdID0gZGF0YS52b3RlcztcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pID0+IHtcclxuXHRcdFx0XHRcdFx0YWxlcnQoXCJFcnJvciB3aGlsZSBzYXZpbmcgdm90ZTogXCIrIGVycm9yVGhyb3duKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcblx0dm90ZShwbGFjZUlELCBpc1Vwdm90ZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHRcdFx0XHRcdFxyXG5cdFx0JC5hamF4KHtcclxuXHRcdFx0XHR1cmwgOiBcIi9hcHAvdm90ZVwiLFxyXG5cdFx0XHRcdHR5cGU6IFwiUE9TVFwiLFxyXG5cdFx0XHRcdHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuXHRcdFx0XHRjcm9zc0RvbWFpbjogdHJ1ZSxcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRkYXRhOiBcInBsYWNlPVwiKyBwbGFjZUlEICsgXCImaXNVcHZvdGU9XCIgKyBpc1Vwdm90ZSxcclxuXHRcdFx0XHRzdWNjZXNzOiAoZGF0YSkgPT4ge1xyXG5cdFx0XHRcdFx0b25TdWNjZXNzKGRhdGEpO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0ZXJyb3I6IG9uRXJyb3JcclxuXHRcdFx0fSk7XHJcblxyXG5cdH1cclxuXHRcdFxyXG5cdHRvZ2dsZVZvdGVCdXR0b24oKSB7XHJcblx0XHQvKmxldCB2b3RlQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2b3RlQ291bnRcIik7XHJcblx0XHR2b3RlQ291bnQgPSB2b3RlQ291bnRFbGVtZW50LmdldEF0dHJpYnV0ZShcInZvdGVDb3VudFwiKTtcclxuXHRcdGNvbnN0IHZvdGVDb3VudEludCA9IE51bWJlci5wYXJzZUludCh2b3RlQ291bnQpO1xyXG5cclxuXHRcdGlmKGlzVXB2b3RlKSB7XHJcblx0XHRcdHZvdGVDb3VudEVsZW1lbnQuaW5uZXJIVE1MID0gdm90ZUNvdW50SW50ICsgMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZvdGVDb3VudEVsZW1lbnQuaW5uZXJIVE1MID0gdm90ZUNvdW50SW50IC0gMTtcclxuXHRcdH0qL1xyXG5cclxuXHRcdGJ0bkxpa2UuY2xhc3NMaXN0LnRvZ2dsZSgnYnRuLW91dGxpbmUtc3VjY2VzcycpO1xyXG5cdFx0YnRuTGlrZS5jbGFzc0xpc3QudG9nZ2xlKCdidG4tc3VjY2VzcycpO1xyXG5cdH1cclxuXHJcblxyXG59IiwiaW1wb3J0IHsgc2hvd1NwaW5uZXIsIGhpZGVTcGlubmVyLCBzZXRDb29raWUsIGdldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFkZFBsYWNlIHtcclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICAkKFwiI3VwbG9hZGltYWdlXCIpLmNoYW5nZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB3aW5kb3cuc2V0SW1nKHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI2Nob29zZS1sb2NhdGlvbi1idG5cIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGF0LnNob3dDcm9zc2hhaXIoKTtcclxuICAgICAgICAgICAgdGhhdC5zZXRDdXJyZW50TG9jYXRpb24oKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIjc2VsZWN0LWxvY2F0aW9uLWJ0blwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoYXQuZ2V0Q3Jvc3NoYWlyTG9jYXRpb24oKTtcclxuICAgICAgICAgICAgJCgnI3JlcG9ydCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgIHRoYXQucmV0cmlldmVFbWFpbEZyb21Db29raWUoKTtcclxuICAgICAgICAgICAgdGhhdC5oaWRlQ3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNjYW5jZWwtYnRuXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhhdC5oaWRlQ3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAkKCcjbXlmb3JtJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhhdC5zdWJtaXRGb3JtKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN1Ym1pdEZvcm0oZSkge1xyXG4gICAgICAgIHRoaXMuc3RvcmVFbWFpbEluQ29va2llKCk7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoJCgnI215Zm9ybScpWzBdKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2hvd1NwaW5uZXIoKTtcclxuICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICB1cmwgOiAnL2FwcC91cGxvYWQnLFxyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgY29udGVudFR5cGU6ICdtdWx0aXBhcnQvZm9ybS1kYXRhJyxcclxuICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICBjb250ZW50VHlwZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxyXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgaGlkZVNwaW5uZXIoKTtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KFwiUGFsZGllcyBwYXIgdmVsb3NsYXpkdSFcIik7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xyXG4gICAgICAgICAgICAgICAgaGlkZVNwaW5uZXIoKTtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KFwiUMSBcmxpZWNpbmllcywgdmFpIGVzaSBwaWV2aWVub2ppcyB2ZWxvc2xhemRhbSBrYXRlZ29yaWp1IHVuIG5vc2F1a3VtdSFcIitcclxuICAgICAgICAgICAgICAgICAgICBcIiBKYSBuZWl6ZG9kYXMgcGlldmllbm90IHB1bmt0dSwgcmFrc3RpIHV6IGluZm9AZGF0dXNrb2xhLmx2XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd0Nyb3NzaGFpcigpIHtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0blwiKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXBvcnQtYnRuLTJcIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgY3Jvc3NoYWlyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgY3Jvc3NoYWlyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIHZhciBzZWxlY3RMb2NhdGlvbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWxvY2F0aW9uLWJ0blwiKTtcclxuICAgICAgICBzZWxlY3RMb2NhdGlvbkJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgY2FuY2VsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW5jZWwtYnRuXCIpO1xyXG4gICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmNlbnRlckNyb3NzaGFpcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGNlbnRlckNyb3NzaGFpcigpIHtcclxuICAgICAgICB2YXIgbWFwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYWluXCIpO1xyXG4gICAgICAgIHZhciB0dXJwaW5hdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm94MVwiKTtcclxuICAgICAgICB2YXIgdG9wUm93ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3Atcm93XCIpO1xyXG5cclxuICAgICAgICB2YXIgdG9wID0gbWFwLm9mZnNldFRvcDtcclxuICAgICAgICB2YXIgbGVmdCA9IG1hcC5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIHZhciBoZWlnaHQgPSB0dXJwaW5hdC5vZmZzZXRUb3AgLSB0b3BSb3cub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIHZhciB3aWR0aCA9IG1hcC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAgICAgdmFyIHggPSBsZWZ0ICsgKHdpZHRoIC8gMikgLSAyMDtcclxuICAgICAgICB2YXIgeSA9IHRvcCArIChoZWlnaHQgLyAyKSAtIDIwO1xyXG5cclxuICAgICAgICB2YXIgY3Jvc3NoYWlyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgY3Jvc3NoYWlyLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xyXG4gICAgICAgIGNyb3NzaGFpci5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENyb3NzaGFpckxvY2F0aW9uKCkge1x0XHJcbiAgICAgICAgdmFyIHRvcFJvd0hlaWdodCA9ICQoJyN0b3Atcm93JykuaGVpZ2h0KCk7XHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBwb2ludCA9IEwucG9pbnQoIGNyb3NzaGFpci5vZmZzZXRMZWZ0ICsgMjAsIGNyb3NzaGFpci5vZmZzZXRUb3AgLSB0b3BSb3dIZWlnaHQgKTtcclxuICAgICAgICBjb25zdCBsYXRsb24gPSB3aW5kb3cubXltYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYXRcIikudmFsdWUgPSBsYXRsb24ubGF0O1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9uXCIpLnZhbHVlID0gbGF0bG9uLmxuZztcclxuICAgIH1cclxuXHJcbiAgICBoaWRlQ3Jvc3NoYWlyKCkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXBvcnQtYnRuXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0bi0yXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgZWxlbWVudDIuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIHNlbGVjdExvY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3QtbG9jYXRpb24tYnRuXCIpO1xyXG4gICAgICAgIHNlbGVjdExvY2F0aW9uQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idG5cIik7XHJcbiAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q3VycmVudExvY2F0aW9uKCkge1xyXG4gICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXHJcbiAgICAgICAgICAgIHBvcyA9PiAge1x0XHRcdFx0XHRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhdCA9IHBvcy5jb29yZHMubGF0aXR1ZGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb24gPSBwb3MuY29vcmRzLmxvbmdpdHVkZTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgd2luZG93Lm15bWFwLnNldFZpZXcoW2xhdCwgbG9uXSwgd2luZG93Lm15bWFwLmdldFpvb20oKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXRyaWV2ZUVtYWlsRnJvbUNvb2tpZSgpIHtcclxuICAgICAgICBsZXQgZW1haWxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbWFpbFwiKTtcclxuICAgICAgICBsZXQgZW1haWwgPSBnZXRDb29raWUoXCJlbWFpbFwiKTtcclxuICAgICAgICBpZihlbWFpbCAmJiBlbWFpbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGVtYWlsRWxlbWVudC52YWx1ZSA9IGVtYWlsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RvcmVFbWFpbEluQ29va2llKCkge1xyXG4gICAgICAgIGxldCBlbWFpbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1haWxcIik7XHJcbiAgICAgICAgc2V0Q29va2llKFwiZW1haWxcIiwgZW1haWwudmFsdWUsIDMsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBpbmNsdWRlSHRtbCB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBGYWNlYm9va1NlcnZpY2UgfSBmcm9tICcuL2ZhY2Vib29rU2VydmljZS5qcyc7XHJcbmltcG9ydCB7IFZvdGVTZXJ2aWNlIH0gZnJvbSAnLi92b3RlU2VydmljZS5qcyc7XHJcbmltcG9ydCB7IHNldENvb2tpZSwgZ2V0Q29va2llLCBmaW5kR2V0UGFyYW1ldGVyIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IEFkZFBsYWNlIH0gZnJvbSAnLi9hZGRQbGFjZS5qcyc7XHJcblx0XHJcbmZ1bmN0aW9uIGluaXRNYXAoKSB7XHJcblxyXG5cdHdpbmRvdy5teW1hcCA9IEwubWFwKFxyXG5cdCAgICAnbWFwaWQnLFxyXG5cdCAgICB7IHpvb21Db250cm9sOiBmYWxzZSB9XHJcblx0KS5zZXRWaWV3KFs1Ni45NTEyNTksIDI0LjExMjYxNF0sIDEzKTtcclxuXHJcblx0TC5jb250cm9sLnpvb20oe1xyXG4gICAgICAgICBwb3NpdGlvbjonYm90dG9tbGVmdCdcclxuICAgIH0pLmFkZFRvKHdpbmRvdy5teW1hcCk7XHJcblxyXG5cdGNvbnN0IGxheWVyID0gTC50aWxlTGF5ZXIoJ2h0dHBzOi8ve3N9LnRpbGUub3BlbnN0cmVldG1hcC5vcmcve3p9L3t4fS97eX0ucG5nJywge1xyXG5cdFx0bWF4Wm9vbTogMTgsXHJcblx0XHRhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cHM6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzJ1xyXG5cdH0pLmFkZFRvKHdpbmRvdy5teW1hcCk7XHJcblxyXG5cdHdpbmRvdy5ncm91cCA9IEwubWFya2VyQ2x1c3Rlckdyb3VwKHtcclxuXHRcdGNodW5rZWRMb2FkaW5nOiB0cnVlLFxyXG5cdFx0Ly9kaXNhYmxlQ2x1c3RlcmluZ0F0Wm9vbTogMTcsXHJcblx0XHRzcGlkZXJmeU9uTWF4Wm9vbTogdHJ1ZVxyXG5cdCAgfSk7XHJcblxyXG5cdGZldGNoKCcvYXBwL3BsYWNlcycpXHJcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XHJcblx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKClcclxuXHRcdH0pXHJcblx0XHQudGhlbihkYXRhID0+IHtcclxuXHRcdFx0d2luZG93LnZvdGVzID0gZGF0YS52b3RlcztcclxuXHRcdFx0d2luZG93LnBsYWNlcyA9IGRhdGEucGxhY2VzO1xyXG5cdFx0XHRsZXQgcGxhY2VzID0gZGF0YS5wbGFjZXM7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRjb25zdCBpY29ucyA9IFtdO1xyXG5cclxuXHRcdFx0bGV0IGljb25TaXplID0gWzkxLCA5OV07IC8vIHNpemUgb2YgdGhlIGljb25cclxuXHRcdFx0bGV0IGljb25BbmNob3IgPSBbNDUsIDc1XTsgLy8gcG9pbnQgb2YgdGhlIGljb24gd2hpY2ggd2lsbCBjb3JyZXNwb25kIHRvIG1hcmtlcidzIGxvY2F0aW9uXHJcblx0XHRcdGxldCBwb3B1cEFuY2hvciA9IFstMywgLTc2XTsgLy8gcG9pbnQgZnJvbSB3aGljaCB0aGUgcG9wdXAgc2hvdWxkIG9wZW4gcmVsYXRpdmUgdG8gdGhlIGljb25BbmNob3JcclxuXHJcblx0XHRcdGljb25zWzFdID0gTC5pY29uKHtcclxuICAgICAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvbG9jYXRpb24ucG5nJyxcclxuICAgICAgICAgICAgICAgIGljb25TaXplOiAgICAgaWNvblNpemUsXHJcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiAgIGljb25BbmNob3IsXHJcbiAgICAgICAgICAgICAgICBwb3B1cEFuY2hvcjogIHBvcHVwQW5jaG9yXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRpY29uc1syXSA9IEwuaWNvbih7XHJcbiAgICAgICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL2xvY2F0aW9uMi5wbmcnLFxyXG4gICAgICAgICAgICAgICAgaWNvblNpemU6ICAgICBpY29uU2l6ZSxcclxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6ICAgaWNvbkFuY2hvcixcclxuICAgICAgICAgICAgICAgIHBvcHVwQW5jaG9yOiAgcG9wdXBBbmNob3JcclxuXHRcdFx0fSk7XHJcblx0XHRcdGljb25zWzNdID0gTC5pY29uKHtcclxuICAgICAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvbG9jYXRpb24zLnBuZycsXHJcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogICAgIGljb25TaXplLFxyXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogICBpY29uQW5jaG9yLFxyXG4gICAgICAgICAgICAgICAgcG9wdXBBbmNob3I6ICBwb3B1cEFuY2hvclxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGxldCBvcGVuUGxhY2VJZCA9IGdldENvb2tpZShcInBsYWNlSWRcIik7XHJcblx0XHRcdHNldENvb2tpZShcInBsYWNlSWRcIiwgbnVsbCwgMSwgZmFsc2UpO1xyXG5cclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHBsYWNlcy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGxldCBwbGFjZUlkID0gcGxhY2VzW2ldLmlkO1x0XHRcdFx0XHJcblxyXG5cdFx0XHRcdHZhciBtYXJrZXIgPSBMLm1hcmtlcihcclxuXHRcdFx0XHRcdFtwbGFjZXNbaV0ubGF0LCBwbGFjZXNbaV0ubG9uXSwgXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGljb246IGljb25zW3BsYWNlc1tpXS5wbGFjZVR5cGVdLCBcclxuXHRcdFx0XHRcdFx0cGxhY2U6IHBsYWNlc1tpXVxyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdG1hcmtlci5iaW5kUG9wdXAoIGNvbnRleHQgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgcGxhY2UgPSBjb250ZXh0Lm9wdGlvbnMucGxhY2U7XHJcblx0XHRcdFx0XHRsZXQgdm90ZUNvdW50ID0gd2luZG93LnZvdGVzW3BsYWNlLmlkXTtcclxuXHRcdFx0XHRcdGlmKCF2b3RlQ291bnQpIHtcclxuXHRcdFx0XHRcdFx0dm90ZUNvdW50ID0gXCJcIjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGxldCBpc1Vwdm90ZSA9IG51bGw7XHJcblx0XHRcdFx0XHRpZih3aW5kb3cubXl2b3Rlcykge1xyXG5cdFx0XHRcdFx0XHRpc1Vwdm90ZSA9IHdpbmRvdy5teXZvdGVzW3BsYWNlLmlkXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGxldCB1cHZvdGVDbGFzcztcclxuXHRcdFx0XHRcdGlmKGlzVXB2b3RlKSB7XHJcblx0XHRcdFx0XHRcdHVwdm90ZUNsYXNzID0gXCJidG4tc3VjY2Vzc1wiO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dXB2b3RlQ2xhc3MgPSBcImJ0bi1vdXRsaW5lLXN1Y2Nlc3NcIjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRsZXQgaW1nU3JjID0gXCIvaW1hZ2VzL25vaW1hZ2UucG5nXCI7XHJcblx0XHRcdFx0XHRsZXQgaW1nQ2xhc3MgPSBcInBvcHVwLW5vaW1hZ2VcIjtcclxuXHRcdFx0XHRcdGlmKHBsYWNlLmltZyAmJiBwbGFjZS5pbWcubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0XHRpbWdTcmMgPSBcIi9hcHAvZmlsZXMvXCIgKyBwbGFjZS5pbWc7XHJcblx0XHRcdFx0XHRcdGltZ0NsYXNzID0gXCJwb3B1cC1pbWFnZVwiO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdHNldENvb2tpZShcInBsYWNlSWRcIiwgcGxhY2UuaWQsIDEsIGZhbHNlKTtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0cmV0dXJuIGA8ZGl2IGlkPSdwb3B1cCcgY2xhc3M9J215Y29udGFpbmVyJz5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9J2dyaWRib3gtbGVmdCc+IFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8aW1nIHNyYz0nJHtpbWdTcmN9JyBjbGFzcz0nJHtpbWdDbGFzc30nLz4gPC9kaXY+XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1sZWZ0Jz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0JHtwbGFjZS5kZXNjcmlwdGlvbn08L2Rpdj5cclxuXHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdncmlkYm94LXJpZ2h0Jz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0QmFsc290XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT0nYnV0dG9uJyBpZD0nYnRuTGlrZScgY2xhc3M9J2J0biAke3Vwdm90ZUNsYXNzfSdcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvbmNsaWNrPSdkb1ZvdGUoJHtwbGFjZS5pZH0pJz7wn5GNIDxkaXYgaWQ9XCJ2b3RlQ291bnRcIj4ke3ZvdGVDb3VudH08L2Rpdj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICBcdFx0PC9kaXY+YDtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR3aW5kb3cuZ3JvdXAuYWRkTGF5ZXIobWFya2VyKTtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRpZih3aW5kb3cuaXNSZWRpcmVjdEZyb21GQiAmJiBwbGFjZUlkICYmIHBsYWNlSWQgPT0gb3BlblBsYWNlSWQpIHtcclxuXHRcdFx0XHRcdHdpbmRvdy5tYXJrZXJQb3VwdXAgPSBtYXJrZXI7XHJcblx0XHRcdFx0XHR3aW5kb3cubGF0ID0gcGxhY2VzW2ldLmxhdDtcclxuXHRcdFx0XHRcdHdpbmRvdy5sb24gPSBwbGFjZXNbaV0ubG9uO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVx0XHRcdFxyXG5cdFx0XHR3aW5kb3cubXltYXAuYWRkTGF5ZXIod2luZG93Lmdyb3VwKTtcclxuXHRcdFx0XHJcblx0XHRcdGlmKHdpbmRvdy5tYXJrZXJQb3VwdXApIHtcclxuXHRcdFx0XHR3aW5kb3cubWFya2VyUG91cHVwLm9wZW5Qb3B1cCgpO1xyXG5cdFx0XHRcdHdpbmRvdy5teW1hcC5zZXRWaWV3KFt3aW5kb3cubGF0LCB3aW5kb3cubG9uXSwgMTMpO1xyXG5cdFx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgbnVsbCwgJy8nKTtcclxuXHRcdFx0XHR3aW5kb3cubG9naW5DYWxsYmFjayA9ICgpID0+IHtcclxuXHRcdFx0XHRcdHdpbmRvdy52b3RlU2VydmljZS5kb1ZvdGUob3BlblBsYWNlSWQpO1xyXG5cdFx0XHRcdH07XHJcblx0XHRcdFx0d2luZG93LmZhY2Vib29rU2VydmljZS5vbkxvZ2luKCk7XHJcblx0XHRcdH1cclxuXHRcdH0pXHJcblx0XHQuY2F0Y2goZXJyID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJlMiBcIisgZXJyKTtcclxuXHRcdH0pO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gc2V0SW1nKGlucHV0KSB7XHJcblx0aWYgKGlucHV0LmZpbGVzICYmIGlucHV0LmZpbGVzWzBdKSB7XHJcblx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHRcdFxyXG5cdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdCQoJyNpbWctdXBsb2FkJykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoaW5wdXQuZmlsZXNbMF0pO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1ZvdGVUb3AoKSB7XHJcblxyXG5cdCQoJyN2b3RlLXRvcCcpLm1vZGFsKCdzaG93Jyk7XHJcblx0XHJcblx0ZmV0Y2goJy9hcHAvdG9wJyxcclxuXHRcdHtcclxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0Y2FjaGU6ICduby1jYWNoZSdcclxuXHRcdH0pXHJcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XHJcblx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKClcclxuXHRcdH0pXHJcblx0XHQudGhlbihkYXRhID0+IHtcclxuXHJcblx0XHRcdGxldCB0aXRsZXMgPSBbXHJcblx0XHRcdFx0XCLFoGF1csSrYmEgLyBuZXDEgXJyZWR6YW3Eq2JhXCIsXHJcblx0XHRcdFx0XCJTdHJhdWppIHBhZ3JpZXppZW5pXCIsXHJcblx0XHRcdFx0XCJTZWd1bXMgKGJlZHJlcywgYsSrc3RhbWFzIGFwbWFsZXMpXCJcclxuXHRcdFx0IF07XHJcblx0XHRcdGxldCBjb250ZW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wLWNvbnRlbnRcIik7XHJcblx0XHRcdGxldCByZXN1bHQgPSBcIlwiO1xyXG5cclxuXHRcdFx0Zm9yKGxldCB0eXBlID0gMTsgdHlwZSA8PSAzOyB0eXBlKyspIHtcclxuXHRcdFx0XHRsZXQgaWR4ID0gdHlwZSAtIDE7XHJcblxyXG5cdFx0XHRcdGlmKCFkYXRhIHx8ICFkYXRhW2lkeF0pIHtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRsZXQgdG9wMyA9IFwiXCI7XHJcblx0XHRcdFx0Zm9yKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRsZXQgdG9wUGxhY2UgPSBkYXRhW2lkeF1baV07XHJcblx0XHRcdFx0XHRpZighdG9wUGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0bGV0IHBsYWNlcyA9IHdpbmRvdy5wbGFjZXM7XHJcblx0XHRcdFx0XHRsZXQgaWQgPSB0b3BQbGFjZVswXTtcclxuXHRcdFx0XHRcdGxldCB2b3RlQ291bnQgPSB0b3BQbGFjZVsxXTtcclxuXHRcdFx0XHRcdGxldCBwbGFjZSA9IG51bGw7XHJcblx0XHRcdFx0XHRmb3IobGV0IGogPSAwOyBqIDwgcGxhY2VzLmxlbmd0aDsgaisrKSB7XHJcblx0XHRcdFx0XHRcdGlmKHBsYWNlc1tqXS5pZCA9PVx0IGlkKSB7XHJcblx0XHRcdFx0XHRcdFx0cGxhY2UgPSBwbGFjZXNbal07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZighcGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0bGV0IGltZ1NyYyA9IFwiL2ltYWdlcy9ub2ltYWdlLnBuZ1wiO1xyXG5cdFx0XHRcdFx0aWYocGxhY2UuaW1nICYmIHBsYWNlLmltZy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRcdGltZ1NyYyA9IFwiL2FwcC9maWxlcy8yXCIgKyBwbGFjZS5pbWc7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0Lyo8ZGl2IGNsYXNzPVwidG9wLXR4dFwiPiR7dm90ZUNvdW50fTwvZGl2PiovXHJcblxyXG5cdFx0XHRcdFx0dG9wMyArPSBgPGRpdiBjbGFzcz1cInRvcC1pdGVtXCI+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0b3AtaW1hZ2UtYm94XCI+XHJcblx0XHRcdFx0XHRcdFx0PGltZyBjbGFzcz1cInRvcC1pbWFnZVwiIHNyYz0nJHtpbWdTcmN9Jy8+IFxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidG9wLW51bWJlclwiPiR7aSArIDF9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0b3AtdGV4dFwiPiR7cGxhY2UuZGVzY3JpcHRpb259PC9kaXY+XHJcblx0XHRcdFx0XHQ8L2Rpdj5gO1xyXG5cdFx0XHRcdH1cdFx0XHRcdFxyXG5cclxuXHRcdFx0XHRpZih0b3AzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdHJlc3VsdCArPSBcclxuXHRcdFx0XHRcdFx0YDxkaXYgY2xhc3M9XCJ2b3RlLXRvcC10aXRsZVwiPiR7dHlwZX0tICR7dGl0bGVzW2lkeF19PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ2b3RlLXRvcC1yb3dcIiBpZD1cInR5cGUke3R5cGV9XCI+XHJcblx0XHRcdFx0XHRcdFx0JHt0b3AzfVxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5gO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0XHRjb250ZW50RWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHQ7XHJcblx0XHR9KVxyXG5cdFx0LmNhdGNoKGUgPT4gY29uc29sZS5sb2coXCJlMVwiKyBlKSk7XHJcbn1cclxuXHJcbiQod2luZG93KS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICBpbmNsdWRlSHRtbCgnaHRtbC9zdGFydC5odG1sJywgJ3N0YXJ0Jyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvY2hvb3NlLXBsYWNlLmh0bWwnLCAnY2hvb3NlLXBsYWNlJyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvcmVwb3J0Lmh0bWwnLCAncmVwb3J0Jyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvdm90ZS10b3AuaHRtbCcsICd2b3RlLXRvcCcpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL2Fib3V0LXVzLmh0bWwnLCAnYWJvdXQtdXMnKTtcclxuXHJcblx0bGV0IHZpc2l0ZWQgPSBnZXRDb29raWUoXCJ2aXNpdGVkXCIpO1xyXG5cdGlmKCF2aXNpdGVkKSB7XHJcblx0XHQkKCcjc3RhcnQnKS5tb2RhbCgnc2hvdycpO1xyXG5cdFx0c2V0Q29va2llKFwidmlzaXRlZFwiLCB0cnVlLCAzNjUpO1xyXG5cdH1cdFxyXG5cdFxyXG5cdGxldCB1cmwgPSBsb2NhdGlvbi50b1N0cmluZygpLnNwbGl0KFwiP1wiKVsxXTtcclxuXHRpZih1cmwpIHtcclxuXHRcdHdpbmRvdy5pc1JlZGlyZWN0RnJvbUZCID0gdXJsXHJcblx0XHRcdFx0LnN1YnN0cmluZygxKVxyXG5cdFx0XHRcdC5zcGxpdChcIiZcIilcclxuXHRcdFx0XHQubWFwKHBhcmFtZXRlciA9PiBwYXJhbWV0ZXIuc3BsaXQoXCI9XCIpKVxyXG5cdFx0XHRcdC5maWx0ZXIocGFyYW1ldGVyVmFsdWUgPT4gcGFyYW1ldGVyVmFsdWVbMF0gPT0gXCJkYXRhX2FjY2Vzc19leHBpcmF0aW9uX3RpbWVcIilcclxuXHRcdFx0XHQucmVkdWNlKGFjY3VtdWxhdG9yID0+IGFjY3VtdWxhdG9yICsgMSwgMCk7XHJcblx0XHRjb25zb2xlLmxvZyhgaXNSZWRpcmVjdEZyb21GQiAke2lzUmVkaXJlY3RGcm9tRkJ9YCk7XHJcblx0fVxyXG5cclxuXHRpbml0TWFwKCk7XHJcblxyXG5cdHdpbmRvdy5zZXRJbWcgPSBzZXRJbWc7XHJcblx0d2luZG93LnNob3dWb3RlVG9wID0gc2hvd1ZvdGVUb3A7XHJcblx0d2luZG93LnZvdGVTZXJ2aWNlID0gbmV3IFZvdGVTZXJ2aWNlKCk7XHJcblx0d2luZG93LmZhY2Vib29rU2VydmljZSA9IG5ldyBGYWNlYm9va1NlcnZpY2UoKTtcclxuXHJcblxyXG5cdGxldCBhZGRQbGFjZSA9IG5ldyBBZGRQbGFjZSgpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbImluY2x1ZGVIdG1sIiwidXJsIiwiaWQiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImlubmVySFRNTCIsInJlc3BvbnNlVGV4dCIsInNlbmQiLCJzZXRDb29raWUiLCJuYW1lIiwidmFsdWUiLCJkYXlzIiwiaXNTZWN1cmUiLCJleHBpcmVzIiwiZGF0ZSIsIkRhdGUiLCJzZXRUaW1lIiwiZ2V0VGltZSIsInRvVVRDU3RyaW5nIiwic2VjdXJlIiwiY29va2llIiwiZ2V0Q29va2llIiwibmFtZUVRIiwiY2EiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJjIiwiY2hhckF0Iiwic3Vic3RyaW5nIiwiaW5kZXhPZiIsImhpZGVTcGlubmVyIiwic3R5bGUiLCJkaXNwbGF5Iiwic2hvd1NwaW5uZXIiLCJGYWNlYm9va1NlcnZpY2UiLCJhZnRlckZCSW5pdCIsImluaXQiLCJ3aW5kb3ciLCJsb2dpbmZ1biIsInVyaSIsImVuY29kZVVSSSIsImxvY2F0aW9uIiwic3RvcmVIdHRwT25seUNvb2tpZSIsInRva2VuIiwiZmFjZWJvb2tTZXJ2aWNlIiwiZmJBc3luY0luaXQiLCJGQiIsImFwcElkIiwieGZibWwiLCJ2ZXJzaW9uIiwiQXBwRXZlbnRzIiwibG9nUGFnZVZpZXciLCJFdmVudCIsInN1YnNjcmliZSIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsIm9uTG9naW4iLCJkIiwicyIsImpzIiwiZmpzIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJjcmVhdGVFbGVtZW50Iiwic3JjIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImNoZWNrRkJMb2dpblN0YXR1cyIsInRoZW4iLCJ2b3RlU2VydmljZSIsImZldGNoTXlWb3RlcyIsImxvZ2luQ2FsbGJhY2siLCJjYXRjaCIsImUiLCJQcm9taXNlIiwicmVzb2x1dGlvbkZ1bmMiLCJyZWplY3Rpb25GdW5jIiwiJCIsIm1vZGFsIiwib25Mb2dnZWRJbiIsIm9uTm90TG9nZ2VkSW4iLCJnZXRMb2dpblN0YXR1cyIsImF1dGhSZXNwb25zZSIsImFjY2Vzc1Rva2VuIiwiYWpheCIsInR5cGUiLCJwcm9jZXNzRGF0YSIsImNyb3NzRG9tYWluIiwiaGVhZGVycyIsImRhdGEiLCJzdWNjZXNzIiwiZXJyb3IiLCJqWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwiVm90ZVNlcnZpY2UiLCJkb1ZvdGUiLCJwbGFjZUlEIiwiZmV0Y2giLCJtZXRob2QiLCJjYWNoZSIsImpzb24iLCJteXZvdGVzIiwibG9naW5JZk5lZWRlZCIsImJ0bkxpa2UiLCJkb1Vwdm90ZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicmVtb3ZlIiwiYWRkIiwidm90ZSIsInZvdGVDb3VudEVsZW1lbnQiLCJ2b3RlQ291bnQiLCJ2b3RlcyIsImFsZXJ0IiwiaXNVcHZvdGUiLCJvblN1Y2Nlc3MiLCJvbkVycm9yIiwidG9nZ2xlIiwiQWRkUGxhY2UiLCJjaGFuZ2UiLCJzZXRJbWciLCJ0aGF0Iiwib24iLCJzaG93Q3Jvc3NoYWlyIiwic2V0Q3VycmVudExvY2F0aW9uIiwiZ2V0Q3Jvc3NoYWlyTG9jYXRpb24iLCJyZXRyaWV2ZUVtYWlsRnJvbUNvb2tpZSIsImhpZGVDcm9zc2hhaXIiLCJzdWJtaXRGb3JtIiwic3RvcmVFbWFpbEluQ29va2llIiwiRm9ybURhdGEiLCJwcmV2ZW50RGVmYXVsdCIsImNvbnRlbnRUeXBlIiwicmVsb2FkIiwiZWxlbWVudCIsImNyb3NzaGFpciIsInNlbGVjdExvY2F0aW9uQnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwiY2VudGVyQ3Jvc3NoYWlyIiwibWFwIiwidHVycGluYXQiLCJ0b3BSb3ciLCJ0b3AiLCJvZmZzZXRUb3AiLCJsZWZ0Iiwib2Zmc2V0TGVmdCIsImhlaWdodCIsIm9mZnNldEhlaWdodCIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJ4IiwieSIsInRvcFJvd0hlaWdodCIsInBvaW50IiwiTCIsImxhdGxvbiIsIm15bWFwIiwiY29udGFpbmVyUG9pbnRUb0xhdExuZyIsImxhdCIsImxuZyIsImVsZW1lbnQyIiwibmF2aWdhdG9yIiwiZ2VvbG9jYXRpb24iLCJnZXRDdXJyZW50UG9zaXRpb24iLCJwb3MiLCJjb29yZHMiLCJsYXRpdHVkZSIsImxvbiIsImxvbmdpdHVkZSIsInNldFZpZXciLCJnZXRab29tIiwiZW1haWxFbGVtZW50IiwiZW1haWwiLCJpbml0TWFwIiwiem9vbUNvbnRyb2wiLCJjb250cm9sIiwiem9vbSIsInBvc2l0aW9uIiwiYWRkVG8iLCJsYXllciIsInRpbGVMYXllciIsIm1heFpvb20iLCJhdHRyaWJ1dGlvbiIsImdyb3VwIiwibWFya2VyQ2x1c3Rlckdyb3VwIiwiY2h1bmtlZExvYWRpbmciLCJzcGlkZXJmeU9uTWF4Wm9vbSIsInBsYWNlcyIsImljb25zIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwicG9wdXBBbmNob3IiLCJpY29uIiwiaWNvblVybCIsIm9wZW5QbGFjZUlkIiwicGxhY2VJZCIsIm1hcmtlciIsInBsYWNlVHlwZSIsInBsYWNlIiwiYmluZFBvcHVwIiwiY29udGV4dCIsIm9wdGlvbnMiLCJ1cHZvdGVDbGFzcyIsImltZ1NyYyIsImltZ0NsYXNzIiwiaW1nIiwiZGVzY3JpcHRpb24iLCJhZGRMYXllciIsImlzUmVkaXJlY3RGcm9tRkIiLCJtYXJrZXJQb3VwdXAiLCJvcGVuUG9wdXAiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwiZXJyIiwiaW5wdXQiLCJmaWxlcyIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJhdHRyIiwidGFyZ2V0IiwicmVzdWx0IiwicmVhZEFzRGF0YVVSTCIsInNob3dWb3RlVG9wIiwidGl0bGVzIiwiY29udGVudEVsZW1lbnQiLCJpZHgiLCJ0b3AzIiwidG9wUGxhY2UiLCJqIiwidmlzaXRlZCIsInRvU3RyaW5nIiwicGFyYW1ldGVyIiwiZmlsdGVyIiwicGFyYW1ldGVyVmFsdWUiLCJyZWR1Y2UiLCJhY2N1bXVsYXRvciIsImFkZFBsYWNlIl0sIm1hcHBpbmdzIjoiOzs7Q0FDTyxTQUFTQSxXQUFULENBQXFCQyxHQUFyQixFQUEwQkMsRUFBMUIsRUFBOEI7Q0FDcEMsTUFBSUMsR0FBRyxHQUFFLElBQUlDLGNBQUosRUFBVDtDQUNBRCxFQUFBQSxHQUFHLENBQUNFLElBQUosQ0FBUyxLQUFULEVBQWdCSixHQUFoQixFQUFxQixLQUFyQjs7Q0FDQUUsRUFBQUEsR0FBRyxDQUFDRyxrQkFB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
