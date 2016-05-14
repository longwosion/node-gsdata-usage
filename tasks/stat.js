

var Gsdata = require('node-gsdata-sdk');
var co = require('co');
var comongo = require('mongodb-bluebird');
var moment = require('moment');

co(function* () {

  var db = yield comongo.connect('mongodb://127.0.0.1:27017/wxdata')
  var wxinfo_group = db.collection('wxinfo_group');
  var wxinfo_week = db.collection('wxinfo_week');

  pub_presses = yield wxinfo_group.find({'groupname': '新出版十强'})
  edu_presses = yield wxinfo_group.find({'groupname': '教育出版社'})

  var presses_map = {}
  var presses_ids = []

  pub_presses.map(function(p) {
    presses_map[p.nickname_id] = p
    presses_ids.push(p.nickname_id)
    //console.log(p.nickname_id, p.wx_nickname)
  })
  edu_presses.map(function(p) {
    presses_map[p.nickname_id] = p
    presses_ids.push(p.nickname_id)
    //console.log(p.nickname_id, p.wx_nickname)
  })

  data = yield wxinfo_week.find();

  week_map = {}

  data.map(function(d) {
    if(!week_map[d.result_week_d2]) {
      week_map[d.result_week_d2] = {}
    }
    week_map[d.result_week_d2][d.nickname_id] = [d.wci, d.url_times, d.url_num]
  })


  var print_data = function(index, sumIt, splitter) {

    splitter = splitter || ","
    var names = []
    for (var dt in week_map) {
      names.push(dt)
    }

    names = names.sort()

    var titles = ["date"]

    //console.log(presses_ids)
    presses_ids.map(function(id){
      titles.push(presses_map[id].wx_nickname)
    })

    console.log(titles.join(splitter))

    count1 = 0;
    count2 = 0;

    count_edu_total = 0;
    count_pub_total = 0;

    count_edu_zero = 0;
    count_pub_zero = 0;

    last_rows = null;

    names.map(function(dt){
      //console.log(dt)
      var rows = [];
      rows.push(dt);

      colindex = 0;
      presses_ids.map(function(id){
        colindex = colindex + 1;

        if(week_map[dt][id]) {
          
          if(sumIt&&last_rows) {
            rows.push(last_rows[colindex] + parseInt(week_map[dt][id][index]))
          } else {
            rows.push(parseInt(week_map[dt][id][index]))
          }

          if(week_map[dt][id][index] == '0' || week_map[dt][id][index]==0) {
            if (presses_map[id].groupname == '教育出版社') {
              count_edu_zero = count_edu_zero + 1
            } else {
              count_pub_zero = count_pub_zero + 1
            }
          }

          if (presses_map[id].groupname == '教育出版社') {
            count_edu_total++;
          } else {
            count_pub_total++;
          }

        } else {
          rows.push(0)  
        }

        
      })

      last_rows = rows
      console.log(rows.join(splitter))
    })

    console.log("EDU", count_edu_total, count_edu_zero)
    console.log("PUB", count_pub_total, count_pub_zero)
  }

  //console.log('url_times total .......')
  print_data(1, true)
  //print_data(0, false)



  yield db.close();

});