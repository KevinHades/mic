'use strict';

module.exports = app => {
  class MonthServer extends app.Service {
    * insert(obj) {
      console.log(obj);
      const result = yield app.mysql.insert('video_video', {
        work_id:obj.work_id,
        name:obj.name,
        description:obj.description,
        category_id:obj.category_id,
        price:obj.price,
        business:obj.business,
        time:obj.time,
        format:obj.format,
        url:obj.url,
        is_audio:obj.is_audio,
        is_model:obj.is_model,
        is_scene:obj.is_scene,
        is_show:obj.is_show,
        is_text:obj.is_text,
        timestamp: app.mysql.literals.now,
      });

      return result.affectedRows === 1;
    }

    // 获取列表
    * list(pageNum, pageSize) {
      const articles = yield app.mysql.query('select * from video_video where deleted = 0 order by timestamp desc limit ? offset ?;', [ pageSize, (pageNum - 1) * pageSize ]);
      return articles;
    }

    // 获取某条信息
    * find(id) {
      const article = yield app.mysql.query('select video_video.id as video_id ,video_video.name as video_name, video_video.price, business, time, format,work_id, url, is_audio, is_text, is_model, is_show, is_scene, video_video.timestamp,category_id, description from video_video LEFT JOIN video_category on video_video.category_id = video_category.id where video_video.id = ?;', [ id ]);

      return article;
    }

    * listByHot(pageSize){
      const articles = yield app.mysql.query('select * from video_hot LEFT JOIN video_video  on video_hot.video_id=video_video.id order by pv desc limit ?;', [ pageSize ]);
      return articles;
    }

    // 搜索
    * search(pageNum, pageSize, where) {
        let sql = 'select * from video_video where deleted = 0 and'
        sql += ' '+ where;
        sql += ' order by timestamp desc limit ? offset ?;'
        const articles = yield app.mysql.query(sql, [pageSize, (pageNum - 1) * pageSize ]);
        return articles;
    }
    // 总数
    * count(where) {
        const count = yield app.mysql.query('select count(*) from video_video where ?', [where]);

        return count[0]['count(*)'];
    } 

    // 更新
    * update(data) {
      const result = yield app.mysql.update('video_video', data);

      return result.affectedRows === 1;
    }

    // 删除
    * remove(id) {
      const result = yield app.mysql.update('video_video', {
        id:id,
        deleted:1
      });

      return result.affectedRows === 1;
    }

  }
  return MonthServer;
};
