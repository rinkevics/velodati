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
		 	
		function readURL(input) {
		    if (input.files && input.files[0]) {
		        var reader = new FileReader();
		        
		        reader.onload = function (e) {
		            $('#img-upload').attr('src', e.target.result);
		        }
		        
		        reader.readAsDataURL(input.files[0]);
		    }
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
					dataType: 'json',
					contentType: 'multipart/form-data',
					processData: false,
					contentType: false,
					crossDomain: true,
					data: data,
					success: function (data) {
						alert("ok");
					},
					error: function (jXHR, textStatus, errorThrown) {
						alert(errorThrown);
					}
				});
			});
        
	});