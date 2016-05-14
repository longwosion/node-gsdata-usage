
var Gsdata = require('node-gsdata-sdk');
var co = require('co');
var comongo = require('mongodb-bluebird');
var moment = require('moment');

var appIds = [
  ['aJ2Vx03fS7j4LdxeSrb5', 'zgaWRumyOf586J7z7uiH9E2D4'], //crack-keys
]

co(function* () {

  var appId = appIds[0]
  var client = new Gsdata(appId[0], appId[1]);

  var db = yield comongo.connect('mongodb://127.0.0.1:27017/wxdata', {w:-1})

  var wxinfo_edu_week = db.collection('wxinfo_edu_week');
  var wxinfo_pub_week = db.collection('wxinfo_pub_week');
  var wxinfo_week = db.collection('wxinfo_week');

  var wxinfo_day = db.collection('wxinfo_day');

  var edu_group = 39046;
  var pub_group = 43529;

  var fetch_weeks = function* (group, numOfWeek) {
    var startDate = '2016-03-12';
    startDate = moment(startDate);
    for(var i=0; i<numOfWeek; i++) {
      var d2 = startDate.format('YYYY-MM-DD');
      var d1 = startDate.add(-6, 'day').format('YYYY-MM-DD');

      var result_week = d2 + "_" + d1 + "week";

      var data = yield client.wx.getResultDay(result_week, group);

      console.log(data.returnCode, result_week)
      var rows = JSON.parse(data.returnData).rows;

      yield rows.map(function (item) {
        return function* () {
          item.result_week_d1 = d1
          item.result_week_d2 = d2

          item.type = (group == edu_group) ? 'edu' : 'pub';
          if(item.type == 'edu') {
            var finditem = yield wxinfo_edu_week.find({'wx_name': item.wx_name, 'result_week_d1': d1, 'result_week_d2': d2});
            if (!finditem.length) {
              yield wxinfo_edu_week.insert(item);        
            }
            
          } else {
            var finditem = yield wxinfo_pub_week.find({'wx_name': item.wx_name, 'result_week_d1': d1, 'result_week_d2': d2});
            if (!finditem.length) {
              yield wxinfo_pub_week.insert(item);      
            }
          }

          var finditem = yield wxinfo_week.find({'wx_name': item.wx_name, 'result_week_d1': d1, 'result_week_d2': d2});
          if (!finditem.length) {
            yield wxinfo_week.insert(item);      
          }
        }
      });

      startDate.add(-1, 'day')
    }
  }

  var fetch_days = function* (group) {
    var startDate = '2016-03-12';
    startDate = moment(startDate);
    for(var i=0; i<350; i++) {

      var result_day = startDate.format('YYYY-MM-DD');

      var data = yield client.wx.getResultDay(result_day, group);

      console.log(data.returnCode, result_day)
      var rows = data.returnData.rows;

      yield rows.map(function (item) {
        return function* () {
          item.result_day = result_day

          item.type = (group == edu_group) ? 'edu' : 'pub';
          if(item.type == 'edu') {
            var finditem = yield wxinfo_day.find({'wx_name': item.wx_name, 'result_day': result_day});
            if (!finditem.length) {
              yield wxinfo_day.insert(item);        
            }
            
          } else {
            var finditem = yield wxinfo_day.find({'wx_name': item.wx_name, 'result_day': result_day});
            if (!finditem.length) {
              yield wxinfo_day.insert(item);      
            }
          }
        }
      });

      startDate.add(-1, 'day')
    }    
  }
  yield fetch_weeks(edu_group, 50)
  yield fetch_weeks(pub_group, 50)

  //yield fetch_days(group1)
  //yield fetch_days(group2)

  yield db.close();
}).catch(function(err){
  console.log(err)
  console.log(err.stack)
})
