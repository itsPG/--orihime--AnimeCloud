var fs = require("fs");
var cs = require("colorplus").enable();



var file_system_tree = function()
{
	var r = 
	{
		file_list:[],
		path_list:[],
		show_scan_dir_flag:false,
		scan_dir:function(target_dir)
		{
			file_list = [];
			this.scan_dir_unit(target_dir);
			console.log(this.file_list.length);
		},
		scan_dir_unit:function(target_dir)
		{
			if (this.show_scan_dir_flag) console.log(("scan " + target_dir).bgred.yellow);
			var tmp_list = fs.readdirSync(target_dir);
			for (var key in tmp_list)
			{
				var file_name = target_dir + tmp_list[key];
				if (this.show_scan_dir_flag) console.log(file_name);
				if (fs.statSync(file_name).isDirectory())
				{
					if (this.show_scan_dir_flag) console.log("is dir".green);
					this.scan_dir_unit(file_name + "/");
				}
				else
				{
					if (this.show_scan_dir_flag) console.log("is not a dir".red);
					this.file_list.push(file_name);
				}
			}

		}

	}
	return r;
}

var PG = file_system_tree();
PG.scan_dir("I:/sense/Anime/");
var express = require('express');
var app = express();
app.get("/", function(req, res)
{
	console.log(req);
	res.send("Orihime (TM)");
});
app.get("/getfile/:file", function(req, res)
{


});

app.listen(35100);