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
	  document.getElementById("spinnerBox").style.display = "none";
	}
	function showSpinner() {
	  document.getElementById("spinnerBox").style.display = "block";
	}
	function getCaptcha() {
	  return new Promise(function (resolutionFunc, rejectionFunc) {
	    grecaptcha.ready(function () {
	      grecaptcha.execute('6LdfLOEUAAAAAAGmzOyh5Kk08M98p5sWceMN9HVc', {
	        action: 'homepage'
	      }).then(function (token) {
	        resolutionFunc(token);
	      });
	    });
	  });
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
	        var uri = encodeURI(location.protocol + '//' + location.host + '/');
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
	      getCaptcha().then(function (captcha) {
	        $.ajax({
	          url: "/app/vote",
	          type: "POST",
	          processData: false,
	          crossDomain: true,
	          headers: {
	            'x-captcha': captcha
	          },
	          data: "place=" + placeID + "&isUpvote=" + isUpvote,
	          success: function success(data) {
	            onSuccess(data);
	          },
	          error: onError
	        });
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
	    console.log("uhsnou");
	    /*
	    var myobj = $('#uploadimage');
	    myobj.on('keyup keypress blur change input', function() {
	        this.setCustomValidity("test");
	    });*/

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
	      showSpinner();
	      this.storeEmailInCookie();
	      var data = new FormData($('#myform')[0]);
	      e.preventDefault();
	      getCaptcha().then(function (captcha) {
	        var _$$ajax;

	        $.ajax((_$$ajax = {
	          url: '/app/upload',
	          type: "POST",
	          contentType: 'multipart/form-data',
	          processData: false
	        }, _defineProperty(_$$ajax, "contentType", false), _defineProperty(_$$ajax, "crossDomain", true), _defineProperty(_$$ajax, "headers", {
	          'x-captcha': captcha
	        }), _defineProperty(_$$ajax, "data", data), _defineProperty(_$$ajax, "success", function success(data) {
	          hideSpinner();
	          alert("Paldies par veloslazdu! Veloslazdi, kas iek\u013C\u016Bs vietnes \u201CTop\u0101\u201D tiks nos\u016Bt\u012Bti RDSD.\n                        Balso par veloslazdiem, izv\u0113loties tos kart\u0113 un autoriz\u0113joties ar Facebook.");
	          location.reload();
	        }), _defineProperty(_$$ajax, "error", function error(jXHR, textStatus, errorThrown) {
	          hideSpinner();
	          alert("Pārliecinies, vai esi pievienojis veloslazdam kategoriju un nosaukumu!" + " Ja neizdodas pievienot punktu, raksti uz info@datuskola.lv");
	        }), _$$ajax));
	      });
	    }
	  }, {
	    key: "showCrosshair",
	    value: function showCrosshair() {
	      var element = document.getElementById("color-codes");
	      element.classList.add("d-none");
	      var element = document.getElementById("color-codes-strip");
	      element.classList.add("d-none");
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
	      var element = document.getElementById("color-codes");
	      element.classList.remove("d-none");
	      var element = document.getElementById("color-codes-strip");
	      element.classList.remove("d-none");
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
	    zoomControl: false,
	    closePopupOnClick: false
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
	    icons[4] = L.icon({
	      iconUrl: 'images/location4.png',
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
	        return "<div id='popup' class='mycontainer'>\n\t\t\t\t\t\t\t\t<div class='gridbox-left'>\n\t\t\t\t\t\t\t\t\t<img id='small-image' src='".concat(imgSrc, "' class='").concat(imgClass, "'/> \n\t\t\t\t\t\t\t\t\t<img id='small-zoom-in' src=\"/images/zoom-in.png\" >\n\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-left'>\n\t\t\t\t\t\t\t\t\t").concat(place.description, "</div>\n\n\t\t\t\t\t\t\t\t<div class='gridbox-right'>\n\t\t\t\t\t\t\t\t\tBalsot\n\t\t\t\t\t\t\t\t\t<button type='button' id='btnLike' class='btn ").concat(upvoteClass, "'\n\t\t\t\t\t\t\t\t\t\tonclick='doVote(").concat(place.id, ")'>\uD83D\uDC4D <div id=\"voteCount\">").concat(voteCount, "</div></button>\n \t\t</div>");
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
	    var titles = ["Šaurība / nepārredzamība", "Strauji pagriezieni", "Segums (bedres, bīstamas apmales)", "Cits"];
	    var contentElement = document.getElementById("top-content");
	    var result = "";

	    for (var type = 1; type <= 4; type++) {
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
	        var fullImgSrc = "";

	        if (place.img && place.img.length > 0) {
	          imgSrc = "/app/files/2" + place.img;
	          fullImgSrc = "/app/files/" + place.img;
	        }

	        top3 += "<div class=\"top-item\">\n\t\t\t\t\t\t<div class=\"top-image-box\">\n\t\t\t\t\t\t\t<img class=\"top-image\" src='".concat(imgSrc, "' full-src='").concat(fullImgSrc, "' />\n\t\t\t\t\t\t</div>\t\t\n\t\t\t\t\t\t<img id=\"top-zoom-in\" src=\"/images/zoom-in.png\" >\n\t\t\t\t\t\t<div class=\"top-vote-count\">\uD83D\uDC4D&nbsp;").concat(voteCount, "</div>\t\t\n\t\t\t\t\t\t<div class=\"top-number\">").concat(i + 1, "</div>\n\t\t\t\t\t\t<div class=\"top-text\">").concat(place.description, "</div>\n\t\t\t\t\t</div>");
	      }

	      if (top3.length > 0) {
	        result += "<div class=\"vote-top-title color-".concat(type, "\">").concat(type, "- ").concat(titles[idx], "\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class=\"vote-top-row\" id=\"type").concat(type, "\">\n\t\t\t\t\t\t\t").concat(top3, "\n\t\t\t\t\t\t</div>");
	      }
	    }

	    contentElement.innerHTML = result;
	  }).catch(function (e) {
	    return console.log("e1" + e);
	  });
	}

	$(window).on("load", function () {
	  includeHtml('public/start.d02c2dc2e3257bcc7d4dc1e41dc0963f.html', 'start');
	  includeHtml('public/choose-place.4c0fc8f06ca674f8743a65473f9c9f6f.html', 'choose-place');
	  includeHtml('public/report.cd5177f561611019be237b24bf772219.html', 'report');
	  includeHtml('public/vote-top.2f94a4b3ba649f6c2e9a74082872d960.html', 'vote-top');
	  includeHtml('public/about-us.a87b2bfb76dd81f2b5288eebb2cd4c73.html', 'about-us');
	  includeHtml('public/big-image.9f85b967b17eaa16a26aec475a730bd4.html', 'big-image-box');
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

	  window.showBigImage = function (imageSrc) {
	    if (imageSrc.length == 0 || imageSrc == "/images/noimage.png") {
	      return;
	    }

	    var elem = document.getElementById("big-image-src");
	    elem.setAttribute("src", imageSrc);
	    $('#big-image-box').modal('show');
	  };

	  var addPlace = new AddPlace();
	  $(document).on("click", "#small-image", function () {
	    var imageSrc = document.getElementById("small-image").getAttribute("src");
	    window.showBigImage(imageSrc);
	  });
	  $(document).on("click", "#small-zoom-in", function () {
	    var imageSrc = document.getElementById("small-image").getAttribute("src");
	    window.showBigImage(imageSrc);
	  });
	  $(document).on("click", ".top-image", function (e) {
	    var src = e.target.getAttribute("full-src");
	    window.showBigImage(src);
	  });
	  $(document).on("click", "#top-zoom-in", function (e) {
	    var src = e.target.parentNode.getElementsByClassName("top-image")[0].getAttribute("full-src");
	    window.showBigImage(src);
	  });
	});

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMuanMiLCIuLi9zcmMvZmFjZWJvb2tTZXJ2aWNlLmpzIiwiLi4vc3JjL3ZvdGVTZXJ2aWNlLmpzIiwiLi4vc3JjL2FkZFBsYWNlLmpzIiwiLi4vc3JjL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmNsdWRlSHRtbCh1cmwsIGlkKSB7XHJcblx0dmFyIHhocj0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblx0eGhyLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UpO1xyXG5cdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2U9IGZ1bmN0aW9uKCkge1xyXG5cdFx0aWYgKHRoaXMucmVhZHlTdGF0ZSE9PTQpIHJldHVybjtcclxuXHRcdGlmICh0aGlzLnN0YXR1cyE9PTIwMCkgcmV0dXJuOyAvLyBvciB3aGF0ZXZlciBlcnJvciBoYW5kbGluZyB5b3Ugd2FudFxyXG5cdFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpLmlubmVySFRNTD0gdGhpcy5yZXNwb25zZVRleHQ7XHJcblx0fTtcclxuXHR4aHIuc2VuZCgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0Q29va2llKG5hbWUsIHZhbHVlLCBkYXlzLCBpc1NlY3VyZSkge1xyXG5cdHZhciBleHBpcmVzID0gXCJcIjtcclxuXHRpZiAoZGF5cykge1xyXG5cdFx0dmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xyXG5cdFx0ZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKGRheXMqMjQqNjAqNjAqMTAwMCkpO1xyXG5cdFx0ZXhwaXJlcyA9IFwiOyBleHBpcmVzPVwiICsgZGF0ZS50b1VUQ1N0cmluZygpO1xyXG5cdH1cclxuXHRsZXQgc2VjdXJlID0gXCJcIjtcclxuXHRpZiAoaXNTZWN1cmUpIHtcclxuXHRcdHNlY3VyZSA9IFwiOyBzZWN1cmU7IEh0dHBPbmx5XCI7XHJcblx0fVxyXG5cdGRvY3VtZW50LmNvb2tpZSA9IG5hbWUgKyBcIj1cIiArICh2YWx1ZSB8fCBcIlwiKSAgKyBleHBpcmVzICsgXCI7IHBhdGg9L1wiICsgc2VjdXJlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29va2llKG5hbWUpIHtcclxuXHRsZXQgbmFtZUVRID0gbmFtZSArIFwiPVwiO1xyXG5cdGxldCBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xyXG5cdGZvciAobGV0IGk9MDsgaSA8IGNhLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRsZXQgYyA9IGNhW2ldO1xyXG5cdFx0d2hpbGUgKGMuY2hhckF0KDApPT0nICcpIGMgPSBjLnN1YnN0cmluZygxLGMubGVuZ3RoKTtcclxuXHRcdGlmIChjLmluZGV4T2YobmFtZUVRKSA9PSAwKSByZXR1cm4gYy5zdWJzdHJpbmcobmFtZUVRLmxlbmd0aCxjLmxlbmd0aCk7XHJcblx0fVxyXG5cdHJldHVybiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZXJhc2VDb29raWUobmFtZSkge1xyXG5cdFx0ZG9jdW1lbnQuY29va2llID0gbmFtZSsnPTsgTWF4LUFnZT0tOTk5OTk5OTk7JzsgIFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGlkZVNwaW5uZXIoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwaW5uZXJCb3hcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd1NwaW5uZXIoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNwaW5uZXJCb3hcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRHZXRQYXJhbWV0ZXIocGFyYW1ldGVyTmFtZSkge1xyXG4gICAgdmFyIHJlc3VsdCA9IG51bGwsXHJcbiAgICAgICAgdG1wID0gW107XHJcbiAgICBsb2NhdGlvbi5zZWFyY2hcclxuICAgICAgICAuc3Vic3RyKDEpXHJcbiAgICAgICAgLnNwbGl0KFwiJlwiKVxyXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XHJcbiAgICAgICAgICB0bXAgPSBpdGVtLnNwbGl0KFwiPVwiKTtcclxuICAgICAgICAgIGlmICh0bXBbMF0gPT09IHBhcmFtZXRlck5hbWUpIHJlc3VsdCA9IGRlY29kZVVSSUNvbXBvbmVudCh0bXBbMV0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENhcHRjaGEoKSB7XHJcblx0cmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x1dGlvbkZ1bmMsIHJlamVjdGlvbkZ1bmMpID0+IHtcclxuXHRcdGdyZWNhcHRjaGEucmVhZHkoZnVuY3Rpb24oKSB7XHJcblx0XHRcdGdyZWNhcHRjaGEuZXhlY3V0ZSgnNkxkZkxPRVVBQUFBQUFHbXpPeWg1S2swOE05OHA1c1djZU1OOUhWYycsIHthY3Rpb246ICdob21lcGFnZSd9KS50aGVuKGZ1bmN0aW9uKHRva2VuKSB7XHJcblx0XHRcdFx0cmVzb2x1dGlvbkZ1bmModG9rZW4pO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdH0pO1xyXG59IiwiaW1wb3J0IHsgZ2V0Q29va2llLCBzZXRDb29raWUgfSBmcm9tICcuL3V0aWxzLmpzJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWNlYm9va1NlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoYWZ0ZXJGQkluaXQpIHtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB3aW5kb3cuYWZ0ZXJGQkluaXQgPSBhZnRlckZCSW5pdDtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KCkge1xyXG4gICAgICAgIHdpbmRvdy5sb2dpbmZ1biA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHVyaSA9IGVuY29kZVVSSShsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0ICsgJy8nKTtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZW5jb2RlVVJJKFwiaHR0cHM6Ly93d3cuZmFjZWJvb2suY29tL2RpYWxvZy9vYXV0aD9jbGllbnRfaWQ9MjczODc1NDYwMTg0NjExJnJlZGlyZWN0X3VyaT1cIit1cmkrXCImcmVzcG9uc2VfdHlwZT10b2tlblwiKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aW5kb3cuc3RvcmVIdHRwT25seUNvb2tpZSA9ICh0b2tlbikgPT4gd2luZG93LmZhY2Vib29rU2VydmljZS5zdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKTtcclxuICAgICAgICBcclxuICAgICAgICB3aW5kb3cuZmJBc3luY0luaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgRkIuaW5pdCh7XHRcclxuICAgICAgICAgICAgICAgIGFwcElkICAgOiAnMjczODc1NDYwMTg0NjExJyxcclxuICAgICAgICAgICAgICAgIGNvb2tpZSAgOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzICA6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB4ZmJtbCAgIDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gOiAndjMuMycgXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgRkIuQXBwRXZlbnRzLmxvZ1BhZ2VWaWV3KCk7XHJcblxyXG4gICAgICAgICAgICBGQi5FdmVudC5zdWJzY3JpYmUoJ2F1dGguYXV0aFJlc3BvbnNlQ2hhbmdlJywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUaGUgc3RhdHVzIG9mIHRoZSBzZXNzaW9uIGNoYW5nZWQgdG86ICcrcmVzcG9uc2Uuc3RhdHVzKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLm9uTG9naW4oKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIChmdW5jdGlvbihkLCBzLCBpZCl7XHJcbiAgICAgICAgICAgIHZhciBqcywgZmpzID0gZC5nZXRFbGVtZW50c0J5VGFnTmFtZShzKVswXTtcclxuICAgICAgICAgICAgaWYgKGQuZ2V0RWxlbWVudEJ5SWQoaWQpKSB7cmV0dXJuO31cclxuICAgICAgICAgICAganMgPSBkLmNyZWF0ZUVsZW1lbnQocyk7IGpzLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIGpzLnNyYyA9IFwiaHR0cHM6Ly9jb25uZWN0LmZhY2Vib29rLm5ldC9sdl9MVi9zZGsuanNcIjtcclxuICAgICAgICAgICAgZmpzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGpzLCBmanMpO1xyXG4gICAgICAgIH0oZG9jdW1lbnQsICdzY3JpcHQnLCAnZmFjZWJvb2stanNzZGsnKSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgb25Mb2dpbigpIHtcclxuICAgICAgICB0aGlzLmNoZWNrRkJMb2dpblN0YXR1cygpXHJcbiAgICAgICAgICAgIC50aGVuKHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuZmFjZWJvb2tTZXJ2aWNlLnN0b3JlSHR0cE9ubHlDb29raWUodG9rZW4pO1xyXG4gICAgICAgICAgICB9KSBcclxuICAgICAgICAgICAgLnRoZW4odG9rZW4gPT4ge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LnZvdGVTZXJ2aWNlLmZldGNoTXlWb3RlcygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgIHRva2VuID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZih3aW5kb3cubG9naW5DYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9naW5DYWxsYmFjayh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2dpbkNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBcIkZCIG5vdCBsb2dnZWQgaW5cIjtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChlID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbG9naW5JZk5lZWRlZCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXNvbHV0aW9uRnVuYywgcmVqZWN0aW9uRnVuYykgPT4ge1xyXG5cclxuICAgICAgICAgICAgJCgnI2xvZ2luTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29uc3Qgb25Mb2dnZWRJbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uub25Mb2dpbigpO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmMoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY29uc3Qgb25Ob3RMb2dnZWRJbiA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2dpbkNhbGxiYWNrID0gdG9rZW4gPT4geyBcclxuICAgICAgICAgICAgICAgICAgICAkKCcjbG9naW5Nb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x1dGlvbkZ1bmModG9rZW4pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICQoJyNsb2dpbk1vZGFsJykubW9kYWwoJ3Nob3cnKTsgXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHdpbmRvdy5mYWNlYm9va1NlcnZpY2UuY2hlY2tGQkxvZ2luU3RhdHVzKClcclxuICAgICAgICAgICAgICAgIC50aGVuKG9uTG9nZ2VkSW4sIG9uTm90TG9nZ2VkSW4pO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2hlY2tGQkxvZ2luU3RhdHVzKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlc29sdXRpb25GdW5jLCByZWplY3Rpb25GdW5jKSA9PiB7XHJcbiAgICAgICAgICAgIEZCLmdldExvZ2luU3RhdHVzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5zdGF0dXMgPT0gXCJjb25uZWN0ZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0b2tlbiA9IHJlc3BvbnNlLmF1dGhSZXNwb25zZS5hY2Nlc3NUb2tlbjtcclxuICAgICAgICAgICAgICAgICAgICByZXNvbHV0aW9uRnVuYyh0b2tlbik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdGlvbkZ1bmMocmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9yZUh0dHBPbmx5Q29va2llKHRva2VuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzb2x1dGlvbkZ1bmMsIHJlamVjdGlvbkZ1bmMpID0+IHtcclxuICAgICAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgICAgIHVybCA6IFwiL2FwcC9sb2dpblwiLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInRva2VuXCI6dG9rZW5cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdXRpb25GdW5jKHRva2VuKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGpYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcnJvciBpbiBzdG9yZUh0dHBPbmx5Q29va2llOiBcIisgZXJyb3JUaHJvd24pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTsgICAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFx0XHJcbn1cclxuIiwiaW1wb3J0IHsgZ2V0Q2FwdGNoYSB9IGZyb20gXCIuL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgVm90ZVNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcblx0XHR0aGlzLmRhdGEgPSB7fTtcclxuXHRcdHdpbmRvdy5kb1ZvdGUgPSAocGxhY2VJRCkgPT4gd2luZG93LnZvdGVTZXJ2aWNlLmRvVm90ZShwbGFjZUlEKTtcclxuICAgIH1cclxuXHJcbiAgICBmZXRjaE15Vm90ZXMoKSB7XHJcblx0XHRmZXRjaCgnL2FwcC9teXZvdGVzJyxcclxuXHRcdHtcclxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0Y2FjaGU6ICduby1jYWNoZSdcclxuXHRcdH0pXHJcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XHJcblx0XHRcdHJldHVybiByZXNwb25zZS5qc29uKClcclxuXHRcdH0pXHJcblx0XHQudGhlbihkYXRhID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJmZXRjaCBteSB2b3Rlc1wiKTtcclxuICAgICAgICAgICAgd2luZG93Lm15dm90ZXMgPSBkYXRhO1xyXG5cdFx0fSlcclxuXHRcdC5jYXRjaChlID0+IHtcclxuXHRcdFx0Y29uc29sZS5sb2coXCJwbG9ibGVtIGZldGNoaW5nIHZvdGVzIFwiICsgZSlcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZG9Wb3RlKHBsYWNlSUQpIHtcclxuXHRcdHdpbmRvdy5wbGFjZUlEID0gcGxhY2VJRDtcclxuXHRcdFx0XHRcclxuXHRcdHdpbmRvdy5mYWNlYm9va1NlcnZpY2UubG9naW5JZk5lZWRlZCgpXHJcblx0XHRcdC50aGVuKCgpID0+IHtcclxuXHRcdFx0XHRjb25zdCBidG5MaWtlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG5MaWtlXCIpO1xyXG5cdFx0XHRcdGxldCBkb1Vwdm90ZSA9IHRydWU7XHJcblx0XHRcdFx0aWYoYnRuTGlrZS5jbGFzc0xpc3QuY29udGFpbnMoJ2J0bi1zdWNjZXNzJykpIHtcclxuXHRcdFx0XHRcdGRvVXB2b3RlID0gZmFsc2U7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdGlmKGRvVXB2b3RlKSB7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1vdXRsaW5lLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHRcdGJ0bkxpa2UuY2xhc3NMaXN0LmFkZCgnYnRuLXN1Y2Nlc3MnKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0YnRuTGlrZS5jbGFzc0xpc3QuYWRkKCdidG4tb3V0bGluZS1zdWNjZXNzJyk7XHJcblx0XHRcdFx0XHRidG5MaWtlLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1zdWNjZXNzJyk7XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR3aW5kb3cudm90ZVNlcnZpY2Uudm90ZShcclxuXHRcdFx0XHRcdHdpbmRvdy5wbGFjZUlELFxyXG5cdFx0XHRcdFx0ZG9VcHZvdGUsXHJcblx0XHRcdFx0XHQoZGF0YSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRsZXQgdm90ZUNvdW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidm90ZUNvdW50XCIpO1xyXG5cdFx0XHRcdFx0XHRsZXQgdm90ZUNvdW50ID0gZGF0YS52b3RlcztcclxuXHRcdFx0XHRcdFx0aWYodm90ZUNvdW50IDwgMSkge1xyXG5cdFx0XHRcdFx0XHRcdHZvdGVDb3VudCA9IFwiXCI7XHJcblx0XHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdFx0dm90ZUNvdW50RWxlbWVudC5pbm5lckhUTUwgPSB2b3RlQ291bnQ7XHJcblx0XHRcdFx0XHRcdHdpbmRvdy5teXZvdGVzW3dpbmRvdy5wbGFjZUlEXSA9IGRvVXB2b3RlO1xyXG5cdFx0XHRcdFx0XHR3aW5kb3cudm90ZXNbd2luZG93LnBsYWNlSURdID0gZGF0YS52b3RlcztcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pID0+IHtcclxuXHRcdFx0XHRcdFx0YWxlcnQoXCJFcnJvciB3aGlsZSBzYXZpbmcgdm90ZTogXCIrIGVycm9yVGhyb3duKTtcclxuXHRcdFx0XHRcdH0pO1xyXG5cclxuXHRcdFx0fSk7XHJcblxyXG5cdH1cclxuXHJcblx0dm90ZShwbGFjZUlELCBpc1Vwdm90ZSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHRcclxuXHRcdGdldENhcHRjaGEoKS50aGVuKGNhcHRjaGEgPT4ge1x0XHRcclxuXHRcdFx0JC5hamF4KHtcclxuXHRcdFx0XHRcdHVybCA6IFwiL2FwcC92b3RlXCIsXHJcblx0XHRcdFx0XHR0eXBlOiBcIlBPU1RcIixcclxuXHRcdFx0XHRcdHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuXHRcdFx0XHRcdGNyb3NzRG9tYWluOiB0cnVlLFxyXG5cdFx0XHRcdFx0aGVhZGVyczogeyAneC1jYXB0Y2hhJzogY2FwdGNoYSB9LFxyXG5cdFx0XHRcdFx0ZGF0YTogXCJwbGFjZT1cIisgcGxhY2VJRCArIFwiJmlzVXB2b3RlPVwiICsgaXNVcHZvdGUsXHJcblx0XHRcdFx0XHRzdWNjZXNzOiAoZGF0YSkgPT4ge1xyXG5cdFx0XHRcdFx0XHRvblN1Y2Nlc3MoZGF0YSk7XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0ZXJyb3I6IG9uRXJyb3JcclxuXHRcdFx0XHR9KTtcclxuXHRcdH0pO1xyXG5cdFx0XHJcblxyXG5cdH1cclxuXHRcdFxyXG5cdHRvZ2dsZVZvdGVCdXR0b24oKSB7XHJcblx0XHQvKmxldCB2b3RlQ291bnRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2b3RlQ291bnRcIik7XHJcblx0XHR2b3RlQ291bnQgPSB2b3RlQ291bnRFbGVtZW50LmdldEF0dHJpYnV0ZShcInZvdGVDb3VudFwiKTtcclxuXHRcdGNvbnN0IHZvdGVDb3VudEludCA9IE51bWJlci5wYXJzZUludCh2b3RlQ291bnQpO1xyXG5cclxuXHRcdGlmKGlzVXB2b3RlKSB7XHJcblx0XHRcdHZvdGVDb3VudEVsZW1lbnQuaW5uZXJIVE1MID0gdm90ZUNvdW50SW50ICsgMTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHZvdGVDb3VudEVsZW1lbnQuaW5uZXJIVE1MID0gdm90ZUNvdW50SW50IC0gMTtcclxuXHRcdH0qL1xyXG5cclxuXHRcdGJ0bkxpa2UuY2xhc3NMaXN0LnRvZ2dsZSgnYnRuLW91dGxpbmUtc3VjY2VzcycpO1xyXG5cdFx0YnRuTGlrZS5jbGFzc0xpc3QudG9nZ2xlKCdidG4tc3VjY2VzcycpO1xyXG5cdH1cclxuXHJcblxyXG59IiwiaW1wb3J0IHsgc2hvd1NwaW5uZXIsIGhpZGVTcGlubmVyLCBzZXRDb29raWUsIGdldENvb2tpZSwgZ2V0Q2FwdGNoYSB9IGZyb20gJy4vdXRpbHMuanMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIEFkZFBsYWNlIHtcclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICAkKFwiI3VwbG9hZGltYWdlXCIpLmNoYW5nZShmdW5jdGlvbigpe1xyXG4gICAgICAgICAgICB3aW5kb3cuc2V0SW1nKHRoaXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgbGV0IHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZyhcInVoc25vdVwiKTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICB2YXIgbXlvYmogPSAkKCcjdXBsb2FkaW1hZ2UnKTtcclxuICAgICAgICBteW9iai5vbigna2V5dXAga2V5cHJlc3MgYmx1ciBjaGFuZ2UgaW5wdXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRDdXN0b21WYWxpZGl0eShcInRlc3RcIik7XHJcbiAgICAgICAgfSk7Ki9cclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNjaG9vc2UtbG9jYXRpb24tYnRuXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhhdC5zaG93Q3Jvc3NoYWlyKCk7XHJcbiAgICAgICAgICAgIHRoYXQuc2V0Q3VycmVudExvY2F0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICBcclxuICAgICAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3NlbGVjdC1sb2NhdGlvbi1idG5cIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGF0LmdldENyb3NzaGFpckxvY2F0aW9uKCk7XHJcbiAgICAgICAgICAgICQoJyNyZXBvcnQnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICB0aGF0LnJldHJpZXZlRW1haWxGcm9tQ29va2llKCk7XHJcbiAgICAgICAgICAgIHRoYXQuaGlkZUNyb3NzaGFpcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIjY2FuY2VsLWJ0blwiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoYXQuaGlkZUNyb3NzaGFpcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgXHJcbiAgICAgICAgJCgnI215Zm9ybScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHRoYXQuc3VibWl0Rm9ybShlKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdWJtaXRGb3JtKGUpIHtcclxuICAgICAgICBzaG93U3Bpbm5lcigpO1xyXG4gICAgICAgIHRoaXMuc3RvcmVFbWFpbEluQ29va2llKCk7XHJcbiAgICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoJCgnI215Zm9ybScpWzBdKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZ2V0Q2FwdGNoYSgpLnRoZW4oY2FwdGNoYSA9PiB7XHJcbiAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICB1cmwgOiAnL2FwcC91cGxvYWQnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogJ211bHRpcGFydC9mb3JtLWRhdGEnLFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7ICd4LWNhcHRjaGEnOiBjYXB0Y2hhIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxyXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWRlU3Bpbm5lcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KCBgUGFsZGllcyBwYXIgdmVsb3NsYXpkdSEgVmVsb3NsYXpkaSwga2FzIGlla8S8xatzIHZpZXRuZXMg4oCcVG9wxIHigJ0gdGlrcyBub3PFq3TEq3RpIFJEU0QuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEJhbHNvIHBhciB2ZWxvc2xhemRpZW0sIGl6dsSTbG90aWVzIHRvcyBrYXJ0xJMgdW4gYXV0b3JpesSTam90aWVzIGFyIEZhY2Vib29rLmApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoalhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgICAgICBoaWRlU3Bpbm5lcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiUMSBcmxpZWNpbmllcywgdmFpIGVzaSBwaWV2aWVub2ppcyB2ZWxvc2xhemRhbSBrYXRlZ29yaWp1IHVuIG5vc2F1a3VtdSFcIitcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCIgSmEgbmVpemRvZGFzIHBpZXZpZW5vdCBwdW5rdHUsIHJha3N0aSB1eiBpbmZvQGRhdHVza29sYS5sdlwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd0Nyb3NzaGFpcigpIHtcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29sb3ItY29kZXNcIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZC1ub25lXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb2xvci1jb2Rlcy1zdHJpcFwiKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXBvcnQtYnRuXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlcG9ydC1idG4tMlwiKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBjcm9zc2hhaXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyb3NzaGFpclwiKTtcclxuICAgICAgICBjcm9zc2hhaXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIHNlbGVjdExvY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3QtbG9jYXRpb24tYnRuXCIpO1xyXG4gICAgICAgIHNlbGVjdExvY2F0aW9uQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idG5cIik7XHJcbiAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHRoaXMuY2VudGVyQ3Jvc3NoYWlyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2VudGVyQ3Jvc3NoYWlyKCkge1xyXG4gICAgICAgIHZhciBtYXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1haW5cIik7XHJcbiAgICAgICAgdmFyIHR1cnBpbmF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib3gxXCIpO1xyXG4gICAgICAgIHZhciB0b3BSb3cgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvcC1yb3dcIik7XHJcblxyXG4gICAgICAgIHZhciB0b3AgPSBtYXAub2Zmc2V0VG9wO1xyXG4gICAgICAgIHZhciBsZWZ0ID0gbWFwLm9mZnNldExlZnQ7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IHR1cnBpbmF0Lm9mZnNldFRvcCAtIHRvcFJvdy5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gbWFwLm9mZnNldFdpZHRoO1xyXG5cclxuICAgICAgICB2YXIgeCA9IGxlZnQgKyAod2lkdGggLyAyKSAtIDIwO1xyXG4gICAgICAgIHZhciB5ID0gdG9wICsgKGhlaWdodCAvIDIpIC0gMjA7XHJcblxyXG4gICAgICAgIHZhciBjcm9zc2hhaXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyb3NzaGFpclwiKTtcclxuICAgICAgICBjcm9zc2hhaXIuc3R5bGUubGVmdCA9IHggKyBcInB4XCI7XHJcbiAgICAgICAgY3Jvc3NoYWlyLnN0eWxlLnRvcCA9IHkgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q3Jvc3NoYWlyTG9jYXRpb24oKSB7XHRcclxuICAgICAgICB2YXIgdG9wUm93SGVpZ2h0ID0gJCgnI3RvcC1yb3cnKS5oZWlnaHQoKTtcclxuICAgICAgICB2YXIgY3Jvc3NoYWlyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHBvaW50ID0gTC5wb2ludCggY3Jvc3NoYWlyLm9mZnNldExlZnQgKyAyMCwgY3Jvc3NoYWlyLm9mZnNldFRvcCAtIHRvcFJvd0hlaWdodCApO1xyXG4gICAgICAgIGNvbnN0IGxhdGxvbiA9IHdpbmRvdy5teW1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50KTtcclxuICAgICAgICBcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxhdFwiKS52YWx1ZSA9IGxhdGxvbi5sYXQ7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb25cIikudmFsdWUgPSBsYXRsb24ubG5nO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVDcm9zc2hhaXIoKSB7ICAgICAgICBcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29sb3ItY29kZXNcIik7XHJcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZC1ub25lXCIpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb2xvci1jb2Rlcy1zdHJpcFwiKTtcclxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXBvcnQtYnRuXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVwb3J0LWJ0bi0yXCIpO1xyXG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImQtbm9uZVwiKTtcclxuXHJcbiAgICAgICAgdmFyIGVsZW1lbnQyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcm9zc2hhaXJcIik7XHJcbiAgICAgICAgZWxlbWVudDIuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdmFyIHNlbGVjdExvY2F0aW9uQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzZWxlY3QtbG9jYXRpb24tYnRuXCIpO1xyXG4gICAgICAgIHNlbGVjdExvY2F0aW9uQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcblxyXG4gICAgICAgIHZhciBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idG5cIik7XHJcbiAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJkLW5vbmVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q3VycmVudExvY2F0aW9uKCkge1xyXG4gICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oXHJcbiAgICAgICAgICAgIHBvcyA9PiAge1x0XHRcdFx0XHRcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhdCA9IHBvcy5jb29yZHMubGF0aXR1ZGU7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBsb24gPSBwb3MuY29vcmRzLmxvbmdpdHVkZTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgd2luZG93Lm15bWFwLnNldFZpZXcoW2xhdCwgbG9uXSwgd2luZG93Lm15bWFwLmdldFpvb20oKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXRyaWV2ZUVtYWlsRnJvbUNvb2tpZSgpIHtcclxuICAgICAgICBsZXQgZW1haWxFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbWFpbFwiKTtcclxuICAgICAgICBsZXQgZW1haWwgPSBnZXRDb29raWUoXCJlbWFpbFwiKTtcclxuICAgICAgICBpZihlbWFpbCAmJiBlbWFpbC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGVtYWlsRWxlbWVudC52YWx1ZSA9IGVtYWlsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RvcmVFbWFpbEluQ29va2llKCkge1xyXG4gICAgICAgIGxldCBlbWFpbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW1haWxcIik7XHJcbiAgICAgICAgc2V0Q29va2llKFwiZW1haWxcIiwgZW1haWwudmFsdWUsIDMsIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBpbmNsdWRlSHRtbCB9IGZyb20gJy4vdXRpbHMuanMnO1xuaW1wb3J0IHsgRmFjZWJvb2tTZXJ2aWNlIH0gZnJvbSAnLi9mYWNlYm9va1NlcnZpY2UuanMnO1xuaW1wb3J0IHsgVm90ZVNlcnZpY2UgfSBmcm9tICcuL3ZvdGVTZXJ2aWNlLmpzJztcbmltcG9ydCB7IHNldENvb2tpZSwgZ2V0Q29va2llLCBmaW5kR2V0UGFyYW1ldGVyIH0gZnJvbSAnLi91dGlscy5qcyc7XG5pbXBvcnQgeyBBZGRQbGFjZSB9IGZyb20gJy4vYWRkUGxhY2UuanMnO1xuXHRcbmZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cblx0d2luZG93Lm15bWFwID0gTC5tYXAoXG5cdCAnbWFwaWQnLFxuXHRcdHsgem9vbUNvbnRyb2w6IGZhbHNlLFxuXHRcdFx0Y2xvc2VQb3B1cE9uQ2xpY2s6IGZhbHNlIH1cblx0KS5zZXRWaWV3KFs1Ni45NTEyNTksIDI0LjExMjYxNF0sIDEzKTtcblxuXHRMLmNvbnRyb2wuem9vbSh7XG4gcG9zaXRpb246J2JvdHRvbWxlZnQnXG4gfSkuYWRkVG8od2luZG93Lm15bWFwKTtcblxuXHRjb25zdCBsYXllciA9IEwudGlsZUxheWVyKCdodHRwczovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZycsIHtcblx0XHRtYXhab29tOiAxOCxcblx0XHRhdHRyaWJ1dGlvbjogJyZjb3B5OyA8YSBocmVmPVwiaHR0cHM6Ly93d3cub3BlbnN0cmVldG1hcC5vcmcvY29weXJpZ2h0XCI+T3BlblN0cmVldE1hcDwvYT4gY29udHJpYnV0b3JzJ1xuXHR9KS5hZGRUbyh3aW5kb3cubXltYXApO1xuXG5cdHdpbmRvdy5ncm91cCA9IEwubWFya2VyQ2x1c3Rlckdyb3VwKHtcblx0XHRjaHVua2VkTG9hZGluZzogdHJ1ZSxcblx0XHQvL2Rpc2FibGVDbHVzdGVyaW5nQXRab29tOiAxNyxcblx0XHRzcGlkZXJmeU9uTWF4Wm9vbTogdHJ1ZVxuXHQgfSk7XG5cblx0ZmV0Y2goJy9hcHAvcGxhY2VzJylcblx0XHQudGhlbihyZXNwb25zZSA9PiB7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuanNvbigpXG5cdFx0fSlcblx0XHQudGhlbihkYXRhID0+IHtcblx0XHRcdHdpbmRvdy52b3RlcyA9IGRhdGEudm90ZXM7XG5cdFx0XHR3aW5kb3cucGxhY2VzID0gZGF0YS5wbGFjZXM7XG5cdFx0XHRsZXQgcGxhY2VzID0gZGF0YS5wbGFjZXM7XG5cdFx0XHRcdFx0XHRcblx0XHRcdGNvbnN0IGljb25zID0gW107XG5cblx0XHRcdGxldCBpY29uU2l6ZSA9IFs5MSwgOTldOyAvLyBzaXplIG9mIHRoZSBpY29uXG5cdFx0XHRsZXQgaWNvbkFuY2hvciA9IFs0NSwgNzVdOyAvLyBwb2ludCBvZiB0aGUgaWNvbiB3aGljaCB3aWxsIGNvcnJlc3BvbmQgdG8gbWFya2VyJ3MgbG9jYXRpb25cblx0XHRcdGxldCBwb3B1cEFuY2hvciA9IFstMywgLTc2XTsgLy8gcG9pbnQgZnJvbSB3aGljaCB0aGUgcG9wdXAgc2hvdWxkIG9wZW4gcmVsYXRpdmUgdG8gdGhlIGljb25BbmNob3JcblxuXHRcdFx0aWNvbnNbMV0gPSBMLmljb24oe1xuIGljb25Vcmw6ICdpbWFnZXMvbG9jYXRpb24ucG5nJyxcbiBpY29uU2l6ZTogaWNvblNpemUsXG4gaWNvbkFuY2hvcjogaWNvbkFuY2hvcixcbiBwb3B1cEFuY2hvcjogcG9wdXBBbmNob3Jcblx0XHRcdH0pO1xuXHRcdFx0aWNvbnNbMl0gPSBMLmljb24oe1xuIGljb25Vcmw6ICdpbWFnZXMvbG9jYXRpb24yLnBuZycsXG4gaWNvblNpemU6IGljb25TaXplLFxuIGljb25BbmNob3I6IGljb25BbmNob3IsXG4gcG9wdXBBbmNob3I6IHBvcHVwQW5jaG9yXG5cdFx0XHR9KTtcblx0XHRcdGljb25zWzNdID0gTC5pY29uKHtcbiBpY29uVXJsOiAnaW1hZ2VzL2xvY2F0aW9uMy5wbmcnLFxuIGljb25TaXplOiBpY29uU2l6ZSxcbiBpY29uQW5jaG9yOiBpY29uQW5jaG9yLFxuIHBvcHVwQW5jaG9yOiBwb3B1cEFuY2hvclxuXHRcdFx0fSk7XG5cdFx0XHRpY29uc1s0XSA9IEwuaWNvbih7XG4gaWNvblVybDogJ2ltYWdlcy9sb2NhdGlvbjQucG5nJyxcbiBpY29uU2l6ZTogaWNvblNpemUsXG4gaWNvbkFuY2hvcjogaWNvbkFuY2hvcixcbiBwb3B1cEFuY2hvcjogcG9wdXBBbmNob3Jcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgb3BlblBsYWNlSWQgPSBnZXRDb29raWUoXCJwbGFjZUlkXCIpO1xuXHRcdFx0c2V0Q29va2llKFwicGxhY2VJZFwiLCBudWxsLCAxLCBmYWxzZSk7XG5cblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBwbGFjZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bGV0IHBsYWNlSWQgPSBwbGFjZXNbaV0uaWQ7XHRcdFx0XHRcblxuXHRcdFx0XHR2YXIgbWFya2VyID0gTC5tYXJrZXIoXG5cdFx0XHRcdFx0W3BsYWNlc1tpXS5sYXQsIHBsYWNlc1tpXS5sb25dLCBcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpY29uOiBpY29uc1twbGFjZXNbaV0ucGxhY2VUeXBlXSwgXG5cdFx0XHRcdFx0XHRwbGFjZTogcGxhY2VzW2ldXG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0bWFya2VyLmJpbmRQb3B1cCggY29udGV4dCA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgcGxhY2UgPSBjb250ZXh0Lm9wdGlvbnMucGxhY2U7XG5cdFx0XHRcdFx0bGV0IHZvdGVDb3VudCA9IHdpbmRvdy52b3Rlc1twbGFjZS5pZF07XG5cdFx0XHRcdFx0aWYoIXZvdGVDb3VudCkge1xuXHRcdFx0XHRcdFx0dm90ZUNvdW50ID0gXCJcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bGV0IGlzVXB2b3RlID0gbnVsbDtcblx0XHRcdFx0XHRpZih3aW5kb3cubXl2b3Rlcykge1xuXHRcdFx0XHRcdFx0aXNVcHZvdGUgPSB3aW5kb3cubXl2b3Rlc1twbGFjZS5pZF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGxldCB1cHZvdGVDbGFzcztcblx0XHRcdFx0XHRpZihpc1Vwdm90ZSkge1xuXHRcdFx0XHRcdFx0dXB2b3RlQ2xhc3MgPSBcImJ0bi1zdWNjZXNzXCI7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHVwdm90ZUNsYXNzID0gXCJidG4tb3V0bGluZS1zdWNjZXNzXCI7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IGltZ1NyYyA9IFwiL2ltYWdlcy9ub2ltYWdlLnBuZ1wiO1xuXHRcdFx0XHRcdGxldCBpbWdDbGFzcyA9IFwicG9wdXAtbm9pbWFnZVwiO1xuXHRcdFx0XHRcdGlmKHBsYWNlLmltZyAmJiBwbGFjZS5pbWcubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0aW1nU3JjID0gXCIvYXBwL2ZpbGVzL1wiICsgcGxhY2UuaW1nO1xuXHRcdFx0XHRcdFx0aW1nQ2xhc3MgPSBcInBvcHVwLWltYWdlXCI7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c2V0Q29va2llKFwicGxhY2VJZFwiLCBwbGFjZS5pZCwgMSwgZmFsc2UpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHJldHVybiBgPGRpdiBpZD0ncG9wdXAnIGNsYXNzPSdteWNvbnRhaW5lcic+XG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1sZWZ0Jz5cblx0XHRcdFx0XHRcdFx0XHRcdDxpbWcgaWQ9J3NtYWxsLWltYWdlJyBzcmM9JyR7aW1nU3JjfScgY2xhc3M9JyR7aW1nQ2xhc3N9Jy8+IFxuXHRcdFx0XHRcdFx0XHRcdFx0PGltZyBpZD0nc21hbGwtem9vbS1pbicgc3JjPVwiL2ltYWdlcy96b29tLWluLnBuZ1wiID5cblx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj5cblxuXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9J2dyaWRib3gtbGVmdCc+XG5cdFx0XHRcdFx0XHRcdFx0XHQke3BsYWNlLmRlc2NyaXB0aW9ufTwvZGl2PlxuXG5cdFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz0nZ3JpZGJveC1yaWdodCc+XG5cdFx0XHRcdFx0XHRcdFx0XHRCYWxzb3Rcblx0XHRcdFx0XHRcdFx0XHRcdDxidXR0b24gdHlwZT0nYnV0dG9uJyBpZD0nYnRuTGlrZScgY2xhc3M9J2J0biAke3Vwdm90ZUNsYXNzfSdcblx0XHRcdFx0XHRcdFx0XHRcdFx0b25jbGljaz0nZG9Wb3RlKCR7cGxhY2UuaWR9KSc+8J+RjSA8ZGl2IGlkPVwidm90ZUNvdW50XCI+JHt2b3RlQ291bnR9PC9kaXY+PC9idXR0b24+XG4gXHRcdDwvZGl2PmA7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRcblx0XHRcdFx0d2luZG93Lmdyb3VwLmFkZExheWVyKG1hcmtlcik7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZih3aW5kb3cuaXNSZWRpcmVjdEZyb21GQiAmJiBwbGFjZUlkICYmIHBsYWNlSWQgPT0gb3BlblBsYWNlSWQpIHtcblx0XHRcdFx0XHR3aW5kb3cubWFya2VyUG91cHVwID0gbWFya2VyO1xuXHRcdFx0XHRcdHdpbmRvdy5sYXQgPSBwbGFjZXNbaV0ubGF0O1xuXHRcdFx0XHRcdHdpbmRvdy5sb24gPSBwbGFjZXNbaV0ubG9uO1xuXHRcdFx0XHR9XG5cdFx0XHR9XHRcdFx0XG5cdFx0XHR3aW5kb3cubXltYXAuYWRkTGF5ZXIod2luZG93Lmdyb3VwKTtcblx0XHRcdFxuXHRcdFx0aWYod2luZG93Lm1hcmtlclBvdXB1cCkge1xuXHRcdFx0XHR3aW5kb3cubWFya2VyUG91cHVwLm9wZW5Qb3B1cCgpO1xuXHRcdFx0XHR3aW5kb3cubXltYXAuc2V0Vmlldyhbd2luZG93LmxhdCwgd2luZG93Lmxvbl0sIDEzKTtcblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgbnVsbCwgJy8nKTtcblx0XHRcdFx0d2luZG93LmxvZ2luQ2FsbGJhY2sgPSAoKSA9PiB7XG5cdFx0XHRcdFx0d2luZG93LnZvdGVTZXJ2aWNlLmRvVm90ZShvcGVuUGxhY2VJZCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHdpbmRvdy5mYWNlYm9va1NlcnZpY2Uub25Mb2dpbigpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKGVyciA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhcImUyIFwiKyBlcnIpO1xuXHRcdH0pO1xufVxuXG5cbmZ1bmN0aW9uIHNldEltZyhpbnB1dCkge1xuXHRpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcblx0XHR2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblx0XHRcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcblx0XHRcdCQoJyNpbWctdXBsb2FkJykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcblx0XHR9XG5cdFx0XG5cdFx0cmVhZGVyLnJlYWRBc0RhdGFVUkwoaW5wdXQuZmlsZXNbMF0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHNob3dWb3RlVG9wKCkge1xuXG5cdCQoJyN2b3RlLXRvcCcpLm1vZGFsKCdzaG93Jyk7XG5cdFxuXHRmZXRjaCgnL2FwcC90b3AnLFxuXHRcdHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRjYWNoZTogJ25vLWNhY2hlJ1xuXHRcdH0pXG5cdFx0LnRoZW4ocmVzcG9uc2UgPT4ge1xuXHRcdFx0cmV0dXJuIHJlc3BvbnNlLmpzb24oKVxuXHRcdH0pXG5cdFx0LnRoZW4oZGF0YSA9PiB7XG5cblx0XHRcdGxldCB0aXRsZXMgPSBbXG5cdFx0XHRcdFwixaBhdXLEq2JhIC8gbmVwxIFycmVkemFtxKtiYVwiLFxuXHRcdFx0XHRcIlN0cmF1amkgcGFncmllemllbmlcIixcblx0XHRcdFx0XCJTZWd1bXMgKGJlZHJlcywgYsSrc3RhbWFzIGFwbWFsZXMpXCIsXG5cdFx0XHRcdFwiQ2l0c1wiXG5cdFx0XHQgXTtcblx0XHRcdGxldCBjb250ZW50RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wLWNvbnRlbnRcIik7XG5cdFx0XHRsZXQgcmVzdWx0ID0gXCJcIjtcblxuXHRcdFx0Zm9yKGxldCB0eXBlID0gMTsgdHlwZSA8PSA0OyB0eXBlKyspIHtcblx0XHRcdFx0bGV0IGlkeCA9IHR5cGUgLSAxO1xuXG5cdFx0XHRcdGlmKCFkYXRhIHx8ICFkYXRhW2lkeF0pIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0bGV0IHRvcDMgPSBcIlwiO1xuXHRcdFx0XHRmb3IobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0bGV0IHRvcFBsYWNlID0gZGF0YVtpZHhdW2ldO1xuXHRcdFx0XHRcdGlmKCF0b3BQbGFjZSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IHBsYWNlcyA9IHdpbmRvdy5wbGFjZXM7XG5cdFx0XHRcdFx0bGV0IGlkID0gdG9wUGxhY2VbMF07XG5cdFx0XHRcdFx0bGV0IHZvdGVDb3VudCA9IHRvcFBsYWNlWzFdO1xuXHRcdFx0XHRcdGxldCBwbGFjZSA9IG51bGw7XG5cdFx0XHRcdFx0Zm9yKGxldCBqID0gMDsgaiA8IHBsYWNlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0aWYocGxhY2VzW2pdLmlkID09XHQgaWQpIHtcblx0XHRcdFx0XHRcdFx0cGxhY2UgPSBwbGFjZXNbal07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoIXBsYWNlKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRsZXQgaW1nU3JjID0gXCIvaW1hZ2VzL25vaW1hZ2UucG5nXCI7XG5cdFx0XHRcdFx0bGV0IGZ1bGxJbWdTcmMgPSBcIlwiO1xuXHRcdFx0XHRcdGlmKHBsYWNlLmltZyAmJiBwbGFjZS5pbWcubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0aW1nU3JjID0gXCIvYXBwL2ZpbGVzLzJcIiArIHBsYWNlLmltZztcblx0XHRcdFx0XHRcdGZ1bGxJbWdTcmMgPSBcIi9hcHAvZmlsZXMvXCIgKyBwbGFjZS5pbWc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHRvcDMgKz0gYDxkaXYgY2xhc3M9XCJ0b3AtaXRlbVwiPlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRvcC1pbWFnZS1ib3hcIj5cblx0XHRcdFx0XHRcdFx0PGltZyBjbGFzcz1cInRvcC1pbWFnZVwiIHNyYz0nJHtpbWdTcmN9JyBmdWxsLXNyYz0nJHtmdWxsSW1nU3JjfScgLz5cblx0XHRcdFx0XHRcdDwvZGl2Plx0XHRcblx0XHRcdFx0XHRcdDxpbWcgaWQ9XCJ0b3Atem9vbS1pblwiIHNyYz1cIi9pbWFnZXMvem9vbS1pbi5wbmdcIiA+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidG9wLXZvdGUtY291bnRcIj7wn5GNJm5ic3A7JHt2b3RlQ291bnR9PC9kaXY+XHRcdFxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRvcC1udW1iZXJcIj4ke2kgKyAxfTwvZGl2PlxuXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInRvcC10ZXh0XCI+JHtwbGFjZS5kZXNjcmlwdGlvbn08L2Rpdj5cblx0XHRcdFx0XHQ8L2Rpdj5gO1xuXHRcdFx0XHR9XHRcdFx0XHRcblxuXHRcdFx0XHRpZih0b3AzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRyZXN1bHQgKz0gXG5cdFx0XHRcdFx0XHRgPGRpdiBjbGFzcz1cInZvdGUtdG9wLXRpdGxlIGNvbG9yLSR7dHlwZX1cIj4ke3R5cGV9LSAke3RpdGxlc1tpZHhdfVxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwidm90ZS10b3Atcm93XCIgaWQ9XCJ0eXBlJHt0eXBlfVwiPlxuXHRcdFx0XHRcdFx0XHQke3RvcDN9XG5cdFx0XHRcdFx0XHQ8L2Rpdj5gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0Y29udGVudEVsZW1lbnQuaW5uZXJIVE1MID0gcmVzdWx0O1xuXHRcdH0pXG5cdFx0LmNhdGNoKGUgPT4gY29uc29sZS5sb2coXCJlMVwiKyBlKSk7XG59XG5cbiQod2luZG93KS5vbihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gaW5jbHVkZUh0bWwoJ3B1YmxpYy9zdGFydC5kMDJjMmRjMmUzMjU3YmNjN2Q0ZGMxZTQxZGMwOTYzZi5odG1sJywgJ3N0YXJ0Jyk7XG5cdGluY2x1ZGVIdG1sKCdwdWJsaWMvY2hvb3NlLXBsYWNlLjRjMGZjOGYwNmNhNjc0Zjg3NDNhNjU0NzNmOWM5ZjZmLmh0bWwnLCAnY2hvb3NlLXBsYWNlJyk7XG5cdGluY2x1ZGVIdG1sKCdwdWJsaWMvcmVwb3J0LmNkNTE3N2Y1NjE2MTEwMTliZTIzN2IyNGJmNzcyMjE5Lmh0bWwnLCAncmVwb3J0Jyk7XG5cdGluY2x1ZGVIdG1sKCdwdWJsaWMvdm90ZS10b3AuMmY5NGE0YjNiYTY0OWY2YzJlOWE3NDA4Mjg3MmQ5NjAuaHRtbCcsICd2b3RlLXRvcCcpO1xuXHRpbmNsdWRlSHRtbCgncHVibGljL2Fib3V0LXVzLmE4N2IyYmZiNzZkZDgxZjJiNTI4OGVlYmIyY2Q0YzczLmh0bWwnLCAnYWJvdXQtdXMnKTtcblx0aW5jbHVkZUh0bWwoJ3B1YmxpYy9iaWctaW1hZ2UuOWY4NWI5NjdiMTdlYWExNmEyNmFlYzQ3NWE3MzBiZDQuaHRtbCcsICdiaWctaW1hZ2UtYm94Jyk7XG5cdFxuXHRsZXQgdmlzaXRlZCA9IGdldENvb2tpZShcInZpc2l0ZWRcIik7XG5cdGlmKCF2aXNpdGVkKSB7XG5cdFx0JCgnI3N0YXJ0JykubW9kYWwoJ3Nob3cnKTtcblx0XHRzZXRDb29raWUoXCJ2aXNpdGVkXCIsIHRydWUsIDM2NSk7XG5cdH1cdFxuXHRcblx0bGV0IHVybCA9IGxvY2F0aW9uLnRvU3RyaW5nKCkuc3BsaXQoXCI/XCIpWzFdO1xuXHRpZih1cmwpIHtcblx0XHR3aW5kb3cuaXNSZWRpcmVjdEZyb21GQiA9IHVybFxuXHRcdFx0XHQuc3Vic3RyaW5nKDEpXG5cdFx0XHRcdC5zcGxpdChcIiZcIilcblx0XHRcdFx0Lm1hcChwYXJhbWV0ZXIgPT4gcGFyYW1ldGVyLnNwbGl0KFwiPVwiKSlcblx0XHRcdFx0LmZpbHRlcihwYXJhbWV0ZXJWYWx1ZSA9PiBwYXJhbWV0ZXJWYWx1ZVswXSA9PSBcImRhdGFfYWNjZXNzX2V4cGlyYXRpb25fdGltZVwiKVxuXHRcdFx0XHQucmVkdWNlKGFjY3VtdWxhdG9yID0+IGFjY3VtdWxhdG9yICsgMSwgMCk7XG5cdFx0Y29uc29sZS5sb2coYGlzUmVkaXJlY3RGcm9tRkIgJHtpc1JlZGlyZWN0RnJvbUZCfWApO1xuXHR9XG5cblx0aW5pdE1hcCgpO1xuXG5cdHdpbmRvdy5zZXRJbWcgPSBzZXRJbWc7XG5cdHdpbmRvdy5zaG93Vm90ZVRvcCA9IHNob3dWb3RlVG9wO1xuXHR3aW5kb3cudm90ZVNlcnZpY2UgPSBuZXcgVm90ZVNlcnZpY2UoKTtcblx0d2luZG93LmZhY2Vib29rU2VydmljZSA9IG5ldyBGYWNlYm9va1NlcnZpY2UoKTtcblxuXHR3aW5kb3cuc2hvd0JpZ0ltYWdlID0gaW1hZ2VTcmMgPT4ge1xuXHRcdGlmKGltYWdlU3JjLmxlbmd0aCA9PSAwIHx8IGltYWdlU3JjID09IFwiL2ltYWdlcy9ub2ltYWdlLnBuZ1wiKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGxldCBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJiaWctaW1hZ2Utc3JjXCIpO1xuXHRcdGVsZW0uc2V0QXR0cmlidXRlKFwic3JjXCIsIGltYWdlU3JjKVxuXHRcdCQoJyNiaWctaW1hZ2UtYm94JykubW9kYWwoJ3Nob3cnKTtcblx0fTtcblxuXHRsZXQgYWRkUGxhY2UgPSBuZXcgQWRkUGxhY2UoKTtcblxuXHQkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3NtYWxsLWltYWdlXCIsICgpID0+IHtcblx0XHRsZXQgaW1hZ2VTcmMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNtYWxsLWltYWdlXCIpLmdldEF0dHJpYnV0ZShcInNyY1wiKTtcblx0XHR3aW5kb3cuc2hvd0JpZ0ltYWdlKGltYWdlU3JjKTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIiNzbWFsbC16b29tLWluXCIsICgpID0+IHtcblx0XHRsZXQgaW1hZ2VTcmMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInNtYWxsLWltYWdlXCIpLmdldEF0dHJpYnV0ZShcInNyY1wiKTtcblx0XHR3aW5kb3cuc2hvd0JpZ0ltYWdlKGltYWdlU3JjKTtcblx0fSk7XG5cblx0JChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi50b3AtaW1hZ2VcIiwgZSA9PiB7XG5cdFx0bGV0IHNyYyA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcImZ1bGwtc3JjXCIpO1xuXHRcdHdpbmRvdy5zaG93QmlnSW1hZ2Uoc3JjKTtcblx0fSk7XG5cdFxuXHQkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiI3RvcC16b29tLWluXCIsIGUgPT4ge1xuXHRcdGxldCBzcmMgPSBlLnRhcmdldC5wYXJlbnROb2RlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJ0b3AtaW1hZ2VcIilbMF0uZ2V0QXR0cmlidXRlKFwiZnVsbC1zcmNcIik7XG5cdFx0d2luZG93LnNob3dCaWdJbWFnZShzcmMpO1xuXHR9KTtcblx0XG59KTtcbiJdLCJuYW1lcyI6WyJpbmNsdWRlSHRtbCIsInVybCIsImlkIiwieGhyIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInN0YXR1cyIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJpbm5lckhUTUwiLCJyZXNwb25zZVRleHQiLCJzZW5kIiwic2V0Q29va2llIiwibmFtZSIsInZhbHVlIiwiZGF5cyIsImlzU2VjdXJlIiwiZXhwaXJlcyIsImRhdGUiLCJEYXRlIiwic2V0VGltZSIsImdldFRpbWUiLCJ0b1VUQ1N0cmluZyIsInNlY3VyZSIsImNvb2tpZSIsImdldENvb2tpZSIsIm5hbWVFUSIsImNhIiwic3BsaXQiLCJpIiwibGVuZ3RoIiwiYyIsImNoYXJBdCIsInN1YnN0cmluZyIsImluZGV4T2YiLCJoaWRlU3Bpbm5lciIsInN0eWxlIiwiZGlzcGxheSIsInNob3dTcGlubmVyIiwiZ2V0Q2FwdGNoYSIsIlByb21pc2UiLCJyZXNvbHV0aW9uRnVuYyIsInJlamVjdGlvbkZ1bmMiLCJncmVjYXB0Y2hhIiwicmVhZHkiLCJleGVjdXRlIiwiYWN0aW9uIiwidGhlbiIsInRva2VuIiwiRmFjZWJvb2tTZXJ2aWNlIiwiYWZ0ZXJGQkluaXQiLCJpbml0Iiwid2luZG93IiwibG9naW5mdW4iLCJ1cmkiLCJlbmNvZGVVUkkiLCJsb2NhdGlvbiIsInByb3RvY29sIiwiaG9zdCIsInN0b3JlSHR0cE9ubHlDb29raWUiLCJmYWNlYm9va1NlcnZpY2UiLCJmYkFzeW5jSW5pdCIsIkZCIiwiYXBwSWQiLCJ4ZmJtbCIsInZlcnNpb24iLCJBcHBFdmVudHMiLCJsb2dQYWdlVmlldyIsIkV2ZW50Iiwic3Vic2NyaWJlIiwicmVzcG9uc2UiLCJjb25zb2xlIiwibG9nIiwib25Mb2dpbiIsImQiLCJzIiwianMiLCJmanMiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImNyZWF0ZUVsZW1lbnQiLCJzcmMiLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwiY2hlY2tGQkxvZ2luU3RhdHVzIiwidm90ZVNlcnZpY2UiLCJmZXRjaE15Vm90ZXMiLCJsb2dpbkNhbGxiYWNrIiwiY2F0Y2giLCJlIiwiJCIsIm1vZGFsIiwib25Mb2dnZWRJbiIsIm9uTm90TG9nZ2VkSW4iLCJnZXRMb2dpblN0YXR1cyIsImF1dGhSZXNwb25zZSIsImFjY2Vzc1Rva2VuIiwiYWpheCIsInR5cGUiLCJwcm9jZXNzRGF0YSIsImNyb3NzRG9tYWluIiwiaGVhZGVycyIsImRhdGEiLCJzdWNjZXNzIiwiZXJyb3IiLCJqWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwiVm90ZVNlcnZpY2UiLCJkb1ZvdGUiLCJwbGFjZUlEIiwiZmV0Y2giLCJtZXRob2QiLCJjYWNoZSIsImpzb24iLCJteXZvdGVzIiwibG9naW5JZk5lZWRlZCIsImJ0bkxpa2UiLCJkb1Vwdm90ZSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicmVtb3ZlIiwiYWRkIiwidm90ZSIsInZvdGVDb3VudEVsZW1lbnQiLCJ2b3RlQ291bnQiLCJ2b3RlcyIsImFsZXJ0IiwiaXNVcHZvdGUiLCJvblN1Y2Nlc3MiLCJvbkVycm9yIiwiY2FwdGNoYSIsInRvZ2dsZSIsIkFkZFBsYWNlIiwiY2hhbmdlIiwic2V0SW1nIiwidGhhdCIsIm9uIiwic2hvd0Nyb3NzaGFpciIsInNldEN1cnJlbnRMb2NhdGlvbiIsImdldENyb3NzaGFpckxvY2F0aW9uIiwicmV0cmlldmVFbWFpbEZyb21Db29raWUiLCJoaWRlQ3Jvc3NoYWlyIiwic3VibWl0Rm9ybSIsInN0b3JlRW1haWxJbkNvb2tpZSIsIkZvcm1EYXRhIiwicHJldmVudERlZmF1bHQiLCJjb250ZW50VHlwZSIsInJlbG9hZCIsImVsZW1lbnQiLCJjcm9zc2hhaXIiLCJzZWxlY3RMb2NhdGlvbkJ1dHRvbiIsImNhbmNlbEJ1dHRvbiIsImNlbnRlckNyb3NzaGFpciIsIm1hcCIsInR1cnBpbmF0IiwidG9wUm93IiwidG9wIiwib2Zmc2V0VG9wIiwibGVmdCIsIm9mZnNldExlZnQiLCJoZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJ3aWR0aCIsIm9mZnNldFdpZHRoIiwieCIsInkiLCJ0b3BSb3dIZWlnaHQiLCJwb2ludCIsIkwiLCJsYXRsb24iLCJteW1hcCIsImNvbnRhaW5lclBvaW50VG9MYXRMbmciLCJsYXQiLCJsbmciLCJlbGVtZW50MiIsIm5hdmlnYXRvciIsImdlb2xvY2F0aW9uIiwiZ2V0Q3VycmVudFBvc2l0aW9uIiwicG9zIiwiY29vcmRzIiwibGF0aXR1ZGUiLCJsb24iLCJsb25naXR1ZGUiLCJzZXRWaWV3IiwiZ2V0Wm9vbSIsImVtYWlsRWxlbWVudCIsImVtYWlsIiwiaW5pdE1hcCIsInpvb21Db250cm9sIiwiY2xvc2VQb3B1cE9uQ2xpY2siLCJjb250cm9sIiwiem9vbSIsInBvc2l0aW9uIiwiYWRkVG8iLCJsYXllciIsInRpbGVMYXllciIsIm1heFpvb20iLCJhdHRyaWJ1dGlvbiIsImdyb3VwIiwibWFya2VyQ2x1c3Rlckdyb3VwIiwiY2h1bmtlZExvYWRpbmciLCJzcGlkZXJmeU9uTWF4Wm9vbSIsInBsYWNlcyIsImljb25zIiwiaWNvblNpemUiLCJpY29uQW5jaG9yIiwicG9wdXBBbmNob3IiLCJpY29uIiwiaWNvblVybCIsIm9wZW5QbGFjZUlkIiwicGxhY2VJZCIsIm1hcmtlciIsInBsYWNlVHlwZSIsInBsYWNlIiwiYmluZFBvcHVwIiwiY29udGV4dCIsIm9wdGlvbnMiLCJ1cHZvdGVDbGFzcyIsImltZ1NyYyIsImltZ0NsYXNzIiwiaW1nIiwiZGVzY3JpcHRpb24iLCJhZGRMYXllciIsImlzUmVkaXJlY3RGcm9tRkIiLCJtYXJrZXJQb3VwdXAiLCJvcGVuUG9wdXAiLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwiZXJyIiwiaW5wdXQiLCJmaWxlcyIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJhdHRyIiwidGFyZ2V0IiwicmVzdWx0IiwicmVhZEFzRGF0YVVSTCIsInNob3dWb3RlVG9wIiwidGl0bGVzIiwiY29udGVudEVsZW1lbnQiLCJpZHgiLCJ0b3AzIiwidG9wUGxhY2UiLCJqIiwiZnVsbEltZ1NyYyIsInZpc2l0ZWQiLCJ0b1N0cmluZyIsInBhcmFtZXRlciIsImZpbHRlciIsInBhcmFtZXRlclZhbHVlIiwicmVkdWNlIiwiYWNjdW11bGF0b3IiLCJzaG93QmlnSW1hZ2UiLCJpbWFnZVNyYyIsImVsZW0iLCJzZXRBdHRyaWJ1dGUiLCJhZGRQbGFjZSIsImdldEF0dHJpYnV0ZSIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiXSwibWFwcGluZ3MiOiI7OztDQUNPLFNBQVNBLFdBQVQsQ0FBcUJDLEdBQXJCLEVBQTBCQyxFQUExQixFQUE4QjtDQUNwQyxNQUFJQyxHQUFHLEdBQUUsSUFBSUMsY0FBSixFQUFUO0NBQ0FELEVBQUFBLEdBQUcsQ0FBQ0UsSUFBSixDQUFTLEtBQVQsRUFBZ0JKLEdBQWhCLEVBQXFCLEtBQXJCOztDQUNBRSxF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
