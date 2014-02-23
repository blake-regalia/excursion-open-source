

(function(namespace) {
	
	var __func__ = 'RfidScanner';
	
	var keyStrokeThreshold = 50;
	
	var instance;
	
	var construct = function(okay) {
		
		var lastKeyStroke;
		var firstKeyStroke;
		var tagEntry = '';
		
		var self = {
			
			//
			listen: function(e) {

				// grab the character
				var chr = String.fromCharCode(e.which);

				// if this isn't the first keystroke
				if(lastKeyStroke) {

					// reject it immediately if it exceeds the threshold
					if(lastKeyStroke() > keyStrokeThreshold) {
						lastKeyStroke = false;
						var digits = tagEntry+chr;
						tagEntry = '';
					}
				}
				
				// record how long it takes in between keystrokes
				lastKeyStroke = new Timer();
				
				// if this is the first acceptable keystroke
				if(!tagEntry.length) {

					// record how long it takes to enter the whole tag
					firstKeyStroke = new Timer();
				}
				
				// if the enter key was pressed
				if(e.keyCode == 13) {

					// submit the tag
					okay(tagEntry);
					
					// reset the variables
					lastKeyStroke = false;
					tagEntry = '';
				}

				// otherwise, append this character to the entry
				else {
					tagEntry += chr;
				}
			},
		};
		
		
		var operator = function() {};
			
			operator['unbind']=  function() {
				$(document).unbind('keydown', self.listen);
			};

			operator['simulate'] = function(input) {
				okay(input);
			};
		
		
		$(document).keydown(self.listen);
		
		
		return operator;
	};
	
	
	
	var expose = namespace[__func__] = function() {
		if(this !== namespace) {
			if(instance) instance.unbind();
			instance = construct.apply(this, arguments);
			return instance;
		}
		else {
			return instance;
		}
	};
		
		expose['unbind'] = function() {
			return (instance && instance.unbind());
		};
		
		expose['toString'] = function() {
			return __func__+'()';
		};
	
	
})(window);
