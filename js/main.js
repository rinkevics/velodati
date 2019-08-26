import { includeHtml } from './utils.js';
import { FacebookService } from './facebookService.js';
import { VoteService } from './voteService.js';
import { setCookie } from './utils.js';
import { getCookie } from './utils.js';
import { AddPlace } from './addPlace.js';
	
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

			window.votes = data.votes;
		    var places = data.places;

            var greenIcon = L.icon({
                iconUrl: 'images/location.png',

                iconSize:     [91, 99], // size of the icon
                iconAnchor:   [45, 75], // point of the icon which will correspond to marker's location
                popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
            });

			for(var i = 0; i < places.length; i++) {

				var voteCountInput = data.votes[places[i].id];
				var voteCount = "";
				if(voteCountInput) {
				    voteCount = "&nbsp;" + data.votes[places[i].id];
				}

				var marker = L.marker(
					[places[i].lat, places[i].lon], 
					{
						icon: greenIcon, 
						place: places[i]
					});

				marker.bindPopup( context => {
					const place = context.options.place;
					let voteCount = window.votes[place.id];
					if(!voteCount) {
						voteCount = "";
					}
					let isUpvote = null;
					if(window.myvotes) {
						isUpvote = window.myvotes[place.id];
					}
					let upvoteClass;
					if(isUpvote) {
						upvoteClass = "btn-success";
					} else {
						upvoteClass = "btn-outline-success";
					}

					return `<div id='popup' class='mycontainer'>
								<div class='gridbox-left'> 
									<img src='/app/files/${place.img}' id='popup-image'/> </div>

								<div class='gridbox-left'>
									${place.description}</div>

								<div class='gridbox-right'>
									Balsot
									<button type='button' id='btnLike' class='btn ${upvoteClass}'
										onclick='doVote(${place.id})'>👍 <div id="voteCount">${voteCount}</div></button>
                    		</div>`;
				});
				window.group.addLayer(marker);
			}
			
			window.mymap.addLayer(window.group);
		})
		.catch(err => {
			alert(err);
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

$(window).on("load", function() {
    includeHtml('html/start.html', 'start');
	includeHtml('html/choose-place.html', 'choose-place');
	includeHtml('html/report.html', 'report');
	includeHtml('html/vote-top.html', 'vote-top');
	includeHtml('html/about-us.html', 'about-us');
	
	let visited = getCookie("visited");
	if(!visited) {
		$('#start').modal('show');
		setCookie("visited", true, 365);
	}	
	
	initMap();

	window.voteService = new VoteService();
	window.facebookService = new FacebookService();

	let addPlace = new AddPlace();
});
