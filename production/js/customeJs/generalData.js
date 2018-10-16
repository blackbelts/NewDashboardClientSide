/* Api Url */
var odooUrl = "http://178.128.197.205/odooApi/index.php?",
  /* Auth user id */
  uid = '1',
  /* auth user passwrod */
  password = 'admin',
  /* monthesNames => list contain monthes short names */
  monthesNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."],
  /* dataSets=> list of data sets that must be draw */
  dataSets = [],
  /* colors=> list of colors for graphs */
  colors = ['rgba(34, 102, 102,1)', 'rgba(0,196,194,1)', 'rgba(60,141,188,0.9)', 'rgba(47,94,117,1)', 'rgba(51,34,136,1)', 'rgba(33,151,238)', 'rgba(255,63,121,1)', "rgba(255,211,70,1)", 'rgba(0,104,185,1)', 'rgba(46,135,190,1)', 'rgba(1,7,102,1)', 'rgba(30,132,208,1)', 'rgba(255,63,121,1)', 'rgba(92,0,32,1)'],
  /* 
   *graphlist=> contain a list of graphs in the page 
   * for mutli tab graph to solve problem of graph not working in tabs
   * problem  details => graph worked on the active tab only 
   * use this list to store graphs in a page 
   * for can refresh the graph when active tab change
   */
  graphlist = [],
  agentsNumber;
