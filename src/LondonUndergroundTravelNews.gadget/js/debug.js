function DEBUG(str)
{
	return;
	var statusBar = document.getElementById('debug');
	statusBar.innerHTML += '<br/>\n' + str;
}

function DEBUG_CLEAR()
{
	return;
	var statusBar = document.getElementById('debug');
	statusBar.innerHTML = '=== DEBUG ===';
}