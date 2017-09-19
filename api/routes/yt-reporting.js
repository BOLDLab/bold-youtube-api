'use strict';
module.exports = function(app) {
  const controller = require('../controllers/yt-reporting');

  app.route('/channels')
    .get(controller.list_all_channels);

 app.route('/report-types').
      get(controller.list_all_report_types);

 app.route('/create-report').
      get(controller.create_report);

  app.route('/playlist-items').
       get(controller.playlist_items);

 app.route('/playlists').
      get(controller.playlists);

 app.route('/video-analytics').
      get(controller.video_analytics);

 app.route('/video-details').
      get(controller.video_details);

  app.route('/google79db606f71f9941f.html').
      get(controller.verify);

  app.route('/one-off-auth').
        get(controller.one_off_auth);

};
