
var Gsdata = require('node-gsdata-sdk');
var co = require('co');
var comongo = require('mongodb-bluebird');
var moment = require('moment');

var appIds = [
  ['bz14X7D8Qy9K6kaKhrJi', 'HuC7xP6hCNbEQNd2qBfP8Q161'], //longwosion@gmail.com
  ['aJ2Vx03fS7j4LdxeSrb5', 'zgaWRumyOf586J7z7uiH9E2D4'], //crack-keys
]

co(function* () {

  var appId = appIds[0]
  var client = new Gsdata(appId[0], appId[1]);

  var db = yield comongo.connect('mongodb://127.0.0.1:27017/wxdata', {w:-1})
  var wxinfo_group = db.collection('wxinfo_group');

  var data = yield client.wx.getNickNames();

  var list = data.returnData.list;

  var wxinfos = [];

  list.map(function(item) {
    var groupname = item.groupname;

    item.nicknames.map(function(nk) {
      nk.groupname = groupname;

      wxinfos.push(nk);
    });
  });

  yield wxinfos.map(function(item) {
    return function* () {
      yield wxinfo_group.insert(item);      
    }
  })

  yield db.close();
}).catch(function(err){
  console.log(err)
  console.log(err.stack)
})