$(function () {
  /* 
   var domains = [];
   *this var for contains Odoo domins list 
   *must be initialize before ever Query or request ajax
   */
  var domains = [];
  /*
   var maps = [];
   * this var for contains Odoo mapping list 
   * must be initialize before ever Query or request ajax
   */
  var maps = [];
  // add domain object like object Domain ProtoType to domains list
  domains.push(new Domain("active", "%3D", "true"))
  /*
   *this function make ajax request to get number of agents from server
   * write it in html file 
   */
  ajaxRequest(uid, password, "crm.lead", "search_read", [new Domain("active", "%3D", "true")], [new Map("fields", ["planned_revenue", "probability"])])
    .then(function (r) {
      var sumExpected = 0;
      var sumProb = 0;
      r.forEach(function (opp) {
        sumExpected += opp.planned_revenue;
        sumProb += opp.probability;
      });
      $("#expected-prem-num").html(sumExpected.toFixed(2));
      $("#expected-prem-prob").html((sumProb / r.length).toFixed(2) + "%");

    })
  ajaxRequest(uid, password, "policy.broker", "search_read", [], [new Map("fields", ["gross_perimum", "t_permimum"])])
    .then(function (r) {
      var sumGross = 0;
      var sumNet = 0;
      r.forEach(function (p) {
        sumGross += p.gross_perimum;
        sumNet += p.t_permimum;
      });
      $("#premium-written-gross").html(sumGross.toFixed(2) + " $");
      $("#premium-written-net").html(sumNet.toFixed(2) + " $");

    })
  ajaxRequest(uid, password, "insurance.claim", "search_read", [], [new Map("fields", ["totalsettled", "total_paid_amount"])])
    .then(function (r) {
      var sumTotalSettled = 0;
      var sumPaid = 0;
      console.log(r)
      r.forEach(function (c) {
        sumTotalSettled += c.totalsettled;
        sumPaid += c.total_paid_amount;
      });
      $("#claim-settled").html(sumTotalSettled.toFixed(2) + " $");
      $("#claim-paid").html(sumPaid.toFixed(2) + " $");

    })
  ajaxRequest(uid, password, "calendar.event", "search_read", [], [new Map("fields", ["name", "display_start", "display_time", "stop_datetime", "attendee_ids", "location", "duration"]), new Map("limit", ["5"]), new Map("order", ["display_start desc"])])
    .then(function (res) {
      var tableContent = "";
      var index = 0;
      res.forEach(function (meeting) {
        if (index % 2 == 0)
          tableContent += '<tr class="even pointer">';
        else
          tableContent += '<tr class="odd pointer">'
        tableContent += "<td>" + meeting.name + "</td>" +
          "<td>" + meeting.display_start + "</td>" +
          "<td>" + meeting.stop_datetime + "</td>" +
          "<td>" + meeting.attendee_ids.length + " record" + "</td>" +
          "<td>" + meeting.location + "</td>";
        var duration = ""
        if (Math.floor(meeting.duration).toString().length == 1)
          duration += "0" + Math.floor(meeting.duration) + ":";
        else
          duration += Math.floor(meeting.duration) + ":";

        if (((meeting.duration - Math.floor(meeting.duration)) * 60).toString().length == 1)
          duration += "0" + (Math.ceil((meeting.duration - Math.floor(meeting.duration)) * 60));
        else
          duration += (Math.ceil((meeting.duration - Math.floor(meeting.duration)) * 60));
        tableContent += "<td>" + duration + "</td>" + '</tr>';
      })
      index++;
      $("#meetings").html(tableContent);
    });
  ajaxRequest(uid, password, "crm.lead", "search_read", [new Domain("type", "%3D", "opportunity"), new Domain("active", "%3D", "true")], [new Map("fields", ["display_name", "type", "LOB", "term", "planned_revenue", "probability", "stage_id", "team_id", "user_id", "insurance_type", "partner_id"]), new Map("limit", [5]), new Map("order", ["planned_revenue desc"])])
    .then(function (res) {
      var tableContent = "";
      var index = 0
      res.forEach(function (opp) {
        if (index % 2 == 0)
          tableContent += '<tr class="even pointer">';
        else
          tableContent += '<tr class="odd pointer">'
        tableContent += "<td>" + opp.insurance_type + "</td>" +
          "<td>" + opp.LOB[1] + "</td>" +
          "<td>" + opp.partner_id[1] + "</td>" +
          "<td>" + opp.display_name + "</td>" +
          "<td>" + opp.term + "</td>" +
          "<td>" + opp.planned_revenue + "$" + "</td>" +
          "<td>" + opp.probability + "</td>" +
          "<td>" + opp.stage_id[1] + "</td>" +
          "<td>" + opp.team_id[1] + "</td>" +
          "<td>" + opp.user_id[1] + "</td>" +
          '</tr>';
        index++;
      })
      $("#opportunities").html(tableContent);
    });
  ajaxRequest(uid, password, "insurance.claim", "search_read", [], [new Map("fields", ["insured", "lob", "insurer", "product", "customer_policy", "policy_number", "name", "totalclaimexp", "totalsettled", "total_paid_amount", "claimstatus"]), new Map("limit", [5]), new Map("order", ["totalclaimexp desc"])])
    .then(function (res) {
      var tableContent = "";
      var index = 0
      res.forEach(function (claim) {
        if (index % 2 == 0)
          tableContent += '<tr class="even pointer">';
        else
          tableContent += '<tr class="odd pointer">'
        tableContent += "<td>" + claim.insured + "</td>" +
          "<td>" + claim.lob[1] + "</td>" +
          "<td>" + claim.insurer[1] + "</td>" +
          "<td>" + claim.product[1] + "</td>" +
          "<td>" + claim.customer_policy[1] + "</td>" +
          "<td>" + claim.policy_number[1] + "$" + "</td>" +
          "<td>" + claim.name + "</td>" +
          "<td>" + claim.totalclaimexp + "</td>" +
          "<td>" + claim.totalsettled + "</td>" +
          "<td>" + claim.total_paid_amount + "</td>" +
          "<td>" + claim.claimstatus + "</td>" +
          '</tr>';
        index++;
      })
      $("#claims").html(tableContent)
    });
  ajaxRequest(uid, password, "policy.broker", "search_read", [], [new Map("fields", ["insurance_type", "line_of_bussines", "company", "product_policy", "customer", "std_id", "edit_number", "renwal_check", "issue_date", "start_date", "end_date", "gross_perimum", "t_permimum"]), new Map("limit", [5]), new Map("order", ["gross_perimum desc"])])
    .then(function (res) {
      var tableContent = "";
      var index = 0
      res.forEach(function (p) {
        if (index % 2 == 0)
          tableContent += '<tr class="even pointer">';
        else
          tableContent += '<tr class="odd pointer">'
        var ch = p.renwal_check == false ? "" : "checked";
        tableContent += "<td>" + p.insurance_type + "</td>" +
          "<td>" + p.line_of_bussines[1] + "</td>" +
          "<td>" + p.company[1] + "</td>" +
          "<td>" + p.product_policy[1] + "</td>" +
          "<td>" + p.customer[1] + "</td>" +
          "<td>" + p.std_id + "</td>" +
          "<td>" + p.edit_number + "</td>" +
          "<td> <input type='checkbox'" + ch + "></td>" +
          "<td>" + p.issue_date + "</td>" +
          "<td>" + p.start_date + "</td>" +
          "<td>" + p.end_date + "</td>" +
          "<td>" + p.gross_perimum + "</td>" +
          "<td>" + p.t_permimum + "</td>" +
          '</tr>';
        index++;
      })
      $("#policyes").html(tableContent)
    });
  ajaxRequest(uid, password, "hr.employee", "search_count", domains, maps)
    // for return result correctly
    .then(function (r) {
      maps = [];
      agentsNumber = r;
      $("#agents #agents-number").text(r);
    }).then(function (t) {
      //get agent graph data
      var monthes = getMonths(),
        monthesNamelsit = [];
      monthes.forEach(function (m) {
        monthesNamelsit.push(monthesNames[new Date(m).getMonth()] + new Date(m).getFullYear().toString());
      })
      monthesNamelsit.splice(0, 1);
      dataSets = [];
      ajaxRequest(uid, password, "res.partner", "search_count", domains, maps, monthes)
        .then(function (re) {
          var ratio = (((re[0] - re[1]) / re[1]) * 100).toFixed(1);
          if (ratio < 0) {
            $("#agents .ratio i").attr("class", "red")
          } else(
            $("#agents .ratio i").attr("class", "green")
          )
          $("#agents .ratio i").html($("#agents .ratio i").html() + ratio + "%")
        })
      ajaxRequest(uid, password, "crm.lead", "search_count", [new Domain("type", "%3D", "lead")], [], [])
        // for return result correctly
        .then(function (r) {
          maps = [];
          $("#leads #leads-number").text(r);
          $("#leads .box-body strong").get(0).innerHTML = ((r / agentsNumber).toFixed(2));
        }).then(function (t) {
          dataSets = [];
          ajaxRequest(uid, password, "crm.lead", "search_count", [new Domain("type", "%3D", "lead")], [], monthes)
            .then(function (re) {
              var ratio = (((re[0] - re[1]) / re[1]) * 100).toFixed(1);
              if (re[1] == 0) {
                ratio = 100;
                $("#leads .ratio i").attr("class", "green")
              } else {
                if (ratio < 0) {
                  $("#leads .ratio i").attr("class", "red")
                } else(
                  $("#leads .ratio i").attr("class", "green")
                )
              }
              $("#leads .ratio i").html($("#leads .ratio i").html() + ratio + "%");

            })
        })
      getValuesNewAdmin("#new", "crm.lead", "search_read", [new Domain("stage_id", "%3D", "New"), new Domain("type", "%3D", "opportunity")], [new Map("fields", ["planned_revenue"])], monthes)
      getValuesNewAdmin("#qualified", "crm.lead", "search_read", [new Domain("stage_id", "%3D", "Qualified"), new Domain("type", "%3D", "opportunity")], [new Map("fields", ["planned_revenue"])], monthes)
      getValuesNewAdmin("#proposition", "crm.lead", "search_read", [new Domain("stage_id", "%3D", "Proposition"), new Domain("type", "%3D", "opportunity")], [new Map("fields", ["planned_revenue"])], monthes)
      getValuesNewAdmin("#won", "crm.lead", "search_read", [new Domain("stage_id", "%3D", "Won"), new Domain("type", "%3D", "opportunity")], [new Map("fields", ["planned_revenue"])], monthes)
      getValuesNewAdmin("#lost", "crm.lead", "search_read", [new Domain("active", "!%3D", "true")], [new Map("fields", ["planned_revenue"])], monthes)
    })
});

