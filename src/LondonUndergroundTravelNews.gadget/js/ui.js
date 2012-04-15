////////////////////////////////////////////////////////////////////////////////
///// USER INTERFACE ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


///// GADGET SIZING ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function dockGadget()
{
	// Adjust <BODY>
	document.body.className = 'docked';
	document.body.style.width = WIDTH_DOCKED + 'px';

	// Set up gadget background
	imgBg.src = 'url(images/windowMain2.png)';
	imgBg.style.width = WIDTH_DOCKED + 'px';

	bgBody.src = 'url(images/windowMain_body.png)';
	bgBody.width = WIDTH_DOCKED;

	bgFoot.src = 'url(images/windowMain_footer.png)';
	bgFoot.width = WIDTH_DOCKED;

	// Hide all .lineStatus elements
	var spans = document.getElementsByTagName('div');
	for (var i = 0; i < spans.length; i++)
	{
		if (spans[i].className == 'lineStatus')
		{
			spans[i].style.display = 'none';
		}
	}
	// Gadget is at half size, alternate the line/status.
	TimerDisplay.start();
}

////////////////////////////////////////////////////////////////////////////////
function undockGadget()
{
	// Adjust <BODY>
	document.body.className = 'undocked';
	document.body.style.width = WIDTH_UNDOCKED + 'px';

	// Set up gadget background
	imgBg.src = 'url(images/windowExWideMain2.png)';
	imgBg.style.width = WIDTH_UNDOCKED + 'px';

	bgBody.src = 'url(images/windowExWideMain_body.png)';
	bgBody.width = WIDTH_UNDOCKED;

	bgFoot.src = 'url(images/windowExWideMain_footer.png)';
	bgFoot.width = WIDTH_UNDOCKED;

	// Make sure that all .lineName and .lineStatus elements are visible as
	// they will alternate when in docked mode.
	var spans = document.getElementsByTagName('div');
	for (var i = 0; i < spans.length; i++)
	{
		if (spans[i].className == 'lineName')
		{
			spans[i].style.display = 'inline';
		}
		if (spans[i].className == 'lineStatus')
		{
			spans[i].style.display = 'inline';
		}
	}
	// Gadget is at full size, don't alternate the line/status any more.
	TimerDisplay.stop();
}

////////////////////////////////////////////////////////////////////////////////
// Resizes and position elements. Must be called whenever the gadget is resized.
function resize()
{
	// (!) Make numbers into constants
	// Find out how many elements is visible
	var lines = tubelines.getElementsByTagName('li');
	var count = 0;
	for (i = 0; i < lines.length; i++)
	{
		if (lines[i].style.display != 'none')
		{
			count++;
		}
	}

	// Calculate the Gadget height
	var height = 58 + (15 * count);
	height = Math.max(height, 57); // Min height of gadget (57)

	// Apply new height
	document.body.style.height = height + 'px';

	// Adjust footer
	bgFoot.top = height - bgFoot.height;

	// Size the body image
	var bodyHeight = Math.round(height - 40 - bgFoot.height);
	var bodyTopOffset = Math.round((170 - bodyHeight) / 2);
	// When the g:image is resized it's top is offset by the half of the
	// remaining space

	bgBody.top = Math.round(40 - bodyTopOffset);
	bgBody.height = bodyHeight + 2;
	// The + 2 is due to edge bluring we need to increase the height by 2 px to
	// overlap the footer and header

	// Resize any message box that might be displayed.
	MessageBox.resize();
}

///// CONTENT VISIBILITY ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Loops through all lines and display them if the settings allows it.
// (!) Convert function into a loop that iterates the lines array.
function displayLines()
{
	displayLine('bakerloo');
	displayLine('central');
	displayLine('circle');
	displayLine('district');
	displayLine('hammersmithandcity');
	displayLine('jubilee');
	displayLine('metropolitan');
	displayLine('northern');
	displayLine('piccadilly');
	displayLine('victoria');
	displayLine('waterlooandcity');
	displayLine('dlr');
	displayLine('overground');
	resize();
}

////////////////////////////////////////////////////////////////////////////////
// Displays or hides the given line depending on user settings.
function displayLine(lineName)
{
	var displayLine = System.Gadget.Settings.read(lineName);
	if (displayLine === false)
	{
		$(lineName).style.display = 'none';
	}
	else
	{
		$(lineName).style.display = 'block';
	}
}

