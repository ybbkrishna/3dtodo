/*
 * GET home page.
 */
//chars length 25
var ObjectID = require('mongodb').ObjectID;
function _generateUniqueString() {
	var i=0,sessionid = '';
	for(i=0;i<26;i++) {
		var char = String.fromCharCode(97 + Math.floor(Math.random()*26));
		sessionid = sessionid+char;
	}
	return sessionid;
};

function _getCookie(propertyName,cookie) {
    var cookies = null, 
        i = 0, 
        c = null;
    
    if(!cookie || cookie === ''){
        return null;
    }

    cookies = cookie.split(';');
    propertyName = propertyName + "=";

    for (i = 0; i < cookies.length; i++) {
        c = cookies[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(propertyName) === 0) {
            return c.substring(propertyName.length, c.length);
        }
    }

    return null;

}
function _validateLogin(db,req,callback) {
	var res = {};
	var username = req.body.username;
	var password = req.body.password;
	var usercollection = db.get('usercollection');
	usercollection.find({'username':username},function(e, docs) {
		if(e||!docs||docs.length===0) {
			if(e)
				res["error"] = e.toString();
			else {
				res["error"] = "Username does not exist.";
			}
		}
		else {
			var docs = docs[0];
			if(docs["password"]===password) {
				res["success"] = true;
				for(k in docs) {if(k!="password")
									res[k] = docs[k];
							}
			}
			else {
				res["error"] = "Your password is incorrect.";
			}
		}
		callback(res);
	});
};

function _addUser(db,req,callback) {
	var res = {};
	var username 	= req.body.username;
	var password 	= req.body.password;
	var name 		= req.body.name;
	var email 		= req.body.email;
	if(!username||!password||!name||!email) {
		res["error"] = "Enter all Details";
		callback(res);
		return;
	}
	var usercollection = db.get('usercollection');
	usercollection.find({'username':username},function(e, docs) {
		if(docs.length!=0) {
			res["error"] = "username already exists.";
			callback(res);
		}
		else {
			usercollection.insert({'name':name,
				'username': username ,
				'password': password ,
				'email'   : email,
				'prioritystart' : 0
			},function(e,docs) {
				if(e) {
					res['error'] = "Something Bad Happened.";
				}
				else {
					res['success'] = true;
				}
				callback(res);
			});
		}
	});
};

function _addTask(db,req,callback) {
	var res = {};
	var sessionid = _getCookie("sessionid",req.headers.cookie);
	var username = _getCookie("username",req.headers.cookie);
	if(!sessionid||!username) {
		res["error"] = "Not Logged In.";
	}
	var usercollection = db.get('usercollection');
	var taskcollection = db.get('taskcollection');
	usercollection.find({'sessionid':sessionid,'username':username},function(e,docs) {
		if(e||!docs||docs.length===0) {
			if(e)
				res["error"] = e.toString();
			else {
				res["error"] = "Session does not exist.";
			}
			callback(res);
		}
		else {
			var docs = docs[0];
			res["success"] = true;
			var taskname = req.body.taskname;
			var priority = docs["prioritystart"]+1.0;
			usercollection.update({"_id":docs["_id"]},{$set : {'prioritystart' : priority}},function(){});
			var status = parseInt(req.body.status);
			taskcollection.insert({'userid' : docs["_id"],'taskname' : taskname,
						'priority':priority,'status':status},function(e,data) {
							res["success"] = true;
							for(k in data){res[k] = data[k];}
							callback(res);
						});
		}
	});
}

function _editTask(db,req,callback) {
	var res = {};
	var sessionid = _getCookie("sessionid",req.headers.cookie);
	var username = _getCookie("username",req.headers.cookie);
	if(!sessionid||!username) {
		res["error"] = "Not Logged In.";
	}
	var usercollection = db.get('usercollection');
	var taskcollection = db.get('taskcollection');
	usercollection.find({'sessionid':sessionid,'username':username},function(e,docs) {
		if(e||!docs||docs.length===0) {
			if(e)
				res["error"] = e.toString();
			else {
				res["error"] = "Session does not exist.";
			}
		callback(res);
		}
		else {
			var docs = docs[0];
			res["success"] = true;
			var taskname = req.body.taskname;
			var status = req.body.status;
			var taskid = ObjectID(req.body._id);
			if(status!==undefined) {
				status = parseInt(status);
				taskcollection.update({"_id" : taskid},{$set : {'taskname' : taskname,
						'status':status}},function(e,data) {
							res["success"] = true;
							callback(res);
						});
			}
			else {
				taskcollection.update({"_id" : taskid},{$set : {'taskname' : taskname}},function(e,data) {
								res["success"] = true;
								callback(res);
							});
			}
		}
	});
};

