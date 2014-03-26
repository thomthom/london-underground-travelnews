function updateCheck()
{
	try
	{
		var http_request = new XMLHttpRequest(); // IE7 http request
		// Error handle
		if (!http_request) {
			update_status('ERROR: new XMLHttpRequest()');
	        return false;
	    }
		http_request.onreadystatechange = function() { updateHttp(http_request); };
		http_request.open("GET", UPDATE_REPOSITORY, true);
		http_request.setRequestHeader( "If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT" );
		http_request.send("");
	}
	catch(e)
	{
		update_status(e.description);
	}
}
function updateHttp(http_request)
{
	try
	{
		if (http_request.readyState == 4)
		{
	        if (http_request.status == 200)
			{
				// Define variables
				var doc = http_request.responseXML;
				var content = document.getElementById('content');

				var root = doc.documentElement;

				// Locate the data for this app
				var application = false;
				var applications = root.getElementsByTagName('application');
				for (var i = 0; i < applications.length; i++)
				{
					if (applications[i].getAttribute('id') == PROG_ID)
					{
						application = applications[i];
						break;
					}
				}
				if (!application) {
					update_status('Could not find update data.');
					return;
				}

				// Get version info
				var version = application.getElementsByTagName('version')[0];
				var vMajor = version.getElementsByTagName('major')[0].firstChild.nodeValue;
				var vMinor = version.getElementsByTagName('minor')[0].firstChild.nodeValue;
				var vRevis = version.getElementsByTagName('revision')[0].firstChild.nodeValue;

				// Check if gadget is up to date
				if (V_MAJOR > vMajor)
				{
					return;
				}
				if (V_MAJOR == vMajor && V_MINOR > vMinor)
				{
					return;
				}
				if (V_MAJOR == vMajor && V_MINOR == vMinor && V_REVIS >= vRevis)
				{
					return;
				}

				// If the function haven't exited yet, it means there is an update.
				var file = application.getElementsByTagName('file')[0];
				var downloadList = '';
				var title, URL;
				for (var i = 0; i < file.childNodes.length; i++)
				{
					title = file.childNodes[i].getAttribute('title');
					URL = file.childNodes[i].firstChild.nodeValue;
					downloadList += '<li><a href="' + URL + '">' + title + '</a></li>';
				}

				// Build HTML message
				info = '<h2>New Update!</h2>' + '<p>Version: ' + vMajor + '.' + vMinor + '.' + vRevis + '</p>';
				info += '<p>Download from: <ul>' + downloadList + '</ul></p>';
				info += '<p><a href="javascript:MessageBox.close();">Update Later</a></p>';
				// OUtput HTML message
				MessageBox.show(info, MSG_DEFAULT);
				update_status('<a href="javascript:MessageBox.reopen();">Update Availible!</a>');
			}
		}
	}
	catch(e)
	{
		update_status(e.description);
	}
}
function closeInfo() {
	try
	{
		document.getElementById('info').style.visibility = 'hidden';
	}
	catch(e) {}
}