////////////////////////////////////////////////////////////////////////////////
// This function is responsible to alternate the display of the line name and
// the line status. It's this.on property keeps track of whether the line name
// should be displayed or not.
function blinkScreen()
{
	// Make sure on state is defines
	if (!this.on)
		this.on = false;
	// Get elements and define variables
	var tubelinesList = document.getElementById('tubelines');
	var tubelines = tubelinesList.getElementsByTagName('li');
	var tubeline = null;
	var lineInfo = null;
	var lineName = null;
	var lineStatus = null;
	// Show or hide each element as needed
	for (var i = 0; i < tubelines.length; i++)
	{
		// Get elements
		tubeline = tubelines[i];
		if (tubeline.className != 'normal')
		{
			lineInfo = tubeline.getElementsByTagName('div');
			lineName = lineInfo[1];
			lineStatus = lineInfo[2];
			// Set properties
			lineName.style.display = (this.on) ? 'none' : 'inline';
			lineStatus.style.display = (this.on) ? 'inline' : 'none';
		}
	}
	this.on = !this.on; // Invert state
}

////////////////////////////////////////////////////////////////////////////////
// Resets all line elements to their default state. Then depending on the docked
// state of the gadget, alternating line name and line status will be initiated.
function resetScreen()
{
	// Reset state
	blinkScreen.on = false;
	// Get elements and defien variables
	var tubelinesList = document.getElementById('tubelines');
	var tubelines = tubelinesList.getElementsByTagName('li');
	var tubeline = null;
	var lineInfo = null;
	var lineName = null;
	var lineStatus = null;
	var lineDetail = null;
	var lineTimestamp = null;

	for (var i = 0; i < tubelines.length; i++)
	{
		// Get elements
		tubeline = tubelines[i];
		if (tubeline.className != 'normal')
		{
			/*
			lineInfo = tubeline.getElementsByTagName('span');

			lineName = lineInfo[1];
			lineStatus = lineInfo[2];
			lineDetail = lineInfo[3];
			lineTimestamp = lineInfo[4];
			*/
      
      tubeline.className = 'normal';

			lineInfo = tubeline.getElementsByTagName('div');

			lineName = lineInfo[1];
			lineStatus = lineInfo[2];
			lineTimestamp = lineInfo[3];
			lineDetail = lineInfo[4];

			// Set properties
			if (System.Gadget.docked)
			{
				lineName.style.display = 'inline';
				lineStatus.style.display = 'none';
			}
			else
			{
				lineName.style.display = 'inline';
				lineStatus.style.display = 'inline';
			}
			lineStatus.innerHTML = 'n/a';
			lineDetail.innerHTML = 'No further information.';
			lineTimestamp.innerHTML = '--/--';
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
function status(str)
{
	var statusBar = document.getElementById('statusBar');
	statusBar.innerHTML = str;
}

////////////////////////////////////////////////////////////////////////////////
// OBJECTS
////////////////////////////////////////////////////////////////////////////////

///// TIMER DISPLAY ////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function TimerDisplay()
{
	var timerID = null;
}
TimerDisplay.start = function()
{
	// Reset and start timer to alternate the line's status and names
	if (TimerDisplay.timerID) clearInterval(TimerDisplay.timerID);
	TimerDisplay.timerID = setInterval(blinkScreen, 2500);
}
TimerDisplay.stop = function()
{
	// Reset the timer alternating the line status and name
	clearInterval(TimerDisplay.timerID);
	blinkScreen.on = false;
}

///// MESSAGEBOX ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
function MessageBox()
{
	// Contructor
}
MessageBox.show = function(content, type)
{
	switch (type)
	{
		case MSG_DATAERROR:
			content += '<br/></br><a href="#" onclick="MessageBox.close();refreshTubeinfo();return false;">Refresh</a>';
			break;
	} // switch

	msg = $('messagebox');
	msg.innerHTML = '<div id="msgContainer">' + content  + '</div>';

	// Set up the correct dimmensions
	MessageBox.resize();

	msg.style.visibility = 'visible';
}
MessageBox.resize = function()
{
	var height = document.body.clientHeight - 68; // minus minHeight + padding

	var msg = $('messagebox');
	var container = $('msgContainer');

	var parentHeight = msg.clientHeight;
	//var top = (parentHeight / 2) - (container.clientHeight / 2) - 10;
	var top = (height / 2) - (parentHeight / 2) - 10;

	top = Math.max(0, top); // No negative number

	msg.style.height = height;
	//container.style.paddingTop = top + 'px';
	var temp = -(container.clientHeight / 2);
	container.style.marginTop = temp + 'px';
	//status(top + 'px - ph: ' + parentHeight + ' - cH: ' + container.clientHeight + ' - H: ' + height);
}
MessageBox.close = function()
{
	msg = $('messagebox');
	msg.style.visibility = 'hidden';
}
MessageBox.reopen = function()
{
	msg = $('messagebox');
	msg.style.visibility = 'visible';
}