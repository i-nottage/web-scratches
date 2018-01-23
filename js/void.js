
ws.Void = function(user_options) {

	this._options = {
		void_space : null,
		void_input : null,
		void_ul : null,
		void_input_form : null,
		void_input_text : null,
		fade_delay : 0,
		fade_time : 8000 
	};

	ws.extend(this._options, user_options);

	this.void_space = this._options.void_space;
	this.void_ul = this._options.void_ul;
	this.void_input = this._options.void_input;
	this.void_input_form = this._options.void_input_form;
	this.void_input_text = this._options.void_input_text;

	this._init();
}

ws.Void.prototype = {
	_init : function() {

		// Add a ul to the VOID
		//

		var self = this;

		// disable backspace for input field
		$(this.void_input_form).keydown(function(e) {
				if (e.keyCode === 8) {

					// write a cheeky little message

					//
					return false;
				};
			});

		// Clear the void ul of all lis
		$( this.void_ul ).children().delay(1000).fadeOut(this._options.fade_time, function() {
			$( this ).remove();
		});

		// Set submit event for form
		$( this.void_input_form).submit( function(e) {

			// stop the reload
			e.preventDefault();
			
			// the actual stuff, needs the thing
			self._submitText();
		});

	},
	_submitText : function() {

		// retrieve text
		var text = $( this.void_input_text ).val();

		// Toss into the VoID
		this._tossText(text);

		// clear field
		$( this.void_input_text ).val('');

		// set focus back to text area
		$( this.void_input_text ).focus();
	},
	_tossText : function(text) {

		// create new 
		$( "<li/>", {
			"class" : "test",
			text: text
		})
		.appendTo( this.void_ul ).delay(this._options.fade_delay).fadeOut(this._options.fade_time, function() {
			$( this ).remove();	
		});
	}
}
