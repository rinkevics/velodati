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
        
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        
		        reader.onload = function (e) {
		            $('#img-upload').attr('src', e.target.result);
		        }
		        
		        reader.readAsDataURL(input.files[0]);
		    }
		}

		$("#myimg").change(function(){
		    readURL(this);
		}); 	
		
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
        
        /*$('#btn-send').on('click', function () {
            
            var photo = document.getElementById("myimg");
            // the file is the first element in the files property
            var file = photo.files[0];

            console.log("File name: " + file.name);
            console.log("File size: " + file.size);

            
        }); */
        
	});