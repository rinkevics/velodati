import {Spinner} from './spin.js';

var opts = {
	lines: 13, // The number of lines to draw
	length: 38, // The length of each line
	width: 17, // The line thickness
	radius: 45, // The radius of the inner circle
	scale: 1, // Scales overall size of the spinner
	corners: 1, // Corner roundness (0..1)
	color: '#000000', // CSS color or array of colors ffffff
	fadeColor: 'transparent', // CSS color or array of colors
	speed: 1, // Rounds per second
	rotate: 0, // The rotation offset
	animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
	direction: 1, // 1: clockwise, -1: counterclockwise
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	className: 'spinner', // The CSS class to assign to the spinner
	top: '50%', // Top position relative to parent
	left: '50%', // Left position relative to parent
	shadow: '0 0 1px transparent', // Box-shadow for the lines
	position: 'absolute' // Element positioning
};

	

	//var target = document.getElementById('main');
	//var spinner = new Spinner(opts).spin(target);	
	
	const sleep = (milliseconds) => {
		return new Promise(resolve => setTimeout(resolve, milliseconds))
	}
	
		

/*
		navigator.geolocation.getCurrentPosition(
			pos => {
				var mymap = L.map('mapid').setView([pos.coords.latitude, pos.coords.longitude], 13);

				var layer = L.tileLayer('https://a.tile.openstreetmap.org/${z}/${x}/${y}.png ', {
					maxZoom: 18,
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(mymap);
				
				layer.on('load', function (event) {
					spinner.stop();
				});
				
				
			});
			*/
			
			
		// navigator.geolocation.getCurrentPosition(
		// 	pos => {
		// 		var mymap = L.map('mapid').setView([pos.coords.latitude, pos.coords.longitude], 13);

		// 		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		// 			maxZoom: 18,
		// 			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		// 		}).addTo(mymap);
		// 	});
	
				
				