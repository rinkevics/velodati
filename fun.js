
const URL = "/app";


$(document).ready( function() {
		

    	$(document).on('change', '.btn-file :file', function() {
			var input = $(this),
			label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
			input.trigger('fileselect', [label]);
		});

		$('.btn-file :file').on('fileselect', function(event, label) {
		    
		    var input = $(this).parents('.input-group').find(':text'),
		        log = label;
		    
		    if( input.length ) {
		        input.val(log);
		    } else {
		        if( log ) alert(log);
		    }
	    
        });
        
		$("#myimg").change(function(){
		    readURL(this);
		});

		
		function start() {	
					
			var mymap = L.map('mapid').setView([56.951259, 24.112614], 13);

			const layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 18,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(mymap);

			fetch(URL + '/employees')
				.then(response => {
					return response.json()
				})
				.then(data => {
					// Work with JSON data here
					for(var i = 0; i < data.length; i++) {
						L.marker([data[i].lat, data[i].lon])
							.addTo(mymap)
							.bindPopup("<img src='" + URL + "/files/" + data[i].img + "' height='100' width='100' /><br/>"+
								data[i].description);
					}			
				})
				.catch(err => {
					alert(err);
					// Do something for an error here
				});

				/*
			layer.on('load', function (event) {	
			
				sleep(1000)
					.then(() => {
						//var spin = document.getElementById('spin');
						//spin.classList.remove('is-active');
						
						L.marker([56.951259, 24.112614]).addTo(mymap)
							.bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();					
					});	
			});*/

			return mymap;
		}
 	
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        
		        reader.onload = function (e) {
		            $('#img-upload').attr('src', e.target.result);
		        }
		        
		        reader.readAsDataURL(input.files[0]);
		    }
		}

		$(document).on("click", "#choose-location-btn", function(event){
			
			var element = document.getElementById("report-btn");
			element.classList.add("d-none");

			var crosschair = document.getElementById("crosschair");
			crosschair.classList.remove("hidden");

			var element3 = document.getElementById("select-location-btn");
			element3.classList.remove("d-none");

			var map = document.getElementById("main");

			var top = map.offsetTop;
			var left = map.offsetLeft;
			var height = map.offsetHeight;
			var width = map.offsetWidth;

			var x = left + width / 2 - 20;
			var y = top + height / 2 - 20;

			crosschair.style.left = x + "px";
			crosschair.style.top = y + "px";
			
			navigator.geolocation.getCurrentPosition(
				pos =>  {					
				   const lat = pos.coords.latitude;
				   const lon = pos.coords.longitude;
				   
				   mymap.setView([lat, lon], mymap.getZoom());
				});

		});
		
		$(document).on("click", "#select-location-btn", function(event){

			getCrosschairLocation();

			var element = document.getElementById("report-btn");
			element.classList.remove("d-none");

			var element2 = document.getElementById("crosschair");
			element2.classList.add("hidden");

			var element3 = document.getElementById("select-location-btn");
			element3.classList.add("d-none");
		});		

		function getCrosschairLocation() {	
			var topRowHeight = $('#top-row').height();
			var offset = $('#crosschair').offset();

			var crosschair = document.getElementById("crosschair");
			
			var point = L.point( crosschair.offsetLeft + 20, crosschair.offsetTop - topRowHeight );
			var latlon = mymap.containerPointToLatLng(point);

			L.marker(latlon).addTo(mymap);
		}
		
		$('#exampleModalCenter').on('shown.bs.modal', function () {
			
			navigator.geolocation.getCurrentPosition(
			 	pos =>  {					
					const lat = pos.coords.latitude;
					const lon = pos.coords.longitude;
					
					const value = 'lat:' + lat + ', lon:' + lon;
					document.getElementById("pos").value = value;
					document.getElementById("lat").value = lat;
					document.getElementById("lon").value = lon;
				 });

		});
		
		$('#myform').on('submit', function(e) {

			var data = new FormData($('#myform')[0]);

			e.preventDefault();
			$.ajax({
				url : $(this).attr('action') || window.location.pathname,
				type: "POST",
				contentType: 'multipart/form-data',
				processData: false,
				contentType: false,
				crossDomain: true,
				data: data,
				success: function (data) {
					alert("Paldies par ziņojumu!");
					location.reload();
				},
				error: function (jXHR, textStatus, errorThrown) {
					alert("err "+ errorThrown);
				}
			});
		});

		var theMarker;
		var mymap = start();
        
	});