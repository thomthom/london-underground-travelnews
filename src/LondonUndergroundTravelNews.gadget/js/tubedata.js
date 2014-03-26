///// TUBE DATA ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// See refreshTubeinfo() handling 12007 status code.
retry_network_connection = true;


function refreshTubeinfo()
{
  ///// Set up XML HTTP Request ////////////////////////////////////////////////
  var http_request = new XMLHttpRequest();
  if ( !http_request )
  {
    MessageBox.show( 'Error! Cannot create an XMLHTTP instance.' );
    return false;
  }
  update_status( 'Loading data...' ); // (!) Display small animation in statusbar
  ///// Response function //////////////////////////////////////////////////////
  http_request.onreadystatechange = function()
  {
    if ( http_request.readyState == 4 )
    {
      switch( http_request.status )
      {
      case 200:
        // Success. Parse data.
        parseData( http_request.responseXML );
        break;
      case 12007:
        // ERROR_WINHTTP_NAME_NOT_RESOLVED
        // http://msdn.microsoft.com/en-us/library/aa383770%28VS.85%29.aspx
        //
        // If the network is not connected this can be returned.
        // When a computer resumes from sleep it appear that the network isn't
        // ready when the gadget resumes and therefor this error is raised.
        // Because of this, a small retry is attempted with a small delay
        // before returning any error messages and invalidating the existing
        // data.
        if ( retry_network_connection )
        {
          update_status( 'Waiting for network...' );
          var seconds = 30;
          timerRefresh = setTimeout( refreshTubeinfo, 1000 * seconds );
          break;
        }
        // This code is meant to fall through here when it has done a retry.
      default:
        // Failure. Display error information.
        var strMsg  = 'Error loading data.<br/>HTTP Error: ' + http_request.status;
        update_status( 'Error loading data.' );
        MessageBox.show( strMsg, MSG_DATAERROR );
      }
    }
  };
  ///// Send HTTP request ////////////////////////////////////////////////////
  http_request.open( 'GET', DATA_SOURCE, true );
  http_request.setRequestHeader( 'If-Modified-Since', 'Sat, 1 Jan 2000 00:00:00 GMT' );
  http_request.send('');
  // Set the timer for next update
  timerRefresh = setTimeout( refreshTubeinfo, 60000 * interval);
}


function get_DOM_element_by_line_id(line_id)
{
  // Ideally the gadget would dynamically resize itself to the data given by the
  // feed. But in this emergency patch I simply map the ID's of the line to the
  // old HTML DOM ids.
  var map = {
    "1" : "bakerloo",
    "2" : "central",
    "7" : "circle",
    "9" : "district",
    "8" : "hammersmithandcity",
    "4" : "jubilee",
    "11" : "metropolitan",
    "5" : "northern",
    "6" : "piccadilly",
    "3" : "victoria",
    "12" : "waterlooandcity",
    "81" : "dlr",
    "82" : "overground"
  };
  var verbose_line_id = map[line_id];
  return document.getElementById(verbose_line_id);
}


function get_status_weight(status)
{
  // Rank per TFL guidelines of significance.
  var map = {
    "suspended"        : 8,
    "part suspended"   : 7,
    "planned closure"  : 6,
    "part closure"     : 5,
    "severe delays"    : 4,
    "reduced services" : 3,
    "bus service"      : 2,
    "minor delays"     : 1,
    "good_service"     : 0
  };
  return map[status.toLowerCase()];
}


function get_most_significant_status(statuses)
{
  var sorted = statuses.sort(function(a, b)
  {
    return get_status_weight(b) - map(a);
  });
  return sorted[0];
}


function get_status_class(status)
{
  var weight = get_status_weight(status);
  if (weight > 3)
  {
    return 'severe';
  }
  else if (weight > 0)
  {
    return 'minor';
  }
  return 'normal';
}


function parseData( xml_doc )
{
  update_status( 'Parsing...' );

  if ( xml_doc === null )
  {
    MessageBox.show( 'Error! No XML document.', MSG_DATAERROR );
    return;
  }

  var lines = xml_doc.getElementsByTagName('LineStatus');
  if ( lines.length == 0 )
  {
    MessageBox.show('Error! No line data.');
    return;
  }

  resetScreen(); // Clear old data
  for (var i = 0; i < lines.length; ++i)
  {
    var line_status = lines[i];
    var line = line_status.getElementsByTagName("Line")[0];
    var line_id = line.getAttribute('ID');
    var line_name = line.getAttribute('Name');
    var status = line_status.getElementsByTagName("Status")[0];
    var status_details = line_status.getAttribute('StatusDetails');
    var status_description = status.getAttribute('Description');

    // Get HTML DOM elements from the gadget UI.
    var dom_line = get_DOM_element_by_line_id(line_id);
    var dom_status = dom_line.getElementsByTagName('div')[2];
    var dom_details = dom_line.getElementsByTagName('div')[3];

    // Update the UI with the new data.
    dom_line.title = line_name + ': ' + status_description;
    dom_line.className = get_status_class(status_description);
    dom_status.innerHTML = status_description;
    dom_details.innerHTML = status_details;
  }

  // Format timestamp and update status
  var d = new Date();
  var hours   = String.fill(d.getHours().toString(),     '0', 2);
  var minutes = String.fill(d.getMinutes().toString(),   '0', 2);
  var date    = String.fill(d.getDate().toString(),      '0', 2);
  var month   = String.fill((d.getMonth()+1).toString(), '0', 2);
  update_status('Updated: ' + hours + ':' + minutes + ' ' + date + '/' + month);

  retry_network_connection = true; // Reset flag

  if ( IS_GADGET && System.Gadget.docked )
  {
    TimerDisplay.start();
  }
}

function clearFlyoutDetails()
{
  var DOM_tubeline;
  for (var i = 0; i < LINES.length; i++)
  {
    DOM_tubeline = document.getElementById(LINES[i]);
    DOM_tubeline.getElementsByTagName('div')[3].innerHTML = '';
    //DOM_tubeline.getElementsByTagName('div')[4].innerHTML = timestamp;
  }
  DOM_tubeline = null;
}
