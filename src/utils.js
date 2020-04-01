
export function includeHtml(url, id) {
	var xhr= new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.onreadystatechange= function() {
		if (this.readyState!==4) return;
		if (this.status!==200) return; // or whatever error handling you want
		document.getElementById(id).innerHTML= this.responseText;
	};
	xhr.send();
}

export function setCookie(name,value,days, isSecure) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	let secure = "";
	if (isSecure) {
		secure = "; secure; HttpOnly";
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/" + secure;
}

export function getCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
}

export function eraseCookie(name) {
		document.cookie = name+'=; Max-Age=-99999999;';  
}

export function hideSpinner() {
    document.getElementById("cover").style.display = "none";
}

export function showSpinner() {
    document.getElementById("cover").style.display = "block";
}
