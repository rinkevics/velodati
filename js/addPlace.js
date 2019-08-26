
export class AddPlace {
    constructor () {
        $("#myimg").change(function(){
            setImg(this);
        });
    
        let that = this;

        $(document).on("click", "#choose-location-btn", function(event){
            that.showCrosshair();
            that.setCurrentLocation();
        });
    
        $(document).on("click", "#select-location-btn", function(event){
            that.getCrosshairLocation();
            $('#report').modal('show');
            that.hideCrosshair();
        });
    
        $('#myform').on('submit', function(e) {
            that.submitForm(e);
        });
    }
    
    submitForm(e) {
        var data = new FormData($('#myform')[0]);
        e.preventDefault();
        $.ajax({
            url : '/app/up',
            type: "POST",
            contentType: 'multipart/form-data',
            processData: false,
            contentType: false,
            crossDomain: true,
            data: data,
            success: function (data) {
                alert("Paldies par veloslazdu!");
                location.reload();
            },
            error: function (jXHR, textStatus, errorThrown) {
                alert("Pārliecinies, vai esi pievienojis veloslazdam kategoriju un nosaukumu!"+
                    " Ja neizdodas pievienot punktu, raksti uz info@datuskola.lv");
            }
        });
    }

    showCrosshair() {
        var element = document.getElementById("report-btn");
        element.classList.add("d-none");

        var element = document.getElementById("report-btn-2");
        element.classList.add("d-none");

        var crosshair = document.getElementById("crosshair");
        crosshair.classList.remove("hidden");

        var element3 = document.getElementById("select-location-btn");
        element3.classList.remove("d-none");

        this.centerCrosshair();
    }

    centerCrosshair() {
        var map = document.getElementById("main");

        var top = map.offsetTop;
        var left = map.offsetLeft;
        var height = map.offsetHeight;
        var width = map.offsetWidth;

        var x = left + width / 2 - 20;
        var y = top + height / 2 - 20;

        var crosshair = document.getElementById("crosshair");
        crosshair.style.left = x + "px";
        crosshair.style.top = y + "px";
    }

    getCrosshairLocation() {	
        var topRowHeight = $('#top-row').height();
        var offset = $('#crosshair').offset();

        var crosshair = document.getElementById("crosshair");
        
        var point = L.point( crosshair.offsetLeft + 20, crosshair.offsetTop - topRowHeight );
        const latlon = window.mymap.containerPointToLatLng(point);
        
        document.getElementById("lat").value = latlon.lat;
        document.getElementById("lon").value = latlon.lng;
    }

    hideCrosshair() {
        var element = document.getElementById("report-btn");
        element.classList.remove("d-none");

        var element2 = document.getElementById("crosshair");
        element2.classList.add("hidden");

        var element3 = document.getElementById("select-location-btn");
        element3.classList.add("d-none");
    }

    setCurrentLocation() {
        navigator.geolocation.getCurrentPosition(
            pos =>  {					
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                
                window.mymap.setView([lat, lon], window.mymap.getZoom());
            });
    }

}