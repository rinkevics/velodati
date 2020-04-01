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
	        /*<div class="top-txt">${voteCount}</div>*/


	        top3 += "<div class=\"top-item\">\n\t\t\t\t\t\t<div class=\"top-image-box\">\n\t\t\t\t\t\t\t<img class=\"top-image\" src='/app/files/2".concat(place.img, "'/> \n\t\t\t\t\t\t</div>\t\t\t\t\n\t\t\t\t\t\t<div class=\"top-number\">").concat(i + 1, "</div>\n\t\t\t\t\t\t<div class=\"top-text\">").concat(place.description, "</div>\n\t\t\t\t\t</div>");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiLCIuLi9zcmMvZmFjZWJvb2tTZXJ2aWNlLmpzIiwiLi4vc3JjL3ZvdGVTZXJ2aWNlLmpzIiwiLi4vc3JjL2FkZFBsYWNlLmpzIiwiLi4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSHRtbCh1cmwsIGlkKSB7XHJcblx0dmFyIHhocj0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0eGhyLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UpO1xyXG5cdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2U9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSE9PTQpIHJldHVybjtcclxuXHRcdGlmICh0aGlzLnN0YXR1cyE9PTIwMCkgcmV0dXJuOyAvLyBvciB3aGF0ZXZlciBlcnJvciBoYW5kbGluZyB5b3Ugd2FudFxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLmlubmVySFRNTD0gdGhpcy5yZXNwb25zZVRleHQ7XHJcblx0fTtcclxuXHR4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsdmFsdWUsZGF5cywgaXNTZWN1cmUpIHtcclxuXHR2YXIgZXhwaXJlcyA9IFwiXCI7XHJcblx0aWYgKGRheXMpIHtcclxuXHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIChkYXlzKjI0KjYwKjYwKjEwMDApKTtcclxuXHRcdGV4cGlyZXMgPSBcIjsgZXhwaXJlcz1cIiArIGRhdGUudG9VVENTdHJpbmcoKTtcclxuXHR9XHJcblx0bGV0IHNlY3VyZSA9IFwiXCI7XHJcblx0aWYgKGlzU2VjdXJlKSB7XHJcblx0XHRzZWN1cmUgPSBcIjsgc2VjdXJlOyBIdHRwT25seVwiO1xyXG5cdH1cclxuXHRkb2N1bWVudC5jb29raWUgPSBuYW1lICsgXCI9XCIgKyAodmFsdWUgfHwgXCJcIikgICsgZXhwaXJlcyArIFwiOyBwYXRoPS9cIiArIHNlY3VyZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvb2tpZShuYW1lKSB7XHJcblx0XHR2YXIgbmFtZUVRID0gbmFtZSArIFwiPVwiO1xyXG5cdFx0dmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XHJcblx0XHRmb3IodmFyIGk9MDtpIDwgY2EubGVuZ3RoO2krKykge1xyXG5cdFx0XHRcdHZhciBjID0gY2FbaV07XHJcblx0XHRcdFx0d2hpbGUgKGMuY2hhckF0KDApPT0nICcpIGMgPSBjLnN1YnN0cmluZygxLGMubGVuZ3RoKTtcclxuXHRcdFx0XHRpZiAoYy5pbmRleE9mKG5hbWVFUSkgPT0gMCkgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWVFUS5sZW5ndGgsYy5sZW5ndGgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKSB7XHJcblx0XHRkb2N1bWVudC5jb29raWUgPSBuYW1lKyc9OyBNYXgtQWdlPS05OTk5OTk5OTsnOyAgXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoaWRlU3Bpbm5lcigpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY292ZXJcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1NwaW5uZXIoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdmVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IHNldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEZhY2Vib29rU2VydmljZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihhZnRlckZCSW5pdCkge1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIHdpbmRvdy5hZnRlckZCSW5pdCA9IGFmdGVyRkJJbml0O1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoKSB7XHJcbiAgICAgICAgd2luZG93LnN0b3JlSHR0cE9ubHlDb29raWUgPSAodG9rZW4pID0+IHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uuc3RvcmVIdHRwT25seUNvb2tpZSh0b2tlbik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93LmZiQXN5bmNJbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIEZCLmluaXQoe1x0XHJcbiAgICAgICAgICAgICAgICBhcHBJZCAgIDogJzI3Mzg3NTQ2MDE4NDYxMScsXHJcbiAgICAgICAgICAgICAgICBjb29raWUgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHN0YXR1cyAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgeGZibWwgICA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB2ZXJzaW9uIDogJ3YzLjMnIFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIEZCLkFwcEV2ZW50cy5sb2dQYWdlVmlldygpO1xyXG5cclxuICAgICAgICAgICAgRkIuRXZlbnQuc3Vic2NyaWJlKCdhdXRoLmF1dGhSZXNwb25zZUNoYW5nZScsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhlIHN0YXR1cyBvZiB0aGUgc2Vzc2lvbiBjaGFuZ2VkIHRvOiAnK3Jlc3BvbnNlLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgd2luZG93LmZhY2Vib29rU2VydmljZS5vbkxvZ2luKCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICAoZnVuY3Rpb24oZCwgcywgaWQpe1xyXG4gICAgICAgICAgICB2YXIganMsIGZqcyA9IGQuZ2V0RWxlbWVudHNCeVRhZ05hbWUocylbMF07XHJcbiAgICAgICAgICAgIGlmIChkLmdldEVsZW1lbnRCeUlkKGlkKSkge3JldHVybjt9XHJcbiAgICAgICAgICAgIGpzID0gZC5jcmVhdGVFbGVtZW50KHMpOyBqcy5pZCA9IGlkO1xyXG4gICAgICAgICAgICBqcy5zcmMgPSBcImh0dHBzOi8vY29ubmVjdC5mYWNlYm9vay5uZXQvbHZfTFYvc2RrLmpzXCI7XHJcbiAgICAgICAgICAgIGZqcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqcywgZmpzKTtcclxuICAgICAgICB9KGRvY3VtZW50LCAnc2NyaXB0JywgJ2ZhY2Vib29rLWpzc2RrJykpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG9uTG9naW4oKSB7XHJcbiAgICAgICAgdGhpcy5jaGVja0ZCTG9naW5TdGF0dXMoKVxyXG4gICAgICAgICAgICAudGhlbih0b2tlbiA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmZhY2Vib29rU2VydmljZS5zdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKTtcclxuICAgICAgICAgICAgfSkgXHJcbiAgICAgICAgICAgIC50aGVuKHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy52b3RlU2VydmljZS5mZXRjaE15Vm90ZXMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICB0b2tlbiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYod2luZG93LmxvZ2luQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvZ2luQ2FsbGJhY2sodG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJGQiBub3QgbG9nZ2VkIGluXCI7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGxvZ2luSWZOZWVkZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x1dGlvbkZ1bmMsIHJlamVjdGlvbkZ1bmMpID0+IHtcclxuXHJcbiAgICAgICAgICAgICQoJyNsb2dpbk1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbnN0IG9uTG9nZ2VkSW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLm9uTG9naW4oKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uTm90TG9nZ2VkSW4gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayA9IHRva2VuID0+IHsgXHJcbiAgICAgICAgICAgICAgICAgICAgJCgnI2xvZ2luTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKHRva2VuKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAkKCcjbG9naW5Nb2RhbCcpLm1vZGFsKCdzaG93Jyk7IFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLmNoZWNrRkJMb2dpblN0YXR1cygpXHJcbiAgICAgICAgICAgICAgICAudGhlbihvbkxvZ2dlZEluLCBvbk5vdExvZ2dlZEluKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNoZWNrRkJMb2dpblN0YXR1cygpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXNvbHV0aW9uRnVuYywgcmVqZWN0aW9uRnVuYykgPT4ge1xyXG4gICAgICAgICAgICBGQi5nZXRMb2dpblN0YXR1cyhmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09IFwiY29ubmVjdGVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgdG9rZW4gPSByZXNwb25zZS5hdXRoUmVzcG9uc2UuYWNjZXNzVG9rZW47XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmModG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3Rpb25GdW5jKHJlc3BvbnNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RvcmVIdHRwT25seUNvb2tpZSh0b2tlbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdXRpb25GdW5jLCByZWplY3Rpb25GdW5jKSA9PiB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmwgOiBcIi9hcHAvbG9naW5cIixcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ0b2tlblwiOnRva2VuXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogXCJcIixcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHV0aW9uRnVuYygpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVycm9yIGluIHN0b3JlSHR0cE9ubHlDb29raWU6IFwiKyBlcnJvclRocm93bik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pOyAgICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHRcclxufVxyXG4iLCJpbXBvcnQgeyBnZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgc2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IGVyYXNlQ29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgVm90ZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmRhdGEgPSB7fTtcclxuXHRcdHdpbmRvdy5kb1ZvdGUgPSAocGxhY2VJRCkgPT4gd2luZG93LnZvdGVTZXJ2aWNlLmRvVm90ZShwbGFjZUlEKTtcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaE15Vm90ZXMoKSB7XHJcblx0XHRmZXRjaCgnL2FwcC9teXZvdGVzJyxcclxuXHRcdHtcclxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0Y2FjaGU6ICduby1jYWNoZSdcclxuXHRcdH0pXHJcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XHJcblx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKClcclxuXHRcdH0pXHJcblx0XHQudGhlbihkYXRhID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJmZXRjaCBteSB2b3Rlc1wiKTtcclxuICAgICAgICAgICAgd2luZG93Lm15dm90ZXMgPSBkYXRhO1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJwbG9ibGVtIGZldGNoaW5nIHZvdGVzIFwiICsgZSlcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZG9Wb3RlKHBsYWNlSUQpIHtcclxuXHRcdHdpbmRvdy5wbGFjZUlEID0gcGxhY2VJRDtcclxuXHRcdFx0XHRcclxuXHRcdHdpbmRvdy5mYWNlYm9va1NlcnZpY2UubG9naW5JZk5lZWRlZCgpXHJcblx0XHRcdC50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRjb25zdCBidG5MaWtlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG5MaWtlXCIpO1xyXG5cdFx0XHRcdGxldCBkb1Vwdm90ZSA9IHRydWU7XHJcblx0XHRcdFx0aWYoYnRuTGlrZS5jbGFzc0xpc3QuY29udGFpbnMoJ2J0bi1zdWNjZXNzJykpIHtcclxuXHRcdFx0XHRcdGRvVXB2b3RlID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGRvVXB2b3RlKSB7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1vdXRsaW5lLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHRcdGJ0bkxpa2UuY2xhc3NMaXN0LmFkZCgnYnRuLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QuYWRkKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1zdWNjZXNzJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdHdpbmRvdy52b3RlU2VydmljZS52b3RlKFxyXG5cdFx0XHRcdFx0d2luZG93LnBsYWNlSUQsXHJcblx0XHRcdFx0XHRkb1Vwdm90ZSxcclxuXHRcdFx0XHRcdChkYXRhKSA9PiB7XHJcblx0XHRcdFx0XHRcdGxldCB2b3RlQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2b3RlQ291bnRcIik7XHJcblx0XHRcdFx0XHRcdGxldCB2b3RlQ291bnQgPSBkYXRhLnZvdGVzO1xyXG5cdFx0XHRcdFx0XHRpZih2b3RlQ291bnQgPCAxKSB7XHJcblx0XHRcdFx0XHRcdFx0dm90ZUNvdW50ID0gXCJcIjtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHR2b3RlQ291bnRFbGVtZW50LmlubmVySFRNTCA9IHZvdGVDb3VudDtcclxuXHRcdFx0XHRcdFx0d2luZG93Lm15dm90ZXNbd2luZG93LnBsYWNlSURdID0gZG9VcHZvdGU7XHJcblx0XHRcdFx0XHRcdHdpbmRvdy52b3Rlc1t3aW5kb3cucGxhY2VJRF0gPSBkYXRhLnZvdGVzO1xyXG5cdFx0XHRcdFx0fSxcclxuXHRcdFx0XHRcdChqWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikgPT4ge1xyXG5cdFx0XHRcdFx0XHRhbGVydChcIkVycm9yIHdoaWxlIHNhdmluZyB2b3RlOiBcIisgZXJyb3JUaHJvd24pO1xyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHR9KTtcclxuXHJcblx0fVxyXG5cclxuXHR2b3RlKHBsYWNlSUQsIGlzVXB2b3RlLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcdFx0XHRcdFx0XHJcblx0XHQkLmFqYXgoe1xyXG5cdFx0XHRcdHVybCA6IFwiL2FwcC92b3RlXCIsXHJcblx0XHRcdFx0dHlwZTogXCJQT1NUXCIsXHJcblx0XHRcdFx0cHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG5cdFx0XHRcdGNyb3NzRG9tYWluOiB0cnVlLFxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGRhdGE6IFwicGxhY2U9XCIrIHBsYWNlSUQgKyBcIiZpc1Vwdm90ZT1cIiArIGlzVXB2b3RlLFxyXG5cdFx0XHRcdHN1Y2Nlc3M6IChkYXRhKSA9PiB7XHJcblx0XHRcdFx0XHRvblN1Y2Nlc3MoZGF0YSk7XHJcblx0XHRcdFx0fSxcclxuXHRcdFx0XHRlcnJvcjogb25FcnJvclxyXG5cdFx0XHR9KTtcclxuXHJcblx0fVxyXG5cdFx0XHJcblx0dG9nZ2xlVm90ZUJ1dHRvbigpIHtcclxuXHRcdC8qbGV0IHZvdGVDb3VudEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZvdGVDb3VudFwiKTtcclxuXHRcdHZvdGVDb3VudCA9IHZvdGVDb3VudEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwidm90ZUNvdW50XCIpO1xyXG5cdFx0Y29uc3Qgdm90ZUNvdW50SW50ID0gTnVtYmVyLnBhcnNlSW50KHZvdGVDb3VudCk7XHJcblxyXG5cdFx0aWYoaXNVcHZvdGUpIHtcclxuXHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnRJbnQgKyAxO1xyXG5cdFx0fSBlbHNlIHtcclxuXHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnRJbnQgLSAxO1xyXG5cdFx0fSovXHJcblxyXG5cdFx0YnRuTGlrZS5jbGFzc0xpc3QudG9nZ2xlKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRidG5MaWtlLmNsYXNzTGlzdC50b2dnbGUoJ2J0bi1zdWNjZXNzJyk7XHJcblx0fVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBzaG93U3Bpbm5lciwgaGlkZVNwaW5uZXIgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBBZGRQbGFjZSB7XHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgJChcIiN1cGxvYWRpbWFnZVwiKS5jaGFuZ2UoZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgd2luZG93LnNldEltZyh0aGlzKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpcztcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNjaG9vc2UtbG9jYXRpb24tYnRuXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgdGhhdC5zaG93Q3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Q3VycmVudExvY2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3NlbGVjdC1sb2NhdGlvbi1idG5cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICB0aGF0LmdldENyb3NzaGFpckxvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICQoJyNyZXBvcnQnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB0aGF0LmhpZGVDcm9zc2hhaXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI2NhbmNlbC1idG5cIiwgZnVuY3Rpb24oZXZlbnQpe1xyXG4gICAgICAgICAgICB0aGF0LmhpZGVDcm9zc2hhaXIoKTtcclxuICAgICAgICB9KTtcclxuICAgIFxyXG4gICAgICAgICQoJyNteWZvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB0aGF0LnN1Ym1pdEZvcm0oZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHN1Ym1pdEZvcm0oZSkge1xyXG4gICAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCQoJyNteWZvcm0nKVswXSk7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNob3dTcGlubmVyKCk7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsIDogJy9hcHAvdXBsb2FkJyxcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiAnbXVsdGlwYXJ0L2Zvcm0tZGF0YScsXHJcbiAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxyXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcclxuICAgICAgICAgICAgZGF0YTogZGF0YSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGhpZGVTcGlubmVyKCk7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlBhbGRpZXMgcGFyIHZlbG9zbGF6ZHUhXCIpO1xyXG4gICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgIGhpZGVTcGlubmVyKCk7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlDEgXJsaWVjaW5pZXMsIHZhaSBlc2kgcGlldmllbm9qaXMgdmVsb3NsYXpkYW0ga2F0ZWdvcmlqdSB1biBub3NhdWt1bXUhXCIrXHJcbiAgICAgICAgICAgICAgICAgICAgXCIgSmEgbmVpemRvZGFzIHBpZXZpZW5vdCBwdW5rdHUsIHJha3N0aSB1eiBpbmZvQGRhdHVza29sYS5sdlwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcG9ydC1idG5cIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0bi0yXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIGNyb3NzaGFpci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB2YXIgc2VsZWN0TG9jYXRpb25CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNlbGVjdC1sb2NhdGlvbi1idG5cIik7XHJcbiAgICAgICAgc2VsZWN0TG9jYXRpb25CdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FuY2VsLWJ0blwiKTtcclxuICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5jZW50ZXJDcm9zc2hhaXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBjZW50ZXJDcm9zc2hhaXIoKSB7XHJcbiAgICAgICAgdmFyIG1hcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFpblwiKTtcclxuXHJcbiAgICAgICAgdmFyIHRvcCA9IG1hcC5vZmZzZXRUb3A7XHJcbiAgICAgICAgdmFyIGxlZnQgPSBtYXAub2Zmc2V0TGVmdDtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gbWFwLm9mZnNldEhlaWdodDtcclxuICAgICAgICB2YXIgd2lkdGggPSBtYXAub2Zmc2V0V2lkdGg7XHJcblxyXG4gICAgICAgIHZhciB4ID0gbGVmdCArIHdpZHRoIC8gMiAtIDIwO1xyXG4gICAgICAgIHZhciB5ID0gdG9wICsgaGVpZ2h0IC8gMiAtIDIwO1xyXG5cclxuICAgICAgICB2YXIgY3Jvc3NoYWlyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgY3Jvc3NoYWlyLnN0eWxlLmxlZnQgPSB4ICsgXCJweFwiO1xyXG4gICAgICAgIGNyb3NzaGFpci5zdHlsZS50b3AgPSB5ICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENyb3NzaGFpckxvY2F0aW9uKCkge1x0XHJcbiAgICAgICAgdmFyIHRvcFJvd0hlaWdodCA9ICQoJyN0b3Atcm93JykuaGVpZ2h0KCk7XHJcbiAgICAgICAgdmFyIG9mZnNldCA9ICQoJyNjcm9zc2hhaXInKS5vZmZzZXQoKTtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBwb2ludCA9IEwucG9pbnQoIGNyb3NzaGFpci5vZmZzZXRMZWZ0ICsgMjAsIGNyb3NzaGFpci5vZmZzZXRUb3AgLSB0b3BSb3dIZWlnaHQgKTtcclxuICAgICAgICBjb25zdCBsYXRsb24gPSB3aW5kb3cubXltYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYXRcIikudmFsdWUgPSBsYXRsb24ubGF0O1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9uXCIpLnZhbHVlID0gbGF0bG9uLmxuZztcclxuICAgIH1cclxuXHJcbiAgICBvbkNhbmNlbCgpIHtcclxuICAgICAgICB0aGlzLmhpZGVDcm9zc2hhaXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlQ3Jvc3NoYWlyKCkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXBvcnQtYnRuXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgZWxlbWVudDIuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIHNlbGVjdExvY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3QtbG9jYXRpb24tYnRuXCIpO1xyXG4gICAgICAgIHNlbGVjdExvY2F0aW9uQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idG5cIik7XHJcbiAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q3VycmVudExvY2F0aW9uKCkge1xyXG4gICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXHJcbiAgICAgICAgICAgIHBvcyA9PiAge1x0XHRcdFx0XHRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhdCA9IHBvcy5jb29yZHMubGF0aXR1ZGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb24gPSBwb3MuY29vcmRzLmxvbmdpdHVkZTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgd2luZG93Lm15bWFwLnNldFZpZXcoW2xhdCwgbG9uXSwgd2luZG93Lm15bWFwLmdldFpvb20oKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IGluY2x1ZGVIdG1sIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IEZhY2Vib29rU2VydmljZSB9IGZyb20gJy4vZmFjZWJvb2tTZXJ2aWNlLmpzJztcclxuaW1wb3J0IHsgVm90ZVNlcnZpY2UgfSBmcm9tICcuL3ZvdGVTZXJ2aWNlLmpzJztcclxuaW1wb3J0IHsgc2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IGdldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBBZGRQbGFjZSB9IGZyb20gJy4vYWRkUGxhY2UuanMnO1xyXG5cdFxyXG5mdW5jdGlvbiBpbml0TWFwKCkge1x0XHJcblx0XHRcdFx0XHJcblx0d2luZG93Lm15bWFwID0gTC5tYXAoXHJcblx0ICAgICdtYXBpZCcsXHJcblx0ICAgIHsgem9vbUNvbnRyb2w6IGZhbHNlIH1cclxuXHQpLnNldFZpZXcoWzU2Ljk1MTI1OSwgMjQuMTEyNjE0XSwgMTMpO1xyXG5cclxuXHRMLmNvbnRyb2wuem9vbSh7XHJcbiAgICAgICAgIHBvc2l0aW9uOidib3R0b21sZWZ0J1xyXG4gICAgfSkuYWRkVG8od2luZG93Lm15bWFwKTtcclxuXHJcblx0Y29uc3QgbGF5ZXIgPSBMLnRpbGVMYXllcignaHR0cHM6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLCB7XHJcblx0XHRtYXhab29tOiAxOCxcclxuXHRcdGF0dHJpYnV0aW9uOiAnJmNvcHk7IDxhIGhyZWY9XCJodHRwczovL3d3dy5vcGVuc3RyZWV0bWFwLm9yZy9jb3B5cmlnaHRcIj5PcGVuU3RyZWV0TWFwPC9hPiBjb250cmlidXRvcnMnXHJcblx0fSkuYWRkVG8od2luZG93Lm15bWFwKTtcclxuXHJcblx0d2luZG93Lmdyb3VwID0gTC5tYXJrZXJDbHVzdGVyR3JvdXAoe1xyXG5cdFx0Y2h1bmtlZExvYWRpbmc6IHRydWUsXHJcblx0XHQvL2Rpc2FibGVDbHVzdGVyaW5nQXRab29tOiAxNyxcclxuXHRcdHNwaWRlcmZ5T25NYXhab29tOiB0cnVlXHJcblx0ICB9KTtcclxuXHJcblx0ZmV0Y2goJy9hcHAvcGxhY2VzJylcclxuXHRcdC50aGVuKHJlc3BvbnNlID0+IHtcclxuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmpzb24oKVxyXG5cdFx0fSlcclxuXHRcdC50aGVuKGRhdGEgPT4ge1xyXG5cdFx0XHR3aW5kb3cudm90ZXMgPSBkYXRhLnZvdGVzO1xyXG5cdFx0XHR3aW5kb3cucGxhY2VzID0gZGF0YS5wbGFjZXM7XHJcblx0XHRcdGxldCBwbGFjZXMgPSBkYXRhLnBsYWNlcztcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdGNvbnN0IGljb25zID0gW107XHJcblxyXG5cdFx0XHRsZXQgaWNvblNpemUgPSBbOTEsIDk5XTsgLy8gc2l6ZSBvZiB0aGUgaWNvblxyXG5cdFx0XHRsZXQgaWNvbkFuY2hvciA9IFs0NSwgNzVdOyAvLyBwb2ludCBvZiB0aGUgaWNvbiB3aGljaCB3aWxsIGNvcnJlc3BvbmQgdG8gbWFya2VyJ3MgbG9jYXRpb25cclxuXHRcdFx0bGV0IHBvcHVwQW5jaG9yID0gWy0zLCAtNzZdOyAvLyBwb2ludCBmcm9tIHdoaWNoIHRoZSBwb3B1cCBzaG91bGQgb3BlbiByZWxhdGl2ZSB0byB0aGUgaWNvbkFuY2hvclxyXG5cclxuXHRcdFx0aWNvbnNbMV0gPSBMLmljb24oe1xyXG4gICAgICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9sb2NhdGlvbi5wbmcnLFxyXG4gICAgICAgICAgICAgICAgaWNvblNpemU6ICAgICBpY29uU2l6ZSxcclxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6ICAgaWNvbkFuY2hvcixcclxuICAgICAgICAgICAgICAgIHBvcHVwQW5jaG9yOiAgcG9wdXBBbmNob3JcclxuXHRcdFx0fSk7XHJcblx0XHRcdGljb25zWzJdID0gTC5pY29uKHtcclxuICAgICAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvbG9jYXRpb24yLnBuZycsXHJcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogICAgIGljb25TaXplLFxyXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogICBpY29uQW5jaG9yLFxyXG4gICAgICAgICAgICAgICAgcG9wdXBBbmNob3I6ICBwb3B1cEFuY2hvclxyXG5cdFx0XHR9KTtcclxuXHRcdFx0aWNvbnNbM10gPSBMLmljb24oe1xyXG4gICAgICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9sb2NhdGlvbjMucG5nJyxcclxuICAgICAgICAgICAgICAgIGljb25TaXplOiAgICAgaWNvblNpemUsXHJcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiAgIGljb25BbmNob3IsXHJcbiAgICAgICAgICAgICAgICBwb3B1cEFuY2hvcjogIHBvcHVwQW5jaG9yXHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IHBsYWNlcy5sZW5ndGg7IGkrKykge1xyXG5cclxuXHRcdFx0XHR2YXIgdm90ZUNvdW50SW5wdXQgPSBkYXRhLnZvdGVzW3BsYWNlc1tpXS5pZF07XHJcblx0XHRcdFx0dmFyIHZvdGVDb3VudCA9IFwiXCI7XHJcblx0XHRcdFx0aWYodm90ZUNvdW50SW5wdXQpIHtcclxuXHRcdFx0XHQgICAgdm90ZUNvdW50ID0gXCImbmJzcDtcIiArIGRhdGEudm90ZXNbcGxhY2VzW2ldLmlkXTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHZhciBtYXJrZXIgPSBMLm1hcmtlcihcclxuXHRcdFx0XHRcdFtwbGFjZXNbaV0ubGF0LCBwbGFjZXNbaV0ubG9uXSwgXHJcblx0XHRcdFx0XHR7XHJcblx0XHRcdFx0XHRcdGljb246IGljb25zW3BsYWNlc1tpXS5wbGFjZVR5cGVdLCBcclxuXHRcdFx0XHRcdFx0cGxhY2U6IHBsYWNlc1tpXVxyXG5cdFx0XHRcdFx0fSk7XHJcblxyXG5cdFx0XHRcdG1hcmtlci5iaW5kUG9wdXAoIGNvbnRleHQgPT4ge1xyXG5cdFx0XHRcdFx0Y29uc3QgcGxhY2UgPSBjb250ZXh0Lm9wdGlvbnMucGxhY2U7XHJcblx0XHRcdFx0XHRsZXQgdm90ZUNvdW50ID0gd2luZG93LnZvdGVzW3BsYWNlLmlkXTtcclxuXHRcdFx0XHRcdGlmKCF2b3RlQ291bnQpIHtcclxuXHRcdFx0XHRcdFx0dm90ZUNvdW50ID0gXCJcIjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGxldCBpc1Vwdm90ZSA9IG51bGw7XHJcblx0XHRcdFx0XHRpZih3aW5kb3cubXl2b3Rlcykge1xyXG5cdFx0XHRcdFx0XHRpc1Vwdm90ZSA9IHdpbmRvdy5teXZvdGVzW3BsYWNlLmlkXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGxldCB1cHZvdGVDbGFzcztcclxuXHRcdFx0XHRcdGlmKGlzVXB2b3RlKSB7XHJcblx0XHRcdFx0XHRcdHVwdm90ZUNsYXNzID0gXCJidG4tc3VjY2Vzc1wiO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0dXB2b3RlQ2xhc3MgPSBcImJ0bi1vdXRsaW5lLXN1Y2Nlc3NcIjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gYDxkaXYgaWQ9J3BvcHVwJyBjbGFzcz0nbXljb250YWluZXInPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1sZWZ0Jz4gXHJcblx0XHRcdFx0XHRcdFx0XHRcdDxpbWcgc3JjPScvYXBwL2ZpbGVzLyR7cGxhY2UuaW1nfScgaWQ9J3BvcHVwLWltYWdlJy8+IDwvZGl2PlxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9J2dyaWRib3gtbGVmdCc+XHJcblx0XHRcdFx0XHRcdFx0XHRcdCR7cGxhY2UuZGVzY3JpcHRpb259PC9kaXY+XHJcblxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1yaWdodCc+XHJcblx0XHRcdFx0XHRcdFx0XHRcdEJhbHNvdFxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8YnV0dG9uIHR5cGU9J2J1dHRvbicgaWQ9J2J0bkxpa2UnIGNsYXNzPSdidG4gJHt1cHZvdGVDbGFzc30nXHJcblx0XHRcdFx0XHRcdFx0XHRcdFx0b25jbGljaz0nZG9Wb3RlKCR7cGxhY2UuaWR9KSc+8J+RjSA8ZGl2IGlkPVwidm90ZUNvdW50XCI+JHt2b3RlQ291bnR9PC9kaXY+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgXHRcdDwvZGl2PmA7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdFx0d2luZG93Lmdyb3VwLmFkZExheWVyKG1hcmtlcik7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdHdpbmRvdy5teW1hcC5hZGRMYXllcih3aW5kb3cuZ3JvdXApO1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlcnIgPT4ge1xyXG5cdFx0XHRhbGVydChcImUyIFwiKyBlcnIpO1xyXG5cdFx0fSk7XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBzZXRJbWcoaW5wdXQpIHtcclxuXHRpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcclxuXHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cdFx0XHJcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuXHRcdFx0JCgnI2ltZy11cGxvYWQnKS5hdHRyKCdzcmMnLCBlLnRhcmdldC5yZXN1bHQpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBzaG93Vm90ZVRvcCgpIHtcclxuXHJcblx0JCgnI3ZvdGUtdG9wJykubW9kYWwoJ3Nob3cnKTtcclxuXHRcclxuXHRmZXRjaCgnL2FwcC90b3AnLFxyXG5cdFx0e1xyXG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRjYWNoZTogJ25vLWNhY2hlJ1xyXG5cdFx0fSlcclxuXHRcdC50aGVuKHJlc3BvbnNlID0+IHtcclxuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmpzb24oKVxyXG5cdFx0fSlcclxuXHRcdC50aGVuKGRhdGEgPT4ge1xyXG5cclxuXHRcdFx0bGV0IHRpdGxlcyA9IFtcclxuXHRcdFx0XHRcIsWgYXVyxKtiYSAvIG5lcMSBcnJlZHphbcSrYmFcIixcclxuXHRcdFx0XHRcIlN0cmF1amkgcGFncmllemllbmlcIixcclxuXHRcdFx0XHRcIlNlZ3VtcyAoYmVkcmVzLCBixKtzdGFtYXMgYXBtYWxlcylcIlxyXG5cdFx0XHQgXTtcclxuXHRcdFx0bGV0IGNvbnRlbnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3AtY29udGVudFwiKTtcclxuXHRcdFx0bGV0IHJlc3VsdCA9IFwiXCI7XHJcblxyXG5cdFx0XHRmb3IobGV0IHR5cGUgPSAxOyB0eXBlIDw9IDM7IHR5cGUrKykge1xyXG5cdFx0XHRcdGxldCBpZHggPSB0eXBlIC0gMTtcclxuXHJcblx0XHRcdFx0aWYoIWRhdGEgfHwgIWRhdGFbaWR4XSkge1xyXG5cdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGxldCB0b3AzID0gXCJcIjtcclxuXHRcdFx0XHRmb3IobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcblx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdGxldCB0b3BQbGFjZSA9IGRhdGFbaWR4XVtpXTtcclxuXHRcdFx0XHRcdGlmKCF0b3BQbGFjZSkge1xyXG5cdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRsZXQgcGxhY2VzID0gd2luZG93LnBsYWNlcztcclxuXHRcdFx0XHRcdGxldCBpZCA9IHRvcFBsYWNlWzBdO1xyXG5cdFx0XHRcdFx0bGV0IHZvdGVDb3VudCA9IHRvcFBsYWNlWzFdO1xyXG5cdFx0XHRcdFx0bGV0IHBsYWNlID0gbnVsbDtcclxuXHRcdFx0XHRcdGZvcihsZXQgaiA9IDA7IGogPCBwbGFjZXMubGVuZ3RoOyBqKyspIHtcclxuXHRcdFx0XHRcdFx0aWYocGxhY2VzW2pdLmlkID09XHQgaWQpIHtcclxuXHRcdFx0XHRcdFx0XHRwbGFjZSA9IHBsYWNlc1tqXTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdGlmKCFwbGFjZSkge1xyXG5cdFx0XHRcdFx0XHRjb250aW51ZTtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHQvKjxkaXYgY2xhc3M9XCJ0b3AtdHh0XCI+JHt2b3RlQ291bnR9PC9kaXY+Ki9cclxuXHJcblx0XHRcdFx0XHR0b3AzICs9IGA8ZGl2IGNsYXNzPVwidG9wLWl0ZW1cIj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRvcC1pbWFnZS1ib3hcIj5cclxuXHRcdFx0XHRcdFx0XHQ8aW1nIGNsYXNzPVwidG9wLWltYWdlXCIgc3JjPScvYXBwL2ZpbGVzLzIke3BsYWNlLmltZ30nLz4gXHJcblx0XHRcdFx0XHRcdDwvZGl2Plx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0b3AtbnVtYmVyXCI+JHtpICsgMX08L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRvcC10ZXh0XCI+JHtwbGFjZS5kZXNjcmlwdGlvbn08L2Rpdj5cclxuXHRcdFx0XHRcdDwvZGl2PmA7XHJcblx0XHRcdFx0fVx0XHRcdFx0XHJcblxyXG5cdFx0XHRcdGlmKHRvcDMubGVuZ3RoID4gMCkge1xyXG5cdFx0XHRcdFx0cmVzdWx0ICs9IFxyXG5cdFx0XHRcdFx0XHRgPGRpdiBjbGFzcz1cInZvdGUtdG9wLXRpdGxlXCI+JHt0eXBlfS0gJHt0aXRsZXNbaWR4XX08L2Rpdj5cclxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInZvdGUtdG9wLXJvd1wiIGlkPVwidHlwZSR7dHlwZX1cIj5cclxuXHRcdFx0XHRcdFx0XHQke3RvcDN9XHJcblx0XHRcdFx0XHRcdDwvZGl2PmA7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFxyXG5cdFx0XHR9XHJcblx0XHRcdGNvbnRlbnRFbGVtZW50LmlubmVySFRNTCA9IHJlc3VsdDtcclxuXHRcdH0pXHJcblx0XHQuY2F0Y2goZSA9PiBhbGVydChcImUxXCIrIGUpKTtcclxufVxyXG5cclxuJCh3aW5kb3cpLm9uKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcclxuICAgIGluY2x1ZGVIdG1sKCdodG1sL3N0YXJ0Lmh0bWwnLCAnc3RhcnQnKTtcclxuXHRpbmNsdWRlSHRtbCgnaHRtbC9jaG9vc2UtcGxhY2UuaHRtbCcsICdjaG9vc2UtcGxhY2UnKTtcclxuXHRpbmNsdWRlSHRtbCgnaHRtbC9yZXBvcnQuaHRtbCcsICdyZXBvcnQnKTtcclxuXHRpbmNsdWRlSHRtbCgnaHRtbC92b3RlLXRvcC5odG1sJywgJ3ZvdGUtdG9wJyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvYWJvdXQtdXMuaHRtbCcsICdhYm91dC11cycpO1xyXG5cclxuXHRsZXQgdmlzaXRlZCA9IGdldENvb2tpZShcInZpc2l0ZWRcIik7XHJcblx0aWYoIXZpc2l0ZWQpIHtcclxuXHRcdCQoJyNzdGFydCcpLm1vZGFsKCdzaG93Jyk7XHJcblx0XHRzZXRDb29raWUoXCJ2aXNpdGVkXCIsIHRydWUsIDM2NSk7XHJcblx0fVx0XHJcblx0XHJcblx0aW5pdE1hcCgpO1xyXG5cclxuXHR3aW5kb3cuc2V0SW1nID0gc2V0SW1nO1xyXG5cdHdpbmRvdy5zaG93Vm90ZVRvcCA9IHNob3dWb3RlVG9wO1xyXG5cdHdpbmRvdy52b3RlU2VydmljZSA9IG5ldyBWb3RlU2VydmljZSgpO1xyXG5cdHdpbmRvdy5mYWNlYm9va1NlcnZpY2UgPSBuZXcgRmFjZWJvb2tTZXJ2aWNlKCk7XHJcblxyXG5cdGxldCBhZGRQbGFjZSA9IG5ldyBBZGRQbGFjZSgpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbImluY2x1ZGVIdG1sIiwidXJsIiwiaWQiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsIm9wZW4iLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwic3RhdHVzIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImlubmVySFRNTCIsInJlc3BvbnNlVGV4dCIsInNlbmQiLCJzZXRDb29raWUiLCJuYW1lIiwidmFsdWUiLCJkYXlzIiwiaXNTZWN1cmUiLCJleHBpcmVzIiwiZGF0ZSIsIkRhdGUiLCJzZXRUaW1lIiwiZ2V0VGltZSIsInRvVVRDU3RyaW5nIiwic2VjdXJlIiwiY29va2llIiwiZ2V0Q29va2llIiwibmFtZUVRIiwiY2EiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJjIiwiY2hhckF0Iiwic3Vic3RyaW5nIiwiaW5kZXhPZiIsImhpZGVTcGlubmVyIiwic3R5bGUiLCJkaXNwbGF5Iiwic2hvd1NwaW5uZXIiLCJGYWNlYm9va1NlcnZpY2UiLCJhZnRlckZCSW5pdCIsImluaXQiLCJ3aW5kb3ciLCJzdG9yZUh0dHBPbmx5Q29va2llIiwidG9rZW4iLCJmYWNlYm9va1NlcnZpY2UiLCJmYkFzeW5jSW5pdCIsIkZCIiwiYXBwSWQiLCJ4ZmJtbCIsInZlcnNpb24iLCJBcHBFdmVudHMiLCJsb2dQYWdlVmlldyIsIkV2ZW50Iiwic3Vic2NyaWJlIiwicmVzcG9uc2UiLCJjb25zb2xlIiwibG9nIiwib25Mb2dpbiIsImQiLCJzIiwianMiLCJmanMiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImNyZWF0ZUVsZW1lbnQiLCJzcmMiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwiY2hlY2tGQkxvZ2luU3RhdHVzIiwidGhlbiIsInZvdGVTZXJ2aWNlIiwiZmV0Y2hNeVZvdGVzIiwibG9naW5DYWxsYmFjayIsImNhdGNoIiwiZSIsIlByb21pc2UiLCJyZXNvbHV0aW9uRnVuYyIsInJlamVjdGlvbkZ1bmMiLCIkIiwibW9kYWwiLCJvbkxvZ2dlZEluIiwib25Ob3RMb2dnZWRJbiIsImdldExvZ2luU3RhdHVzIiwiYXV0aFJlc3BvbnNlIiwiYWNjZXNzVG9rZW4iLCJhamF4IiwidHlwZSIsInByb2Nlc3NEYXRhIiwiY3Jvc3NEb21haW4iLCJoZWFkZXJzIiwiZGF0YSIsInN1Y2Nlc3MiLCJlcnJvciIsImpYSFIiLCJ0ZXh0U3RhdHVzIiwiZXJyb3JUaHJvd24iLCJWb3RlU2VydmljZSIsImRvVm90ZSIsInBsYWNlSUQiLCJmZXRjaCIsIm1ldGhvZCIsImNhY2hlIiwianNvbiIsIm15dm90ZXMiLCJsb2dpbklmTmVlZGVkIiwiYnRuTGlrZSIsImRvVXB2b3RlIiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJyZW1vdmUiLCJhZGQiLCJ2b3RlIiwidm90ZUNvdW50RWxlbWVudCIsInZvdGVDb3VudCIsInZvdGVzIiwiYWxlcnQiLCJpc1Vwdm90ZSIsIm9uU3VjY2VzcyIsIm9uRXJyb3IiLCJ0b2dnbGUiLCJBZGRQbGFjZSIsImNoYW5nZSIsInNldEltZyIsInRoYXQiLCJvbiIsImV2ZW50Iiwic2hvd0Nyb3NzaGFpciIsInNldEN1cnJlbnRMb2NhdGlvbiIsImdldENyb3NzaGFpckxvY2F0aW9uIiwiaGlkZUNyb3NzaGFpciIsInN1Ym1pdEZvcm0iLCJGb3JtRGF0YSIsInByZXZlbnREZWZhdWx0IiwiY29udGVudFR5cGUiLCJsb2NhdGlvbiIsInJlbG9hZCIsImVsZW1lbnQiLCJjcm9zc2hhaXIiLCJzZWxlY3RMb2NhdGlvbkJ1dHRvbiIsImNhbmNlbEJ1dHRvbiIsImNlbnRlckNyb3NzaGFpciIsIm1hcCIsInRvcCIsIm9mZnNldFRvcCIsImxlZnQiLCJvZmZzZXRMZWZ0IiwiaGVpZ2h0Iiwib2Zmc2V0SGVpZ2h0Iiwid2lkdGgiLCJvZmZzZXRXaWR0aCIsIngiLCJ5IiwidG9wUm93SGVpZ2h0Iiwib2Zmc2V0IiwicG9pbnQiLCJMIiwibGF0bG9uIiwibXltYXAiLCJjb250YWluZXJQb2ludFRvTGF0TG5nIiwibGF0IiwibG5nIiwiZWxlbWVudDIiLCJuYXZpZ2F0b3IiLCJnZW9sb2NhdGlvbiIsImdldEN1cnJlbnRQb3NpdGlvbiIsInBvcyIsImNvb3JkcyIsImxhdGl0dWRlIiwibG9uIiwibG9uZ2l0dWRlIiwic2V0VmlldyIsImdldFpvb20iLCJpbml0TWFwIiwiem9vbUNvbnRyb2wiLCJjb250cm9sIiwiem9vbSIsInBvc2l0aW9uIiwiYWRkVG8iLCJsYXllciIsInRpbGVMYXllciIsIm1heFpvb20iLCJhdHRyaWJ1dGlvbiIsImdyb3VwIiwibWFya2VyQ2x1c3Rlckdyb3VwIiwiY2h1bmtlZExvYWRpbmciLCJzcGlkZXJmeU9uTWF4Wm9vbSIsInBsYWNlcyIsImljb25zIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwicG9wdXBBbmNob3IiLCJpY29uIiwiaWNvblVybCIsInZvdGVDb3VudElucHV0IiwibWFya2VyIiwicGxhY2VUeXBlIiwicGxhY2UiLCJiaW5kUG9wdXAiLCJjb250ZXh0Iiwib3B0aW9ucyIsInVwdm90ZUNsYXNzIiwiaW1nIiwiZGVzY3JpcHRpb24iLCJhZGRMYXllciIsImVyciIsImlucHV0IiwiZmlsZXMiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiYXR0ciIsInRhcmdldCIsInJlc3VsdCIsInJlYWRBc0RhdGFVUkwiLCJzaG93Vm90ZVRvcCIsInRpdGxlcyIsImNvbnRlbnRFbGVtZW50IiwiaWR4IiwidG9wMyIsInRvcFBsYWNlIiwiaiIsInZpc2l0ZWQiLCJhZGRQbGFjZSJdLCJtYXBwaW5ncyI6Ijs7O0NBQ08sU0FBU0EsV0FBVCxDQUFxQkMsR0FBckIsRUFBMEJDLEVBQTFCLEVBQThCO0NBQ3BDLE1BQUlDLEdBQUcsR0FBRSxJQUFJQyxjQUFKLEVBQVQ7Q0FDQUQsRUFBQUEsR0FBRyxDQUFDRSxJQUFKLENBQVMsS0FBVCxFQUFnQkosR0FBaEIsRUFBcUIsS0FBckI7O0NBQ0FFLEVBQUFBLEdBQUcsQ0FBQ0csa0JBQUosR0FBd0IsWUFBVztDQUNsQyxRQUFJLEtBQUtDLFVBQUwsS0FBa0IsQ0FBdEIsRUFBeUI7Q0FDekIsUUFBSSxLQUFLQyxNQUFMLEtBQWMsR0FBbEIsRUFBdUIsT0FGVzs7Q0FHbENDLElBQUFBLFFBQVEsQ0FBQ0MsY0FBVCxDQUF3QlIsRUFBeEIsRUFBNEJTLFNBQTVCLEdBQXVDLEtBQUtDLFlBQTVDO0NBQ0EsR0FKRDs7Q0FLQVQsRUFBQUEsR0FBRyxDQUFDVSxJQUFKO0NBQ0E7QUFFRCxDQUFPLFNBQVNDLFNBQVQsQ0FBbUJDLElBQW5CLEVBQXdCQyxLQUF4QixFQUE4QkMsSUFBOUIsRUFBb0NDLFFBQXBDLEVBQThDO0NBQ3BE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
