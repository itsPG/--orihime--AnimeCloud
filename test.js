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
		show_scan_dir_flag: false,
		file_filter: undefined,

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
					//console.log(hash);
					this.md5_map[hash] = this.file_list.length;
					r.md5 = hash;

					var tag_tmp = r.file_name.split(".");
					r.tag = tag_tmp[0].split(/[\[\]]+/);
					this.clean_ary(r.tag, "");

					var anime_vol_success_flag = false;
					/*
						we assume that an anime_vol will appear before [4] tag
						otherwise, it should be "i < r.tag.length"
					*/
					for (var i = 0; i < 4 && i < r.tag.length; i++)
					{
						if (r.tag[i].match(/^[0-9+][0-9vend ]+$/i))
						{
							//console.log(r.file_name, r.tag[i]);
							
							var tmp = r.tag[i].match(/^[0-9\.]+/);
							
							
							if (tmp == null)
							{
								console.log("null error".red, r.tag[i], r.file_name);
								continue;
							}


							var num_tmp = Number(tmp[0]);
							if (num_tmp > 52)
							{
								console.log("num_tmp error".red, r.tag[i], r.file_name);
							}
							else
							{
								r.anime_vol = r.tag[i];
								r.anime_vol_num = num_tmp;
								anime_vol_success_flag = true;
							}
						}
					}
					if (!anime_vol_success_flag) continue;

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
					if (i > r) r = i;
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

		find_max_vol: function(q)
		{
			var r = -1;
			for (var i in q)
			{
				var at = q[i];
				if (this.file_list[at].anime_vol_num > r) r = this.file_list[at].anime_vol_num;
			}
			return r;
		},

		views_list: function()
		{
			//console.log("this", this);
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

			var pad_zero = function(q)
			{
				var r = q + "";
				if (q < 10) r = "0" + r;
				return r;
			}
			var anime_list = this.anime_list;
			var time_now = new Date();
			

			for (var i in anime_list)
			{
				//console.log(i.cyan);

				var max_vol = this.find_max_vol(anime_list[i]);
				//console.log(anime_list[i], i, max_vol);
				max_vol = Math.floor((max_vol-1)/13)*13+13;
				//console.log(i, max_vol);
				//max_vol = 26;
				var last_update_time = new Date(1970,1,1,0,0,0,0);
				var data = [];
				var sub_name = "";

				for (var j = 1; j <= max_vol; j+=1)
				{
					var tmp2 = {};
					var at = anime_list[i][j];
					if (at === undefined)
					{
						//console.log( (j + " ").yellow , "--".red );
						tmp2 = {empty: true};
					}
					else
					{
						var d = "black";
						//console.log( (j + " ").yellow , (at + " ").green );
						var delta = time_now.getTime() - this.file_list[at].stat.ctime.getTime();
						delta = delta/1000/3600/24;

						if (sub_name == "") sub_name = this.file_list[at].tag[0];

						tmp2 = 
						{
							vol: pad_zero(this.file_list[at].anime_vol_num),
							file_name: this.file_list[at].file_name,
							file_size: this.file_list[at].stat.size,
							origin_path: this.file_list[at].full_path,
							//download_path: "getfile/" + this.file_list[at].md5,
							download_path: "getfile/" + this.file_list[at].md5 + "/go",
							create_time: this.file_list[at].stat.ctime,
							empty: false,
							delta: delta
						}
						if (tmp2.create_time > last_update_time) last_update_time = tmp2.create_time;
						//console.log(tmp2);
					}
					data[j] = tmp2;
				}
				var tmp = 
				{
					name: i,
					max_vol: max_vol,
					last_update_time: last_update_time,
					data: data,
					sub_name: sub_name,

				};
				r.push(tmp);
			}

			var cmp = function(a, b)
			{
				return b.last_update_time - a.last_update_time;
			}
			r.sort(cmp);
			return r;

		},
		test: function()
		{
			console.log("test was called".cyan);

		},




	}
	return r;
}

var views_cache_system = function()
{
	var r = 
	{
		views_table: [],
		register: function(name, obj, interval, ref) // interval: minutes
		{
			var tmp = 
			{
				view: obj,
				interval: interval*1000*60,
				ref: ref,
				cache: undefined,
				last_update_time: new Date(),
			};
			this.views_table[name] = tmp;
		},
		view: function(name)
		{
			var debug_flag = true;
			var node = this.views_table[name];
			if (node === undefined)
			{
				console.log("views_cache_system error: cant find".red, name);
				return;
			}
			var now = new Date();
			var delta = now.getTime() - node.last_update_time.getTime();
			if (node.cache === undefined || delta > node.interval)
			{
				if (node.ref !== undefined)
				{
					node.cache = node.view.call(node.ref);
				}
				else
				{
					node.cache = node.view();
				}
				node.last_update_time = now;
				if (node.cache === undefined) node.cache = null;
			}
			if (debug_flag) console.log("[cache system]".cyan, name.green, delta, now.getTime() - node.last_update_time.getTime());
			return node.cache;
		},
	}
	return r;
};

var PG = file_system_tree();
var PG_cache = views_cache_system();

function set_PG()
{
	PG.init();
	var PG_dev_level = 3;
	if (PG_dev_level == 3)
	{
		//PG.scan_dir("E:/Anime-New/!__ON AIR__!/未分類/");
		//PG.scan_dir("E:/Anime-New/2013Q2/");
		PG.scan_dir("E:/BT/BT_completed/");
		//PG.scan_dir("E:/Anime-New/!__ON AIR__!/みなみけ ただいま/");
	}
	else if (PG_dev_level == 2)
	{
		PG.scan_dir("I:/sense/");
	}
	else
	{
		PG.scan_dir("/Users/PG/Dropbox/code/anime2/test_sample/src/");
	}

	
}
PG_cache.register("set_PG", set_PG, 3);
PG_cache.register("views_list", PG.views_list, 3, PG);
PG.views_list();

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

app.get("/oldlist", function(req, res)
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
	var now = new Date();
	PG_cache.view("set_PG");
	res.render("list",
	{
		anime_list: PG_cache.view("views_list")
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
	//console.log(query_result);
	if (query_result !== undefined)
	{
		res.download(query_result.full_path);
		console.log(("[" + req.ip + "]").green, query_result.file_name.cyan);
	}
	else
	{
		res.send("Error");
		console.log(("[" + req.ip + "]").red, req.params["file"]);
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