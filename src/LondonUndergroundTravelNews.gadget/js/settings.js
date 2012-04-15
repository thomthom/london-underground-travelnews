var interval = null;
var blinkStatus = null;

function $(id)
{
	return document.getElementById(id);
}

function init()
{
	interval = $('interval');
	//blinkStatus = document.getElementById('blinkStatus');

	var currentSetting = System.Gadget.Settings.read('interval');
	if (currentSetting != '') {
		interval.value = currentSetting;
	}

	setLineCheckbox('bakerloo');
	setLineCheckbox('central');
	setLineCheckbox('circle');
	setLineCheckbox('district');
	setLineCheckbox('hammersmithandcity');
	setLineCheckbox('jubilee');
	setLineCheckbox('metropolitan');
	setLineCheckbox('northern');
	setLineCheckbox('piccadilly');
	setLineCheckbox('victoria');
	setLineCheckbox('waterlooandcity');
	setLineCheckbox('dlr');
	setLineCheckbox('overground');

	System.Gadget.onSettingsClosing = SettingsClosing;

	$('version').innerHTML = 'Version: ' + System.Gadget.version;
}

function SettingsClosing(event)
{
	if (event.closeAction == event.Action.commit) {
		System.Gadget.Settings.write('interval', interval.value);
		// Show/Hide Lines
		System.Gadget.Settings.write('bakerloo',     $('bakerloo').checked);
		System.Gadget.Settings.write('central',      $('central').checked);
		System.Gadget.Settings.write('circle',       $('circle').checked);
		System.Gadget.Settings.write('district',     $('district').checked);
		System.Gadget.Settings.write('hammersmithandcity', $('hammersmithandcity').checked);
		System.Gadget.Settings.write('jubilee',      $('jubilee').checked);
		System.Gadget.Settings.write('metropolitan', $('metropolitan').checked);
		System.Gadget.Settings.write('northern',     $('northern').checked);
		System.Gadget.Settings.write('piccadilly',   $('piccadilly').checked);
		System.Gadget.Settings.write('victoria',     $('victoria').checked);
		System.Gadget.Settings.write('waterlooandcity',     $('waterlooandcity').checked);
		System.Gadget.Settings.write('dlr',          $('dlr').checked);
		System.Gadget.Settings.write('overground',   $('overground').checked);
	}

	event.cancel = false;
}

function setLineCheckbox(id)
{
	var setting = System.Gadget.Settings.read(id);
	$(id).title = (setting) ? 'True - ' + setting : 'False - ' + setting;
	if (setting === true || setting === false)
	{
		$(id).checked = setting;
		$(id).title += ' (!)';
	}
}