function getValuesNewAdmin(conntId, modal, method, dom = [], m = [], month = []) {
  ajaxRequest(uid, password, modal, method, dom, m, [])
    // for return result correctly
    .then(function (r) {
      maps = [];
      $(conntId + " #new_prem").text(clacPre(r).toFixed(1) + "$");
      $(conntId + " .box-body strong").get(0).innerHTML = r.length;
      $(conntId + " .box-body strong").get(1).innerHTML = ((clacPre(r) / r.length).toFixed(2));
      $(conntId + " .box-body strong").get(2).innerHTML = ((clacPre(r) / agentsNumber).toFixed(2));
      $(conntId + " .box-body strong").get(3).innerHTML = ((r.length / agentsNumber).toFixed(2));
    }).then(function () {
      //get agent graph data
      ajaxRequest(uid, password, modal, method, dom, m, month)
        .then(function (re) {
          var fMonth = clacPre(JSON.parse(re[0])),
            sMonth = clacPre(JSON.parse(re[1]));
          var ratio = (((fMonth - sMonth) / sMonth) * 100).toFixed(1);
          if (fMonth == 0 && sMonth == 0)
            ratio = 0;
          if (sMonth == 0) {
            ratio = 100;
            $(conntId + " .ratio i").attr("class", "green")
          } else {
            if (ratio < 0) {
              $(conntId + " .ratio i").attr("class", "red")
            } else(
              $(conntId + " .ratio i").attr("class", "green")
            )
          }
          $(conntId + " .ratio i").html($(conntId + " .ratio i").html() + ratio + "%");
        })
    })
}

