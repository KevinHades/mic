'use strict';

const moment = require('moment');
const marked = require('marked');
const counter = require('../lib/count');
const mail = require('../lib/mail');


exports.index = function* () {
  let categorys = yield this.service.category.list();
  categorys = categorys.filter((d)=>{return d.level === 1});
  let platforms = yield this.service.platform.list();
  let columns = yield this.service.column.list();
  let users = yield this.service.people.listAll()
  yield this.render('bill.html',{
    current:"bill",
    columns: JSON.stringify(columns),
    categorys: JSON.stringify(categorys),
    platforms: JSON.stringify(platforms),
    users : JSON.stringify(users),
    title:"订单管理"
  });

};

// 新增

exports.main = function *(){

  const body = this.request.body;
  const oper = body.oper; 
  let id = body.id;
  const name = body.name;
  const price = body.price;
  const business = body.business;
  const status = body.status;
  const is_scene = body.is_scene;
  const is_audio = body.is_audio;
  const is_show = body.is_show;
  const is_model = body.is_model;
  const is_text = body.is_text;
  const time = body.time;
  const scale = body.scale;
  const channel = body.channel;
  const phone = body.phone;
  const category_id = body.category_id;
  const video_id = body.video_id;
  const platform_id = body.platform_id;
  const comment = body.comment;
  const column_id = body.column_id;
  const openid = body.openid;
  let result;
  if(oper === 'add'){

    result = yield this.service.bill.insert({
      work_id:this.session.user? this.session.user.id : null,
      name,
      price,
      business,
      status,
      is_scene,
      is_audio,
      is_model,
      is_text,
      is_show,
      time,
      scale,
      channel,
      phone,
      category_id,
      platform_id,
      column_id,
      video_id,
      openid,
      comment
    });

    if(!this.session.user){
      mail.sendMail('你收到一份来自全民星小视频的brief', '请在后台查看id为' + result.insertId +'的订单',function(info){
        console.log(info);
      })
    }

    this.body = 'success';

  }else if(oper === 'edit'){

    let work_id = this.session.user.id;

    yield this.service.bill.update({
      id,
      work_id:body.work_id,
      name,
      price,
      business,
      status,
      is_scene,
      is_audio,
      is_model,
      is_text,
      is_show,
      time,
      scale,
      channel,
      phone,
      platform_id,
      column_id,
      video_id,
      category_id,
      comment
    });
    yield this.service.workerLog.insert({
      event: '修改订单'+ name,
      place:'订单管理',
      work_id
    });
    this.body = 'success';

  }else if(oper === 'del'){

    let work_id = this.session.user.id;

    id = id.split(',');
    for(let i =0, l = id.length;i<l; i++){

      yield this.service.bill.remove(id[i]);

      yield this.service.workerLog.insert({
        event: '删除订单'+ id[i],
        place:'订单管理',
        work_id
      });
    }



    this.body = 'success';
  }


}

exports.list = function* () {
  const pageNum = +this.query.page || 1;
  const pageSize = +this.query.rows || 100;
  const _search = this.query._search;
  const sql = this.query.sql;
  let result, total;

  if(_search !== 'true'){
    result = yield this.service.bill.list(pageNum, pageSize);
    total = yield this.service.bill.count('1=1');
  }else{
    result = yield this.service.bill.search(pageNum, pageSize, sql);
    total = yield this.service.bill.count(sql);
  }
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
  this.body = {
    total: total > pageSize ? (parseInt(total / pageSize) + 1) : 1,
    rows: result,
    totalRow:total,
  };
}

exports.listByUser = function* () {
  let result;
  const openid = this.query.openid;
  result = yield this.service.bill.listByUser(openid);
  result = result.map((d)=>{
    d.timestamp = moment(d.timestamp).format('YYYY-MM-DD hh:mm:ss');
    return d;
  });
  this.body = {
    rows: result
  };
}