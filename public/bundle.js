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

	  initMap();
	  window.setImg = setImg;
	  window.showVoteTop = showVoteTop;
	  window.voteService = new VoteService();
	  window.facebookService = new FacebookService();
	  var addPlace = new AddPlace();
	});

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiLCIuLi9zcmMvZmFjZWJvb2tTZXJ2aWNlLmpzIiwiLi4vc3JjL3ZvdGVTZXJ2aWNlLmpzIiwiLi4vc3JjL2FkZFBsYWNlLmpzIiwiLi4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSHRtbCh1cmwsIGlkKSB7XHJcblx0dmFyIHhocj0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0eGhyLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UpO1xyXG5cdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2U9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSE9PTQpIHJldHVybjtcclxuXHRcdGlmICh0aGlzLnN0YXR1cyE9PTIwMCkgcmV0dXJuOyAvLyBvciB3aGF0ZXZlciBlcnJvciBoYW5kbGluZyB5b3Ugd2FudFxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLmlubmVySFRNTD0gdGhpcy5yZXNwb25zZVRleHQ7XHJcblx0fTtcclxuXHR4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlLCBkYXlzLCBpc1NlY3VyZSkge1xyXG5cdHZhciBleHBpcmVzID0gXCJcIjtcclxuXHRpZiAoZGF5cykge1xyXG5cdFx0dmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0ZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKGRheXMqMjQqNjAqNjAqMTAwMCkpO1xyXG5cdFx0ZXhwaXJlcyA9IFwiOyBleHBpcmVzPVwiICsgZGF0ZS50b1VUQ1N0cmluZygpO1xyXG5cdH1cclxuXHRsZXQgc2VjdXJlID0gXCJcIjtcclxuXHRpZiAoaXNTZWN1cmUpIHtcclxuXHRcdHNlY3VyZSA9IFwiOyBzZWN1cmU7IEh0dHBPbmx5XCI7XHJcblx0fVxyXG5cdGRvY3VtZW50LmNvb2tpZSA9IG5hbWUgKyBcIj1cIiArICh2YWx1ZSB8fCBcIlwiKSAgKyBleHBpcmVzICsgXCI7IHBhdGg9L1wiICsgc2VjdXJlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29va2llKG5hbWUpIHtcclxuXHRcdHZhciBuYW1lRVEgPSBuYW1lICsgXCI9XCI7XHJcblx0XHR2YXIgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcclxuXHRcdGZvcih2YXIgaT0wO2kgPCBjYS5sZW5ndGg7aSsrKSB7XHJcblx0XHRcdFx0dmFyIGMgPSBjYVtpXTtcclxuXHRcdFx0XHR3aGlsZSAoYy5jaGFyQXQoMCk9PScgJykgYyA9IGMuc3Vic3RyaW5nKDEsYy5sZW5ndGgpO1xyXG5cdFx0XHRcdGlmIChjLmluZGV4T2YobmFtZUVRKSA9PSAwKSByZXR1cm4gYy5zdWJzdHJpbmcobmFtZUVRLmxlbmd0aCxjLmxlbmd0aCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVyYXNlQ29va2llKG5hbWUpIHtcclxuXHRcdGRvY3VtZW50LmNvb2tpZSA9IG5hbWUrJz07IE1heC1BZ2U9LTk5OTk5OTk5Oyc7ICBcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhpZGVTcGlubmVyKCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3ZlclwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93U3Bpbm5lcigpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY292ZXJcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxufVxyXG4iLCJpbXBvcnQgeyBnZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgc2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgRmFjZWJvb2tTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKGFmdGVyRkJJbml0KSB7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgd2luZG93LmFmdGVyRkJJbml0ID0gYWZ0ZXJGQkluaXQ7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdCgpIHtcclxuICAgICAgICB3aW5kb3cuc3RvcmVIdHRwT25seUNvb2tpZSA9ICh0b2tlbikgPT4gd2luZG93LmZhY2Vib29rU2VydmljZS5zdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKTtcclxuICAgICAgICBcclxuICAgICAgICB3aW5kb3cuZmJBc3luY0luaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgRkIuaW5pdCh7XHRcclxuICAgICAgICAgICAgICAgIGFwcElkICAgOiAnMjczODc1NDYwMTg0NjExJyxcclxuICAgICAgICAgICAgICAgIGNvb2tpZSAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzICA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB4ZmJtbCAgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gOiAndjMuMycgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgRkIuQXBwRXZlbnRzLmxvZ1BhZ2VWaWV3KCk7XHJcblxyXG4gICAgICAgICAgICBGQi5FdmVudC5zdWJzY3JpYmUoJ2F1dGguYXV0aFJlc3BvbnNlQ2hhbmdlJywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGUgc3RhdHVzIG9mIHRoZSBzZXNzaW9uIGNoYW5nZWQgdG86ICcrcmVzcG9uc2Uuc3RhdHVzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLm9uTG9naW4oKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIChmdW5jdGlvbihkLCBzLCBpZCl7XHJcbiAgICAgICAgICAgIHZhciBqcywgZmpzID0gZC5nZXRFbGVtZW50c0J5VGFnTmFtZShzKVswXTtcclxuICAgICAgICAgICAgaWYgKGQuZ2V0RWxlbWVudEJ5SWQoaWQpKSB7cmV0dXJuO31cclxuICAgICAgICAgICAganMgPSBkLmNyZWF0ZUVsZW1lbnQocyk7IGpzLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIGpzLnNyYyA9IFwiaHR0cHM6Ly9jb25uZWN0LmZhY2Vib29rLm5ldC9sdl9MVi9zZGsuanNcIjtcclxuICAgICAgICAgICAgZmpzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGpzLCBmanMpO1xyXG4gICAgICAgIH0oZG9jdW1lbnQsICdzY3JpcHQnLCAnZmFjZWJvb2stanNzZGsnKSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgb25Mb2dpbigpIHtcclxuICAgICAgICB0aGlzLmNoZWNrRkJMb2dpblN0YXR1cygpXHJcbiAgICAgICAgICAgIC50aGVuKHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLnN0b3JlSHR0cE9ubHlDb29raWUodG9rZW4pO1xyXG4gICAgICAgICAgICB9KSBcclxuICAgICAgICAgICAgLnRoZW4odG9rZW4gPT4ge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LnZvdGVTZXJ2aWNlLmZldGNoTXlWb3RlcygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZih3aW5kb3cubG9naW5DYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2dpbkNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkZCIG5vdCBsb2dnZWQgaW5cIjtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9naW5JZk5lZWRlZCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXNvbHV0aW9uRnVuYywgcmVqZWN0aW9uRnVuYykgPT4ge1xyXG5cclxuICAgICAgICAgICAgJCgnI2xvZ2luTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc3Qgb25Mb2dnZWRJbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uub25Mb2dpbigpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmMoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Ob3RMb2dnZWRJbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2dpbkNhbGxiYWNrID0gdG9rZW4gPT4geyBcclxuICAgICAgICAgICAgICAgICAgICAkKCcjbG9naW5Nb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmModG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICQoJyNsb2dpbk1vZGFsJykubW9kYWwoJ3Nob3cnKTsgXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdpbmRvdy5mYWNlYm9va1NlcnZpY2UuY2hlY2tGQkxvZ2luU3RhdHVzKClcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uTG9nZ2VkSW4sIG9uTm90TG9nZ2VkSW4pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2hlY2tGQkxvZ2luU3RhdHVzKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdXRpb25GdW5jLCByZWplY3Rpb25GdW5jKSA9PiB7XHJcbiAgICAgICAgICAgIEZCLmdldExvZ2luU3RhdHVzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT0gXCJjb25uZWN0ZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHJlc3BvbnNlLmF1dGhSZXNwb25zZS5hY2Nlc3NUb2tlbjtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHV0aW9uRnVuYyh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdGlvbkZ1bmMocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x1dGlvbkZ1bmMsIHJlamVjdGlvbkZ1bmMpID0+IHtcclxuICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgIHVybCA6IFwiL2FwcC9sb2dpblwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInRva2VuXCI6dG9rZW5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKCk7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChqWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRXJyb3IgaW4gc3RvcmVIdHRwT25seUNvb2tpZTogXCIrIGVycm9yVGhyb3duKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcdFxyXG59XHJcbiIsImltcG9ydCB7IGdldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBzZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgZXJhc2VDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBWb3RlU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuXHRcdHRoaXMuZGF0YSA9IHt9O1xyXG5cdFx0d2luZG93LmRvVm90ZSA9IChwbGFjZUlEKSA9PiB3aW5kb3cudm90ZVNlcnZpY2UuZG9Wb3RlKHBsYWNlSUQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZldGNoTXlWb3RlcygpIHtcclxuXHRcdGZldGNoKCcvYXBwL215dm90ZXMnLFxyXG5cdFx0e1xyXG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRjYWNoZTogJ25vLWNhY2hlJ1xyXG5cdFx0fSlcclxuXHRcdC50aGVuKHJlc3BvbnNlID0+IHtcclxuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmpzb24oKVxyXG5cdFx0fSlcclxuXHRcdC50aGVuKGRhdGEgPT4ge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcImZldGNoIG15IHZvdGVzXCIpO1xyXG4gICAgICAgICAgICB3aW5kb3cubXl2b3RlcyA9IGRhdGE7XHJcblx0XHR9KVxyXG5cdFx0LmNhdGNoKGUgPT4ge1xyXG5cdFx0XHRjb25zb2xlLmxvZyhcInBsb2JsZW0gZmV0Y2hpbmcgdm90ZXMgXCIgKyBlKVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRkb1ZvdGUocGxhY2VJRCkge1xyXG5cdFx0d2luZG93LnBsYWNlSUQgPSBwbGFjZUlEO1xyXG5cdFx0XHRcdFxyXG5cdFx0d2luZG93LmZhY2Vib29rU2VydmljZS5sb2dpbklmTmVlZGVkKClcclxuXHRcdFx0LnRoZW4oKCkgPT4ge1xyXG5cdFx0XHRcdGNvbnN0IGJ0bkxpa2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bkxpa2VcIik7XHJcblx0XHRcdFx0bGV0IGRvVXB2b3RlID0gdHJ1ZTtcclxuXHRcdFx0XHRpZihidG5MaWtlLmNsYXNzTGlzdC5jb250YWlucygnYnRuLXN1Y2Nlc3MnKSkge1xyXG5cdFx0XHRcdFx0ZG9VcHZvdGUgPSBmYWxzZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0aWYoZG9VcHZvdGUpIHtcclxuXHRcdFx0XHRcdGJ0bkxpa2UuY2xhc3NMaXN0LnJlbW92ZSgnYnRuLW91dGxpbmUtc3VjY2VzcycpO1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QuYWRkKCdidG4tc3VjY2VzcycpO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5hZGQoJ2J0bi1vdXRsaW5lLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHRcdGJ0bkxpa2UuY2xhc3NMaXN0LnJlbW92ZSgnYnRuLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0d2luZG93LnZvdGVTZXJ2aWNlLnZvdGUoXHJcblx0XHRcdFx0XHR3aW5kb3cucGxhY2VJRCxcclxuXHRcdFx0XHRcdGRvVXB2b3RlLFxyXG5cdFx0XHRcdFx0KGRhdGEpID0+IHtcclxuXHRcdFx0XHRcdFx0bGV0IHZvdGVDb3VudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZvdGVDb3VudFwiKTtcclxuXHRcdFx0XHRcdFx0bGV0IHZvdGVDb3VudCA9IGRhdGEudm90ZXM7XHJcblx0XHRcdFx0XHRcdGlmKHZvdGVDb3VudCA8IDEpIHtcclxuXHRcdFx0XHRcdFx0XHR2b3RlQ291bnQgPSBcIlwiO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRcdHZvdGVDb3VudEVsZW1lbnQuaW5uZXJIVE1MID0gdm90ZUNvdW50O1xyXG5cdFx0XHRcdFx0XHR3aW5kb3cubXl2b3Rlc1t3aW5kb3cucGxhY2VJRF0gPSBkb1Vwdm90ZTtcclxuXHRcdFx0XHRcdFx0d2luZG93LnZvdGVzW3dpbmRvdy5wbGFjZUlEXSA9IGRhdGEudm90ZXM7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0KGpYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSA9PiB7XHJcblx0XHRcdFx0XHRcdGFsZXJ0KFwiRXJyb3Igd2hpbGUgc2F2aW5nIHZvdGU6IFwiKyBlcnJvclRocm93bik7XHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdH0pO1xyXG5cclxuXHR9XHJcblxyXG5cdHZvdGUocGxhY2VJRCwgaXNVcHZvdGUsIG9uU3VjY2Vzcywgb25FcnJvcikge1x0XHRcdFx0XHRcclxuXHRcdCQuYWpheCh7XHJcblx0XHRcdFx0dXJsIDogXCIvYXBwL3ZvdGVcIixcclxuXHRcdFx0XHR0eXBlOiBcIlBPU1RcIixcclxuXHRcdFx0XHRwcm9jZXNzRGF0YTogZmFsc2UsXHJcblx0XHRcdFx0Y3Jvc3NEb21haW46IHRydWUsXHJcblx0XHRcdFx0XHJcblx0XHRcdFx0ZGF0YTogXCJwbGFjZT1cIisgcGxhY2VJRCArIFwiJmlzVXB2b3RlPVwiICsgaXNVcHZvdGUsXHJcblx0XHRcdFx0c3VjY2VzczogKGRhdGEpID0+IHtcclxuXHRcdFx0XHRcdG9uU3VjY2VzcyhkYXRhKTtcclxuXHRcdFx0XHR9LFxyXG5cdFx0XHRcdGVycm9yOiBvbkVycm9yXHJcblx0XHRcdH0pO1xyXG5cclxuXHR9XHJcblx0XHRcclxuXHR0b2dnbGVWb3RlQnV0dG9uKCkge1xyXG5cdFx0LypsZXQgdm90ZUNvdW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidm90ZUNvdW50XCIpO1xyXG5cdFx0dm90ZUNvdW50ID0gdm90ZUNvdW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJ2b3RlQ291bnRcIik7XHJcblx0XHRjb25zdCB2b3RlQ291bnRJbnQgPSBOdW1iZXIucGFyc2VJbnQodm90ZUNvdW50KTtcclxuXHJcblx0XHRpZihpc1Vwdm90ZSkge1xyXG5cdFx0XHR2b3RlQ291bnRFbGVtZW50LmlubmVySFRNTCA9IHZvdGVDb3VudEludCArIDE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2b3RlQ291bnRFbGVtZW50LmlubmVySFRNTCA9IHZvdGVDb3VudEludCAtIDE7XHJcblx0XHR9Ki9cclxuXHJcblx0XHRidG5MaWtlLmNsYXNzTGlzdC50b2dnbGUoJ2J0bi1vdXRsaW5lLXN1Y2Nlc3MnKTtcclxuXHRcdGJ0bkxpa2UuY2xhc3NMaXN0LnRvZ2dsZSgnYnRuLXN1Y2Nlc3MnKTtcclxuXHR9XHJcblxyXG5cclxufSIsImltcG9ydCB7IHNob3dTcGlubmVyLCBoaWRlU3Bpbm5lciwgc2V0Q29va2llLCBnZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBZGRQbGFjZSB7XHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgJChcIiN1cGxvYWRpbWFnZVwiKS5jaGFuZ2UoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgd2luZG93LnNldEltZyh0aGlzKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNjaG9vc2UtbG9jYXRpb24tYnRuXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhhdC5zaG93Q3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Q3VycmVudExvY2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3NlbGVjdC1sb2NhdGlvbi1idG5cIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGF0LmdldENyb3NzaGFpckxvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICQoJyNyZXBvcnQnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB0aGF0LnJldHJpZXZlRW1haWxGcm9tQ29va2llKCk7XHJcbiAgICAgICAgICAgIHRoYXQuaGlkZUNyb3NzaGFpcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIjY2FuY2VsLWJ0blwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoYXQuaGlkZUNyb3NzaGFpcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgJCgnI215Zm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3VibWl0Rm9ybShlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdWJtaXRGb3JtKGUpIHtcclxuICAgICAgICB0aGlzLnN0b3JlRW1haWxJbkNvb2tpZSgpO1xyXG4gICAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCQoJyNteWZvcm0nKVswXSk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNob3dTcGlubmVyKCk7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsIDogJy9hcHAvdXBsb2FkJyxcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScsXHJcbiAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGhpZGVTcGlubmVyKCk7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlBhbGRpZXMgcGFyIHZlbG9zbGF6ZHUhXCIpO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgIGhpZGVTcGlubmVyKCk7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlDEgXJsaWVjaW5pZXMsIHZhaSBlc2kgcGlldmllbm9qaXMgdmVsb3NsYXpkYW0ga2F0ZWdvcmlqdSB1biBub3NhdWt1bXUhXCIrXHJcbiAgICAgICAgICAgICAgICAgICAgXCIgSmEgbmVpemRvZGFzIHBpZXZpZW5vdCBwdW5rdHUsIHJha3N0aSB1eiBpbmZvQGRhdHVza29sYS5sdlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcG9ydC1idG5cIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0bi0yXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIGNyb3NzaGFpci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgc2VsZWN0TG9jYXRpb25CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdC1sb2NhdGlvbi1idG5cIik7XHJcbiAgICAgICAgc2VsZWN0TG9jYXRpb25CdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FuY2VsLWJ0blwiKTtcclxuICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jZW50ZXJDcm9zc2hhaXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBjZW50ZXJDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKTtcclxuICAgICAgICB2YXIgdHVycGluYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJveDFcIik7XHJcbiAgICAgICAgdmFyIHRvcFJvdyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wLXJvd1wiKTtcclxuXHJcbiAgICAgICAgdmFyIHRvcCA9IG1hcC5vZmZzZXRUb3A7XHJcbiAgICAgICAgdmFyIGxlZnQgPSBtYXAub2Zmc2V0TGVmdDtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gdHVycGluYXQub2Zmc2V0VG9wIC0gdG9wUm93Lm9mZnNldEhlaWdodDtcclxuICAgICAgICB2YXIgd2lkdGggPSBtYXAub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIHZhciB4ID0gbGVmdCArICh3aWR0aCAvIDIpIC0gMjA7XHJcbiAgICAgICAgdmFyIHkgPSB0b3AgKyAoaGVpZ2h0IC8gMikgLSAyMDtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIGNyb3NzaGFpci5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuICAgICAgICBjcm9zc2hhaXIuc3R5bGUudG9wID0geSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDcm9zc2hhaXJMb2NhdGlvbigpIHtcdFxyXG4gICAgICAgIHZhciB0b3BSb3dIZWlnaHQgPSAkKCcjdG9wLXJvdycpLmhlaWdodCgpO1xyXG4gICAgICAgIHZhciBjcm9zc2hhaXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyb3NzaGFpclwiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgcG9pbnQgPSBMLnBvaW50KCBjcm9zc2hhaXIub2Zmc2V0TGVmdCArIDIwLCBjcm9zc2hhaXIub2Zmc2V0VG9wIC0gdG9wUm93SGVpZ2h0ICk7XHJcbiAgICAgICAgY29uc3QgbGF0bG9uID0gd2luZG93Lm15bWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGF0XCIpLnZhbHVlID0gbGF0bG9uLmxhdDtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvblwiKS52YWx1ZSA9IGxhdGxvbi5sbmc7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUNyb3NzaGFpcigpIHtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0blwiKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkLW5vbmVcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcG9ydC1idG4tMlwiKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50MiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIGVsZW1lbnQyLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIHZhciBzZWxlY3RMb2NhdGlvbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWxvY2F0aW9uLWJ0blwiKTtcclxuICAgICAgICBzZWxlY3RMb2NhdGlvbkJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgY2FuY2VsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW5jZWwtYnRuXCIpO1xyXG4gICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEN1cnJlbnRMb2NhdGlvbigpIHtcclxuICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgICAgICBwb3MgPT4gIHtcdFx0XHRcdFx0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsYXQgPSBwb3MuY29vcmRzLmxhdGl0dWRlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9uID0gcG9zLmNvb3Jkcy5sb25naXR1ZGU7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5teW1hcC5zZXRWaWV3KFtsYXQsIGxvbl0sIHdpbmRvdy5teW1hcC5nZXRab29tKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcmV0cmlldmVFbWFpbEZyb21Db29raWUoKSB7XHJcbiAgICAgICAgbGV0IGVtYWlsRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1haWxcIik7XHJcbiAgICAgICAgbGV0IGVtYWlsID0gZ2V0Q29va2llKFwiZW1haWxcIik7XHJcbiAgICAgICAgaWYoZW1haWwgJiYgZW1haWwubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBlbWFpbEVsZW1lbnQudmFsdWUgPSBlbWFpbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN0b3JlRW1haWxJbkNvb2tpZSgpIHtcclxuICAgICAgICBsZXQgZW1haWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVtYWlsXCIpO1xyXG4gICAgICAgIHNldENvb2tpZShcImVtYWlsXCIsIGVtYWlsLnZhbHVlLCAzLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgaW5jbHVkZUh0bWwgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgRmFjZWJvb2tTZXJ2aWNlIH0gZnJvbSAnLi9mYWNlYm9va1NlcnZpY2UuanMnO1xyXG5pbXBvcnQgeyBWb3RlU2VydmljZSB9IGZyb20gJy4vdm90ZVNlcnZpY2UuanMnO1xyXG5pbXBvcnQgeyBzZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IEFkZFBsYWNlIH0gZnJvbSAnLi9hZGRQbGFjZS5qcyc7XHJcblx0XHJcbmZ1bmN0aW9uIGluaXRNYXAoKSB7XHRcclxuXHRcdFx0XHRcclxuXHR3aW5kb3cubXltYXAgPSBMLm1hcChcclxuXHQgICAgJ21hcGlkJyxcclxuXHQgICAgeyB6b29tQ29udHJvbDogZmFsc2UgfVxyXG5cdCkuc2V0VmlldyhbNTYuOTUxMjU5LCAyNC4xMTI2MTRdLCAxMyk7XHJcblxyXG5cdEwuY29udHJvbC56b29tKHtcclxuICAgICAgICAgcG9zaXRpb246J2JvdHRvbWxlZnQnXHJcbiAgICB9KS5hZGRUbyh3aW5kb3cubXltYXApO1xyXG5cclxuXHRjb25zdCBsYXllciA9IEwudGlsZUxheWVyKCdodHRwczovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcclxuXHRcdG1heFpvb206IDE4LFxyXG5cdFx0YXR0cmlidXRpb246ICcmY29weTsgPGEgaHJlZj1cImh0dHBzOi8vd3d3Lm9wZW5zdHJlZXRtYXAub3JnL2NvcHlyaWdodFwiPk9wZW5TdHJlZXRNYXA8L2E+IGNvbnRyaWJ1dG9ycydcclxuXHR9KS5hZGRUbyh3aW5kb3cubXltYXApO1xyXG5cclxuXHR3aW5kb3cuZ3JvdXAgPSBMLm1hcmtlckNsdXN0ZXJHcm91cCh7XHJcblx0XHRjaHVua2VkTG9hZGluZzogdHJ1ZSxcclxuXHRcdC8vZGlzYWJsZUNsdXN0ZXJpbmdBdFpvb206IDE3LFxyXG5cdFx0c3BpZGVyZnlPbk1heFpvb206IHRydWVcclxuXHQgIH0pO1xyXG5cclxuXHRmZXRjaCgnL2FwcC9wbGFjZXMnKVxyXG5cdFx0LnRoZW4ocmVzcG9uc2UgPT4ge1xyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4oZGF0YSA9PiB7XHJcblx0XHRcdHdpbmRvdy52b3RlcyA9IGRhdGEudm90ZXM7XHJcblx0XHRcdHdpbmRvdy5wbGFjZXMgPSBkYXRhLnBsYWNlcztcclxuXHRcdFx0bGV0IHBsYWNlcyA9IGRhdGEucGxhY2VzO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0Y29uc3QgaWNvbnMgPSBbXTtcclxuXHJcblx0XHRcdGxldCBpY29uU2l6ZSA9IFs5MSwgOTldOyAvLyBzaXplIG9mIHRoZSBpY29uXHJcblx0XHRcdGxldCBpY29uQW5jaG9yID0gWzQ1LCA3NV07IC8vIHBvaW50IG9mIHRoZSBpY29uIHdoaWNoIHdpbGwgY29ycmVzcG9uZCB0byBtYXJrZXIncyBsb2NhdGlvblxyXG5cdFx0XHRsZXQgcG9wdXBBbmNob3IgPSBbLTMsIC03Nl07IC8vIHBvaW50IGZyb20gd2hpY2ggdGhlIHBvcHVwIHNob3VsZCBvcGVuIHJlbGF0aXZlIHRvIHRoZSBpY29uQW5jaG9yXHJcblxyXG5cdFx0XHRpY29uc1sxXSA9IEwuaWNvbih7XHJcbiAgICAgICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL2xvY2F0aW9uLnBuZycsXHJcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogICAgIGljb25TaXplLFxyXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogICBpY29uQW5jaG9yLFxyXG4gICAgICAgICAgICAgICAgcG9wdXBBbmNob3I6ICBwb3B1cEFuY2hvclxyXG5cdFx0XHR9KTtcclxuXHRcdFx0aWNvbnNbMl0gPSBMLmljb24oe1xyXG4gICAgICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9sb2NhdGlvbjIucG5nJyxcclxuICAgICAgICAgICAgICAgIGljb25TaXplOiAgICAgaWNvblNpemUsXHJcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiAgIGljb25BbmNob3IsXHJcbiAgICAgICAgICAgICAgICBwb3B1cEFuY2hvcjogIHBvcHVwQW5jaG9yXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRpY29uc1szXSA9IEwuaWNvbih7XHJcbiAgICAgICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL2xvY2F0aW9uMy5wbmcnLFxyXG4gICAgICAgICAgICAgICAgaWNvblNpemU6ICAgICBpY29uU2l6ZSxcclxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6ICAgaWNvbkFuY2hvcixcclxuICAgICAgICAgICAgICAgIHBvcHVwQW5jaG9yOiAgcG9wdXBBbmNob3JcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRmb3IodmFyIGkgPSAwOyBpIDwgcGxhY2VzLmxlbmd0aDsgaSsrKSB7XHJcblxyXG5cdFx0XHRcdHZhciB2b3RlQ291bnRJbnB1dCA9IGRhdGEudm90ZXNbcGxhY2VzW2ldLmlkXTtcclxuXHRcdFx0XHR2YXIgdm90ZUNvdW50ID0gXCJcIjtcclxuXHRcdFx0XHRpZih2b3RlQ291bnRJbnB1dCkge1xyXG5cdFx0XHRcdCAgICB2b3RlQ291bnQgPSBcIiZuYnNwO1wiICsgZGF0YS52b3Rlc1twbGFjZXNbaV0uaWRdO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0dmFyIG1hcmtlciA9IEwubWFya2VyKFxyXG5cdFx0XHRcdFx0W3BsYWNlc1tpXS5sYXQsIHBsYWNlc1tpXS5sb25dLCBcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0aWNvbjogaWNvbnNbcGxhY2VzW2ldLnBsYWNlVHlwZV0sIFxyXG5cdFx0XHRcdFx0XHRwbGFjZTogcGxhY2VzW2ldXHJcblx0XHRcdFx0XHR9KTtcclxuXHJcblx0XHRcdFx0bWFya2VyLmJpbmRQb3B1cCggY29udGV4dCA9PiB7XHJcblx0XHRcdFx0XHRjb25zdCBwbGFjZSA9IGNvbnRleHQub3B0aW9ucy5wbGFjZTtcclxuXHRcdFx0XHRcdGxldCB2b3RlQ291bnQgPSB3aW5kb3cudm90ZXNbcGxhY2UuaWRdO1xyXG5cdFx0XHRcdFx0aWYoIXZvdGVDb3VudCkge1xyXG5cdFx0XHRcdFx0XHR2b3RlQ291bnQgPSBcIlwiO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0bGV0IGlzVXB2b3RlID0gbnVsbDtcclxuXHRcdFx0XHRcdGlmKHdpbmRvdy5teXZvdGVzKSB7XHJcblx0XHRcdFx0XHRcdGlzVXB2b3RlID0gd2luZG93Lm15dm90ZXNbcGxhY2UuaWRdO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0bGV0IHVwdm90ZUNsYXNzO1xyXG5cdFx0XHRcdFx0aWYoaXNVcHZvdGUpIHtcclxuXHRcdFx0XHRcdFx0dXB2b3RlQ2xhc3MgPSBcImJ0bi1zdWNjZXNzXCI7XHJcblx0XHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0XHR1cHZvdGVDbGFzcyA9IFwiYnRuLW91dGxpbmUtc3VjY2Vzc1wiO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGxldCBpbWdTcmMgPSBcIi9pbWFnZXMvbm9pbWFnZS5wbmdcIjtcclxuXHRcdFx0XHRcdGxldCBpbWdDbGFzcyA9IFwicG9wdXAtbm9pbWFnZVwiO1xyXG5cdFx0XHRcdFx0aWYocGxhY2UuaW1nICYmIHBsYWNlLmltZy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRcdGltZ1NyYyA9IFwiL2FwcC9maWxlcy9cIiArIHBsYWNlLmltZztcclxuXHRcdFx0XHRcdFx0aW1nQ2xhc3MgPSBcInBvcHVwLWltYWdlXCI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmV0dXJuIGA8ZGl2IGlkPSdwb3B1cCcgY2xhc3M9J215Y29udGFpbmVyJz5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9J2dyaWRib3gtbGVmdCc+IFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8aW1nIHNyYz0nJHtpbWdTcmN9JyBjbGFzcz0nJHtpbWdDbGFzc30nLz4gPC9kaXY+XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1sZWZ0Jz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0JHtwbGFjZS5kZXNjcmlwdGlvbn08L2Rpdj5cclxuXHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdncmlkYm94LXJpZ2h0Jz5cclxuXHRcdFx0XHRcdFx0XHRcdFx0QmFsc290XHJcblx0XHRcdFx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT0nYnV0dG9uJyBpZD0nYnRuTGlrZScgY2xhc3M9J2J0biAke3Vwdm90ZUNsYXNzfSdcclxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvbmNsaWNrPSdkb1ZvdGUoJHtwbGFjZS5pZH0pJz7wn5GNIDxkaXYgaWQ9XCJ2b3RlQ291bnRcIj4ke3ZvdGVDb3VudH08L2Rpdj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICBcdFx0PC9kaXY+YDtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR3aW5kb3cuZ3JvdXAuYWRkTGF5ZXIobWFya2VyKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRcclxuXHRcdFx0d2luZG93Lm15bWFwLmFkZExheWVyKHdpbmRvdy5ncm91cCk7XHJcblx0XHR9KVxyXG5cdFx0LmNhdGNoKGVyciA9PiB7XHJcblx0XHRcdGFsZXJ0KFwiZTIgXCIrIGVycik7XHJcblx0XHR9KTtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHNldEltZyhpbnB1dCkge1xyXG5cdGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xyXG5cdFx0dmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcblx0XHRcclxuXHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xyXG5cdFx0XHQkKCcjaW1nLXVwbG9hZCcpLmF0dHIoJ3NyYycsIGUudGFyZ2V0LnJlc3VsdCk7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNob3dWb3RlVG9wKCkge1xyXG5cclxuXHQkKCcjdm90ZS10b3AnKS5tb2RhbCgnc2hvdycpO1xyXG5cdFxyXG5cdGZldGNoKCcvYXBwL3RvcCcsXHJcblx0XHR7XHJcblx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdGNhY2hlOiAnbm8tY2FjaGUnXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4ocmVzcG9uc2UgPT4ge1xyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4oZGF0YSA9PiB7XHJcblxyXG5cdFx0XHRsZXQgdGl0bGVzID0gW1xyXG5cdFx0XHRcdFwixaBhdXLEq2JhIC8gbmVwxIFycmVkemFtxKtiYVwiLFxyXG5cdFx0XHRcdFwiU3RyYXVqaSBwYWdyaWV6aWVuaVwiLFxyXG5cdFx0XHRcdFwiU2VndW1zIChiZWRyZXMsIGLEq3N0YW1hcyBhcG1hbGVzKVwiXHJcblx0XHRcdCBdO1xyXG5cdFx0XHRsZXQgY29udGVudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvcC1jb250ZW50XCIpO1xyXG5cdFx0XHRsZXQgcmVzdWx0ID0gXCJcIjtcclxuXHJcblx0XHRcdGZvcihsZXQgdHlwZSA9IDE7IHR5cGUgPD0gMzsgdHlwZSsrKSB7XHJcblx0XHRcdFx0bGV0IGlkeCA9IHR5cGUgLSAxO1xyXG5cclxuXHRcdFx0XHRpZighZGF0YSB8fCAhZGF0YVtpZHhdKSB7XHJcblx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0bGV0IHRvcDMgPSBcIlwiO1xyXG5cdFx0XHRcdGZvcihsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0bGV0IHRvcFBsYWNlID0gZGF0YVtpZHhdW2ldO1xyXG5cdFx0XHRcdFx0aWYoIXRvcFBsYWNlKSB7XHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGxldCBwbGFjZXMgPSB3aW5kb3cucGxhY2VzO1xyXG5cdFx0XHRcdFx0bGV0IGlkID0gdG9wUGxhY2VbMF07XHJcblx0XHRcdFx0XHRsZXQgdm90ZUNvdW50ID0gdG9wUGxhY2VbMV07XHJcblx0XHRcdFx0XHRsZXQgcGxhY2UgPSBudWxsO1xyXG5cdFx0XHRcdFx0Zm9yKGxldCBqID0gMDsgaiA8IHBsYWNlcy5sZW5ndGg7IGorKykge1xyXG5cdFx0XHRcdFx0XHRpZihwbGFjZXNbal0uaWQgPT1cdCBpZCkge1xyXG5cdFx0XHRcdFx0XHRcdHBsYWNlID0gcGxhY2VzW2pdO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0aWYoIXBsYWNlKSB7XHJcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGxldCBpbWdTcmMgPSBcIi9pbWFnZXMvbm9pbWFnZS5wbmdcIjtcclxuXHRcdFx0XHRcdGlmKHBsYWNlLmltZyAmJiBwbGFjZS5pbWcubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0XHRpbWdTcmMgPSBcIi9hcHAvZmlsZXMvMlwiICsgcGxhY2UuaW1nO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdC8qPGRpdiBjbGFzcz1cInRvcC10eHRcIj4ke3ZvdGVDb3VudH08L2Rpdj4qL1xyXG5cclxuXHRcdFx0XHRcdHRvcDMgKz0gYDxkaXYgY2xhc3M9XCJ0b3AtaXRlbVwiPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidG9wLWltYWdlLWJveFwiPlxyXG5cdFx0XHRcdFx0XHRcdDxpbWcgY2xhc3M9XCJ0b3AtaW1hZ2VcIiBzcmM9JyR7aW1nU3JjfScvPiBcclxuXHRcdFx0XHRcdFx0PC9kaXY+XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRvcC1udW1iZXJcIj4ke2kgKyAxfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidG9wLXRleHRcIj4ke3BsYWNlLmRlc2NyaXB0aW9ufTwvZGl2PlxyXG5cdFx0XHRcdFx0PC9kaXY+YDtcclxuXHRcdFx0XHR9XHRcdFx0XHRcclxuXHJcblx0XHRcdFx0aWYodG9wMy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRyZXN1bHQgKz0gXHJcblx0XHRcdFx0XHRcdGA8ZGl2IGNsYXNzPVwidm90ZS10b3AtdGl0bGVcIj4ke3R5cGV9LSAke3RpdGxlc1tpZHhdfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidm90ZS10b3Atcm93XCIgaWQ9XCJ0eXBlJHt0eXBlfVwiPlxyXG5cdFx0XHRcdFx0XHRcdCR7dG9wM31cclxuXHRcdFx0XHRcdFx0PC9kaXY+YDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0XHJcblx0XHRcdH1cclxuXHRcdFx0Y29udGVudEVsZW1lbnQuaW5uZXJIVE1MID0gcmVzdWx0O1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlID0+IGNvbnNvbGUubG9nKFwiZTFcIisgZSkpO1xyXG59XHJcblxyXG4kKHdpbmRvdykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgaW5jbHVkZUh0bWwoJ2h0bWwvc3RhcnQuaHRtbCcsICdzdGFydCcpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL2Nob29zZS1wbGFjZS5odG1sJywgJ2Nob29zZS1wbGFjZScpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL3JlcG9ydC5odG1sJywgJ3JlcG9ydCcpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL3ZvdGUtdG9wLmh0bWwnLCAndm90ZS10b3AnKTtcclxuXHRpbmNsdWRlSHRtbCgnaHRtbC9hYm91dC11cy5odG1sJywgJ2Fib3V0LXVzJyk7XHJcblxyXG5cdGxldCB2aXNpdGVkID0gZ2V0Q29va2llKFwidmlzaXRlZFwiKTtcclxuXHRpZighdmlzaXRlZCkge1xyXG5cdFx0JCgnI3N0YXJ0JykubW9kYWwoJ3Nob3cnKTtcclxuXHRcdHNldENvb2tpZShcInZpc2l0ZWRcIiwgdHJ1ZSwgMzY1KTtcclxuXHR9XHRcclxuXHRcclxuXHRpbml0TWFwKCk7XHJcblxyXG5cdHdpbmRvdy5zZXRJbWcgPSBzZXRJbWc7XHJcblx0d2luZG93LnNob3dWb3RlVG9wID0gc2hvd1ZvdGVUb3A7XHJcblx0d2luZG93LnZvdGVTZXJ2aWNlID0gbmV3IFZvdGVTZXJ2aWNlKCk7XHJcblx0d2luZG93LmZhY2Vib29rU2VydmljZSA9IG5ldyBGYWNlYm9va1NlcnZpY2UoKTtcclxuXHJcblx0bGV0IGFkZFBsYWNlID0gbmV3IEFkZFBsYWNlKCk7XHJcbn0pO1xyXG4iXSwibmFtZXMiOlsiaW5jbHVkZUh0bWwiLCJ1cmwiLCJpZCIsInhociIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJzdGF0dXMiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiaW5uZXJIVE1MIiwicmVzcG9uc2VUZXh0Iiwic2VuZCIsInNldENvb2tpZSIsIm5hbWUiLCJ2YWx1ZSIsImRheXMiLCJpc1NlY3VyZSIsImV4cGlyZXMiLCJkYXRlIiwiRGF0ZSIsInNldFRpbWUiLCJnZXRUaW1lIiwidG9VVENTdHJpbmciLCJzZWN1cmUiLCJjb29raWUiLCJnZXRDb29raWUiLCJuYW1lRVEiLCJjYSIsInNwbGl0IiwiaSIsImxlbmd0aCIsImMiLCJjaGFyQXQiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwiaGlkZVNwaW5uZXIiLCJzdHlsZSIsImRpc3BsYXkiLCJzaG93U3Bpbm5lciIsIkZhY2Vib29rU2VydmljZSIsImFmdGVyRkJJbml0IiwiaW5pdCIsIndpbmRvdyIsInN0b3JlSHR0cE9ubHlDb29raWUiLCJ0b2tlbiIsImZhY2Vib29rU2VydmljZSIsImZiQXN5bmNJbml0IiwiRkIiLCJhcHBJZCIsInhmYm1sIiwidmVyc2lvbiIsIkFwcEV2ZW50cyIsImxvZ1BhZ2VWaWV3IiwiRXZlbnQiLCJzdWJzY3JpYmUiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJsb2ciLCJvbkxvZ2luIiwiZCIsInMiLCJqcyIsImZqcyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiY3JlYXRlRWxlbWVudCIsInNyYyIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJjaGVja0ZCTG9naW5TdGF0dXMiLCJ0aGVuIiwidm90ZVNlcnZpY2UiLCJmZXRjaE15Vm90ZXMiLCJsb2dpbkNhbGxiYWNrIiwiY2F0Y2giLCJlIiwiUHJvbWlzZSIsInJlc29sdXRpb25GdW5jIiwicmVqZWN0aW9uRnVuYyIsIiQiLCJtb2RhbCIsIm9uTG9nZ2VkSW4iLCJvbk5vdExvZ2dlZEluIiwiZ2V0TG9naW5TdGF0dXMiLCJhdXRoUmVzcG9uc2UiLCJhY2Nlc3NUb2tlbiIsImFqYXgiLCJ0eXBlIiwicHJvY2Vzc0RhdGEiLCJjcm9zc0RvbWFpbiIsImhlYWRlcnMiLCJkYXRhIiwic3VjY2VzcyIsImVycm9yIiwialhIUiIsInRleHRTdGF0dXMiLCJlcnJvclRocm93biIsIlZvdGVTZXJ2aWNlIiwiZG9Wb3RlIiwicGxhY2VJRCIsImZldGNoIiwibWV0aG9kIiwiY2FjaGUiLCJqc29uIiwibXl2b3RlcyIsImxvZ2luSWZOZWVkZWQiLCJidG5MaWtlIiwiZG9VcHZvdGUiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInJlbW92ZSIsImFkZCIsInZvdGUiLCJ2b3RlQ291bnRFbGVtZW50Iiwidm90ZUNvdW50Iiwidm90ZXMiLCJhbGVydCIsImlzVXB2b3RlIiwib25TdWNjZXNzIiwib25FcnJvciIsInRvZ2dsZSIsIkFkZFBsYWNlIiwiY2hhbmdlIiwic2V0SW1nIiwidGhhdCIsIm9uIiwic2hvd0Nyb3NzaGFpciIsInNldEN1cnJlbnRMb2NhdGlvbiIsImdldENyb3NzaGFpckxvY2F0aW9uIiwicmV0cmlldmVFbWFpbEZyb21Db29raWUiLCJoaWRlQ3Jvc3NoYWlyIiwic3VibWl0Rm9ybSIsInN0b3JlRW1haWxJbkNvb2tpZSIsIkZvcm1EYXRhIiwicHJldmVudERlZmF1bHQiLCJjb250ZW50VHlwZSIsImxvY2F0aW9uIiwicmVsb2FkIiwiZWxlbWVudCIsImNyb3NzaGFpciIsInNlbGVjdExvY2F0aW9uQnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwiY2VudGVyQ3Jvc3NoYWlyIiwibWFwIiwidHVycGluYXQiLCJ0b3BSb3ciLCJ0b3AiLCJvZmZzZXRUb3AiLCJsZWZ0Iiwib2Zmc2V0TGVmdCIsImhlaWdodCIsIm9mZnNldEhlaWdodCIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJ4IiwieSIsInRvcFJvd0hlaWdodCIsInBvaW50IiwiTCIsImxhdGxvbiIsIm15bWFwIiwiY29udGFpbmVyUG9pbnRUb0xhdExuZyIsImxhdCIsImxuZyIsImVsZW1lbnQyIiwibmF2aWdhdG9yIiwiZ2VvbG9jYXRpb24iLCJnZXRDdXJyZW50UG9zaXRpb24iLCJwb3MiLCJjb29yZHMiLCJsYXRpdHVkZSIsImxvbiIsImxvbmdpdHVkZSIsInNldFZpZXciLCJnZXRab29tIiwiZW1haWxFbGVtZW50IiwiZW1haWwiLCJpbml0TWFwIiwiem9vbUNvbnRyb2wiLCJjb250cm9sIiwiem9vbSIsInBvc2l0aW9uIiwiYWRkVG8iLCJsYXllciIsInRpbGVMYXllciIsIm1heFpvb20iLCJhdHRyaWJ1dGlvbiIsImdyb3VwIiwibWFya2VyQ2x1c3Rlckdyb3VwIiwiY2h1bmtlZExvYWRpbmciLCJzcGlkZXJmeU9uTWF4Wm9vbSIsInBsYWNlcyIsImljb25zIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwicG9wdXBBbmNob3IiLCJpY29uIiwiaWNvblVybCIsInZvdGVDb3VudElucHV0IiwibWFya2VyIiwicGxhY2VUeXBlIiwicGxhY2UiLCJiaW5kUG9wdXAiLCJjb250ZXh0Iiwib3B0aW9ucyIsInVwdm90ZUNsYXNzIiwiaW1nU3JjIiwiaW1nQ2xhc3MiLCJpbWciLCJkZXNjcmlwdGlvbiIsImFkZExheWVyIiwiZXJyIiwiaW5wdXQiLCJmaWxlcyIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJhdHRyIiwidGFyZ2V0IiwicmVzdWx0IiwicmVhZEFzRGF0YVVSTCIsInNob3dWb3RlVG9wIiwidGl0bGVzIiwiY29udGVudEVsZW1lbnQiLCJpZHgiLCJ0b3AzIiwidG9wUGxhY2UiLCJqIiwidmlzaXRlZCIsImFkZFBsYWNlIl0sIm1hcHBpbmdzIjoiOzs7Q0FDTyxTQUFTQSxXQUFULENBQXFCQyxHQUFyQixFQUEwQkMsRUFBMUIsRUFBOEI7Q0FDcEMsTUFBSUMsR0FBRyxHQUFFLElBQUlDLGNBQUosRUFBVDtDQUNBRCxFQUFBQSxHQUFHLENBQUNFLElBQUosQ0FBUyxLQUFULEVBQWdCSixHQUFoQixFQUFxQixLQUFyQjs7Q0FDQUUsRUFBQUEsR0FBRyxDQUFDRyxrQkFBSixHQUF3QixZQUFXO0NBQ2xDLFFB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
