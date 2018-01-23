/*
 * - Thought
 *   --- CONCEPT
 *   * Think of it like a sentence
 *   *	- May have to break this up later
 *   --- RELATIONS
 *   *   - thoughts can have thoughts as children
 *   *	  ++ but ONLY ONE
 *   *   - child thoughts can have multiple parents
 *   *   - thoughts can be referenced by other thoughts
 *
 * - Experience
 *   Type a thought
 *   	- New thought bubble is created
 *   	 ++ you can expound, move on to the next thought, or review
 *   	 +++ (but then, or therefore)
 *   	 ++ (Done by keyboard)
 */

/*
 * Issues:::
 *
 * - Placement of elements on canvas
 *   - creates a strange issue with radius drawing
 */

ws.Composer = function(user_options) {

	this._options = {
		input_container : null,
		input_field : null,
		input_form : null,
		space : null,
		space_canvas : null,
	}

	ws.extend(this._options, user_options);

	this.input_container = this._options.input_container;
	this.input_field = this._options.input_field;
	this.input_form = this._options.input_form;
	this.space = this._options.space;
	this.space_display = this._options.space_display;
	this.space_canvas = this._options.space_canvas;

	this.canvas_context = '2d';

	this.canvas_object_set;

	this.x_start = 30;
	this.y_start = 50;

	this.y_interval = 60;

	this.x_now = this.x_start;
	this.y_now = this.y_start;

	// event vars
	this.mouse_holding = false;
	this.move_interval;

	this.move_interval_distance = 5; // confusing language, refers to how many pixels to move every interval

	this.WRITE_STATES = Object.freeze({
		THOUGHT : 0,
		PASSAGE : 1
	});

	this.current_write_state = null;
	this.current_passage = null;

	// initialize
	this._init();
}

ws.Composer.prototype = {

	_init : function() {

		var self = this;

		this.canvas_object_set = new ws.CanvasObjectSet(this.space_canvas);
		
		// initialize default: 
		// 	- passage
		// 	- write state
		this.current_passage= new ws.Passage();
		this.current_write_state = this.WRITE_STATES.THOUGHT;

		// assign events
		//
		$( this.input_form).submit( function(e) {

			// stop the reload
			e.preventDefault();
			
			// the actual stuff, needs the thing
			self._addThought();
		});

		$( this.space_canvas ).click(this._handleClick.bind(this));

		$(".move-button").on('mouseup mousedown', this._setCanvasMovement.bind(this));
	},
	_addThought : function() {

		// retrieve text
		var text = $( this.input_field ).val();

		if (this.current_write_state === this.WRITE_STATES.THOUGHT) {

			// create and add new thought
			var thought = new ws.Thought( this._getCanvasContext(), text, this.x_now, this.y_now );
			this.current_passage._add(thought);
		}

		if (this.current_write_state === this.WRITE_STATES.PASSAGE) {

			// create new passage, create and add new thought
			this.current_passage = new ws.Passage();
			var thought = new ws.Thought( this._getCanvasContext(), text, this.x_now, this.y_now );
			this.current_passage._add(thought);

		}

		this._proceed();

		// the thought goes into the SECTION
		//
		// the SECTION decides what it is (not exactly)
		//
		// the USER decides what it is
		//   - the SECTION remembers the user's decision
		//   - and awaits further instruction
		//
		// if it is a NEW SECTION
		//   - by default, start a new passage

		/*
		// create new thought
		var thought = new ws.Thought( this._getCanvasContext(), text, this.x_now, this.y_now );

		this.canvas_object_set._add( thought );

		// add thought to canvas
		this._displayThoughtOnCanvas( thought );

		*/

		// clear form
		$( this.input_field ).val('');
	},
	_displayThoughtOnCanvas : function( thought ) {

		// figure out where thought should go
		var x = 0;
		var y = 0;

		// assign thought position
		thought._setPosition(x, y);

		// draw
		this._setThought( thought );
	},
	_setThought : function(thought) {

		/*
		// get canvas and draw thought
		var ctx = this._getCanvas();
		ctx.beginPath();
		ctx.arc(100,75,50,0,2*Math.PI);
		ctx.stroke();
		*/
	},
	_getCanvasContext : function() {
		return this.space_canvas.getContext( this.canvas_context );
	},
	_handleClick : function(e) {

		// get clicked thought
		var thought = this.canvas_object_set._getClickedObject(e);

		// display text
		if (thought) {
			var text = thought._getText();
			$( this.space_display ).text( text );
		}
	},
	_proceed : function() {

		// call overlay
		openNav();

		// assign on keydown event listener
		window.onkeydown = this._waitToCloseNav.bind(this);
		
		// assign link listeners
	},
	_getKeyCode : function(e) {

		var key_code = ('which' in e) ? e.which : e.keyCode;

		// check for tab
		if (key_code === 9) {
		  return false;
		}
		else {
		  return key_code;
		}
	},
	_waitToCloseNav : function(e) {

		var key_code = this._getKeyCode(e);
		var direction;

		if (key_code == 39)
		  direction = 'right'; 
		else if (key_code == 40)
		  direction = 'down';

		closeNav();

		this._prepareForNextThought(direction);

		ws.detach(window, 'keydown', this._waitToCloseNav);
	},
	_prepareForNextThought : function(direction) {

		if (direction == 'right') {

			// set position
			this.x_now += 60;

			// set state
			this.current_write_state = this.WRITE_STATES.THOUGHT;
		}
		
		if (direction == 'down') {

			// set position
			this.x_now = this.x_start;
			this.y_now += this.y_interval;

			// set state
			this.current_write_state = this.WRITE_STATES.PASSAGE;
		}
	},
	_setCanvasMovement : function(e) {

		var button_id = e.target.id;
		var dimension;
		var value;

		//////////
		// Figure out where we're going
		//

		if (button_id == 'canvas-move-right') {
			dimension = 'x';
			value = this.move_interval_distance;
		}
		else if (button_id == 'canvas-move-left') {
			dimension = 'x';
			value = (-1) * this.move_interval_distance;
		}
		else if (button_id == 'canvas-move-up') {
			dimension = 'y';
			value = this.move_interval_distance;
		}
		else if (button_id == 'canvas-move-down') {
			dimension = 'y';
			value = (-1) * this.move_interval_distance;
		}

		////////
		// Set interval
		//
		
		if (this._isMouseHolding(e)) {

			this.move_interval = setInterval(this._moveCanvas.bind(this, dimension, value), 30);
			//this._moveCanvas(dimension, value);
		}
		else {
			clearInterval(this.move_interval);
		}
	},
	_moveCanvas : function(dimension, value) {

		this._clearCanvas();
		this.canvas_object_set._move(this._getCanvasContext(), dimension, value);
	},
	_clearCanvas : function() {
		
		var context = this._getCanvasContext();
		context.clearRect(0, 0, this.space_canvas.width, this.space_canvas.height);
	},
	_isMouseHolding : function(e) {
		if (e.type == "mousedown") {
		  return true;
		}
		else {
		  return false;
		}
	}
}

