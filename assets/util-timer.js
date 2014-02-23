
/** Timer **/
(function(namespace) {
	
	var construct = function(timeToLive) {
		var start = (new Date()).getTime();
		
		var operator = function() {
			var elapsed = (new Date()).getTime() - start;
			if(elapsed >= timeToLive) operator.expired = true;
			return elapsed;
		};

			operator['public'] = {
				expired: false,
				toString: function() {
					return 'new Timer()';
				},
			};

		return operator;
	};

	var expose = namespace.Timer = function() {
		if(this !== namespace) {
			var instance = construct.apply(this, arguments);
			return instance;
		}
		else {
			
		}
	};
		expose['toString'] = function() {
			return 'Timer()';
		};
})(window);