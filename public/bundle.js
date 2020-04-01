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
	      var top = map.offsetTop;
	      var left = map.offsetLeft;
	      var height = map.offsetHeight;
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
	      var offset = $('#crosshair').offset();
	      var crosshair = document.getElementById("crosshair");
	      var point = L.point(crosshair.offsetLeft + 20, crosshair.offsetTop - topRowHeight);
	      var latlon = window.mymap.containerPointToLatLng(point);
	      document.getElementById("lat").value = latlon.lat;
	      document.getElementById("lon").value = latlon.lng;
	    }
	  }, {
	    key: "onCancel",
	    value: function onCancel() {
	      this.hideCrosshair();
	    }
	  }, {
	    key: "hideCrosshair",
	    value: function hideCrosshair() {
	      var element = document.getElementById("report-btn");
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

	        return "<div id='popup' class='mycontainer'>\n\t\t\t\t\t\t\t\t<div class='gridbox-left'> \n\t\t\t\t\t\t\t\t\t<img src='/app/files/".concat(place.img, "' id='popup-image'/> </div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-left'>\n\t\t\t\t\t\t\t\t\t").concat(place.description, "</div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-right'>\n\t\t\t\t\t\t\t\t\tBalsot\n\t\t\t\t\t\t\t\t\t<button type='button' id='btnLike' class='btn ").concat(upvoteClass, "'\n\t\t\t\t\t\t\t\t\t\tonclick='doVote(").concat(place.id, ")'>\uD83D\uDC4D <div id=\"voteCount\">").concat(voteCount, "</div></button>\n                    \t\t</div>");
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
	    for (var type = 1; type <= 3; type++) {
	      var idx = type - 1;

	      if (!data || !data[idx]) {
	        continue;
	      }

	      var element = document.getElementById("type" + type);
	      var result = "";

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

	        result += "<div class=\"image\">\n\t\t\t\t\t\t<img class=\"vote-top-img\" src='/app/files/2".concat(place.img, "' />\n\t\t\t\t\t\t<div class=\"vote-top-place\">").concat(i + 1, "</div>\n\t\t\t\t\t\t<div class=\"vote-top-count\">").concat(voteCount, "</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"vote-top-text\">").concat(place.description, "</div>");
	      }

	      element.innerHTML = result;
	    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiLCIuLi9zcmMvZmFjZWJvb2tTZXJ2aWNlLmpzIiwiLi4vc3JjL3ZvdGVTZXJ2aWNlLmpzIiwiLi4vc3JjL2FkZFBsYWNlLmpzIiwiLi4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSHRtbCh1cmwsIGlkKSB7XHJcblx0dmFyIHhocj0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0eGhyLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UpO1xyXG5cdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2U9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSE9PTQpIHJldHVybjtcclxuXHRcdGlmICh0aGlzLnN0YXR1cyE9PTIwMCkgcmV0dXJuOyAvLyBvciB3aGF0ZXZlciBlcnJvciBoYW5kbGluZyB5b3Ugd2FudFxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLmlubmVySFRNTD0gdGhpcy5yZXNwb25zZVRleHQ7XHJcblx0fTtcclxuXHR4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsdmFsdWUsZGF5cywgaXNTZWN1cmUpIHtcclxuXHR2YXIgZXhwaXJlcyA9IFwiXCI7XHJcblx0aWYgKGRheXMpIHtcclxuXHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIChkYXlzKjI0KjYwKjYwKjEwMDApKTtcclxuXHRcdGV4cGlyZXMgPSBcIjsgZXhwaXJlcz1cIiArIGRhdGUudG9VVENTdHJpbmcoKTtcclxuXHR9XHJcblx0bGV0IHNlY3VyZSA9IFwiXCI7XHJcblx0aWYgKGlzU2VjdXJlKSB7XHJcblx0XHRzZWN1cmUgPSBcIjsgc2VjdXJlOyBIdHRwT25seVwiO1xyXG5cdH1cclxuXHRkb2N1bWVudC5jb29raWUgPSBuYW1lICsgXCI9XCIgKyAodmFsdWUgfHwgXCJcIikgICsgZXhwaXJlcyArIFwiOyBwYXRoPS9cIiArIHNlY3VyZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvb2tpZShuYW1lKSB7XHJcblx0XHR2YXIgbmFtZUVRID0gbmFtZSArIFwiPVwiO1xyXG5cdFx0dmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XHJcblx0XHRmb3IodmFyIGk9MDtpIDwgY2EubGVuZ3RoO2krKykge1xyXG5cdFx0XHRcdHZhciBjID0gY2FbaV07XHJcblx0XHRcdFx0d2hpbGUgKGMuY2hhckF0KDApPT0nICcpIGMgPSBjLnN1YnN0cmluZygxLGMubGVuZ3RoKTtcclxuXHRcdFx0XHRpZiAoYy5pbmRleE9mKG5hbWVFUSkgPT0gMCkgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWVFUS5sZW5ndGgsYy5sZW5ndGgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKSB7XHJcblx0XHRkb2N1bWVudC5jb29raWUgPSBuYW1lKyc9OyBNYXgtQWdlPS05OTk5OTk5OTsnOyAgXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoaWRlU3Bpbm5lcigpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY292ZXJcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1NwaW5uZXIoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdmVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IHNldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihhZnRlckZCSW5pdCkge1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIHdpbmRvdy5hZnRlckZCSW5pdCA9IGFmdGVyRkJJbml0O1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgd2luZG93LnN0b3JlSHR0cE9ubHlDb29raWUgPSAodG9rZW4pID0+IHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uuc3RvcmVIdHRwT25seUNvb2tpZSh0b2tlbik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93LmZiQXN5bmNJbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIEZCLmluaXQoe1x0XHJcbiAgICAgICAgICAgICAgICBhcHBJZCAgIDogJzI3Mzg3NTQ2MDE4NDYxMScsXHJcbiAgICAgICAgICAgICAgICBjb29raWUgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN0YXR1cyAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgeGZibWwgICA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB2ZXJzaW9uIDogJ3YzLjMnIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIEZCLkFwcEV2ZW50cy5sb2dQYWdlVmlldygpO1xyXG5cclxuICAgICAgICAgICAgRkIuRXZlbnQuc3Vic2NyaWJlKCdhdXRoLmF1dGhSZXNwb25zZUNoYW5nZScsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhlIHN0YXR1cyBvZiB0aGUgc2Vzc2lvbiBjaGFuZ2VkIHRvOiAnK3Jlc3BvbnNlLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgd2luZG93LmZhY2Vib29rU2VydmljZS5vbkxvZ2luKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICAoZnVuY3Rpb24oZCwgcywgaWQpe1xyXG4gICAgICAgICAgICB2YXIganMsIGZqcyA9IGQuZ2V0RWxlbWVudHNCeVRhZ05hbWUocylbMF07XHJcbiAgICAgICAgICAgIGlmIChkLmdldEVsZW1lbnRCeUlkKGlkKSkge3JldHVybjt9XHJcbiAgICAgICAgICAgIGpzID0gZC5jcmVhdGVFbGVtZW50KHMpOyBqcy5pZCA9IGlkO1xyXG4gICAgICAgICAgICBqcy5zcmMgPSBcImh0dHBzOi8vY29ubmVjdC5mYWNlYm9vay5uZXQvbHZfTFYvc2RrLmpzXCI7XHJcbiAgICAgICAgICAgIGZqcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqcywgZmpzKTtcclxuICAgICAgICB9KGRvY3VtZW50LCAnc2NyaXB0JywgJ2ZhY2Vib29rLWpzc2RrJykpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG9uTG9naW4oKSB7XHJcbiAgICAgICAgdGhpcy5jaGVja0ZCTG9naW5TdGF0dXMoKVxyXG4gICAgICAgICAgICAudGhlbih0b2tlbiA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmZhY2Vib29rU2VydmljZS5zdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKTtcclxuICAgICAgICAgICAgfSkgXHJcbiAgICAgICAgICAgIC50aGVuKHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy52b3RlU2VydmljZS5mZXRjaE15Vm90ZXMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICB0b2tlbiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYod2luZG93LmxvZ2luQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvZ2luQ2FsbGJhY2sodG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJGQiBub3QgbG9nZ2VkIGluXCI7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvZ2luSWZOZWVkZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x1dGlvbkZ1bmMsIHJlamVjdGlvbkZ1bmMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICQoJyNsb2dpbk1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9nZ2VkSW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLm9uTG9naW4oKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTm90TG9nZ2VkSW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayA9IHRva2VuID0+IHsgXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2xvZ2luTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKHRva2VuKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAkKCcjbG9naW5Nb2RhbCcpLm1vZGFsKCdzaG93Jyk7IFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLmNoZWNrRkJMb2dpblN0YXR1cygpXHJcbiAgICAgICAgICAgICAgICAudGhlbihvbkxvZ2dlZEluLCBvbk5vdExvZ2dlZEluKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNoZWNrRkJMb2dpblN0YXR1cygpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXNvbHV0aW9uRnVuYywgcmVqZWN0aW9uRnVuYykgPT4ge1xyXG4gICAgICAgICAgICBGQi5nZXRMb2dpblN0YXR1cyhmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09IFwiY29ubmVjdGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG9rZW4gPSByZXNwb25zZS5hdXRoUmVzcG9uc2UuYWNjZXNzVG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmModG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3Rpb25GdW5jKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RvcmVIdHRwT25seUNvb2tpZSh0b2tlbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdXRpb25GdW5jLCByZWplY3Rpb25GdW5jKSA9PiB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmwgOiBcIi9hcHAvbG9naW5cIixcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0b2tlblwiOnRva2VuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogXCJcIixcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHV0aW9uRnVuYygpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIGluIHN0b3JlSHR0cE9ubHlDb29raWU6IFwiKyBlcnJvclRocm93bik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHRcclxufVxyXG4iLCJpbXBvcnQgeyBnZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgc2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IGVyYXNlQ29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVm90ZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmRhdGEgPSB7fTtcclxuXHRcdHdpbmRvdy5kb1ZvdGUgPSAocGxhY2VJRCkgPT4gd2luZG93LnZvdGVTZXJ2aWNlLmRvVm90ZShwbGFjZUlEKTtcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaE15Vm90ZXMoKSB7XHJcblx0XHRmZXRjaCgnL2FwcC9teXZvdGVzJyxcclxuXHRcdHtcclxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0Y2FjaGU6ICduby1jYWNoZSdcclxuXHRcdH0pXHJcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XHJcblx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKClcclxuXHRcdH0pXHJcblx0XHQudGhlbihkYXRhID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJmZXRjaCBteSB2b3Rlc1wiKTtcclxuICAgICAgICAgICAgd2luZG93Lm15dm90ZXMgPSBkYXRhO1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJwbG9ibGVtIGZldGNoaW5nIHZvdGVzIFwiICsgZSlcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZG9Wb3RlKHBsYWNlSUQpIHtcclxuXHRcdHdpbmRvdy5wbGFjZUlEID0gcGxhY2VJRDtcclxuXHRcdFx0XHRcclxuXHRcdHdpbmRvdy5mYWNlYm9va1NlcnZpY2UubG9naW5JZk5lZWRlZCgpXHJcblx0XHRcdC50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRjb25zdCBidG5MaWtlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG5MaWtlXCIpO1xyXG5cdFx0XHRcdGxldCBkb1Vwdm90ZSA9IHRydWU7XHJcblx0XHRcdFx0aWYoYnRuTGlrZS5jbGFzc0xpc3QuY29udGFpbnMoJ2J0bi1zdWNjZXNzJykpIHtcclxuXHRcdFx0XHRcdGRvVXB2b3RlID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGRvVXB2b3RlKSB7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1vdXRsaW5lLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHRcdGJ0bkxpa2UuY2xhc3NMaXN0LmFkZCgnYnRuLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QuYWRkKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1zdWNjZXNzJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHdpbmRvdy52b3RlU2VydmljZS52b3RlKFxyXG5cdFx0XHRcdFx0d2luZG93LnBsYWNlSUQsXHJcblx0XHRcdFx0XHRkb1Vwdm90ZSxcclxuXHRcdFx0XHRcdChkYXRhKSA9PiB7XHJcblx0XHRcdFx0XHRcdGxldCB2b3RlQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2b3RlQ291bnRcIik7XHJcblx0XHRcdFx0XHRcdGxldCB2b3RlQ291bnQgPSBkYXRhLnZvdGVzO1xyXG5cdFx0XHRcdFx0XHRpZih2b3RlQ291bnQgPCAxKSB7XHJcblx0XHRcdFx0XHRcdFx0dm90ZUNvdW50ID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR2b3RlQ291bnRFbGVtZW50LmlubmVySFRNTCA9IHZvdGVDb3VudDtcclxuXHRcdFx0XHRcdFx0d2luZG93Lm15dm90ZXNbd2luZG93LnBsYWNlSURdID0gZG9VcHZvdGU7XHJcblx0XHRcdFx0XHRcdHdpbmRvdy52b3Rlc1t3aW5kb3cucGxhY2VJRF0gPSBkYXRhLnZvdGVzO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdChqWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikgPT4ge1xyXG5cdFx0XHRcdFx0XHRhbGVydChcIkVycm9yIHdoaWxlIHNhdmluZyB2b3RlOiBcIisgZXJyb3JUaHJvd24pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHR2b3RlKHBsYWNlSUQsIGlzVXB2b3RlLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcdFx0XHRcdFx0XHJcblx0XHQkLmFqYXgoe1xyXG5cdFx0XHRcdHVybCA6IFwiL2FwcC92b3RlXCIsXHJcblx0XHRcdFx0dHlwZTogXCJQT1NUXCIsXHJcblx0XHRcdFx0cHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG5cdFx0XHRcdGNyb3NzRG9tYWluOiB0cnVlLFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGRhdGE6IFwicGxhY2U9XCIrIHBsYWNlSUQgKyBcIiZpc1Vwdm90ZT1cIiArIGlzVXB2b3RlLFxyXG5cdFx0XHRcdHN1Y2Nlc3M6IChkYXRhKSA9PiB7XHJcblx0XHRcdFx0XHRvblN1Y2Nlc3MoZGF0YSk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRlcnJvcjogb25FcnJvclxyXG5cdFx0XHR9KTtcclxuXHJcblx0fVxyXG5cdFx0XHJcblx0dG9nZ2xlVm90ZUJ1dHRvbigpIHtcclxuXHRcdC8qbGV0IHZvdGVDb3VudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZvdGVDb3VudFwiKTtcclxuXHRcdHZvdGVDb3VudCA9IHZvdGVDb3VudEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwidm90ZUNvdW50XCIpO1xyXG5cdFx0Y29uc3Qgdm90ZUNvdW50SW50ID0gTnVtYmVyLnBhcnNlSW50KHZvdGVDb3VudCk7XHJcblxyXG5cdFx0aWYoaXNVcHZvdGUpIHtcclxuXHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnRJbnQgKyAxO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnRJbnQgLSAxO1xyXG5cdFx0fSovXHJcblxyXG5cdFx0YnRuTGlrZS5jbGFzc0xpc3QudG9nZ2xlKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRidG5MaWtlLmNsYXNzTGlzdC50b2dnbGUoJ2J0bi1zdWNjZXNzJyk7XHJcblx0fVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBzaG93U3Bpbm5lciwgaGlkZVNwaW5uZXIgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBZGRQbGFjZSB7XHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgJChcIiN1cGxvYWRpbWFnZVwiKS5jaGFuZ2UoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgd2luZG93LnNldEltZyh0aGlzKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNjaG9vc2UtbG9jYXRpb24tYnRuXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgdGhhdC5zaG93Q3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Q3VycmVudExvY2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3NlbGVjdC1sb2NhdGlvbi1idG5cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICB0aGF0LmdldENyb3NzaGFpckxvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICQoJyNyZXBvcnQnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB0aGF0LmhpZGVDcm9zc2hhaXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI2NhbmNlbC1idG5cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICB0aGF0LmhpZGVDcm9zc2hhaXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgICQoJyNteWZvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB0aGF0LnN1Ym1pdEZvcm0oZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1Ym1pdEZvcm0oZSkge1xyXG4gICAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCQoJyNteWZvcm0nKVswXSk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNob3dTcGlubmVyKCk7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsIDogJy9hcHAvdXBsb2FkJyxcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScsXHJcbiAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGhpZGVTcGlubmVyKCk7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlBhbGRpZXMgcGFyIHZlbG9zbGF6ZHUhXCIpO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgIGhpZGVTcGlubmVyKCk7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlDEgXJsaWVjaW5pZXMsIHZhaSBlc2kgcGlldmllbm9qaXMgdmVsb3NsYXpkYW0ga2F0ZWdvcmlqdSB1biBub3NhdWt1bXUhXCIrXHJcbiAgICAgICAgICAgICAgICAgICAgXCIgSmEgbmVpemRvZGFzIHBpZXZpZW5vdCBwdW5rdHUsIHJha3N0aSB1eiBpbmZvQGRhdHVza29sYS5sdlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcG9ydC1idG5cIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0bi0yXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIGNyb3NzaGFpci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgc2VsZWN0TG9jYXRpb25CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdC1sb2NhdGlvbi1idG5cIik7XHJcbiAgICAgICAgc2VsZWN0TG9jYXRpb25CdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FuY2VsLWJ0blwiKTtcclxuICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jZW50ZXJDcm9zc2hhaXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBjZW50ZXJDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKTtcclxuXHJcbiAgICAgICAgdmFyIHRvcCA9IG1hcC5vZmZzZXRUb3A7XHJcbiAgICAgICAgdmFyIGxlZnQgPSBtYXAub2Zmc2V0TGVmdDtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gbWFwLm9mZnNldEhlaWdodDtcclxuICAgICAgICB2YXIgd2lkdGggPSBtYXAub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIHZhciB4ID0gbGVmdCArIHdpZHRoIC8gMiAtIDIwO1xyXG4gICAgICAgIHZhciB5ID0gdG9wICsgaGVpZ2h0IC8gMiAtIDIwO1xyXG5cclxuICAgICAgICB2YXIgY3Jvc3NoYWlyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgY3Jvc3NoYWlyLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xyXG4gICAgICAgIGNyb3NzaGFpci5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENyb3NzaGFpckxvY2F0aW9uKCkge1x0XHJcbiAgICAgICAgdmFyIHRvcFJvd0hlaWdodCA9ICQoJyN0b3Atcm93JykuaGVpZ2h0KCk7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9ICQoJyNjcm9zc2hhaXInKS5vZmZzZXQoKTtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBwb2ludCA9IEwucG9pbnQoIGNyb3NzaGFpci5vZmZzZXRMZWZ0ICsgMjAsIGNyb3NzaGFpci5vZmZzZXRUb3AgLSB0b3BSb3dIZWlnaHQgKTtcclxuICAgICAgICBjb25zdCBsYXRsb24gPSB3aW5kb3cubXltYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYXRcIikudmFsdWUgPSBsYXRsb24ubGF0O1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9uXCIpLnZhbHVlID0gbGF0bG9uLmxuZztcclxuICAgIH1cclxuXHJcbiAgICBvbkNhbmNlbCgpIHtcclxuICAgICAgICB0aGlzLmhpZGVDcm9zc2hhaXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlQ3Jvc3NoYWlyKCkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXBvcnQtYnRuXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgZWxlbWVudDIuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIHNlbGVjdExvY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3QtbG9jYXRpb24tYnRuXCIpO1xyXG4gICAgICAgIHNlbGVjdExvY2F0aW9uQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idG5cIik7XHJcbiAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q3VycmVudExvY2F0aW9uKCkge1xyXG4gICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXHJcbiAgICAgICAgICAgIHBvcyA9PiAge1x0XHRcdFx0XHRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhdCA9IHBvcy5jb29yZHMubGF0aXR1ZGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb24gPSBwb3MuY29vcmRzLmxvbmdpdHVkZTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgd2luZG93Lm15bWFwLnNldFZpZXcoW2xhdCwgbG9uXSwgd2luZG93Lm15bWFwLmdldFpvb20oKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IGluY2x1ZGVIdG1sIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IEZhY2Vib29rU2VydmljZSB9IGZyb20gJy4vZmFjZWJvb2tTZXJ2aWNlLmpzJztcclxuaW1wb3J0IHsgVm90ZVNlcnZpY2UgfSBmcm9tICcuL3ZvdGVTZXJ2aWNlLmpzJztcclxuaW1wb3J0IHsgc2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IGdldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBBZGRQbGFjZSB9IGZyb20gJy4vYWRkUGxhY2UuanMnO1xyXG5cdFxyXG5mdW5jdGlvbiBpbml0TWFwKCkge1x0XHJcblx0XHRcdFx0XHJcblx0d2luZG93Lm15bWFwID0gTC5tYXAoXHJcblx0ICAgICdtYXBpZCcsXHJcblx0ICAgIHsgem9vbUNvbnRyb2w6IGZhbHNlIH1cclxuXHQpLnNldFZpZXcoWzU2Ljk1MTI1OSwgMjQuMTEyNjE0XSwgMTMpO1xyXG5cclxuXHRMLmNvbnRyb2wuem9vbSh7XHJcbiAgICAgICAgIHBvc2l0aW9uOidib3R0b21sZWZ0J1xyXG4gICAgfSkuYWRkVG8od2luZG93Lm15bWFwKTtcclxuXHJcblx0Y29uc3QgbGF5ZXIgPSBMLnRpbGVMYXllcignaHR0cHM6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XHJcblx0XHRtYXhab29tOiAxOCxcclxuXHRcdGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwczovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMnXHJcblx0fSkuYWRkVG8od2luZG93Lm15bWFwKTtcclxuXHJcblx0d2luZG93Lmdyb3VwID0gTC5tYXJrZXJDbHVzdGVyR3JvdXAoe1xyXG5cdFx0Y2h1bmtlZExvYWRpbmc6IHRydWUsXHJcblx0XHQvL2Rpc2FibGVDbHVzdGVyaW5nQXRab29tOiAxNyxcclxuXHRcdHNwaWRlcmZ5T25NYXhab29tOiB0cnVlXHJcblx0ICB9KTtcclxuXHJcblx0ZmV0Y2goJy9hcHAvcGxhY2VzJylcclxuXHRcdC50aGVuKHJlc3BvbnNlID0+IHtcclxuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmpzb24oKVxyXG5cdFx0fSlcclxuXHRcdC50aGVuKGRhdGEgPT4ge1xyXG5cdFx0XHR3aW5kb3cudm90ZXMgPSBkYXRhLnZvdGVzO1xyXG5cdFx0XHR3aW5kb3cucGxhY2VzID0gZGF0YS5wbGFjZXM7XHJcblx0XHRcdGxldCBwbGFjZXMgPSBkYXRhLnBsYWNlcztcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdGNvbnN0IGljb25zID0gW107XHJcblxyXG5cdFx0XHRsZXQgaWNvblNpemUgPSBbOTEsIDk5XTsgLy8gc2l6ZSBvZiB0aGUgaWNvblxyXG5cdFx0XHRsZXQgaWNvbkFuY2hvciA9IFs0NSwgNzVdOyAvLyBwb2ludCBvZiB0aGUgaWNvbiB3aGljaCB3aWxsIGNvcnJlc3BvbmQgdG8gbWFya2VyJ3MgbG9jYXRpb25cclxuXHRcdFx0bGV0IHBvcHVwQW5jaG9yID0gWy0zLCAtNzZdOyAvLyBwb2ludCBmcm9tIHdoaWNoIHRoZSBwb3B1cCBzaG91bGQgb3BlbiByZWxhdGl2ZSB0byB0aGUgaWNvbkFuY2hvclxyXG5cclxuXHRcdFx0aWNvbnNbMV0gPSBMLmljb24oe1xyXG4gICAgICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9sb2NhdGlvbi5wbmcnLFxyXG4gICAgICAgICAgICAgICAgaWNvblNpemU6ICAgICBpY29uU2l6ZSxcclxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6ICAgaWNvbkFuY2hvcixcclxuICAgICAgICAgICAgICAgIHBvcHVwQW5jaG9yOiAgcG9wdXBBbmNob3JcclxuXHRcdFx0fSk7XHJcblx0XHRcdGljb25zWzJdID0gTC5pY29uKHtcclxuICAgICAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvbG9jYXRpb24yLnBuZycsXHJcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogICAgIGljb25TaXplLFxyXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogICBpY29uQW5jaG9yLFxyXG4gICAgICAgICAgICAgICAgcG9wdXBBbmNob3I6ICBwb3B1cEFuY2hvclxyXG5cdFx0XHR9KTtcclxuXHRcdFx0aWNvbnNbM10gPSBMLmljb24oe1xyXG4gICAgICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9sb2NhdGlvbjMucG5nJyxcclxuICAgICAgICAgICAgICAgIGljb25TaXplOiAgICAgaWNvblNpemUsXHJcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiAgIGljb25BbmNob3IsXHJcbiAgICAgICAgICAgICAgICBwb3B1cEFuY2hvcjogIHBvcHVwQW5jaG9yXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHBsYWNlcy5sZW5ndGg7IGkrKykge1xyXG5cclxuXHRcdFx0XHR2YXIgdm90ZUNvdW50SW5wdXQgPSBkYXRhLnZvdGVzW3BsYWNlc1tpXS5pZF07XHJcblx0XHRcdFx0dmFyIHZvdGVDb3VudCA9IFwiXCI7XHJcblx0XHRcdFx0aWYodm90ZUNvdW50SW5wdXQpIHtcclxuXHRcdFx0XHQgICAgdm90ZUNvdW50ID0gXCImbmJzcDtcIiArIGRhdGEudm90ZXNbcGxhY2VzW2ldLmlkXTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHZhciBtYXJrZXIgPSBMLm1hcmtlcihcclxuXHRcdFx0XHRcdFtwbGFjZXNbaV0ubGF0LCBwbGFjZXNbaV0ubG9uXSwgXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGljb246IGljb25zW3BsYWNlc1tpXS5wbGFjZVR5cGVdLCBcclxuXHRcdFx0XHRcdFx0cGxhY2U6IHBsYWNlc1tpXVxyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdG1hcmtlci5iaW5kUG9wdXAoIGNvbnRleHQgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgcGxhY2UgPSBjb250ZXh0Lm9wdGlvbnMucGxhY2U7XHJcblx0XHRcdFx0XHRsZXQgdm90ZUNvdW50ID0gd2luZG93LnZvdGVzW3BsYWNlLmlkXTtcclxuXHRcdFx0XHRcdGlmKCF2b3RlQ291bnQpIHtcclxuXHRcdFx0XHRcdFx0dm90ZUNvdW50ID0gXCJcIjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGxldCBpc1Vwdm90ZSA9IG51bGw7XHJcblx0XHRcdFx0XHRpZih3aW5kb3cubXl2b3Rlcykge1xyXG5cdFx0XHRcdFx0XHRpc1Vwdm90ZSA9IHdpbmRvdy5teXZvdGVzW3BsYWNlLmlkXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGxldCB1cHZvdGVDbGFzcztcclxuXHRcdFx0XHRcdGlmKGlzVXB2b3RlKSB7XHJcblx0XHRcdFx0XHRcdHVwdm90ZUNsYXNzID0gXCJidG4tc3VjY2Vzc1wiO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dXB2b3RlQ2xhc3MgPSBcImJ0bi1vdXRsaW5lLXN1Y2Nlc3NcIjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gYDxkaXYgaWQ9J3BvcHVwJyBjbGFzcz0nbXljb250YWluZXInPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1sZWZ0Jz4gXHJcblx0XHRcdFx0XHRcdFx0XHRcdDxpbWcgc3JjPScvYXBwL2ZpbGVzLyR7cGxhY2UuaW1nfScgaWQ9J3BvcHVwLWltYWdlJy8+IDwvZGl2PlxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9J2dyaWRib3gtbGVmdCc+XHJcblx0XHRcdFx0XHRcdFx0XHRcdCR7cGxhY2UuZGVzY3JpcHRpb259PC9kaXY+XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1yaWdodCc+XHJcblx0XHRcdFx0XHRcdFx0XHRcdEJhbHNvdFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9J2J1dHRvbicgaWQ9J2J0bkxpa2UnIGNsYXNzPSdidG4gJHt1cHZvdGVDbGFzc30nXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0b25jbGljaz0nZG9Wb3RlKCR7cGxhY2UuaWR9KSc+8J+RjSA8ZGl2IGlkPVwidm90ZUNvdW50XCI+JHt2b3RlQ291bnR9PC9kaXY+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgXHRcdDwvZGl2PmA7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0d2luZG93Lmdyb3VwLmFkZExheWVyKG1hcmtlcik7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHdpbmRvdy5teW1hcC5hZGRMYXllcih3aW5kb3cuZ3JvdXApO1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlcnIgPT4ge1xyXG5cdFx0XHRhbGVydChcImUyIFwiKyBlcnIpO1xyXG5cdFx0fSk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBzZXRJbWcoaW5wdXQpIHtcclxuXHRpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcclxuXHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cdFx0XHJcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0JCgnI2ltZy11cGxvYWQnKS5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93Vm90ZVRvcCgpIHtcclxuXHJcblx0JCgnI3ZvdGUtdG9wJykubW9kYWwoJ3Nob3cnKTtcclxuXHRcclxuXHRmZXRjaCgnL2FwcC90b3AnLFxyXG5cdFx0e1xyXG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRjYWNoZTogJ25vLWNhY2hlJ1xyXG5cdFx0fSlcclxuXHRcdC50aGVuKHJlc3BvbnNlID0+IHtcclxuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmpzb24oKVxyXG5cdFx0fSlcclxuXHRcdC50aGVuKGRhdGEgPT4ge1xyXG5cdFx0XHRmb3IobGV0IHR5cGUgPSAxOyB0eXBlIDw9IDM7IHR5cGUrKykge1xyXG5cdFx0XHRcdGxldCBpZHggPSB0eXBlIC0gMTtcclxuXHJcblx0XHRcdFx0aWYoIWRhdGEgfHwgIWRhdGFbaWR4XSkge1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRsZXQgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidHlwZVwiICsgdHlwZSk7XHJcblx0XHRcdFx0bGV0IHJlc3VsdCA9IFwiXCI7XHJcblx0XHRcdFx0Zm9yKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRsZXQgdG9wUGxhY2UgPSBkYXRhW2lkeF1baV07XHJcblx0XHRcdFx0XHRpZighdG9wUGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0bGV0IHBsYWNlcyA9IHdpbmRvdy5wbGFjZXM7XHJcblx0XHRcdFx0XHRsZXQgaWQgPSB0b3BQbGFjZVswXTtcclxuXHRcdFx0XHRcdGxldCB2b3RlQ291bnQgPSB0b3BQbGFjZVsxXTtcclxuXHRcdFx0XHRcdGxldCBwbGFjZSA9IG51bGw7XHJcblx0XHRcdFx0XHRmb3IobGV0IGogPSAwOyBqIDwgcGxhY2VzLmxlbmd0aDsgaisrKSB7XHJcblx0XHRcdFx0XHRcdGlmKHBsYWNlc1tqXS5pZCA9PVx0IGlkKSB7XHJcblx0XHRcdFx0XHRcdFx0cGxhY2UgPSBwbGFjZXNbal07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZighcGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cmVzdWx0ICs9IGA8ZGl2IGNsYXNzPVwiaW1hZ2VcIj5cclxuXHRcdFx0XHRcdFx0PGltZyBjbGFzcz1cInZvdGUtdG9wLWltZ1wiIHNyYz0nL2FwcC9maWxlcy8yJHtwbGFjZS5pbWd9JyAvPlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidm90ZS10b3AtcGxhY2VcIj4ke2kgKyAxfTwvZGl2PlxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidm90ZS10b3AtY291bnRcIj4ke3ZvdGVDb3VudH08L2Rpdj5cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdFx0PGRpdiBjbGFzcz1cInZvdGUtdG9wLXRleHRcIj4ke3BsYWNlLmRlc2NyaXB0aW9ufTwvZGl2PmA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdGVsZW1lbnQuaW5uZXJIVE1MID0gcmVzdWx0O1xyXG5cdFx0XHR9XHJcblx0XHR9KVxyXG5cdFx0LmNhdGNoKGUgPT4gYWxlcnQoXCJlMVwiKyBlKSk7XHJcbn1cclxuXHJcbiQod2luZG93KS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICBpbmNsdWRlSHRtbCgnaHRtbC9zdGFydC5odG1sJywgJ3N0YXJ0Jyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvY2hvb3NlLXBsYWNlLmh0bWwnLCAnY2hvb3NlLXBsYWNlJyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvcmVwb3J0Lmh0bWwnLCAncmVwb3J0Jyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvdm90ZS10b3AuaHRtbCcsICd2b3RlLXRvcCcpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL2Fib3V0LXVzLmh0bWwnLCAnYWJvdXQtdXMnKTtcclxuXHJcblx0bGV0IHZpc2l0ZWQgPSBnZXRDb29raWUoXCJ2aXNpdGVkXCIpO1xyXG5cdGlmKCF2aXNpdGVkKSB7XHJcblx0XHQkKCcjc3RhcnQnKS5tb2RhbCgnc2hvdycpO1xyXG5cdFx0c2V0Q29va2llKFwidmlzaXRlZFwiLCB0cnVlLCAzNjUpO1xyXG5cdH1cdFxyXG5cdFxyXG5cdGluaXRNYXAoKTtcclxuXHJcblx0d2luZG93LnNldEltZyA9IHNldEltZztcclxuXHR3aW5kb3cuc2hvd1ZvdGVUb3AgPSBzaG93Vm90ZVRvcDtcclxuXHR3aW5kb3cudm90ZVNlcnZpY2UgPSBuZXcgVm90ZVNlcnZpY2UoKTtcclxuXHR3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlID0gbmV3IEZhY2Vib29rU2VydmljZSgpO1xyXG5cclxuXHRsZXQgYWRkUGxhY2UgPSBuZXcgQWRkUGxhY2UoKTtcclxufSk7XHJcbiJdLCJuYW1lcyI6WyJpbmNsdWRlSHRtbCIsInVybCIsImlkIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJpbm5lckhUTUwiLCJyZXNwb25zZVRleHQiLCJzZW5kIiwic2V0Q29va2llIiwibmFtZSIsInZhbHVlIiwiZGF5cyIsImlzU2VjdXJlIiwiZXhwaXJlcyIsImRhdGUiLCJEYXRlIiwic2V0VGltZSIsImdldFRpbWUiLCJ0b1VUQ1N0cmluZyIsInNlY3VyZSIsImNvb2tpZSIsImdldENvb2tpZSIsIm5hbWVFUSIsImNhIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwiYyIsImNoYXJBdCIsInN1YnN0cmluZyIsImluZGV4T2YiLCJoaWRlU3Bpbm5lciIsInN0eWxlIiwiZGlzcGxheSIsInNob3dTcGlubmVyIiwiRmFjZWJvb2tTZXJ2aWNlIiwiYWZ0ZXJGQkluaXQiLCJpbml0Iiwid2luZG93Iiwic3RvcmVIdHRwT25seUNvb2tpZSIsInRva2VuIiwiZmFjZWJvb2tTZXJ2aWNlIiwiZmJBc3luY0luaXQiLCJGQiIsImFwcElkIiwieGZibWwiLCJ2ZXJzaW9uIiwiQXBwRXZlbnRzIiwibG9nUGFnZVZpZXciLCJFdmVudCIsInN1YnNjcmliZSIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsIm9uTG9naW4iLCJkIiwicyIsImpzIiwiZmpzIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJjcmVhdGVFbGVtZW50Iiwic3JjIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImNoZWNrRkJMb2dpblN0YXR1cyIsInRoZW4iLCJ2b3RlU2VydmljZSIsImZldGNoTXlWb3RlcyIsImxvZ2luQ2FsbGJhY2siLCJjYXRjaCIsImUiLCJQcm9taXNlIiwicmVzb2x1dGlvbkZ1bmMiLCJyZWplY3Rpb25GdW5jIiwiJCIsIm1vZGFsIiwib25Mb2dnZWRJbiIsIm9uTm90TG9nZ2VkSW4iLCJnZXRMb2dpblN0YXR1cyIsImF1dGhSZXNwb25zZSIsImFjY2Vzc1Rva2VuIiwiYWpheCIsInR5cGUiLCJwcm9jZXNzRGF0YSIsImNyb3NzRG9tYWluIiwiaGVhZGVycyIsImRhdGEiLCJzdWNjZXNzIiwiZXJyb3IiLCJqWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwiVm90ZVNlcnZpY2UiLCJkb1ZvdGUiLCJwbGFjZUlEIiwiZmV0Y2giLCJtZXRob2QiLCJjYWNoZSIsImpzb24iLCJteXZvdGVzIiwibG9naW5JZk5lZWRlZCIsImJ0bkxpa2UiLCJkb1Vwdm90ZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicmVtb3ZlIiwiYWRkIiwidm90ZSIsInZvdGVDb3VudEVsZW1lbnQiLCJ2b3RlQ291bnQiLCJ2b3RlcyIsImFsZXJ0IiwiaXNVcHZvdGUiLCJvblN1Y2Nlc3MiLCJvbkVycm9yIiwidG9nZ2xlIiwiQWRkUGxhY2UiLCJjaGFuZ2UiLCJzZXRJbWciLCJ0aGF0Iiwib24iLCJldmVudCIsInNob3dDcm9zc2hhaXIiLCJzZXRDdXJyZW50TG9jYXRpb24iLCJnZXRDcm9zc2hhaXJMb2NhdGlvbiIsImhpZGVDcm9zc2hhaXIiLCJzdWJtaXRGb3JtIiwiRm9ybURhdGEiLCJwcmV2ZW50RGVmYXVsdCIsImNvbnRlbnRUeXBlIiwibG9jYXRpb24iLCJyZWxvYWQiLCJlbGVtZW50IiwiY3Jvc3NoYWlyIiwic2VsZWN0TG9jYXRpb25CdXR0b24iLCJjYW5jZWxCdXR0b24iLCJjZW50ZXJDcm9zc2hhaXIiLCJtYXAiLCJ0b3AiLCJvZmZzZXRUb3AiLCJsZWZ0Iiwib2Zmc2V0TGVmdCIsImhlaWdodCIsIm9mZnNldEhlaWdodCIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJ4IiwieSIsInRvcFJvd0hlaWdodCIsIm9mZnNldCIsInBvaW50IiwiTCIsImxhdGxvbiIsIm15bWFwIiwiY29udGFpbmVyUG9pbnRUb0xhdExuZyIsImxhdCIsImxuZyIsImVsZW1lbnQyIiwibmF2aWdhdG9yIiwiZ2VvbG9jYXRpb24iLCJnZXRDdXJyZW50UG9zaXRpb24iLCJwb3MiLCJjb29yZHMiLCJsYXRpdHVkZSIsImxvbiIsImxvbmdpdHVkZSIsInNldFZpZXciLCJnZXRab29tIiwiaW5pdE1hcCIsInpvb21Db250cm9sIiwiY29udHJvbCIsInpvb20iLCJwb3NpdGlvbiIsImFkZFRvIiwibGF5ZXIiLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJncm91cCIsIm1hcmtlckNsdXN0ZXJHcm91cCIsImNodW5rZWRMb2FkaW5nIiwic3BpZGVyZnlPbk1heFpvb20iLCJwbGFjZXMiLCJpY29ucyIsImljb25TaXplIiwiaWNvbkFuY2hvciIsInBvcHVwQW5jaG9yIiwiaWNvbiIsImljb25VcmwiLCJ2b3RlQ291bnRJbnB1dCIsIm1hcmtlciIsInBsYWNlVHlwZSIsInBsYWNlIiwiYmluZFBvcHVwIiwiY29udGV4dCIsIm9wdGlvbnMiLCJ1cHZvdGVDbGFzcyIsImltZyIsImRlc2NyaXB0aW9uIiwiYWRkTGF5ZXIiLCJlcnIiLCJpbnB1dCIsImZpbGVzIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImF0dHIiLCJ0YXJnZXQiLCJyZXN1bHQiLCJyZWFkQXNEYXRhVVJMIiwic2hvd1ZvdGVUb3AiLCJpZHgiLCJ0b3BQbGFjZSIsImoiLCJ2aXNpdGVkIiwiYWRkUGxhY2UiXSwibWFwcGluZ3MiOiI7OztDQUNPLFNBQVNBLFdBQVQsQ0FBcUJDLEdBQXJCLEVBQTBCQyxFQUExQixFQUE4QjtDQUNwQyxNQUFJQyxHQUFHLEdBQUUsSUFBSUMsY0FBSixFQUFUO0NBQ0FELEVBQUFBLEdBQUcsQ0FBQ0UsSUFBSixDQUFTLEtBQVQsRUFBZ0JKLEdBQWhCLEVBQXFCLEtBQXJCOztDQUNBRSxFQUFBQSxHQUFHLENBQUNHLGtCQUFK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