ws.Section = function() {

	this.head = null;
}

ws.Section.prototype = new ws.DoubleLinkedList();

ws.extend( ws.Section.prototype, {

});

ws.Passage = function() {

	this.next = null;

	this.ancestor = null;
	this.child = null;

	this._init();
}

ws.Passage.prototype = new ws.DoubleLinkedList();

ws.extend( ws.Passage.prototype, {
	
	_init : function() {
	
		// make head a reference to itself
	}
});

ws.Thought = function(context, text, x, y) {

	this.x = null;
	this.text = null;
	this.y = null;

	this.radius = 25;
	
	this._setPosition(x, y);
	this._setText(text);

	this._draw(context);
}

ws.Thought.prototype = new ws.ListNode();

ws.extend( ws.Thought.prototype, {

	_draw : function(context) {

		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
		context.fill();
	},
	_setPosition : function(x, y) {
		this.x = x;
		this.y = y;
	},
	_getText : function() {
	  	return this.text;
	},
	_setText : function(text) {
		this.text = text;
	},
	_isPositionInside : function(x, y) {

		// pythagorean theorem givin me the distance
		//
		// NOTE::::have to add radius to y because x and y indicate the TOP of the circle
		//
		var distance = Math.sqrt( Math.pow((x - this.x), 2) + Math.pow((y - this.y), 2) );

		if (distance <= this.radius)
		  return true;
		else
		  return false;
	},
	_moveRight : function(distance) {
		this.x += distance;
	},
	_move : function(dimension, distance) {
		this[dimension] += distance;
		// a little safer
		/*
		if ($.inArray(dimension, ['x', 'y']) > -1) {
		}
		*/
	},
	_toPassage : function() {

		var node = this.previous;
		var passage = new ws.Passage();

		passage._add(this);
		node.next = passage;
	}
});

// Interesting solution,
//   class has different objects
//   the objects act as the interface
//

ws.CanvasObjectSet = function(canvas) {

	this.canvas = canvas;

	// get offset vars
	var offset = $( this.canvas ).offset();
	this.offset_x = offset.left;
	this.offset_y = offset.top;


	this.objects = [];
}

ws.CanvasObjectSet.prototype = {

	_add : function(object) {
		this.objects.push(object);
	},
	_delete : function(object) {

		/*
		var index = 0;

		// remove object
		this.objects.splice(index, 1);
		*/
	},
	_getClickedObject : function(e) {

	    // calculate the mouse click position
	    var mouse_x = parseInt(e.clientX - this.offset_x);
	    var mouse_y = parseInt(e.clientY - this.offset_y);

	    for (var i = 0; i < this.objects.length; i++) {

		    if (this.objects[i]._isPositionInside(mouse_x, mouse_y)) {
			return this.objects[i];
		    }
	    }

	    return false;
	},
	_move : function(context, dimension, distance) {

	    for (var i = 0; i < this.objects.length; i++) {

		    this.objects[i]._move(dimension, distance);
		    this.objects[i]._draw(context);
	    }
	}
}

/* Open when someone clicks on the span element */
function openNav() {
    document.getElementById("myNav").style.height = "100%";
}

/* Close when someone clicks on the "x" symbol inside the overlay */
function closeNav() {
    document.getElementById("myNav").style.height = "0%";
}