function setValues(id, modal, method, re, domains = [], maps = [], monthes = [], canvasId = []) {
  ajaxRequest(uid, password, modal, method, domains, maps, monthes)
    .then(function (re2) {
      $(id + " p strong").get(1).append(clacPre(re2).toFixed(2));
      $(id + " p strong").get(2).append((clacPre(re2) / parseInt($(id + " p strong").get(0).innerHTML)).toFixed(2));
      $(id + " p strong").get(3).append((clacPre(re2) / agentsNumber).toFixed(2));
      $(id + " p strong").get(4).append((re / agentsNumber).toFixed(2));
      var monthes = getMonths(),
        monthesNamelsit = [];
      monthes.forEach(function (m) {
        monthesNamelsit.push(monthesNames[new Date(m).getMonth()] + new Date(m).getFullYear().toString());
      })
      monthesNamelsit.splice(0, 1);
      var dS = [];
      //get count graph data
      ajaxRequest(uid, password, modal, "search_count", domains, [], monthes)
        .then(function (response) {
          dS.push(response);
          graphlist.push(areaChart(dS, monthesNamelsit, graphlist.length, canvasId[0]));
          graphlist.push(donut(response, monthesNamelsit, graphlist.length, canvasId[1]));
          graphlist.push(barChart(dS, monthesNamelsit, graphlist.length, canvasId[2]))
        })
        .catch(function (error) {
          console.log(error)
        })
      var montelyPre = [],
        ava = [],
        apa = [],
        aca = [],
        sumPre = 0;
      ajaxRequest(uid, password, modal, "search_read", domains, maps, monthes)
        .then(function (res = []) {
          res.forEach(function (item) {
            sumPre = 0;
            JSON.parse(item).forEach(function (item2) {
              sumPre += item2.planned_revenue;
            })
            if (JSON.parse(item).length == 0) {
              ava.push(0);
              aca.push(0);
            } else {
              ava.push((sumPre / JSON.parse(item).length).toFixed(2));
              aca.push((JSON.parse(item).length / agentsNumber).toFixed(2))
            }
            apa.push((sumPre / agentsNumber).toFixed(2))
            montelyPre.push(sumPre);
          })
          graphlist.push(areaChart([montelyPre], monthesNamelsit, graphlist.length, canvasId[3]));
          graphlist.push(donut(montelyPre, monthesNamelsit, graphlist.length, canvasId[4]));
          graphlist.push(barChart([montelyPre], monthesNamelsit, graphlist.length, canvasId[5]));
          graphlist.push(areaChart([ava], monthesNamelsit, graphlist.length, canvasId[6]));
          graphlist.push(donut(ava, monthesNamelsit, graphlist.length, canvasId[7]));
          graphlist.push(barChart([ava], monthesNamelsit, graphlist.length, canvasId[8]));
          graphlist.push(areaChart([apa], monthesNamelsit, graphlist.length, canvasId[9]));
          graphlist.push(donut(apa, monthesNamelsit, graphlist.length, canvasId[10]));
          graphlist.push(barChart([apa], monthesNamelsit, graphlist.length, canvasId[11]));
          graphlist.push(areaChart([aca], monthesNamelsit, graphlist.length, canvasId[12]));
          graphlist.push(donut(aca, monthesNamelsit, graphlist.length, canvasId[13]));
          graphlist.push(barChart([aca], monthesNamelsit, graphlist.length, canvasId[14]));
        })
    })
}

