(function(namespace) {
	
	/**
	* private static:
	**/
	var __func__ = 'Blip';
	
	var instance;
	var castArray = Array.prototype.slice;

	var defaultDuration = 800;
	var durationTypes = {
		fatal: 0,
		error: 2800,
		good: 1600,
		warn: 1600,
	};

	var queue = [];
	var busy = false;
	var next_timeout;

	var next = function() {
		// if(busy) return; busy = true;
		clearTimeout(next_timeout);
		if(!queue.length) return busy = false;
		$('.blip-banner').remove();
		var msg = queue.shift();
		console.log(msg);
		$('<div class="blip-banner '+msg.type+'">'
				+msg.args[0]
			+'</div>').appendTo(document.body);

		var duration = msg.args[1] || durationTypes[msg.type] || defaultDuration;
		if(duration) {
			next_timeout = setTimeout(fade, duration);
		}
	};

	var fade = function() {
		$('.blip-banner').addClass('retire');
		next_timeout = setTimeout(function() {
			busy = false;
			next();
		}, 800);
	};
		

	
	/**
	* public static operator() ()
	**/
	var expose = namespace[__func__] = function() {
	};
	
	
	
	/**
	* public static:
	**/
		
		//
		expose['toString'] = function() {
			return __func__+'()';
		};
		
		//
		expose['good'] = function() {
			queue.push({
				type: 'good',
				args: castArray.call(arguments),
			});
			next();
		};

		//
		expose['error'] = function() {
			queue.push({
				type: 'error',
				args: castArray.call(arguments),
			});
			next();
		};
		
		//
		expose['warn'] = function() {
			queue.push({
				type: 'warn',
				args: castArray.call(arguments),
			});
			next();
		};
		
})(window);