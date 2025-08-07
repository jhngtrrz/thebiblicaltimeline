var landingContainer = $('div.landing-container')[0];
var landingStage = $('div.landing-stage')[0];
var landingPaper = $('div.landing-paper')[0];
var landingGrid = $('div.landing-grid')[0];

/*	Initialize Landing Scroller
---------------------------------------------------------------------- */
var landing = new Scroller(function (left, top, zoom) {
	landingStage.style[transformProperty] = 'translate3d(' + (-left) + 'px,0px,0) scale(1)'; // Move events
	landingPaper.style[transformProperty] = 'translate3d(' + (-(left / 3)) + 'px, 0px,0) scale(1)'; // Move events
	landingGrid.style[transformProperty] = 'translate3d(' + (-(left / 3)) + 'px, 0px,0) scale(1)'; // Move events
}, {
	zooming: true
});

landing.setOffset(0, 0);

/*	Reflow
---------------------------------------------------------------------- */
var reflow_landing = function () {
	var landingWidth = (landingStage.clientWidth != 0) ? landingStage.clientWidth : 2525;
	var landingHeight = (landingStage.clientHeight != 0) ? landingStage.clientHeight : 845;
	landing.setDimensions(clientWidth, clientHeight, landingWidth, landingHeight);

	// Notes:
	// If the user loads the page on a period view, the home page isn't
	// able to reflow properly. This why I'm explicitly setting the 
	// dimensions above if the landingStage is hidden.
};
window.addEventListener("resize", reflow_landing, false);
reflow_landing();

/*	Events
---------------------------------------------------------------------- */

$('div.landing').on('MSPointerDown', function (e) {

});

// Listen for Touch and Mouse Events on Timeline
if ('ontouchstart' in window) {
	landingContainer.addEventListener("touchstart", function (e) {
		if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
			return;
		}
		landing.doTouchStart(e.touches, e.timeStamp);
		e.preventDefault();
	}, false);
	landingContainer.addEventListener("touchmove", function (e) {
		landing.doTouchMove(e.touches, e.timeStamp, e.scale);
	}, false);
	landingContainer.addEventListener("touchend", function (e) {
		landing.doTouchEnd(e.timeStamp);
	}, false);
	landingContainer.addEventListener("touchcancel", function (e) {
		landing.doTouchEnd(e.timeStamp);
	}, false);
}

else if ('onmsgesturechange' in window) {
	var mousedown = false;
	landingContainer.addEventListener("MSPointerDown", function (e) {
		if (e.target.tagName.match(/input|textarea|select/i)) {
			return;
		}
		landing.doTouchStart([{
			pageX: e.pageX,
			pageY: e.pageY
		}], e.timeStamp);
		mousedown = true;
	}, false);
	landingContainer.addEventListener("MSPointerMove", function (e) {
		if (!mousedown) {
			return;
		}
		landing.doTouchMove([{
			pageX: e.pageX,
			pageY: e.pageY
		}], e.timeStamp);
		mousedown = true;
	}, false);
	landingContainer.addEventListener("MSPointerUp", function (e) {
		if (!mousedown) {
			return;
		}
		landing.doTouchEnd(e.timeStamp);
		mousedown = false;
	}, false);
}

else {
	var mousedown = false;
	landingContainer.addEventListener("mousedown", function (e) {
		if (e.target.tagName.match(/input|textarea|select/i)) {
			return;
		}
		landing.doTouchStart([{
			pageX: e.pageX,
			pageY: e.pageY
		}], e.timeStamp);
		mousedown = true;
	}, false);
	landingContainer.addEventListener("mousemove", function (e) {
		if (!mousedown) {
			return;
		}
		landing.doTouchMove([{
			pageX: e.pageX,
			pageY: e.pageY
		}], e.timeStamp);
		mousedown = true;
	}, false);
	landingContainer.addEventListener("mouseup", function (e) {
		if (!mousedown) {
			return;
		}
		landing.doTouchEnd(e.timeStamp);
		mousedown = false;
	}, false);
}

// Bind the arrow buttons
$('div.landing-container div.arrow.left').on('click', function () { landing.scrollBy(-250, 0, true); });
$('div.landing-container div.arrow.right').on('click', function () { landing.scrollBy(250, 0, true); });

// Bind keyboard arrows
$(document).keydown(function (e) {
	if (e.keyCode == 38) {
		// Up
		zoomIn();
		return false;
	}
	if (e.keyCode == 40) {
		// Down
		zoomOut();
		return false;
	}
	if (e.keyCode == 37) {
		landing.scrollBy(-150, 0, true);
		return false;
	}
	if (e.keyCode == 39) {
		landing.scrollBy(150, 0, true);
		return false;
	}
});

// Zoom in and out
$('div.zoom li.zoom-in').on('click', zoomIn);
$('div.zoom li.zoom-out').on('click', zoomOut);

var landing_zoom = 1;
function zoomIn() {
	landing_zoom++;
	if (landing_zoom > 2) { landing_zoom = 2; }
	setLandingZoom(landing_zoom);
}
function zoomOut() {
	landing_zoom--;
	if (landing_zoom == -1) { landing_zoom = 0; }
	setLandingZoom(landing_zoom);
}

function setLandingZoom(level) {
	// Change nav indicator
	$('ul.indicator li').removeClass('active');
	$('ul.indicator li:eq(' + level + ')').addClass('active');

	// Change Stage Class
	$('div.landing-stage').removeClass('zoom-1 zoom-2 zoom-3');
	$('div.landing-stage').addClass('zoom-' + (level + 1));

	// Reflow Scroller
	reflow_landing();
}

// Go Full Screen
var fullscreen = false;
$('div.zoom li.full').on('click', function () {
	if (fullscreen == true) {
		fullscreen = false;
		if (document.documentElement.cancelFullScreen) {
			document.documentElement.cancelFullScreen();
		} else if (document.documentElement.mozCancelFullScreen) {
			document.documentElement.mozCancelFullScreen();
		} else if (document.documentElement.webkitCancelFullScreen) {
			document.documentElement.webkitCancelFullScreen();
		}
	} else {
		fullscreen = true;
		if (document.documentElement.requestFullScreen) {
			document.documentElement.requestFullScreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullScreen) {
			document.documentElement.webkitRequestFullScreen();
		}
	}
});