function clacPre(array = []) {
  sum = 0;
  array.forEach(function (item) {
    sum += item.planned_revenue
  });
  return sum
}
/* 
 * map object protoType
 * prop => like fields,limit,order ...
 * prop_values => values of prop that must be contain
 */
function Map(prop, prop_values = []) {
  this.prop = prop;
  this.prop_values = prop_values;
}
/* 
 * Domain object protoType
 * f => field name to execute on it query
 * e => experation like =,<,> ...
 * value => value of f
 */
function Domain(f, e, v) {
  this.filed = f;
  this.experation = e;
  this.value = v;
}

function Graph(data, options, type) {
  this.data = data;
  this.options = options;
  this.type = type;
}
/* this function for login  */
function login(username, password) {
  $.ajax({
    url: odooUrl + "username=" + username + "&password=" + password,
    method: "GET",
    beforeSend: function (r) {
      //r.setRequestHeader("Access-Control-Allow-Origin","*")
    },
    error: function (e) {
      console.log(e)
    },
    success: function (result) {}
  })
}

function ajaxRequest(uid, password, modal, method, domains = [], mapList = [], monthesdata = []) {
  return $.ajax({
    url: makeHttpUrl(uid, password, modal, method, domains, mapList),
    method: "GET",
    dataType: 'json',
    data: {
      months: JSON.stringify(monthesdata),
    },
    error: function (e) {
      console.log(e)
    },
    success: function (r) {
      result = parseInt(JSON.parse(JSON.stringify(r)))
    }
  })
}
/*
 * return url Format
 */
function makeHttpUrl(uid, password, modal, method, domains = [], mapList = []) {
  return (
    odooUrl +
    "uid=" + uid +
    "&password=" + password +
    "&modalname=" + modal +
    "&method=" + method +
    makeDomainQuery(domains) +
    makeMappingList(mapList)
  );
}

function makeMappingList(mapList = []) {
  if (mapList.length != 0) {
    var mapStr = "&mappinglist[";
    var j = 0;
    mapList.forEach(map => {
      if (map.prop == "fields") {
        for (var i = 0; i < map.prop_values.length; i++) {
          mapStr += map.prop + "][" + i + "]=" + map.prop_values[i];
          if (i < map.prop_values.length - 1) {
            mapStr += "&mappinglist[";
          }
        }
      } else {
        mapStr += map.prop + "]"
        for (var i = 0; i < map.prop_values.length; i++) {
          mapStr += "=" + map.prop_values[i];
          if (i < map.prop_values.length - 1) {
            mapStr += "&mappinglist[";
          }
        }
      }
      j++;
      if (j < mapList.length) mapStr += "&mappinglist[";
    });
    return mapStr;
  } else {
    return "";
  }
}
/* make domain string */
function makeDomainQuery(domains = []) {
  var domainStr = "&parmlist[0]";
  if (domains.length != 0) {
    var i = 0;
    domains.forEach(dom => {
      domainStr += "[" + i + "]" + "[0]=" +
        dom.filed + "&parmlist[0]" + "[" +
        i + "][1]=" + dom.experation +
        "&parmlist[0]" + "[" + i + "][2]=" + dom.value;
      i++;
      if (i < domains.length) domainStr += "&parmlist[0]";
    });
    return domainStr;
  } else {
    return "";
  }
}
/* 
 *****get Months dates*****
 * this function return alist contain 13 date for months that must work on it
 * ever element on this list it's format is MM-DD-MM HH:MM:SS
 * it return 13 element to get 12 node or value from odoo 
 * every node return values between current element and next element
 */
function getMonths() {
  var date = new Date(),
    month = date.getMonth() + 1,
    monthsList = [],
    yearChanged = false
  for (var i = 0; i < 13; i++) {
    if (month < 0) {
      if (!yearChanged) {
        yearChanged = true
        date.setYear(date.getFullYear() - 1);
      }
      date.setMonth(month + 11);
    } else {
      date.setMonth(month);
    }
    date.setDate(1);
    date.setHours(00);
    date.setSeconds(00);
    date.setMilliseconds(00);
    date.setMinutes(00);
    /*
     * the next code push month date to months list 
     * convert month date to MM-DD-YYYY HH:MM:SS 
     */
    monthsList.push([date.getMonth() + 1,
      date.getDate(),
      date.getFullYear()
    ].join('-') + ' ' + [date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    ].join(':'));
    month--;
  }
  return monthsList
}