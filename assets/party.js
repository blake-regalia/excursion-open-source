
var SECONDS = 1000;
var MINUTES = 60*SECONDS;



new RfidScanner(function(rfid) {

	// must be exactly 10 digits
	if(rfid.length != 10) {
		return Blip.warn('Faulty Scan - Try Again!');
	}

	// lookup user info
	$.post('/user', {
		rfid: rfid,
	}, function(user) {


		// user does not exist
		if(!user) {
			load_user_info();
		}

		// assume approval
		var approved = true;
		var message;

		// 
		if(user.reject) {
			approved = false;
			message = user.reject;
		}

		else if(user.last_seen) {
			var diff = Date.now()-user.last_seen;
			var minutes_ago = Math.ceil(diff / MINUTES);
			message = 'Wristband was already used<br/>'+minutes_ago+' minute'+(minutes_ago==1?'':'s')+' ago';
			approved = false;
		}

		// they exist, load their info
		load_user_info(user, approved, message);
	});
});

var format_phone = function(str) {
	var splt = str.split('');
	splt[2] += ') '
	splt[5] += '-';
	return '('+splt.join('');
};

var load_user_info = function(user, approve, message) {
	var classes = (approve?'valid':'reject');
	var name, phone, email;
	if(!user) {
		classes = 'reject no-one';
		name = 'Not a member';
		message = '';
	}
	else {
		name = user.fullname;
		phone = format_phone(user.phone);
		email = user.email;
	}
	$('div#block').html(''
		+'<div class="'+classes+'">'
			+'<div class="name">'+name+'</div>'
			+'<div class="info">'
				+'<div class="phone">'+phone+'</div>'
				+'<div class="email">'+email+'</div>'
				+'<div class="invisible">-</div>'
			+'</div>'
			+'<div class="message">'+message+'</div>'
		+'</div>'
	);
};

$(document).on('keydown', function(e) {
	if(e.which == 32) {
		if(!$('.phone').is(':visible')) {
			$('.phone').slideDown();
		}
		else if(!$('.email').is(':visible')) {
			$('.email').slideDown();
		}
	}
});

$(window).blur(function(){
	// $('<div class="overlay">'
	// 	+'<div>Lost Window Focus</div>'
	// 	+'<div>Click on this screen to scan members</div>'
	// +'</div>').appendTo(document.body).fadeIn();
});
$(window).focus(function(){
	$('.overlay').remove();
});