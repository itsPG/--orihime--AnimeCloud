var fs = require("fs");
var cs = require("colorplus").enable();
var crypto = require("crypto");
var jsdump = require("./jsdump.js");
jsdump.html = true;

var file_system_tree = function()
{
	var r = 
	{
		file_list:[],
		/*
			failed_flag,
			file_name,
			full_path,
			md5,
			stat,
			tag,
			anime_name,
			anime_vol,
			anime_vol_num
		*/
		md5_map:[],
		anime_list:[],
		show_scan_dir_flag:true,
		file_filter:undefined,

		clean_ary: function(target_ary, delete_value)
		{
			for (var i = 0; i < target_ary.length; i++)
			{
				if (target_ary[i] == delete_value)
				{         
					target_ary.splice(i, 1);
					i--;
				}
			}
		},
		default_filter: function(full_path, file_name)
		{
			if (!file_name.match(/.mp4$/)) return true;
			else return false;
		},
		init: function()
		{
			this.file_list = [];
			this.md5_map = [];
			this.anime_list = [];
			this.file_filter = this.default_filter;
		},
		scan_dir: function(target_dir)
		{
			this.scan_dir_unit(target_dir);
			console.log("scan_dir".green, this.file_list.length);
		},
		scan_dir_unit: function(target_dir)
		{
			if (this.show_scan_dir_flag) console.log(("scan " + target_dir).yellow);
			var tmp_list = fs.readdirSync(target_dir);
			for (var key in tmp_list)
			{
				var r = {};
				r.file_name = tmp_list[key];
				//console.log(r.file_name.red);
				r.full_path = target_dir + r.file_name;
				

				try
				{
					r.stat = fs.statSync(r.full_path);
				}
				catch (e)
				{
					console.log("Error".red, "in file", r.full_path);
					console.log(e);
					continue;
				}


				if (r.stat.isDirectory())
				{
					this.scan_dir_unit(r.full_path + "/");
				}
				else
				{
					if (this.file_filter !== undefined)
					{
						if (this.file_filter(r.full_path, r.file_name))
						{
							//console.log(r.file_name, "blocked by filter");
							continue;
						}
					}
					var hash = crypto.createHash('md5').update(r.full_path).digest("hex");
					console.log(hash);
					this.md5_map[hash] = this.file_list.length;
					r.md5 = hash;

					var tag_tmp = r.file_name.split(".");
					r.tag = tag_tmp[0].split(/[\[\]]+/);
					this.clean_ary(r.tag, "");
					for (var i = 0; i < r.tag.length; i++)
					{
						if (r.tag[i].match(/^[0-9vend ]+$/i))
						{
							//console.log(r.file_name, r.tag[i]);
							r.anime_vol = r.tag[i];
							var tmp = r.tag[i].match(/^[0-9]+/);
							r.anime_vol_num = Number(tmp[0]);
						}
					}
					r.anime_name = r.tag[1];

					if (r.anime_vol_num !== undefined)
					{
						if (this.anime_list[r.anime_name] === undefined)
						{
							this.anime_list[r.anime_name] = [];
							//console.log("init".cyan);
						}

						this.anime_list[r.anime_name][r.anime_vol_num] = this.file_list.length;
						//console.log("set".magenta, r.anime_name, r.anime_vol_num);
						
					}
					//console.log(this.anime_list);

					//r.stat = r.stat.ctime;
					///* for jsdump */
					this.file_list.push(r);

				}
			}
		},
		show_anime_list: function()
		{
			var find_max_vol = function(q)
			{
				var r = -1;
				for (var i in q)
				{
					if (q[i] > r) r = q[i];
				}
				return r;
			}
			var anime_list = this.anime_list;
			for (var i in anime_list)
			{
				console.log(i.red);
				var max_vol = find_max_vol(anime_list[i]);

				for (var j = 0; j <= max_vol; j++)
				{

					if ((anime_list[i]).indexOf(j) == -1)
					{
						console.log("--");
					}
					else
					{
						console.log( (j + " ").yellow );
					}

				}
			}

		},
		query: function(query_in)
		{
			if (this.md5_map[query_in] !== undefined)
			{
				var at = this.md5_map[query_in];
				return this.file_list[at];
			}
			else return undefined;
		},
		views_list: function()
		{
			var r = [];
			/*
				r.name
				r.max_vol
				r.last_update_time
				r.data[]
					[i].vol
					[i].file_name
					[i].file_size
					[i].origin_path
					[i].download_path
					[i]r.create_time
			*/
			var find_max_vol = function(q)
			{
				var r = -1;
				for (var i in q)
				{
					if (q[i] > r) r = q[i];
				}
				return r;
			}
			var pad_zero = function(q)
			{
				var r = q + "";
				if (q < 10) r = "0" + r;
				return r;
			}
			var anime_list = this.anime_list;
			

			for (var i in anime_list)
			{
				console.log(i.cyan);

				//var max_vol = find_max_vol(anime_list[i]);
				max_vol = 13;
				var last_update_time = new Date(1970,1,1,0,0,0,0);
				var data = [];

				for (var j = 1; j <= max_vol; j++)
				{
					var tmp2 = {};
					var at = anime_list[i][j];
					if (at === undefined)
					{
						console.log( (j + " ").yellow , "--".red );
						tmp2 = {empty: true};
					}
					else
					{
						console.log( (j + " ").yellow , (at + " ").green );
						tmp2 = 
						{
							vol: this.file_list[at].anime_vol,
							file_name: this.file_list[at].file_name,
							file_size: this.file_list[at].stat.size,
							origin_path: this.file_list[at].full_path,
							download_path: this.file_list[at].md5,
							create_time: this.file_list[at].stat.ctime,
							empty: false,
						}
						if (tmp2.create_time > last_update_time) last_update_time = tmp2.create_time;
						console.log(tmp2);
					}
					data[j] = tmp2;


				}
				var tmp = 
				{
					name: i,
					max_vol: max_vol,
					last_update_time: last_update_time,
					data: data,
				};
				console.log(tmp);
				r.push(tmp);
			}
			return r;

		},




	}
	return r;
}

var PG = file_system_tree();
//PG.scan_dir("I:/sense/Anime/");
PG.init();
PG.scan_dir("/Users/PG/Dropbox/code/anime2/test_sample/src/");
console.log(PG.anime_list);
PG.views_list();

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
	output_buffer += "<pre>" + jsdump.parse(PG) + jsdump.parse(PG.anime_list) + "</pre>";
	res.send(output_buffer);


});
app.get("/list2", function(req, res)
{
	//res.send("test");
	res.render("list",
	{
		anime_list: PG.views_list()
	});

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
		output_buffer += query_result.tag[0] + " " + query_result.tag[1] + "<br>";
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