// Extra functions
String.trim = function(str)
{
	return str.replace(/^\s+/, '').replace(/\s+$/, '');
}
String.fill = function(str, fill, length)
{
	if (length > str.length)
	{
		var str_fill = '';
		for (var i = 0; i < (length - str.length); i++)
		{
			str_fill += fill;
		}
		return str_fill + str;
	}
	else
	{
		return str;
	}
}

function $(id)
{
	return document.getElementById(id);
}

function isEven(x)
{
	return (x % 2) ? false : true;
}
function isOdd(x)
{
	return !isEven(x);
}