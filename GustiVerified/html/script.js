var config;

$.getJSON("config.json", function (body) {
	config = body;

	$("#header").html(config.header);
	$("#second-text").html(config.secondtext);
	$("#invite").html(config.invite);
	$("#code").html(config.code);
});



window.onload = (e) => {
	window.addEventListener('message', (ev) => {
		if(ev.data.type == "ToggleChecker") {
			if(ev.data.toggle == true) $('.wrapper').css('opacity', '1')
			if(ev.data.toggle == false) $('.wrapper').css('opacity', '0')
		}
		if(ev.data.type == "TriggerError") {
			showError(ev.data.count);
		}
	})
}

$("#submit").click(function(e) {
   	e.preventDefault();
	if($("#dc").val() == "") {
		Toastify({
			text: config.empty,
			backgroundColor: "linear-gradient(135deg, #e74c3c, #c0392b)",
			position: 'right',
			gravity: 'toastify-top',
			duration: 2000
		}).showToast();
		return;
	}
	$.post('http://gustiverified/checkCode', JSON.stringify({
        code: encodeURI($("#dc").val()),
    }));
});

function showError(int) {
	Toastify({
		text: config.wrongCode.replace('#TRIESLEFT#', int),
		backgroundColor: "linear-gradient(135deg, #e74c3c, #c0392b)",
		position: 'right',
		gravity: 'toastify-top',
		duration: 5000
	}).showToast();
}
