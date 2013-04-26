var fs = require("fs");
var cs = require("colorplus").enable();
var crypto = require("crypto");


var file_system_tree = function()
{
	var r = 
	{
		file_list:[],
		path_list:[],
		stat_list:[],
		md5_list:[],
		file_list_hash:[],
		show_scan_dir_flag:false,
		file_filter:undefined,
		default_filter:function(full_path, file_name)
		{
			if (!file_name.match(/.mp4$/)) return true;
			else return false;

		},
		scan_dir:function(target_dir)
		{
			this.file_list = [];
			this.path_list = [];
			this.stat_list = [];
			this.md5_list = [];
			this.md5_map = [];
			this.file_list_hash = [];
			this.file_filter = this.default_filter;
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
				
				var stat;
				try
				{
					stat = fs.statSync(full_path);
				}
				catch (e)
				{
					console.log("Error".red);
					console.log(e);
					continue;
				}
				if (this.show_scan_dir_flag) console.log(full_path);
				if (stat.isDirectory())
				{
					if (this.show_scan_dir_flag) console.log("is dir".green);
					this.scan_dir_unit(full_path + "/");
				}
				else
				{

					if (this.show_scan_dir_flag) console.log("is not a dir".red);
					if (this.file_filter !== undefined)
					{
						if (this.file_filter(full_path, file_name))
						{
							console.log(file_name, "blocked by filter");
							continue;
						}
					}
					var hash = crypto.createHash('md5').update(full_path).digest("hex");
					console.log(hash);
					this.md5_map[hash] = this.file_list.length;
					this.file_list_hash[file_name] = this.file_list.length;
					this.md5_list.push(hash);
					this.path_list.push(full_path);
					this.file_list.push(file_name);
					this.stat_list.push(stat);


				}
			}
		},
		query:function(query_in)
		{
			if (this.md5_map[query_in] !== undefined)
			{
				var at = this.md5_map[query_in];
				var result = 
				{
					file_name: this.file_list[at],
					full_path: this.path_list[at],
					file_stat: this.stat_list[at]
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

app.get("/list", function(req, res)
{
	var output_buffer = "";
	for (var key in PG.file_list)
	{

		var tmp = "<a href = \"/getfile/" + PG.md5_list[key] + "\">" + PG.file_list[key] + "</a><br>";
		output_buffer += tmp;
	}
	res.send(output_buffer);


});
app.get("/getfile/:file", function(req, res)
{

	var output_buffer = "";
	var query_result = PG.query(req.params["file"]);
	if (query_result !== undefined)
	{
		output_buffer += "<pre>" + query_result.file_stat.size + "</pre>";
		output_buffer += query_result.file_name + "<br>";
		output_buffer += query_result.full_path + "<br>";
		output_buffer += "Yes<br>";
		output_buffer += "<a href=\"./" + query_result.file_name + "/go\"> Download </a><br>";
	}
	else
	{
		output_buffer += req.params["file"] + "<br>";
		output_buffer += "No";
	}
	res.send(output_buffer);



});

app.get("/getfile/:file/go", function(req, res)
{

	var output_buffer = "";
	var query_result = PG.query(req.params["file"]);
	if (query_result !== undefined)
	{
		res.download(query_result.full_path);
	}
	else
	{
		res.send("Error");
	}



});

app.listen(35101);