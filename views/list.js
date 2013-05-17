var PG_color = function()
{
	var r = 
	{
		blue: [],
		green: [],
		red: [],
		level_max: 7,

		blue_factor:  [-12, -6, -1],
		green_factor: [-9, -1, -9],
		red_factor:   [-1, -12, -6],

		blue_init:  "#EFF8FB",
		green_init: "#F5FBEF",
		red_init:   "#FBF5EF",

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
			for (var i = 0; i < this.level_max; i++)
			{
				var tmp;
				tmp = this.Hex_to_RGB(this.blue_init);
				console.log((tmp[0] + i*this.blue_factor[0], tmp[1] + i*this.blue_factor[1], tmp[2] + i*this.blue_factor[2]));
				this.blue.push(this.RGB_to_Hex(tmp[0] + i*this.blue_factor[0], tmp[1] + i*this.blue_factor[1], tmp[2] + i*this.blue_factor[2]));
				tmp = this.Hex_to_RGB(this.green_init);
				this.green.push(this.RGB_to_Hex(tmp[0] + i*this.green_factor[0], tmp[1] + i*this.green_factor[1], tmp[2] + i*this.green_factor[2]));
				tmp = this.Hex_to_RGB(this.red_init);
				this.red.push(this.RGB_to_Hex(tmp[0] + i*this.red_factor[0], tmp[1] + i*this.red_factor[1], tmp[2] + i*this.red_factor[2]));
			}
		},


		color_demo_unit: function(target_ary)
		{
			$(document).ready(function()
			{
				for (var i = 0; i < target_ary.length; i++)
				{
					var a;
					a = $("<div>test</div>");
					$(a).css("background-color", target_ary[i]);
					$(a).html(target_ary[i]);
					$("body").append(a);
				}
				console.log(a);
			});

		},
		color_demo: function()
		{
			this.color_demo_unit(r.blue);
			this.color_demo_unit(r.green);
			this.color_demo_unit(r.red);
		},


	}
	r.prepare_table();
	var debug_msg = "";
	for (var i = 0; i < r.level_max; i++) debug_msg += r.blue[i] + "\n";
	//alert(debug_msg);
	r.color_demo();
	return r;
}

var color_table = PG_color();

$(document).ready(function()
{
	$("a[delta]").each(function()
	{
		var node = $(this), node_parent = node.parent();
		var delta = node.attr("delta");
		var csscolor = "";
		var factor;
		var level_max = color_table.level_max;

		if (delta < 21)
		{
			factor = Math.floor( (delta-14)/(21-14) * (level_max-1) );
			factor = level_max - factor - 1;
			csscolor = color_table.blue[factor];
			//node.html(node.html() + csscolor);
		}
		if (delta < 14)
		{
			factor = Math.floor( (delta-7)/(14-7) * (level_max-1) );
			factor = level_max - factor - 1;
			csscolor = color_table.green[factor];
			//node.html(node.html() + csscolor);
		}

		if (delta < 7)
		{
			factor = Math.floor( (delta-0)/(7-0) * (level_max-1) );
			factor = level_max - factor - 1;
			csscolor = color_table.red[factor];
			//node.html(node.html() + csscolor);
		}

		node_parent.css("background-color", csscolor);
	});

	
	
	

});