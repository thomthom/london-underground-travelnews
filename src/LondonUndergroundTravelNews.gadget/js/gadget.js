/*
 * NOTE: This is an intermediate fix to address changes of the TFL source.
 * This part of the 1.4 release which I had to hack together in order to
 * be able to release a working gadget.
 *
 * TODO:
 * 1. Clean up my freakin' mess!
 * 2. Separate code layers
 * 3. Move/remove Tube logo
 * 4. Add version number in Settings page and link to any update availible.
 * 5. Ensure message box text is scrollable.
 *
 * MAYBE:
 * ~ Add new flyout displaying line map graphics
 * ~ Statusbar history
 *
 *
 * http://msdn2.microsoft.com/en-us/library/aa974179.aspx
 * Provide connection problem info.
 * Provide "Getting data..." message
 * Use default cursor. (Use other means to highligh interactive objects)
 */

////////////////////////////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////////////////////////////
IS_GADGET = ( typeof System !== 'undefined' );

if ( IS_GADGET )
{
  var VERSION = System.Gadget.version.split('.');
  var V_MAJOR = parseInt( VERSION[0] );
  var V_MINOR = parseInt( VERSION[1] );
  var V_REVIS = parseInt( VERSION[2] );
} else {
  // Debug version
  var V_MAJOR = 9;
  var V_MINOR = 9;
  var V_REVIS = 9;
}

var PROG_ID = 'LULT_WS';

var UPDATE_REPOSITORY  = 'http://skynet.thomthom.net/software/';
    UPDATE_REPOSITORY += PROG_ID + '/' + V_MAJOR + '.' + V_MINOR + '.' + V_REVIS;
    UPDATE_REPOSITORY += '/packages.xml';

//var HEIGHT = 238; // 15 per line
var FULL_HEIGHT = 253; // 15 per line
var WIDTH_DOCKED  = 141;
var WIDTH_UNDOCKED  = 230;

var DATA_SOURCE = 'http://cloud.tfl.gov.uk/TrackerNet/LineStatus';

var LINES = new Array(
	'bakerloo',
	'central',
	'circle',
	'district',
	'hammersmithandcity',
	'jubilee',
	'metropolitan',
	'northern',
	'piccadilly',
	'victoria',
	'waterlooandcity',
	'dlr',
	'overground'
	);

var MSG_DEFAULT = 0;
var MSG_DATAERROR = 1;

////////////////////////////////////////////////////////////////////////////////
// GLOBALS
////////////////////////////////////////////////////////////////////////////////

// Data update interval in minutes
var interval = 1;

// Boolean controlling if the name and status needs to be alternated when gadget
// is docked.
var flashStatus = true;

// Timer object to refresh the display when flashStatus = true.
var timerRefresh = null;

// Graphics objects
var bgBody;
var bgFoot;


////////////////////////////////////////////////////////////////////////////////
// FUNCTIONS
////////////////////////////////////////////////////////////////////////////////
function init()
{
	///// Set up background image //////////////////////////////////////////////
	with (imgBg.style)
	{
		position = 'absolute';
		left = 0;
		top = 0;
		width  = '141px';
		height = FULL_HEIGHT + 'px'; //'238px'; // 15*12=180 -- 238-180=58
	}
	imgBg.src = 'url(images/windowMain2.png)';
  if ( IS_GADGET )
  {
    bgBody = imgBg.addImageObject('url(images/windowMain_body.png)', 0, 40);
    bgFoot = imgBg.addImageObject('url(images/windowMain_footer.png)', 0, 210);
  }
  else
  {
    undockGadget();
    document.body.style.background = '#000';
    document.body.style.marginLeft = 'auto';
    document.body.style.marginRight = 'auto';
  }

	///// Configure Gadget /////////////////////////////////////////////////////
  if ( IS_GADGET )
  {
    System.Gadget.settingsUI = "Settings.html";
    System.Gadget.onSettingsClosed = SettingsClosed;

    System.Gadget.Flyout.file = "Flyout.html";

    System.Gadget.onUndock = undockGadget;
    System.Gadget.onDock = dockGadget;
  }

	///// Load settings ////////////////////////////////////////////////////////
  if ( IS_GADGET )
  {
    readSettings();
  }

	///// Initialise ///////////////////////////////////////////////////////////
	refreshTubeinfo();
  if ( IS_GADGET )
  {
    updateCheck();
  }
	//messageBox('Hello World', null);
	//MessageBox.show('Hello World', null);
}


///// SETTINGS /////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function readSettings()
{
	// Read the update interval
	var settingInterval = System.Gadget.Settings.read("interval");
	if (settingInterval != "")
	{
		interval = settingInterval;
	}

	// Read what lines to monitor and hide/show lines appropriately
	for (i = 0; i < LINES.length; i++)
	{
		lineName = LINES[i];
		if (System.Gadget.Settings.read(lineName) === false)
		{
			$(lineName).style.display = 'none';
		}
		else
		{
			$(lineName).style.display = 'block';
		}
	}

	// Update the gadget's size
	resize();
}

////////////////////////////////////////////////////////////////////////////////
function SettingsClosed() {
	// Get settings
    var settingInterval = System.Gadget.Settings.read("interval");
	if (settingInterval != "")
		interval = settingInterval;
	displayLines();
	// Reset timer
	clearTimeout(timerRefresh);
	timerRefresh = setTimeout('refreshTubeinfo()', 60000 * interval);
}


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// OLD FUNCTIONS
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


function showFlyout(tubeline)
{
	if (System.Gadget.Flyout.show)
	{
		showFlyoutEvent(tubeline);
    }
	else
	{
		System.Gadget.Flyout.onShow = function() { showFlyoutEvent(tubeline) };
		System.Gadget.Flyout.show = true;
	}
}
function showFlyoutEvent(tubeline)
{
	// Get elements
	var lineInfo = tubeline.getElementsByTagName('div');
	var lineName      = lineInfo[1].childNodes[0].nodeValue;
	var lineStatus    = lineInfo[2].childNodes[0].nodeValue;
	var lineDetails   = lineInfo[3].innerHTML;
	/*temp = lineDetails;
	temp = temp.replace(/</g, '(');
	temp = temp.replace(/>/g, ')');
	MessageBox.show( temp );*/

	var lineTimestamp = lineInfo[4].childNodes[0].nodeValue;
	var lineID = tubeline.id;
	// Set info
	var flyout = System.Gadget.Flyout.document;
	var content = flyout.getElementById('content');
	content.innerHTML = '<h1 class="' + lineID +'">' + lineName + '</h1><h2>' + lineStatus + '</h2><div id="details">' + lineDetails + '</div><span id="detailTimestamp">' + lineTimestamp + '</span>';
}
