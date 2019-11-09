import { getCookie } from './utils.js';
import { setCookie } from './utils.js';

export class FacebookService {
    constructor(afterFBInit) {
        this.init();
        window.afterFBInit = afterFBInit;
    }

    init() {
        window.login = () => window.facebookService.login();
        window.storeHttpOnlyCookie = (token) => window.facebookService.storeHttpOnlyCookie(token);

        window.fbAsyncInit = function() {
            FB.init({	
                appId      : '273875460184611',
                cookie     : true,
                xfbml      : true,
                version    : 'v3.3' 
            });
            
            FB.AppEvents.logPageView();

            FB.Event.subscribe('auth.authResponseChange', function(response) {
                console.log('The status of the session changed to: '+response.status);
            });

            window.loginCallback = () => this.window.voteService.fetchMyVotes();
            window.facebookService.login();            
        };
        
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/lv_LV/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        
    }
    
    loginIfNeeded(loginCallback) {
        $('#loginModal').modal('hide');
        var token = getCookie("token");
        if(token == null) {
            window.loginCallback = loginCallback;
            $('#loginModal').modal('show'); 
        } else {
            window.loginCallback = loginCallback;
            window.facebookService.login();	
        }
    }
    
	login() {
		FB.getLoginStatus(function(response) {
			if(response.status == "connected") {
				var token = response.authResponse.accessToken;
                setCookie("token", token, 1);
                $('#loginModal').modal('hide');
				window.storeHttpOnlyCookie(token);
			} else {
				//console.log(response);
			}
		});
    }

    storeHttpOnlyCookie(token) {
		$.ajax({
            url : "/app/login",
            type: "POST",
            processData: false,
            crossDomain: true,
            headers: {
                "token":token
            },
            data: "",
            success: function (data) {
                if(window.loginCallback) {
                    window.loginCallback();
                }
                window.loginCallback = null;
            },
            error: function (jXHR, textStatus, errorThrown) {
                alert("Error in storeHttpOnlyCookie: "+ errorThrown);
            }
        });
    }
    	
}
