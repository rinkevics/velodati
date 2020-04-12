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
		//disableClusteringAtZoom: 17,
		spiderfyOnMaxZoom: true
	  });

	fetch('/app/places')
		.then(response => {
			return response.json()
		})
		.then(data => {
			window.votes = data.votes;
			window.places = data.places;
			let places = data.places;
						
			const icons = [];

			let iconSize = [91, 99]; // size of the icon
			let iconAnchor = [45, 75]; // point of the icon which will correspond to marker's location
			let popupAnchor = [-3, -76]; // point from which the popup should open relative to the iconAnchor

			icons[1] = L.icon({
                iconUrl: 'images/location.png',
                iconSize:     iconSize,
                iconAnchor:   iconAnchor,
                popupAnchor:  popupAnchor
			});
			icons[2] = L.icon({
                iconUrl: 'images/location2.png',
                iconSize:     iconSize,
                iconAnchor:   iconAnchor,
                popupAnchor:  popupAnchor
			});
			icons[3] = L.icon({
                iconUrl: 'images/location3.png',
                iconSize:     iconSize,
                iconAnchor:   iconAnchor,
                popupAnchor:  popupAnchor
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
						icon: icons[places[i].placeType], 
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

					let imgSrc = "/images/noimage.png";
					let imgClass = "popup-noimage";
					if(place.img && place.img.length > 0) {
						imgSrc = "/app/files/" + place.img;
						imgClass = "popup-image";
					}

					return `<div id='popup' class='mycontainer'>
								<div class='gridbox-left'> 
									<img src='${imgSrc}' class='${imgClass}'/> </div>

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
			alert("e2 "+ err);
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

function showVoteTop() {

	$('#vote-top').modal('show');
	
	fetch('/app/top',
		{
			method: 'GET',
			cache: 'no-cache'
		})
		.then(response => {
			return response.json()
		})
		.then(data => {

			let titles = [
				"Šaurība / nepārredzamība",
				"Strauji pagriezieni",
				"Segums (bedres, bīstamas apmales)"
			 ];
			let contentElement = document.getElementById("top-content");
			let result = "";

			for(let type = 1; type <= 3; type++) {
				let idx = type - 1;

				if(!data || !data[idx]) {
					continue;
				}
				
				let top3 = "";
				for(let i = 0; i < 3; i++) {
					
					let topPlace = data[idx][i];
					if(!topPlace) {
						continue;
					}

					let places = window.places;
					let id = topPlace[0];
					let voteCount = topPlace[1];
					let place = null;
					for(let j = 0; j < places.length; j++) {
						if(places[j].id ==	 id) {
							place = places[j];
						}
					}

					if(!place) {
						continue;
					}

					let imgSrc = "/images/noimage.png";
					if(place.img && place.img.length > 0) {
						imgSrc = "/app/files/2" + place.img;
					}

					/*<div class="top-txt">${voteCount}</div>*/

					top3 += `<div class="top-item">
						<div class="top-image-box">
							<img class="top-image" src='${imgSrc}'/> 
						</div>				
						<div class="top-number">${i + 1}</div>
						<div class="top-text">${place.description}</div>
					</div>`;
				}				

				if(top3.length > 0) {
					result += 
						`<div class="vote-top-title">${type}- ${titles[idx]}</div>
						<div class="vote-top-row" id="type${type}">
							${top3}
						</div>`;
				}
				
			}
			contentElement.innerHTML = result;
		})
		.catch(e => console.log("e1"+ e));
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

	window.setImg = setImg;
	window.showVoteTop = showVoteTop;
	window.voteService = new VoteService();
	window.facebookService = new FacebookService();

	let addPlace = new AddPlace();
});
