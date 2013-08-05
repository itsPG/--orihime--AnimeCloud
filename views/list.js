var PG_color_table = 
[
	"#FE2E2E",
	"#FE9A2E",
	"#D7DF01",
	"#2EFE2E",
	"#2ECCFA",
	"#2E2EFE",
];

$(document).ready(function()
{
	$("a[delta]").each(function()
	{
		var node = $(this), node_parent = node.parent();
		var delta = node.attr("delta");
		var csscolor = "";


		if (delta < 21)
		{
			var tmp = Math.floor( delta / 3 );
			csscolor = PG_color_table[tmp];
		}


		if (delta < 2)
		{
			node.addClass("new_anime");
		}

		node.css("color", csscolor);

		//if (delta < 2) node_parent.addClass("new_anime");
	});

	
	
	

});