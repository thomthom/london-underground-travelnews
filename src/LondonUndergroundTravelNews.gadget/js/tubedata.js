///// TUBE DATA ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function refreshTubeinfo()
{
  ///// Set up XML HTTP Request ////////////////////////////////////////////////
  var http_request = new XMLHttpRequest();
  if ( !http_request )
  {
    MessageBox.show('Error! Cannot create an XMLHTTP instance.');
    return false;
  }
  status( 'Loading...' ); // (!) Display small animation in statusbar
  ///// Response function //////////////////////////////////////////////////////
  http_request.onreadystatechange = function()
  {
    if ( http_request.readyState == 4 )
    {
      if ( http_request.status == 200 )
      {
        // Success. Parse data.
        parseData( http_request.responseText );
        parseData( http_request.responseText );
      }
      else
      {
        // Failure. Display error information.
        var strMsg  = 'Error loading data.<br/>HTTP Error: ' + http_request.status;
        status( 'Error loading data.' );
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


function parseData( cache )
{
  // Set status
  status( 'Parsing...' );

  // Errorcheck
  if ( cache.length == 0 )
  {
    MessageBox.show( 'Error! No data.', MSG_DATAERROR );
    return;
  }

  ////////////////////////////////////////////////////////////////////////////
  // Get data chuck containing the travel news
  var data = cache.match(/<ul(?:\s\S+)*?\sid="lines"[\s\S]*?>([\s\S]*?)<\/ul>/i);
  if ( data == null )
  {
    MessageBox.show('Error! Could not locate tube data.');
    return;
  }
  // Get lines
  var lines_data = data[1].match(/<li\s+class="(?:\w+\s+)*ltn-line(?:\w+\s+)*">([\s\S]*?)<\/li>/gi);
  if (lines_data == null)
  {
    MessageBox.show('Error! Could not extract lines.');
    return;
  }
  resetScreen(); // Clear old data
  for (i = 0; i < lines_data.length; i++)
  {
    line_data = lines_data[i].match(/<li\s+class="(?:\w+\s+)*ltn-line(?:\s+\w+\s*)*">\s*<h3\s+class="(\w+)[\s\w-]+">([\s\S]+?)<\/h3>([\s\S]*?)<\/li>/i);
    if (line_data == null)
    {
      // Could not extract line data - try to ignore and read the rest
      continue;
    }
    lineClass = line_data[1];
    lineName = line_data[2];
    lineStatus = line_data[3]; // not really line status
    DOM_tubeline = document.getElementById(lineClass);
    
    // Extract status and messages
    lineData = lineStatus.match(/<div\s+class="(?:\w+\s+)*status(?:\s+\w+\s*)*">([\s\S]*)<\/div>/i);
    if (lineData == null)
    {
      // could not get status - report error as status
      continue;
    }
    statusData = lineData[1];
    
    // Check for elements with class 'ltn-title' - that indicate that there is
    // a message present. If not - then assume it [statusData] only contains
    // the status title.
    tmpData = statusData.match(/<\w+\s+class="ltn-title">([\s\S]+?)<\//i);
    if (tmpData == null)
    {
      // Good Service
      lineStatus = statusData;
    }
    else
    {
      // Problem
      lineStatus = tmpData[1];
      lineMessage = statusData.match(/<div\s+class="message">([\s\S]+)<\/div>/i);
      if (lineMessage != null)
      {
        message = lineMessage[1].replace(/<dl\s+class="linklist">[\s\S]*<\/dl>/i, '');
        DOM_tubeline.getElementsByTagName('div')[3].innerHTML = message;
      }
    }
    // Update status
    DOM_tubeline.title = lineName + ': ' + lineStatus;
    DOM_status = DOM_tubeline.getElementsByTagName('div')[2];
    // A line might have mulitple statuses. Pick out the most severe and display
    // that one.
    statuses = lineStatus.split(/,[\s]*/);
    status(lineName);
    for (j = 0; j < statuses.length; j++)
    {
      thisStatus = statuses[j];
      // Highlight as required
      switch (thisStatus.toLowerCase())
      {
        case 'severe delays':
        case 'suspended':
        case 'planned closure':
        case 'disrupted':
        case 'special service':
          if (DOM_tubeline.className != 'error')
          {
            DOM_tubeline.className = 'severe';
            compactStatus = thisStatus;
            break;
          }
        case 'part suspended':
        case 'part closure':
        case 'minor delays':
        case 'bus service':
          if (DOM_tubeline.className == 'normal')
          {
            DOM_tubeline.className = 'minor';
            compactStatus = thisStatus;
          }
          break;
        case 'good service':
          DOM_tubeline.className = 'normal';
          compactStatus = thisStatus;
          break;
        default:
          DOM_tubeline.className = 'error';
          compactStatus = 'Error';
          //compactStatus = thisStatus;
          break;
      }
    }
    DOM_status.innerHTML = compactStatus;
  } // end for
  // Format timestamp and update status
  var d = new Date();
  var hours   = String.fill(d.getHours().toString(),     '0', 2);
  var minutes = String.fill(d.getMinutes().toString(),   '0', 2);
  var date    = String.fill(d.getDate().toString(),      '0', 2);
  var month   = String.fill((d.getMonth()+1).toString(), '0', 2);
  status('Updated: ' + hours + ':' + minutes + ' ' + date + '/' + month);
  
  if (System.Gadget.docked)
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