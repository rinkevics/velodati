import { showSpinner, hideSpinner, setCookie, getCookie, getCaptcha } from './utils.js';

export class AddPlace {
    constructor () {
        $("#uploadimage").change(function(){
            window.setImg(this);
        });
    
        let that = this;

        $(document).on("click", "#choose-location-btn", () => {
            that.showCrosshair();
            that.setCurrentLocation();
        });
    
        $(document).on("click", "#select-location-btn", () => {
            that.getCrosshairLocation();
            $('#report').modal('show');
            that.retrieveEmailFromCookie();
            that.hideCrosshair();
        });
        
        $(document).on("click", "#cancel-btn", () => {
            that.hideCrosshair();
        });
    
        $('#myform').on('submit', function(e) {
            that.submitForm(e);
        });
    }

    submitForm(e) {
        showSpinner();
        this.storeEmailInCookie();
        var data = new FormData($('#myform')[0]);
        e.preventDefault();
        getCaptcha().then(captcha => {
            $.ajax({
                url : '/app/upload',
                type: "POST",
                contentType: 'multipart/form-data',
                processData: false,
                contentType: false,
                crossDomain: true,
                headers: { 'x-captcha': captcha },
                data: data,
                success: function (data) {
                    hideSpinner();
                    alert("Paldies par veloslazdu!");
                    location.reload();
                },
                error: function (jXHR, textStatus, errorThrown) {
                    hideSpinner();
                    alert("Pārliecinies, vai esi pievienojis veloslazdam kategoriju un nosaukumu!"+
                        " Ja neizdodas pievienot punktu, raksti uz info@datuskola.lv");
                }
            });
        });
    }

    showCrosshair() {
        var element = document.getElementById("color-codes");
        element.classList.add("d-none");

        var element = document.getElementById("report-btn");
        element.classList.add("d-none");

        var element = document.getElementById("report-btn-2");
        element.classList.add("d-none");

        var crosshair = document.getElementById("crosshair");
        crosshair.classList.remove("hidden");

        var selectLocationButton = document.getElementById("select-location-btn");
        selectLocationButton.classList.remove("d-none");

        var cancelButton = document.getElementById("cancel-btn");
        cancelButton.classList.remove("d-none");

        this.centerCrosshair();
    }

    centerCrosshair() {
        var map = document.getElementById("main");
        var turpinat = document.getElementById("box1");
        var topRow = document.getElementById("top-row");

        var top = map.offsetTop;
        var left = map.offsetLeft;
        var height = turpinat.offsetTop - topRow.offsetHeight;
        var width = map.offsetWidth;

        var x = left + (width / 2) - 20;
        var y = top + (height / 2) - 20;

        var crosshair = document.getElementById("crosshair");
        crosshair.style.left = x + "px";
        crosshair.style.top = y + "px";
    }

    getCrosshairLocation() {	
        var topRowHeight = $('#top-row').height();
        var crosshair = document.getElementById("crosshair");
        
        var point = L.point( crosshair.offsetLeft + 20, crosshair.offsetTop - topRowHeight );
        const latlon = window.mymap.containerPointToLatLng(point);
        
        document.getElementById("lat").value = latlon.lat;
        document.getElementById("lon").value = latlon.lng;
    }

    hideCrosshair() {        
        var element = document.getElementById("color-codes");
        element.classList.remove("d-none");

        var element = document.getElementById("report-btn");
        element.classList.remove("d-none");
        
        var element = document.getElementById("report-btn-2");
        element.classList.remove("d-none");

        var element2 = document.getElementById("crosshair");
        element2.classList.add("hidden");

        var selectLocationButton = document.getElementById("select-location-btn");
        selectLocationButton.classList.add("d-none");

        var cancelButton = document.getElementById("cancel-btn");
        cancelButton.classList.add("d-none");
    }

    setCurrentLocation() {
        navigator.geolocation.getCurrentPosition(
            pos =>  {					
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                
                window.mymap.setView([lat, lon], window.mymap.getZoom());
            });
    }
    
    retrieveEmailFromCookie() {
        let emailElement = document.getElementById("email");
        let email = getCookie("email");
        if(email && email.length > 0) {
            emailElement.value = email;
        }
    }
    
    storeEmailInCookie() {
        let email = document.getElementById("email");
        setCookie("email", email.value, 3, false);
    }

}