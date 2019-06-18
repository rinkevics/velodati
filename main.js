
function includeHtml(url, id) {
	var xhr= new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.onreadystatechange= function() {
		if (this.readyState!==4) return;
		if (this.status!==200) return; // or whatever error handling you want
		document.getElementById(id).innerHTML= this.responseText;
	};
	xhr.send();
}
	
function initMap() {	
				
	window.mymap = L.map(
	    'mapid',
	    { zoomControl: false }
	).setView([56.951259, 24.112614], 13);

	L.control.zoom({
         position:'bottomleft'
    }).addTo(window.mymap);

	const layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(window.mymap);

	window.group = L.markerClusterGroup({
		chunkedLoading: true,
		//singleMarkerMode: true,
		spiderfyOnMaxZoom: false
	  });

	fetch('/app/places')
		.then(response => {
			return response.json()
		})
		.then(data => {

            var greenIcon = L.icon({
                iconUrl: 'images/location.png',

                iconSize:     [91, 99], // size of the icon
                iconAnchor:   [45, 75], // point of the icon which will correspond to marker's location
                popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
            });

			// Work with JSON data here
			for(var i = 0; i < data.length; i++) {
				var marker = L.marker([data[i].lat, data[i].lon],  {icon: greenIcon});

				marker.bindPopup("<div id='popup'>"+
					"<img src='/app/files/" + data[i].img + "' id='popup-image'/><br/>"+
					data[i].description + "<br/>" +
					"<a href='/logout' onclick='FB.logout();'>Logout</a>" +
					"Balsot <button type='button' id='btnLike' class='btn btn-outline-success' "+
						"style='margin-top: 10px; margin-bottom: 10px;' onclick='startVote("+ data[i].id+ ")'>👍</button>"+
						"</div>");
				window.group.addLayer(marker);
			}
			
			window.mymap.addLayer(window.group);
		})
		.catch(err => {
			alert(err);
		});
}

function showCrosshair() {
	var element = document.getElementById("report-btn");
	element.classList.add("d-none");

	var element = document.getElementById("report-btn-2");
	element.classList.add("d-none");

	var crosshair = document.getElementById("crosshair");
	crosshair.classList.remove("hidden");

	var element3 = document.getElementById("select-location-btn");
	element3.classList.remove("d-none");

	centerCrosshair();
}

function centerCrosshair() {
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

function getCrosshairLocation() {	
	var topRowHeight = $('#top-row').height();
	var offset = $('#crosshair').offset();

	var crosshair = document.getElementById("crosshair");
	
	var point = L.point( crosshair.offsetLeft + 20, crosshair.offsetTop - topRowHeight );
	const latlon = window.mymap.containerPointToLatLng(point);
	
	document.getElementById("lat").value = latlon.lat;
	document.getElementById("lon").value = latlon.lng;
}

function hideCrosshair() {
	var element = document.getElementById("report-btn");
	element.classList.remove("d-none");

	var element2 = document.getElementById("crosshair");
	element2.classList.add("hidden");

	var element3 = document.getElementById("select-location-btn");
	element3.classList.add("d-none");
}

function setCurrentLocation() {
	navigator.geolocation.getCurrentPosition(
		pos =>  {					
			const lat = pos.coords.latitude;
			const lon = pos.coords.longitude;
			
			window.mymap.setView([lat, lon], window.mymap.getZoom());
		});
}

function setImg(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		reader.onload = function (e) {
			$('#img-upload').attr('src', e.target.result);
		}
		
		reader.readAsDataURL(input.files[0]);
	}
}

function submitForm(e) {
	var data = new FormData($('#myform')[0]);
	e.preventDefault();
	$.ajax({
		url : '/app/up',
		type: "POST",
		contentType: 'multipart/form-data',
		processData: false,
		contentType: false,
		crossDomain: true,
		data: data,
		success: function (data) {
			alert("Paldies par veloslazdu!");
			location.reload();
		},
		error: function (jXHR, textStatus, errorThrown) {
			alert("Pārliecinies, vai esi pievienojis veloslazdam kategoriju un nosaukumu!"+
			    " Ja neizdodas pievienot punktu, raksti uz info@datuskola.lv");
		}
	});
}

function createVoteTopPage() {
	
}

$(window).on("load", function() {
	includeHtml('html/choose-place.html', 'choose-place');
	includeHtml('html/report.html', 'report');
	includeHtml('html/vote-top.html', 'vote-top');
	includeHtml('html/about-us.html', 'about-us');

	$("#myimg").change(function(){
		setImg(this);
	});

	$(document).on("click", "#choose-location-btn", function(event){
		showCrosshair();
		setCurrentLocation();
	});

	$(document).on("click", "#select-location-btn", function(event){
		getCrosshairLocation();
		$('#report').modal('show');
		hideCrosshair();
	});

	$('#myform').on('submit', function(e) {
		submitForm(e);
	});

	initMap();
});
