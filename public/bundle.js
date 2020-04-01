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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiLCIuLi9zcmMvZmFjZWJvb2tTZXJ2aWNlLmpzIiwiLi4vc3JjL3ZvdGVTZXJ2aWNlLmpzIiwiLi4vc3JjL2FkZFBsYWNlLmpzIiwiLi4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSHRtbCh1cmwsIGlkKSB7XHJcblx0dmFyIHhocj0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0eGhyLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UpO1xyXG5cdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2U9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSE9PTQpIHJldHVybjtcclxuXHRcdGlmICh0aGlzLnN0YXR1cyE9PTIwMCkgcmV0dXJuOyAvLyBvciB3aGF0ZXZlciBlcnJvciBoYW5kbGluZyB5b3Ugd2FudFxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLmlubmVySFRNTD0gdGhpcy5yZXNwb25zZVRleHQ7XHJcblx0fTtcclxuXHR4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsdmFsdWUsZGF5cywgaXNTZWN1cmUpIHtcclxuXHR2YXIgZXhwaXJlcyA9IFwiXCI7XHJcblx0aWYgKGRheXMpIHtcclxuXHRcdHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuXHRcdGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIChkYXlzKjI0KjYwKjYwKjEwMDApKTtcclxuXHRcdGV4cGlyZXMgPSBcIjsgZXhwaXJlcz1cIiArIGRhdGUudG9VVENTdHJpbmcoKTtcclxuXHR9XHJcblx0bGV0IHNlY3VyZSA9IFwiXCI7XHJcblx0aWYgKGlzU2VjdXJlKSB7XHJcblx0XHRzZWN1cmUgPSBcIjsgc2VjdXJlOyBIdHRwT25seVwiO1xyXG5cdH1cclxuXHRkb2N1bWVudC5jb29raWUgPSBuYW1lICsgXCI9XCIgKyAodmFsdWUgfHwgXCJcIikgICsgZXhwaXJlcyArIFwiOyBwYXRoPS9cIiArIHNlY3VyZTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvb2tpZShuYW1lKSB7XHJcblx0XHR2YXIgbmFtZUVRID0gbmFtZSArIFwiPVwiO1xyXG5cdFx0dmFyIGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XHJcblx0XHRmb3IodmFyIGk9MDtpIDwgY2EubGVuZ3RoO2krKykge1xyXG5cdFx0XHRcdHZhciBjID0gY2FbaV07XHJcblx0XHRcdFx0d2hpbGUgKGMuY2hhckF0KDApPT0nICcpIGMgPSBjLnN1YnN0cmluZygxLGMubGVuZ3RoKTtcclxuXHRcdFx0XHRpZiAoYy5pbmRleE9mKG5hbWVFUSkgPT0gMCkgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWVFUS5sZW5ndGgsYy5sZW5ndGgpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlcmFzZUNvb2tpZShuYW1lKSB7XHJcblx0XHRkb2N1bWVudC5jb29raWUgPSBuYW1lKyc9OyBNYXgtQWdlPS05OTk5OTk5OTsnOyAgXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoaWRlU3Bpbm5lcigpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY292ZXJcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1NwaW5uZXIoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvdmVyXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJbWdVcmwoaW1nKSB7XHJcblxyXG59XHJcbiIsImltcG9ydCB7IGdldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBzZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1NlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoYWZ0ZXJGQkluaXQpIHtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB3aW5kb3cuYWZ0ZXJGQkluaXQgPSBhZnRlckZCSW5pdDtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHdpbmRvdy5zdG9yZUh0dHBPbmx5Q29va2llID0gKHRva2VuKSA9PiB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLnN0b3JlSHR0cE9ubHlDb29raWUodG9rZW4pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdpbmRvdy5mYkFzeW5jSW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBGQi5pbml0KHtcdFxyXG4gICAgICAgICAgICAgICAgYXBwSWQgICA6ICcyNzM4NzU0NjAxODQ2MTEnLFxyXG4gICAgICAgICAgICAgICAgY29va2llICA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXMgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHhmYm1sICAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA6ICd2My4zJyBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBGQi5BcHBFdmVudHMubG9nUGFnZVZpZXcoKTtcclxuXHJcbiAgICAgICAgICAgIEZCLkV2ZW50LnN1YnNjcmliZSgnYXV0aC5hdXRoUmVzcG9uc2VDaGFuZ2UnLCBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZSBzdGF0dXMgb2YgdGhlIHNlc3Npb24gY2hhbmdlZCB0bzogJytyZXNwb25zZS5zdGF0dXMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uub25Mb2dpbigpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgKGZ1bmN0aW9uKGQsIHMsIGlkKXtcclxuICAgICAgICAgICAgdmFyIGpzLCBmanMgPSBkLmdldEVsZW1lbnRzQnlUYWdOYW1lKHMpWzBdO1xyXG4gICAgICAgICAgICBpZiAoZC5nZXRFbGVtZW50QnlJZChpZCkpIHtyZXR1cm47fVxyXG4gICAgICAgICAgICBqcyA9IGQuY3JlYXRlRWxlbWVudChzKTsganMuaWQgPSBpZDtcclxuICAgICAgICAgICAganMuc3JjID0gXCJodHRwczovL2Nvbm5lY3QuZmFjZWJvb2submV0L2x2X0xWL3Nkay5qc1wiO1xyXG4gICAgICAgICAgICBmanMucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoanMsIGZqcyk7XHJcbiAgICAgICAgfShkb2N1bWVudCwgJ3NjcmlwdCcsICdmYWNlYm9vay1qc3NkaycpKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBvbkxvZ2luKCkge1xyXG4gICAgICAgIHRoaXMuY2hlY2tGQkxvZ2luU3RhdHVzKClcclxuICAgICAgICAgICAgLnRoZW4odG9rZW4gPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uuc3RvcmVIdHRwT25seUNvb2tpZSh0b2tlbik7XHJcbiAgICAgICAgICAgIH0pIFxyXG4gICAgICAgICAgICAudGhlbih0b2tlbiA9PiB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cudm90ZVNlcnZpY2UuZmV0Y2hNeVZvdGVzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgdG9rZW4gPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKHdpbmRvdy5sb2dpbkNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2dpbkNhbGxiYWNrKHRva2VuKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvZ2luQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiRkIgbm90IGxvZ2dlZCBpblwiO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGUgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBsb2dpbklmTmVlZGVkKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdXRpb25GdW5jLCByZWplY3Rpb25GdW5jKSA9PiB7XHJcblxyXG4gICAgICAgICAgICAkKCcjbG9naW5Nb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb25zdCBvbkxvZ2dlZEluID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmZhY2Vib29rU2VydmljZS5vbkxvZ2luKCk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uRnVuYygpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbk5vdExvZ2dlZEluID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvZ2luQ2FsbGJhY2sgPSB0b2tlbiA9PiB7IFxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNsb2dpbk1vZGFsJykubW9kYWwoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHV0aW9uRnVuYyh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgJCgnI2xvZ2luTW9kYWwnKS5tb2RhbCgnc2hvdycpOyBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgd2luZG93LmZhY2Vib29rU2VydmljZS5jaGVja0ZCTG9naW5TdGF0dXMoKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4ob25Mb2dnZWRJbiwgb25Ob3RMb2dnZWRJbik7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjaGVja0ZCTG9naW5TdGF0dXMoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x1dGlvbkZ1bmMsIHJlamVjdGlvbkZ1bmMpID0+IHtcclxuICAgICAgICAgICAgRkIuZ2V0TG9naW5TdGF0dXMoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLnN0YXR1cyA9PSBcImNvbm5lY3RlZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRva2VuID0gcmVzcG9uc2UuYXV0aFJlc3BvbnNlLmFjY2Vzc1Rva2VuO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKHRva2VuKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0aW9uRnVuYyhyZXNwb25zZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0b3JlSHR0cE9ubHlDb29raWUodG9rZW4pIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXNvbHV0aW9uRnVuYywgcmVqZWN0aW9uRnVuYykgPT4ge1xyXG4gICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgdXJsIDogXCIvYXBwL2xvZ2luXCIsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwidG9rZW5cIjp0b2tlblxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmMoKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBpbiBzdG9yZUh0dHBPbmx5Q29va2llOiBcIisgZXJyb3JUaHJvd24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTsgICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFx0XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2V0Q29va2llIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcbmltcG9ydCB7IHNldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBlcmFzZUNvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZvdGVTZXJ2aWNlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG5cdFx0dGhpcy5kYXRhID0ge307XHJcblx0XHR3aW5kb3cuZG9Wb3RlID0gKHBsYWNlSUQpID0+IHdpbmRvdy52b3RlU2VydmljZS5kb1ZvdGUocGxhY2VJRCk7XHJcbiAgICB9XHJcblxyXG4gICAgZmV0Y2hNeVZvdGVzKCkge1xyXG5cdFx0ZmV0Y2goJy9hcHAvbXl2b3RlcycsXHJcblx0XHR7XHJcblx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdGNhY2hlOiAnbm8tY2FjaGUnXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4ocmVzcG9uc2UgPT4ge1xyXG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpXHJcblx0XHR9KVxyXG5cdFx0LnRoZW4oZGF0YSA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwiZmV0Y2ggbXkgdm90ZXNcIik7XHJcbiAgICAgICAgICAgIHdpbmRvdy5teXZvdGVzID0gZGF0YTtcclxuXHRcdH0pXHJcblx0XHQuY2F0Y2goZSA9PiB7XHJcblx0XHRcdGNvbnNvbGUubG9nKFwicGxvYmxlbSBmZXRjaGluZyB2b3RlcyBcIiArIGUpXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGRvVm90ZShwbGFjZUlEKSB7XHJcblx0XHR3aW5kb3cucGxhY2VJRCA9IHBsYWNlSUQ7XHJcblx0XHRcdFx0XHJcblx0XHR3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLmxvZ2luSWZOZWVkZWQoKVxyXG5cdFx0XHQudGhlbigoKSA9PiB7XHJcblx0XHRcdFx0Y29uc3QgYnRuTGlrZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuTGlrZVwiKTtcclxuXHRcdFx0XHRsZXQgZG9VcHZvdGUgPSB0cnVlO1xyXG5cdFx0XHRcdGlmKGJ0bkxpa2UuY2xhc3NMaXN0LmNvbnRhaW5zKCdidG4tc3VjY2VzcycpKSB7XHJcblx0XHRcdFx0XHRkb1Vwdm90ZSA9IGZhbHNlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRpZihkb1Vwdm90ZSkge1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QucmVtb3ZlKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5hZGQoJ2J0bi1zdWNjZXNzJyk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdGJ0bkxpa2UuY2xhc3NMaXN0LmFkZCgnYnRuLW91dGxpbmUtc3VjY2VzcycpO1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QucmVtb3ZlKCdidG4tc3VjY2VzcycpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHR3aW5kb3cudm90ZVNlcnZpY2Uudm90ZShcclxuXHRcdFx0XHRcdHdpbmRvdy5wbGFjZUlELFxyXG5cdFx0XHRcdFx0ZG9VcHZvdGUsXHJcblx0XHRcdFx0XHQoZGF0YSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRsZXQgdm90ZUNvdW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidm90ZUNvdW50XCIpO1xyXG5cdFx0XHRcdFx0XHRsZXQgdm90ZUNvdW50ID0gZGF0YS52b3RlcztcclxuXHRcdFx0XHRcdFx0aWYodm90ZUNvdW50IDwgMSkge1xyXG5cdFx0XHRcdFx0XHRcdHZvdGVDb3VudCA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnQ7XHJcblx0XHRcdFx0XHRcdHdpbmRvdy5teXZvdGVzW3dpbmRvdy5wbGFjZUlEXSA9IGRvVXB2b3RlO1xyXG5cdFx0XHRcdFx0XHR3aW5kb3cudm90ZXNbd2luZG93LnBsYWNlSURdID0gZGF0YS52b3RlcztcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pID0+IHtcclxuXHRcdFx0XHRcdFx0YWxlcnQoXCJFcnJvciB3aGlsZSBzYXZpbmcgdm90ZTogXCIrIGVycm9yVGhyb3duKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcblx0dm90ZShwbGFjZUlELCBpc1Vwdm90ZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHRcdFx0XHRcdFxyXG5cdFx0JC5hamF4KHtcclxuXHRcdFx0XHR1cmwgOiBcIi9hcHAvdm90ZVwiLFxyXG5cdFx0XHRcdHR5cGU6IFwiUE9TVFwiLFxyXG5cdFx0XHRcdHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuXHRcdFx0XHRjcm9zc0RvbWFpbjogdHJ1ZSxcclxuXHRcdFx0XHRcclxuXHRcdFx0XHRkYXRhOiBcInBsYWNlPVwiKyBwbGFjZUlEICsgXCImaXNVcHZvdGU9XCIgKyBpc1Vwdm90ZSxcclxuXHRcdFx0XHRzdWNjZXNzOiAoZGF0YSkgPT4ge1xyXG5cdFx0XHRcdFx0b25TdWNjZXNzKGRhdGEpO1xyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0ZXJyb3I6IG9uRXJyb3JcclxuXHRcdFx0fSk7XHJcblxyXG5cdH1cclxuXHRcdFxyXG5cdHRvZ2dsZVZvdGVCdXR0b24oKSB7XHJcblx0XHQvKmxldCB2b3RlQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2b3RlQ291bnRcIik7XHJcblx0XHR2b3RlQ291bnQgPSB2b3RlQ291bnRFbGVtZW50LmdldEF0dHJpYnV0ZShcInZvdGVDb3VudFwiKTtcclxuXHRcdGNvbnN0IHZvdGVDb3VudEludCA9IE51bWJlci5wYXJzZUludCh2b3RlQ291bnQpO1xyXG5cclxuXHRcdGlmKGlzVXB2b3RlKSB7XHJcblx0XHRcdHZvdGVDb3VudEVsZW1lbnQuaW5uZXJIVE1MID0gdm90ZUNvdW50SW50ICsgMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZvdGVDb3VudEVsZW1lbnQuaW5uZXJIVE1MID0gdm90ZUNvdW50SW50IC0gMTtcclxuXHRcdH0qL1xyXG5cclxuXHRcdGJ0bkxpa2UuY2xhc3NMaXN0LnRvZ2dsZSgnYnRuLW91dGxpbmUtc3VjY2VzcycpO1xyXG5cdFx0YnRuTGlrZS5jbGFzc0xpc3QudG9nZ2xlKCdidG4tc3VjY2VzcycpO1xyXG5cdH1cclxuXHJcblxyXG59IiwiaW1wb3J0IHsgc2hvd1NwaW5uZXIsIGhpZGVTcGlubmVyIH0gZnJvbSAnLi91dGlscy5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgQWRkUGxhY2Uge1xyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgICQoXCIjdXBsb2FkaW1hZ2VcIikuY2hhbmdlKGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICAgIHdpbmRvdy5zZXRJbWcodGhpcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICBsZXQgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIjY2hvb3NlLWxvY2F0aW9uLWJ0blwiLCBmdW5jdGlvbihldmVudCl7XHJcbiAgICAgICAgICAgIHRoYXQuc2hvd0Nyb3NzaGFpcigpO1xyXG4gICAgICAgICAgICB0aGF0LnNldEN1cnJlbnRMb2NhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNzZWxlY3QtbG9jYXRpb24tYnRuXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgdGhhdC5nZXRDcm9zc2hhaXJMb2NhdGlvbigpO1xyXG4gICAgICAgICAgICAkKCcjcmVwb3J0JykubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAgICAgdGhhdC5oaWRlQ3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNjYW5jZWwtYnRuXCIsIGZ1bmN0aW9uKGV2ZW50KXtcclxuICAgICAgICAgICAgdGhhdC5oaWRlQ3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAkKCcjbXlmb3JtJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdGhhdC5zdWJtaXRGb3JtKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdWJtaXRGb3JtKGUpIHtcclxuICAgICAgICB2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgkKCcjbXlmb3JtJylbMF0pO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzaG93U3Bpbm5lcigpO1xyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybCA6ICcvYXBwL3VwbG9hZCcsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBjb250ZW50VHlwZTogJ211bHRpcGFydC9mb3JtLWRhdGEnLFxyXG4gICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcclxuICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXHJcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlU3Bpbm5lcigpO1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJQYWxkaWVzIHBhciB2ZWxvc2xhemR1IVwiKTtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICBoaWRlU3Bpbm5lcigpO1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJQxIFybGllY2luaWVzLCB2YWkgZXNpIHBpZXZpZW5vamlzIHZlbG9zbGF6ZGFtIGthdGVnb3JpanUgdW4gbm9zYXVrdW11IVwiK1xyXG4gICAgICAgICAgICAgICAgICAgIFwiIEphIG5laXpkb2RhcyBwaWV2aWVub3QgcHVua3R1LCByYWtzdGkgdXogaW5mb0BkYXR1c2tvbGEubHZcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93Q3Jvc3NoYWlyKCkge1xyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXBvcnQtYnRuXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcG9ydC1idG4tMlwiKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBjcm9zc2hhaXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyb3NzaGFpclwiKTtcclxuICAgICAgICBjcm9zc2hhaXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIHNlbGVjdExvY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3QtbG9jYXRpb24tYnRuXCIpO1xyXG4gICAgICAgIHNlbGVjdExvY2F0aW9uQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idG5cIik7XHJcbiAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHRoaXMuY2VudGVyQ3Jvc3NoYWlyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2VudGVyQ3Jvc3NoYWlyKCkge1xyXG4gICAgICAgIHZhciBtYXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIik7XHJcblxyXG4gICAgICAgIHZhciB0b3AgPSBtYXAub2Zmc2V0VG9wO1xyXG4gICAgICAgIHZhciBsZWZ0ID0gbWFwLm9mZnNldExlZnQ7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IG1hcC5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gbWFwLm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICB2YXIgeCA9IGxlZnQgKyB3aWR0aCAvIDIgLSAyMDtcclxuICAgICAgICB2YXIgeSA9IHRvcCArIGhlaWdodCAvIDIgLSAyMDtcclxuXHJcbiAgICAgICAgdmFyIGNyb3NzaGFpciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIGNyb3NzaGFpci5zdHlsZS5sZWZ0ID0geCArIFwicHhcIjtcclxuICAgICAgICBjcm9zc2hhaXIuc3R5bGUudG9wID0geSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDcm9zc2hhaXJMb2NhdGlvbigpIHtcdFxyXG4gICAgICAgIHZhciB0b3BSb3dIZWlnaHQgPSAkKCcjdG9wLXJvdycpLmhlaWdodCgpO1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSAkKCcjY3Jvc3NoYWlyJykub2Zmc2V0KCk7XHJcblxyXG4gICAgICAgIHZhciBjcm9zc2hhaXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyb3NzaGFpclwiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgcG9pbnQgPSBMLnBvaW50KCBjcm9zc2hhaXIub2Zmc2V0TGVmdCArIDIwLCBjcm9zc2hhaXIub2Zmc2V0VG9wIC0gdG9wUm93SGVpZ2h0ICk7XHJcbiAgICAgICAgY29uc3QgbGF0bG9uID0gd2luZG93Lm15bWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnQpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGF0XCIpLnZhbHVlID0gbGF0bG9uLmxhdDtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvblwiKS52YWx1ZSA9IGxhdGxvbi5sbmc7XHJcbiAgICB9XHJcblxyXG4gICAgb25DYW5jZWwoKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlQ3Jvc3NoYWlyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUNyb3NzaGFpcigpIHtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0blwiKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50MiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3Jvc3NoYWlyXCIpO1xyXG4gICAgICAgIGVsZW1lbnQyLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIHZhciBzZWxlY3RMb2NhdGlvbkJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2VsZWN0LWxvY2F0aW9uLWJ0blwiKTtcclxuICAgICAgICBzZWxlY3RMb2NhdGlvbkJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG5cclxuICAgICAgICB2YXIgY2FuY2VsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW5jZWwtYnRuXCIpO1xyXG4gICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEN1cnJlbnRMb2NhdGlvbigpIHtcclxuICAgICAgICBuYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKFxyXG4gICAgICAgICAgICBwb3MgPT4gIHtcdFx0XHRcdFx0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsYXQgPSBwb3MuY29vcmRzLmxhdGl0dWRlO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbG9uID0gcG9zLmNvb3Jkcy5sb25naXR1ZGU7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5teW1hcC5zZXRWaWV3KFtsYXQsIGxvbl0sIHdpbmRvdy5teW1hcC5nZXRab29tKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBpbmNsdWRlSHRtbCB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBGYWNlYm9va1NlcnZpY2UgfSBmcm9tICcuL2ZhY2Vib29rU2VydmljZS5qcyc7XHJcbmltcG9ydCB7IFZvdGVTZXJ2aWNlIH0gZnJvbSAnLi92b3RlU2VydmljZS5qcyc7XHJcbmltcG9ydCB7IHNldENvb2tpZSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5pbXBvcnQgeyBnZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuaW1wb3J0IHsgQWRkUGxhY2UgfSBmcm9tICcuL2FkZFBsYWNlLmpzJztcclxuXHRcclxuZnVuY3Rpb24gaW5pdE1hcCgpIHtcdFxyXG5cdFx0XHRcdFxyXG5cdHdpbmRvdy5teW1hcCA9IEwubWFwKFxyXG5cdCAgICAnbWFwaWQnLFxyXG5cdCAgICB7IHpvb21Db250cm9sOiBmYWxzZSB9XHJcblx0KS5zZXRWaWV3KFs1Ni45NTEyNTksIDI0LjExMjYxNF0sIDEzKTtcclxuXHJcblx0TC5jb250cm9sLnpvb20oe1xyXG4gICAgICAgICBwb3NpdGlvbjonYm90dG9tbGVmdCdcclxuICAgIH0pLmFkZFRvKHdpbmRvdy5teW1hcCk7XHJcblxyXG5cdGNvbnN0IGxheWVyID0gTC50aWxlTGF5ZXIoJ2h0dHBzOi8ve3N9LnRpbGUub3BlbnN0cmVldG1hcC5vcmcve3p9L3t4fS97eX0ucG5nJywge1xyXG5cdFx0bWF4Wm9vbTogMTgsXHJcblx0XHRhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cHM6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzJ1xyXG5cdH0pLmFkZFRvKHdpbmRvdy5teW1hcCk7XHJcblxyXG5cdHdpbmRvdy5ncm91cCA9IEwubWFya2VyQ2x1c3Rlckdyb3VwKHtcclxuXHRcdGNodW5rZWRMb2FkaW5nOiB0cnVlLFxyXG5cdFx0Ly9kaXNhYmxlQ2x1c3RlcmluZ0F0Wm9vbTogMTcsXHJcblx0XHRzcGlkZXJmeU9uTWF4Wm9vbTogdHJ1ZVxyXG5cdCAgfSk7XHJcblxyXG5cdGZldGNoKCcvYXBwL3BsYWNlcycpXHJcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XHJcblx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKClcclxuXHRcdH0pXHJcblx0XHQudGhlbihkYXRhID0+IHtcclxuXHRcdFx0d2luZG93LnZvdGVzID0gZGF0YS52b3RlcztcclxuXHRcdFx0d2luZG93LnBsYWNlcyA9IGRhdGEucGxhY2VzO1xyXG5cdFx0XHRsZXQgcGxhY2VzID0gZGF0YS5wbGFjZXM7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRjb25zdCBpY29ucyA9IFtdO1xyXG5cclxuXHRcdFx0bGV0IGljb25TaXplID0gWzkxLCA5OV07IC8vIHNpemUgb2YgdGhlIGljb25cclxuXHRcdFx0bGV0IGljb25BbmNob3IgPSBbNDUsIDc1XTsgLy8gcG9pbnQgb2YgdGhlIGljb24gd2hpY2ggd2lsbCBjb3JyZXNwb25kIHRvIG1hcmtlcidzIGxvY2F0aW9uXHJcblx0XHRcdGxldCBwb3B1cEFuY2hvciA9IFstMywgLTc2XTsgLy8gcG9pbnQgZnJvbSB3aGljaCB0aGUgcG9wdXAgc2hvdWxkIG9wZW4gcmVsYXRpdmUgdG8gdGhlIGljb25BbmNob3JcclxuXHJcblx0XHRcdGljb25zWzFdID0gTC5pY29uKHtcclxuICAgICAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvbG9jYXRpb24ucG5nJyxcclxuICAgICAgICAgICAgICAgIGljb25TaXplOiAgICAgaWNvblNpemUsXHJcbiAgICAgICAgICAgICAgICBpY29uQW5jaG9yOiAgIGljb25BbmNob3IsXHJcbiAgICAgICAgICAgICAgICBwb3B1cEFuY2hvcjogIHBvcHVwQW5jaG9yXHJcblx0XHRcdH0pO1xyXG5cdFx0XHRpY29uc1syXSA9IEwuaWNvbih7XHJcbiAgICAgICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL2xvY2F0aW9uMi5wbmcnLFxyXG4gICAgICAgICAgICAgICAgaWNvblNpemU6ICAgICBpY29uU2l6ZSxcclxuICAgICAgICAgICAgICAgIGljb25BbmNob3I6ICAgaWNvbkFuY2hvcixcclxuICAgICAgICAgICAgICAgIHBvcHVwQW5jaG9yOiAgcG9wdXBBbmNob3JcclxuXHRcdFx0fSk7XHJcblx0XHRcdGljb25zWzNdID0gTC5pY29uKHtcclxuICAgICAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvbG9jYXRpb24zLnBuZycsXHJcbiAgICAgICAgICAgICAgICBpY29uU2l6ZTogICAgIGljb25TaXplLFxyXG4gICAgICAgICAgICAgICAgaWNvbkFuY2hvcjogICBpY29uQW5jaG9yLFxyXG4gICAgICAgICAgICAgICAgcG9wdXBBbmNob3I6ICBwb3B1cEFuY2hvclxyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwbGFjZXMubGVuZ3RoOyBpKyspIHtcclxuXHJcblx0XHRcdFx0dmFyIHZvdGVDb3VudElucHV0ID0gZGF0YS52b3Rlc1twbGFjZXNbaV0uaWRdO1xyXG5cdFx0XHRcdHZhciB2b3RlQ291bnQgPSBcIlwiO1xyXG5cdFx0XHRcdGlmKHZvdGVDb3VudElucHV0KSB7XHJcblx0XHRcdFx0ICAgIHZvdGVDb3VudCA9IFwiJm5ic3A7XCIgKyBkYXRhLnZvdGVzW3BsYWNlc1tpXS5pZF07XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR2YXIgbWFya2VyID0gTC5tYXJrZXIoXHJcblx0XHRcdFx0XHRbcGxhY2VzW2ldLmxhdCwgcGxhY2VzW2ldLmxvbl0sIFxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRpY29uOiBpY29uc1twbGFjZXNbaV0ucGxhY2VUeXBlXSwgXHJcblx0XHRcdFx0XHRcdHBsYWNlOiBwbGFjZXNbaV1cclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0XHRtYXJrZXIuYmluZFBvcHVwKCBjb250ZXh0ID0+IHtcclxuXHRcdFx0XHRcdGNvbnN0IHBsYWNlID0gY29udGV4dC5vcHRpb25zLnBsYWNlO1xyXG5cdFx0XHRcdFx0bGV0IHZvdGVDb3VudCA9IHdpbmRvdy52b3Rlc1twbGFjZS5pZF07XHJcblx0XHRcdFx0XHRpZighdm90ZUNvdW50KSB7XHJcblx0XHRcdFx0XHRcdHZvdGVDb3VudCA9IFwiXCI7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRsZXQgaXNVcHZvdGUgPSBudWxsO1xyXG5cdFx0XHRcdFx0aWYod2luZG93Lm15dm90ZXMpIHtcclxuXHRcdFx0XHRcdFx0aXNVcHZvdGUgPSB3aW5kb3cubXl2b3Rlc1twbGFjZS5pZF07XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHRsZXQgdXB2b3RlQ2xhc3M7XHJcblx0XHRcdFx0XHRpZihpc1Vwdm90ZSkge1xyXG5cdFx0XHRcdFx0XHR1cHZvdGVDbGFzcyA9IFwiYnRuLXN1Y2Nlc3NcIjtcclxuXHRcdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHRcdHVwdm90ZUNsYXNzID0gXCJidG4tb3V0bGluZS1zdWNjZXNzXCI7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0bGV0IGltZ1NyYyA9IFwiL2ltYWdlcy9ub2ltYWdlLnBuZ1wiO1xyXG5cdFx0XHRcdFx0bGV0IGltZ0NsYXNzID0gXCJwb3B1cC1ub2ltYWdlXCI7XHJcblx0XHRcdFx0XHRpZihwbGFjZS5pbWcgJiYgcGxhY2UuaW1nLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdFx0aW1nU3JjID0gXCIvYXBwL2ZpbGVzL1wiICsgcGxhY2UuaW1nO1xyXG5cdFx0XHRcdFx0XHRpbWdDbGFzcyA9IFwicG9wdXAtaW1hZ2VcIjtcclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRyZXR1cm4gYDxkaXYgaWQ9J3BvcHVwJyBjbGFzcz0nbXljb250YWluZXInPlxyXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1sZWZ0Jz4gXHJcblx0XHRcdFx0XHRcdFx0XHRcdDxpbWcgc3JjPScke2ltZ1NyY30nIGNsYXNzPScke2ltZ0NsYXNzfScvPiA8L2Rpdj5cclxuXHJcblx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPSdncmlkYm94LWxlZnQnPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHQke3BsYWNlLmRlc2NyaXB0aW9ufTwvZGl2PlxyXG5cclxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9J2dyaWRib3gtcmlnaHQnPlxyXG5cdFx0XHRcdFx0XHRcdFx0XHRCYWxzb3RcclxuXHRcdFx0XHRcdFx0XHRcdFx0PGJ1dHRvbiB0eXBlPSdidXR0b24nIGlkPSdidG5MaWtlJyBjbGFzcz0nYnRuICR7dXB2b3RlQ2xhc3N9J1xyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9uY2xpY2s9J2RvVm90ZSgke3BsYWNlLmlkfSknPvCfkY0gPGRpdiBpZD1cInZvdGVDb3VudFwiPiR7dm90ZUNvdW50fTwvZGl2PjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIFx0XHQ8L2Rpdj5gO1xyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdHdpbmRvdy5ncm91cC5hZGRMYXllcihtYXJrZXIpO1xyXG5cdFx0XHR9XHJcblx0XHRcdFxyXG5cdFx0XHR3aW5kb3cubXltYXAuYWRkTGF5ZXIod2luZG93Lmdyb3VwKTtcclxuXHRcdH0pXHJcblx0XHQuY2F0Y2goZXJyID0+IHtcclxuXHRcdFx0YWxlcnQoXCJlMiBcIisgZXJyKTtcclxuXHRcdH0pO1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gc2V0SW1nKGlucHV0KSB7XHJcblx0aWYgKGlucHV0LmZpbGVzICYmIGlucHV0LmZpbGVzWzBdKSB7XHJcblx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHRcdFxyXG5cdFx0cmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcblx0XHRcdCQoJyNpbWctdXBsb2FkJykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoaW5wdXQuZmlsZXNbMF0pO1xyXG5cdH1cclxufVxyXG5cclxuZnVuY3Rpb24gc2hvd1ZvdGVUb3AoKSB7XHJcblxyXG5cdCQoJyN2b3RlLXRvcCcpLm1vZGFsKCdzaG93Jyk7XHJcblx0XHJcblx0ZmV0Y2goJy9hcHAvdG9wJyxcclxuXHRcdHtcclxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0Y2FjaGU6ICduby1jYWNoZSdcclxuXHRcdH0pXHJcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XHJcblx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKClcclxuXHRcdH0pXHJcblx0XHQudGhlbihkYXRhID0+IHtcclxuXHJcblx0XHRcdGxldCB0aXRsZXMgPSBbXHJcblx0XHRcdFx0XCLFoGF1csSrYmEgLyBuZXDEgXJyZWR6YW3Eq2JhXCIsXHJcblx0XHRcdFx0XCJTdHJhdWppIHBhZ3JpZXppZW5pXCIsXHJcblx0XHRcdFx0XCJTZWd1bXMgKGJlZHJlcywgYsSrc3RhbWFzIGFwbWFsZXMpXCJcclxuXHRcdFx0IF07XHJcblx0XHRcdGxldCBjb250ZW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wLWNvbnRlbnRcIik7XHJcblx0XHRcdGxldCByZXN1bHQgPSBcIlwiO1xyXG5cclxuXHRcdFx0Zm9yKGxldCB0eXBlID0gMTsgdHlwZSA8PSAzOyB0eXBlKyspIHtcclxuXHRcdFx0XHRsZXQgaWR4ID0gdHlwZSAtIDE7XHJcblxyXG5cdFx0XHRcdGlmKCFkYXRhIHx8ICFkYXRhW2lkeF0pIHtcclxuXHRcdFx0XHRcdGNvbnRpbnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0XHRsZXQgdG9wMyA9IFwiXCI7XHJcblx0XHRcdFx0Zm9yKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xyXG5cdFx0XHRcdFx0XHJcblx0XHRcdFx0XHRsZXQgdG9wUGxhY2UgPSBkYXRhW2lkeF1baV07XHJcblx0XHRcdFx0XHRpZighdG9wUGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0bGV0IHBsYWNlcyA9IHdpbmRvdy5wbGFjZXM7XHJcblx0XHRcdFx0XHRsZXQgaWQgPSB0b3BQbGFjZVswXTtcclxuXHRcdFx0XHRcdGxldCB2b3RlQ291bnQgPSB0b3BQbGFjZVsxXTtcclxuXHRcdFx0XHRcdGxldCBwbGFjZSA9IG51bGw7XHJcblx0XHRcdFx0XHRmb3IobGV0IGogPSAwOyBqIDwgcGxhY2VzLmxlbmd0aDsgaisrKSB7XHJcblx0XHRcdFx0XHRcdGlmKHBsYWNlc1tqXS5pZCA9PVx0IGlkKSB7XHJcblx0XHRcdFx0XHRcdFx0cGxhY2UgPSBwbGFjZXNbal07XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0XHRpZighcGxhY2UpIHtcclxuXHRcdFx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0bGV0IGltZ1NyYyA9IFwiL2ltYWdlcy9ub2ltYWdlLnBuZ1wiO1xyXG5cdFx0XHRcdFx0aWYocGxhY2UuaW1nICYmIHBsYWNlLmltZy5sZW5ndGggPiAwKSB7XHJcblx0XHRcdFx0XHRcdGltZ1NyYyA9IFwiL2FwcC9maWxlcy8yXCIgKyBwbGFjZS5pbWc7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0Lyo8ZGl2IGNsYXNzPVwidG9wLXR4dFwiPiR7dm90ZUNvdW50fTwvZGl2PiovXHJcblxyXG5cdFx0XHRcdFx0dG9wMyArPSBgPGRpdiBjbGFzcz1cInRvcC1pdGVtXCI+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0b3AtaW1hZ2UtYm94XCI+XHJcblx0XHRcdFx0XHRcdFx0PGltZyBjbGFzcz1cInRvcC1pbWFnZVwiIHNyYz0nJHtpbWdTcmN9Jy8+IFxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidG9wLW51bWJlclwiPiR7aSArIDF9PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0b3AtdGV4dFwiPiR7cGxhY2UuZGVzY3JpcHRpb259PC9kaXY+XHJcblx0XHRcdFx0XHQ8L2Rpdj5gO1xyXG5cdFx0XHRcdH1cdFx0XHRcdFxyXG5cclxuXHRcdFx0XHRpZih0b3AzLmxlbmd0aCA+IDApIHtcclxuXHRcdFx0XHRcdHJlc3VsdCArPSBcclxuXHRcdFx0XHRcdFx0YDxkaXYgY2xhc3M9XCJ2b3RlLXRvcC10aXRsZVwiPiR7dHlwZX0tICR7dGl0bGVzW2lkeF19PC9kaXY+XHJcblx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ2b3RlLXRvcC1yb3dcIiBpZD1cInR5cGUke3R5cGV9XCI+XHJcblx0XHRcdFx0XHRcdFx0JHt0b3AzfVxyXG5cdFx0XHRcdFx0XHQ8L2Rpdj5gO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHRcclxuXHRcdFx0fVxyXG5cdFx0XHRjb250ZW50RWxlbWVudC5pbm5lckhUTUwgPSByZXN1bHQ7XHJcblx0XHR9KVxyXG5cdFx0LmNhdGNoKGUgPT4gYWxlcnQoXCJlMVwiKyBlKSk7XHJcbn1cclxuXHJcbiQod2luZG93KS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICBpbmNsdWRlSHRtbCgnaHRtbC9zdGFydC5odG1sJywgJ3N0YXJ0Jyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvY2hvb3NlLXBsYWNlLmh0bWwnLCAnY2hvb3NlLXBsYWNlJyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvcmVwb3J0Lmh0bWwnLCAncmVwb3J0Jyk7XHJcblx0aW5jbHVkZUh0bWwoJ2h0bWwvdm90ZS10b3AuaHRtbCcsICd2b3RlLXRvcCcpO1xyXG5cdGluY2x1ZGVIdG1sKCdodG1sL2Fib3V0LXVzLmh0bWwnLCAnYWJvdXQtdXMnKTtcclxuXHJcblx0bGV0IHZpc2l0ZWQgPSBnZXRDb29raWUoXCJ2aXNpdGVkXCIpO1xyXG5cdGlmKCF2aXNpdGVkKSB7XHJcblx0XHQkKCcjc3RhcnQnKS5tb2RhbCgnc2hvdycpO1xyXG5cdFx0c2V0Q29va2llKFwidmlzaXRlZFwiLCB0cnVlLCAzNjUpO1xyXG5cdH1cdFxyXG5cdFxyXG5cdGluaXRNYXAoKTtcclxuXHJcblx0d2luZG93LnNldEltZyA9IHNldEltZztcclxuXHR3aW5kb3cuc2hvd1ZvdGVUb3AgPSBzaG93Vm90ZVRvcDtcclxuXHR3aW5kb3cudm90ZVNlcnZpY2UgPSBuZXcgVm90ZVNlcnZpY2UoKTtcclxuXHR3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlID0gbmV3IEZhY2Vib29rU2VydmljZSgpO1xyXG5cclxuXHRsZXQgYWRkUGxhY2UgPSBuZXcgQWRkUGxhY2UoKTtcclxufSk7XHJcbiJdLCJuYW1lcyI6WyJpbmNsdWRlSHRtbCIsInVybCIsImlkIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJpbm5lckhUTUwiLCJyZXNwb25zZVRleHQiLCJzZW5kIiwic2V0Q29va2llIiwibmFtZSIsInZhbHVlIiwiZGF5cyIsImlzU2VjdXJlIiwiZXhwaXJlcyIsImRhdGUiLCJEYXRlIiwic2V0VGltZSIsImdldFRpbWUiLCJ0b1VUQ1N0cmluZyIsInNlY3VyZSIsImNvb2tpZSIsImdldENvb2tpZSIsIm5hbWVFUSIsImNhIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwiYyIsImNoYXJBdCIsInN1YnN0cmluZyIsImluZGV4T2YiLCJoaWRlU3Bpbm5lciIsInN0eWxlIiwiZGlzcGxheSIsInNob3dTcGlubmVyIiwiRmFjZWJvb2tTZXJ2aWNlIiwiYWZ0ZXJGQkluaXQiLCJpbml0Iiwid2luZG93Iiwic3RvcmVIdHRwT25seUNvb2tpZSIsInRva2VuIiwiZmFjZWJvb2tTZXJ2aWNlIiwiZmJBc3luY0luaXQiLCJGQiIsImFwcElkIiwieGZibWwiLCJ2ZXJzaW9uIiwiQXBwRXZlbnRzIiwibG9nUGFnZVZpZXciLCJFdmVudCIsInN1YnNjcmliZSIsInJlc3BvbnNlIiwiY29uc29sZSIsImxvZyIsIm9uTG9naW4iLCJkIiwicyIsImpzIiwiZmpzIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJjcmVhdGVFbGVtZW50Iiwic3JjIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImNoZWNrRkJMb2dpblN0YXR1cyIsInRoZW4iLCJ2b3RlU2VydmljZSIsImZldGNoTXlWb3RlcyIsImxvZ2luQ2FsbGJhY2siLCJjYXRjaCIsImUiLCJQcm9taXNlIiwicmVzb2x1dGlvbkZ1bmMiLCJyZWplY3Rpb25GdW5jIiwiJCIsIm1vZGFsIiwib25Mb2dnZWRJbiIsIm9uTm90TG9nZ2VkSW4iLCJnZXRMb2dpblN0YXR1cyIsImF1dGhSZXNwb25zZSIsImFjY2Vzc1Rva2VuIiwiYWpheCIsInR5cGUiLCJwcm9jZXNzRGF0YSIsImNyb3NzRG9tYWluIiwiaGVhZGVycyIsImRhdGEiLCJzdWNjZXNzIiwiZXJyb3IiLCJqWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwiVm90ZVNlcnZpY2UiLCJkb1ZvdGUiLCJwbGFjZUlEIiwiZmV0Y2giLCJtZXRob2QiLCJjYWNoZSIsImpzb24iLCJteXZvdGVzIiwibG9naW5JZk5lZWRlZCIsImJ0bkxpa2UiLCJkb1Vwdm90ZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicmVtb3ZlIiwiYWRkIiwidm90ZSIsInZvdGVDb3VudEVsZW1lbnQiLCJ2b3RlQ291bnQiLCJ2b3RlcyIsImFsZXJ0IiwiaXNVcHZvdGUiLCJvblN1Y2Nlc3MiLCJvbkVycm9yIiwidG9nZ2xlIiwiQWRkUGxhY2UiLCJjaGFuZ2UiLCJzZXRJbWciLCJ0aGF0Iiwib24iLCJldmVudCIsInNob3dDcm9zc2hhaXIiLCJzZXRDdXJyZW50TG9jYXRpb24iLCJnZXRDcm9zc2hhaXJMb2NhdGlvbiIsImhpZGVDcm9zc2hhaXIiLCJzdWJtaXRGb3JtIiwiRm9ybURhdGEiLCJwcmV2ZW50RGVmYXVsdCIsImNvbnRlbnRUeXBlIiwibG9jYXRpb24iLCJyZWxvYWQiLCJlbGVtZW50IiwiY3Jvc3NoYWlyIiwic2VsZWN0TG9jYXRpb25CdXR0b24iLCJjYW5jZWxCdXR0b24iLCJjZW50ZXJDcm9zc2hhaXIiLCJtYXAiLCJ0b3AiLCJvZmZzZXRUb3AiLCJsZWZ0Iiwib2Zmc2V0TGVmdCIsImhlaWdodCIsIm9mZnNldEhlaWdodCIsIndpZHRoIiwib2Zmc2V0V2lkdGgiLCJ4IiwieSIsInRvcFJvd0hlaWdodCIsIm9mZnNldCIsInBvaW50IiwiTCIsImxhdGxvbiIsIm15bWFwIiwiY29udGFpbmVyUG9pbnRUb0xhdExuZyIsImxhdCIsImxuZyIsImVsZW1lbnQyIiwibmF2aWdhdG9yIiwiZ2VvbG9jYXRpb24iLCJnZXRDdXJyZW50UG9zaXRpb24iLCJwb3MiLCJjb29yZHMiLCJsYXRpdHVkZSIsImxvbiIsImxvbmdpdHVkZSIsInNldFZpZXciLCJnZXRab29tIiwiaW5pdE1hcCIsInpvb21Db250cm9sIiwiY29udHJvbCIsInpvb20iLCJwb3NpdGlvbiIsImFkZFRvIiwibGF5ZXIiLCJ0aWxlTGF5ZXIiLCJtYXhab29tIiwiYXR0cmlidXRpb24iLCJncm91cCIsIm1hcmtlckNsdXN0ZXJHcm91cCIsImNodW5rZWRMb2FkaW5nIiwic3BpZGVyZnlPbk1heFpvb20iLCJwbGFjZXMiLCJpY29ucyIsImljb25TaXplIiwiaWNvbkFuY2hvciIsInBvcHVwQW5jaG9yIiwiaWNvbiIsImljb25VcmwiLCJ2b3RlQ291bnRJbnB1dCIsIm1hcmtlciIsInBsYWNlVHlwZSIsInBsYWNlIiwiYmluZFBvcHVwIiwiY29udGV4dCIsIm9wdGlvbnMiLCJ1cHZvdGVDbGFzcyIsImltZ1NyYyIsImltZ0NsYXNzIiwiaW1nIiwiZGVzY3JpcHRpb24iLCJhZGRMYXllciIsImVyciIsImlucHV0IiwiZmlsZXMiLCJyZWFkZXIiLCJGaWxlUmVhZGVyIiwib25sb2FkIiwiYXR0ciIsInRhcmdldCIsInJlc3VsdCIsInJlYWRBc0RhdGFVUkwiLCJzaG93Vm90ZVRvcCIsInRpdGxlcyIsImNvbnRlbnRFbGVtZW50IiwiaWR4IiwidG9wMyIsInRvcFBsYWNlIiwiaiIsInZpc2l0ZWQiLCJhZGRQbGFjZSJdLCJtYXBw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
