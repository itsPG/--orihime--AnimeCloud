var PG_color = function()
{
	var r = 
	{
		blue: [],
		green: [],
		red: [],


		blue_factor: [-20, -12, 0],
		green_factor: [-10, 0, -10],
		red_factor: [0, -20, -12],

		blue_init: "#C2D6FF",
		green_init: "#CCFFCC",
		red_init: "#FFCCB2",

		int_to_hex: function(c)
		{
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		},

		hex_to_int: function(q)
		{
			var left = 0;
			for (var i = q.length - 1; i >= 0; i--)
			{
				//left = left * 16 + ;


			}

		},

		RGB_to_Hex: function(r, g, b)
		{
			var ret = "#" + this.int_to_hex(r) + this.int_to_hex(g) + this.int_to_hex(b);
			console.log("RGB_to_Hex", r);
			return ret;
		},

		Hex_to_RGB: function(q)
		{
			var tmp = q.match(/#([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])([0-9A-F][0-9A-F])/i);
			console.log(tmp);
			return [parseInt(tmp[1], 16), parseInt(tmp[2], 16), parseInt(tmp[3], 16)];
		},

		prepare_table: function()
		{
			for (var i = 0; i < 10; i++)
			{
				var tmp;
				tmp = this.Hex_to_RGB(this.blue_init);
				console.log((tmp[0] + i*this.blue_factor[0], tmp[1] + i*this.blue_factor[1], tmp[2] + i*this.blue_factor[2]));
				this.blue.push(this.RGB_to_Hex(tmp[0] + i*this.blue_factor[0], tmp[1] + i*this.blue_factor[1], tmp[2] + i*this.blue_factor[2]));
				tmp = this.Hex_to_RGB(this.green_init);
				this.green.push(this.RGB_to_Hex(tmp[0] + i*this.green_factor[0], tmp[1] + i*this.green_factor[1], tmp[2] + i*this.green_factor[2]));
				//tmp = Hex_to_RGB(blue_init);
				//blue.push(RGB_to_Hex(tmp[0] + i*blue_factor[0], tmp[1] + i*blue_factor[1], tmp[2] + i*blue_factor[2]));
			}
		},


	}
	r.prepare_table();
	var debug_msg = "";
	for (var i = 0; i < 10; i++) debug_msg += r.blue[i] + "\n";
	alert(debug_msg);
	return r;
}

var C = PG_color();

$(document).ready(function()
{
	$("a[delta]").each(function()
	{
		var node = $(this), node_parent = node.parent();
		var delta = node.attr("delta");
		var csscolor = "black";
		if (delta < 30)
		{
			csscolor = "blue";
		}
		if (delta < 7)
		{
			csscolor = "green";
		}
		if (delta < 3)
		{
			csscolor = "orange";
		}
		if (delta < 1)
		{
			csscolor = "red";
		}

		node_parent.css("background-color", csscolor);
	});

	
	for (var i = 0; i < 10; i++)
	{
		var a = $("<div>test</div>");
		$(a).css("background-color", C.blue[i]);
		$(a).html(C.blue[i]);
		$("body").append(a);
	}
	

});