function _removeTask(db,req,callback) {
	var res = {};
	var sessionid = _getCookie("sessionid",req.headers.cookie);
	var username = _getCookie("username",req.headers.cookie);
	if(!sessionid||!username) {
		res["error"] = "Not Logged In.";
	}
	var usercollection = db.get('usercollection');
	var taskcollection = db.get('taskcollection');
	usercollection.find({'sessionid':sessionid,'username':username},function(e,docs) {
		if(e||!docs||docs.length===0) {
			if(e)
				res["error"] = e.toString();
			else {
				res["error"] = "Session does not exist.";
			}
		callback(res);
		}
		else {
			var docs = docs[0];
			res["success"] = true;
			var taskid = ObjectID(req.body._id);
			taskcollection.remove({"_id" : taskid},function(e,data) {
							res["success"] = true;
							callback(res);
						});
		}
	});
};

function _getAllTasks(db,req,callback) {
	var res = {};
	var sessionid = _getCookie("sessionid",req.headers.cookie);
	var username = _getCookie("username",req.headers.cookie);
	if(!sessionid||!username) {
		res["error"] = "Not Logged In.";
	}
	var usercollection = db.get('usercollection');
	var taskcollection = db.get('taskcollection');
	usercollection.find({'sessionid':sessionid,'username':username},function(e,docs) {
		if(e||!docs||docs.length===0) {
			if(e)
				res["error"] = e.toString();
			else {
				res["error"] = "Session does not exist.";
			}
			callback(res);
		}
		else {
			var docs = docs[0];
			res["success"] = true;
			taskcollection.find({'userid' : docs["_id"]},function(e,data) {
				data.sort(function(a,b){return a["priority"]-b["priority"];});
				res["data"] = data;
				callback(res);
			});
		}
	});
};

function _editPriority(db,req,callback) {
	var res = {};
	var sessionid = _getCookie("sessionid",req.headers.cookie);
	var username = _getCookie("username",req.headers.cookie);
	if(!sessionid||!username) {
		res["error"] = "Not Logged In.";
	}
	var usercollection = db.get('usercollection');
	var taskcollection = db.get('taskcollection');
	usercollection.find({'sessionid':sessionid,'username':username},function(e,docs) {
		if(e||!docs||docs.length===0) {
			if(e)
				res["error"] = e.toString();
			else {
				res["error"] = "Session does not exist.";
			}
		callback(res);
		}
		else {var docs = docs[0];
			res["success"] = true;
			var priority = req.body.priority;
			var taskid = ObjectID(req.body._id);
			priority = parseFloat(priority);
			taskcollection.update({"_id" : taskid},{$set : {'priority':priority}},function(e,data) {
						res["success"] = true;
						callback(res);
					});
		}
	});
}

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.login = function(db) {
	return function(req,res) {
		_validateLogin(db,req,function(result) {
			if(result["error"]) {
				res.end(JSON.stringify(result));
			} else {
				var usercollection = db.get('usercollection');
				var sessionid = _generateUniqueString();
				usercollection.update({'username':req.body.username},
					{$set : {'sessionid' : sessionid}},function(out) {
						res.cookie('sessionid',sessionid);
						res.cookie('username',req.body.username);
						res.end(JSON.stringify(result));
					});
			}
		});
	}
};

exports.logout = function(db) {
	return function(req,res) {
		var sessionid = _getCookie("sessionid",req.headers.cookie);
		var username = _getCookie("username",req.headers.cookie);
		if(!sessionid||!username) {
			res.end("Not Logged In.");
		}
		res.cookie('sessionid','');
		res.cookie('username','');
		var usercollection = db.get('usercollection');
		usercollection.update({'username':username},
			{$set : {'sessionid' : ''}},function(out) {
				res.end("Logged Out.");
			});
	}
};

exports.newuser = function(db) {
	return function(req,res) {
		_addUser(db,req,function(result) {
			if(result["error"]) {
				res.end(JSON.stringify(result));
			}
			else {
				res.end(JSON.stringify({"success":"user successfully created"}));
			}
		});
	}
};
//'taskname' : taskname,'priority':priority,'status':status
exports.addtask = function(db) {
	return function(req,res) {
		_addTask(db,req,function(result) {
			if(result["error"]) {
				res.end(result["error"]);
			}
			else {
				res.end(JSON.stringify(result));
			}
		})
	}
};

exports.edittask = function(db) {
	return function(req,res) {
		_editTask(db,req,function(result) {
			if(result["error"]) {
				res.end(result["error"]);
			}
			else {
				res.end("task successfully edited");
			}
		})
	}
};

exports.deltask = function(db) {
	return function(req,res) {
		_removeTask(db,req,function(result) {
			if(result["error"]) {
				res.end(result["error"]);
			}
			else {
				res.end("task successfully deleted.");
			}
		})
	}
};

exports.alltasks = function(db) {
	return function(req,res) {
		_getAllTasks(db,req,function(result) {
			if(result["error"]) {
				res.end(result["error"]);
			}
			else {
				res.end(JSON.stringify(result));
			}
		})
	}
};

exports.editPriority = function(db) {
	return function(req,res) {
		_editPriority(db,req,function(result) {
			if(result["error"]) {
				res.end(result["error"]);
			}
			else {
				res.end(JSON.stringify(result));
			}
		})
	}
};