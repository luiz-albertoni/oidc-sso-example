var fs = require('fs');

// vue.config.js
module.exports = {
  // options...
  devServer: {
    port: 3333, // CHANGE YOUR PORT HERE!
    /*
    https: {
      key: fs.readFileSync('/Users/luiz.albertoni/ssh/vue-cert/server.key'),
      cert: fs.readFileSync('/Users/luiz.albertoni/ssh/vue-cert/server.crt'),
      ca: fs.readFileSync('/Users/luiz.albertoni/ssh/vue-cert/rootCA.pem'),
    },*/
    //host: '192.168.0.50',
    hotOnly: false,
    disableHostCheck: true,
  }
}