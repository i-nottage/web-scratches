ws.Memorizer = function(user_options) {

	this._options = {
		player : null,
		part_display : null,
		controls : null	
	};

	ws.extend(this._options, user_options);

	this._player = this._options.player;
	this._part_display = this._options.part_display;
	this._controls = this._options.controls;

	this._init();
};

ws.Memorizer.prototype = {

	_init : function() {

		var self = this;

		// get controls
		$controls = $( this._controls );

		// get input button
		$input_button = $controls.children('button.input');

		$input_button.on('click', function(e) {

			e.preventDefault();

			self._submitText();
		});

		// BUTTON SUBMIT
		$play_button = $controls.children('button.play');

		$play_button.on('click', function(e) {

			e.preventDefault();

			self._activatePlayer();
		});

		// CONTROL SUBMIT
		$controls.on('submit', function(e) {

			e.preventDefault();

			self._submitText();
		});

		// HIDE PLAYER
		$player = $( this._player );
		$player.hide();
	},
	_submitText : function() {

		// get text
		var text = $( this._controls ).children("input[type='text']").val();

		// create new 
		$( "<li/>", {
			"class" : "test",
			text: text
		})
		.appendTo( this._part_display );
	},
	_activatePlayer : function() {

		// HIDE CONTROLS AND PART DISPLAY
		$controls = $( this._controls );
		 $part_display = $( this._part_display );
		   $controls.hide();
		    $part_display.hide();

		// SHOW PLAYER
		$player = $( this._player );
		$player.show();
	}
};
