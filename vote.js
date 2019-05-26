
	function startVote(p) {
		window.placeID = p;

		var token = getCookie("token");
		if(token == null) {
			$('#voteLogin').modal('show'); 
		} else {
			var user = getCookie("user");
			statusChangeCallback(user, token);
		}
	}

	window.fbAsyncInit = function() {
		FB.init({	
			appId      : '273875460184611',
			cookie     : true,
			xfbml      : true,
			version    : 'v3.3'
		});
			
		FB.AppEvents.logPageView();   
	};

	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "https://connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));


	function login() {
		FB.getLoginStatus(function(response) {
				if(response.status = "connected") {
					var user = response.authResponse.userID;
					var token = response.authResponse.accessToken;
					setCookie("user", user, 1);
					setCookie("token", token, 1);
					statusChangeCallback(user, token);
				} else {
					console.log(response);
				}
		});
	}

	function statusChangeCallback(user, token) {
		$.ajax({
				url : "/app/vote",
				type: "POST",
				processData: false,
				crossDomain: true,
				headers: {
						"token":token
				},
				data: "place="+ window.placeID+ "&user="+ user,
				success: function (data) {
					$("#btnLike").removeClass('btn-outline-success');
					$("#btnLike").addClass('btn-success');
					$('#voteLogin').modal('hide'); 
				},
				error: function (jXHR, textStatus, errorThrown) {
					alert("Error in statusChangeCallback: "+ errorThrown);
					$('#voteLogin').modal('hide'); 
				}
			});
	}

	function setCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
	}

	function getCookie(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
					var c = ca[i];
					while (c.charAt(0)==' ') c = c.substring(1,c.length);
					if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
	}

	function eraseCookie(name) {   
			document.cookie = name+'=; Max-Age=-99999999;';  
	}
