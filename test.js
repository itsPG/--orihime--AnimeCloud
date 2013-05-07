var fs = require("fs");
var cs = require("colorplus").enable();
var crypto = require("crypto");


var file_system_tree = function()
{
	var r = 
	{
		file_list:[],
		md5_map:[],
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
			this.md5_map = [];

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
				var r = {};
				r.file_name = tmp_list[key];
				r.full_path = target_dir + r.file_name;
				

				try
				{
					r.stat = fs.statSync(r.full_path);
				}
				catch (e)
				{
					console.log("Error".red);
					console.log(e);
					continue;
				}
				if (this.show_scan_dir_flag) console.log(full_path);
				if (r.stat.isDirectory())
				{
					if (this.show_scan_dir_flag) console.log("is dir".green);
					this.scan_dir_unit(r.full_path + "/");
				}
				else
				{

					if (this.show_scan_dir_flag) console.log("is not a dir".red);
					if (this.file_filter !== undefined)
					{
						if (this.file_filter(r.full_path, r.file_name))
						{
							console.log(r.file_name, "blocked by filter");
							continue;
						}
					}
					var hash = crypto.createHash('md5').update(r.full_path).digest("hex");
					console.log(hash);
					this.md5_map[hash] = this.file_list.length;
					r.md5 = hash;

					this.file_list.push(r);


				}
			}
		},
		query:function(query_in)
		{
			if (this.md5_map[query_in] !== undefined)
			{
				var at = this.md5_map[query_in];
				return this.file_list[at];
			}
			else return undefined;
		},



	}
	return r;
}

var PG = file_system_tree();
//PG.scan_dir("I:/sense/Anime/");
PG.scan_dir("/Users/PG/Dropbox/code/anime2/test_sample/src/");
//PG.scan_dir("");
var express = require('express');
var app = express();
var cons = require("consolidate");
app.engine("haml", cons.haml);
app.set("view engine", "haml");
app.set("views", __dirname + "/views");

app.get("/", function(req, res)
{
	console.log(req);
	res.send("Orihime (TM)");
});

app.get("/list", function(req, res)
{
	var output_buffer = "";
	for (var i = 0; i < PG.file_list.length; i++)
	{
		var file = PG.file_list[i];
		var tmp = "<a href = \"/getfile/" + file.md5 + "\">" + file.file_name + "</a><br>";
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
		output_buffer += "<pre>" + query_result.stat.size + "</pre>";
		output_buffer += "<pre>" + query_result.stat.atime + "</pre>";
		output_buffer += "<pre>" + query_result.stat.mtime + "</pre>";
		output_buffer += "<pre>" + query_result.stat.ctime + "</pre>";
		output_buffer += query_result.file_name + "<br>";
		output_buffer += query_result.full_path + "<br>";
		output_buffer += "Yes<br>";
		output_buffer += "<a href=\"./" + query_result.md5 + "/go\"> Download </a><br>";
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
	console.log(query_result);
	if (query_result !== undefined)
	{
		res.download(query_result.full_path);
	}
	else
	{
		res.send("Error");
	}



});

app.get("/haml", function(req, res)
{

	
	res.render("animecloud",
	{
		title:"test",
		title2:"t2",
		items:["1", "2", "3"],
		tmp123:"123123"

	});

});
app.use('/views', express.static(__dirname + '/views'));

app.listen(35101);