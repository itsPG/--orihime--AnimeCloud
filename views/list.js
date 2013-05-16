$(document).ready(function()
{
	$("a[delta]").each(function()
	{
		$(this).parent().css("background-color", "yellow");
	});
});