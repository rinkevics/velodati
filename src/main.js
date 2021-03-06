import { includeHtml } from './utils.js';
import { FacebookService } from './facebookService.js';
import { VoteService } from './voteService.js';
import { setCookie, getCookie, findGetParameter } from './utils.js';
import { AddPlace } from './addPlace.js';
	
function initMap() {

	window.mymap = L.map(
	 'mapid',
		{ zoomControl: false,
			closePopupOnClick: false }
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
						

			let iconSize = [91, 99]; // size of the icon
			let iconAnchor = [45, 75]; // point of the icon which will correspond to marker's location
			let popupAnchor = [-3, -76]; // point from which the popup should open relative to the iconAnchor

			const icons = [
				L.icon({
					iconUrl: 'images/location.png',
					iconSize: iconSize,
					iconAnchor: iconAnchor,
					popupAnchor: popupAnchor
				}),
				L.icon({
					iconUrl: 'images/location2.png',
					iconSize: iconSize,
					iconAnchor: iconAnchor,
					popupAnchor: popupAnchor
				}),
				L.icon({
					iconUrl: 'images/location3.png',
					iconSize: iconSize,
					iconAnchor: iconAnchor,
					popupAnchor: popupAnchor
				}),
				L.icon({
					iconUrl: 'images/location4.png',
					iconSize: iconSize,
					iconAnchor: iconAnchor,
					popupAnchor: popupAnchor
				})
			];


			let openPlaceId = getCookie("placeId");
			setCookie("placeId", null, 1, false);

			for(var i = 0; i < places.length; i++) {
				let placeId = places[i].id;				

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

					setCookie("placeId", place.id, 1, false);
					
					return `<div id='popup' class='mycontainer'>
								<div class='gridbox-left'>
									<img id='small-image' src='${imgSrc}' class='${imgClass}'/> 
									<img id='small-zoom-in' src="/images/zoom-in.png" >
								</div>

								<div class='gridbox-left'>
									${place.description}</div>

								<div class='gridbox-right'>
									Balsot
									<button type='button' id='btnLike' class='btn ${upvoteClass}'
										onclick='doVote(${place.id})'>👍 <div id="voteCount">${voteCount}</div></button>
 		</div>`;
				});
				
				window.group.addLayer(marker);
				
				if(window.isRedirectFromFB && placeId && placeId == openPlaceId) {
					window.markerPoupup = marker;
					window.lat = places[i].lat;
					window.lon = places[i].lon;
				}
			}			
			window.mymap.addLayer(window.group);
			
			if(window.markerPoupup) {
				window.markerPoupup.openPopup();
				window.mymap.setView([window.lat, window.lon], 13);
								
				history.replaceState(null, null, '/');
				window.loginCallback = () => {
					window.voteService.doVote(openPlaceId);
				};
				window.facebookService.onLogin();
			}
		})
		.catch(err => {
			console.log("e2 "+ err);
		});
}


function setImg(input) {
	if (input.files && input.files[0]) {
		const fileSizeInMB = input.files[0].size / 1024 / 1024;
		if(fileSizeInMB > 10) {
			document.getElementById("uploadimage").value = null;
			alert("Maksimālais faila izmērs 10MB");
			return;
		}

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
				"Segums (bedres, bīstamas apmales)",
				"Cits"
			 ];
			let contentElement = document.getElementById("top-content");
			let result = "";

			for(let type = 0; type < 4; type++) {
				if(!data || !data[type]) {
					continue;
				}
				
				let top3 = "";
				for(let i = 0; i < 3; i++) {
					
					let topPlace = data[type][i];
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
					let fullImgSrc = "";
					if(place.img && place.img.length > 0) {
						imgSrc = "/app/files/2" + place.img;
						fullImgSrc = "/app/files/" + place.img;
					}
					
					top3 += `<div class="top-item">
						<div class="top-image-box">
							<img class="top-image" src='${imgSrc}' full-src='${fullImgSrc}' />
						</div>		
						<img id="top-zoom-in" src="/images/zoom-in.png" >
						<div class="top-vote-count">👍&nbsp;${voteCount}</div>		
						<div class="top-number">${i + 1}</div>
						<div class="top-text">${place.description}</div>
					</div>`;
				}				

				if(top3.length > 0) {
					result += 
						`<div class="vote-top-title color-${type}">${type + 1}- ${titles[type]}
						</div>
						<div class="vote-top-row" id="type${type}">
							${top3}
						</div>`;
				}
				
			}

			result += `<div class="top-footer">Tops uzrāda punktus, par kuriem RD Satiksmes departaments vēl nav sniedzis atbildi. Pilns tops pieejams “Visi dati” sadaļā.</div>`;

			contentElement.innerHTML = result;
		})
		.catch(e => console.log("e1"+ e));
}

$(window).on("load", function() {
 includeHtml('public/start.e059a7557042acf58528a0c88531419d.html', 'start');
	includeHtml('public/choose-place.4c0fc8f06ca674f8743a65473f9c9f6f.html', 'choose-place');
	includeHtml('public/report.33c442742f0347f172b5f57713445614.html', 'report');
	includeHtml('public/vote-top.2f94a4b3ba649f6c2e9a74082872d960.html', 'vote-top');
	includeHtml('public/about-us.717d35ad7ab2787abe7e8eeff5145f0a.html', 'about-us');
	includeHtml('public/big-image.9f85b967b17eaa16a26aec475a730bd4.html', 'big-image-box');
	includeHtml('public/finish-message.d9399de7b464c6e84b070742e1235e37.html', 'finish-message');
	
	let visited = getCookie("finishVisited");
	if(!visited) {
		$('#finish-message').modal('show');
		setCookie("finishVisited", true, 365);
	}
	
	let url = location.toString().split("?")[1];
	if(url) {
		window.isRedirectFromFB = url
				.substring(1)
				.split("&")
				.map(parameter => parameter.split("="))
				.filter(parameterValue => parameterValue[0] == "data_access_expiration_time")
				.reduce(accumulator => accumulator + 1, 0);
		//console.log(`isRedirectFromFB ${isRedirectFromFB}`);
	}

	initMap();

	window.setImg = setImg;
	window.showVoteTop = showVoteTop;
	window.voteService = new VoteService();
	window.facebookService = new FacebookService();

	window.showBigImage = imageSrc => {
		if(imageSrc.length == 0 || imageSrc == "/images/noimage.png") {
			return;
		}
		let elem = document.getElementById("big-image-src");
		elem.setAttribute("src", imageSrc)
		$('#big-image-box').modal('show');
	};

	let addPlace = new AddPlace();

	$(document).on("click", "#small-image", () => {
		let imageSrc = document.getElementById("small-image").getAttribute("src");
		window.showBigImage(imageSrc);
	});

	$(document).on("click", "#small-zoom-in", () => {
		let imageSrc = document.getElementById("small-image").getAttribute("src");
		window.showBigImage(imageSrc);
	});

	$(document).on("click", ".top-image", e => {
		let src = e.target.getAttribute("full-src");
		window.showBigImage(src);
	});
	
	$(document).on("click", "#top-zoom-in", e => {
		let src = e.target.parentNode.getElementsByClassName("top-image")[0].getAttribute("full-src");
		window.showBigImage(src);
	});
	
});
