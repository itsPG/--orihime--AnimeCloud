var fs = require("fs");
var cs = require("colorplus").enable();



var file_system_tree = function()
{
	var r = 
	{
		file_list:[],
		path_list:[],
		file_list_hash:[],
		show_scan_dir_flag:false,
		scan_dir:function(target_dir)
		{
			this.file_list = [];
			this.path_list = [];
			this.file_list_hash = [];
			this.scan_dir_unit(target_dir);
			console.log(this.file_list.length);
		},
		scan_dir_unit:function(target_dir)
		{
			if (this.show_scan_dir_flag) console.log(("scan " + target_dir).bgred.yellow);
			var tmp_list = fs.readdirSync(target_dir);
			for (var key in tmp_list)
			{
				var file_name = tmp_list[key];
				var full_path = target_dir + file_name;
				if (this.show_scan_dir_flag) console.log(full_path);
				if (fs.statSync(full_path).isDirectory())
				{
					if (this.show_scan_dir_flag) console.log("is dir".green);
					this.scan_dir_unit(full_path + "/");
				}
				else
				{
					if (this.show_scan_dir_flag) console.log("is not a dir".red);
					this.file_list_hash[file_name] = this.file_list.length;
					this.path_list.push(full_path);
					this.file_list.push(file_name);

				}
			}
		},
		query:function(query_in)
		{
			if (this.file_list_hash[query_in] !== undefined)
			{
				var at = this.file_list_hash[query_in];
				var result = 
				{
					file_name: this.file_list[at],
					full_path: this.path_list[at]
				}
				return result;
			}
			else return undefined;
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
	var output_buffer = "";
	var query_result = PG.query(req.params["file"]);
	if (query_result !== undefined)
	{
		output_buffer += query_result.file_name + "<br>";
		output_buffer += query_result.full_path + "<br>";
		output_buffer += "Yes<br>";
	}
	else
	{
		output_buffer += "No";
	}
	res.send(output_buffer);



});

app.listen(35100);