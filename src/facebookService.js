import { getCookie, setCookie } from './utils.js';

export class FacebookService {
    constructor(afterFBInit) {
        this.init();
        window.afterFBInit = afterFBInit;
    }

    init() {
        window.loginfun = () => {
            let uri = encodeURI(location.protocol + '//' + location.host + '/');
            window.location = encodeURI("https://www.facebook.com/dialog/oauth?client_id=273875460184611&redirect_uri="+uri+"&response_type=token");
        };

        window.storeHttpOnlyCookie = (token) => window.facebookService.storeHttpOnlyCookie(token);
        
        window.fbAsyncInit = function() {
            FB.init({	
                appId   : '273875460184611',
                cookie  : true,
                status  : true,
                xfbml   : true,
                version : 'v3.3' 
            });
            
            FB.AppEvents.logPageView();

            FB.Event.subscribe('auth.authResponseChange', function(response) {
                //console.log('The status of the session changed to: '+response.status);
            });
            
            window.facebookService.onLogin();
        };
        
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/lv_LV/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
        
    }

    onLogin() {
        this.checkFBLoginStatus()
            .then(token => {
                return window.facebookService.storeHttpOnlyCookie(token);
            }) 
            .then(token => {
                window.voteService.fetchMyVotes();
                return token;
            })
            .then(
                token => {
                    if(window.loginCallback) {
                        window.loginCallback(token);
                        window.loginCallback = null;
                    }
                    return token;
                },
                () => {
                    throw "FB not logged in";
                })
            .catch(e => {
                console.log(e);
            });
    }
    
    loginIfNeeded() {
        return new Promise( (resolutionFunc, rejectionFunc) => {

            $('#loginModal').modal('hide');
            
            const onLoggedIn = () => {
                window.facebookService.onLogin();
                resolutionFunc();
            };
            const onNotLoggedIn = () => {
                window.loginCallback = token => { 
                    $('#loginModal').modal('hide');
                    resolutionFunc(token);
                };
                $('#loginModal').modal('show'); 
            };
            window.facebookService.checkFBLoginStatus()
                .then(onLoggedIn, onNotLoggedIn);
            
        });
    }
    
    checkFBLoginStatus() {
        return new Promise( (resolutionFunc, rejectionFunc) => {
            FB.getLoginStatus(function(response) {
                if(response.status == "connected") {
                    var token = response.authResponse.accessToken;
                    resolutionFunc(token);
                } else {
                    rejectionFunc(response);
                }
            });
        });
    }

    storeHttpOnlyCookie(token) {
        return new Promise( (resolutionFunc, rejectionFunc) => {
            $.ajax({
                url : "/app/login",
                type: "POST",
                processData: false,
                crossDomain: true,
                headers: {
                    "token":token
                },
                data: "",
                success: function () {
                    resolutionFunc(token);
                },
                error: function (jXHR, textStatus, errorThrown) {
                    console.log("Error in storeHttpOnlyCookie: "+ errorThrown);
                }
            });            
        });
    }
    	
}
