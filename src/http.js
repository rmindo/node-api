'use strict';


/**
 * Modules
 */
const http = require('http');

/**
 * Config
 */
const config = require('./config');


/**
 * Export
 */
const fn = module.exports = Object.create(http);
	

/**
 * Listen
 */
fn.run = (port) => {
  const server = http.createServer();
  
  // Create Request
  server.on('request', (req, res) => {
    const seg = req.url.split('/').filter(i=>i!='');

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });

    for(let items of config.resource)
    {
      for(let name in items)
      {
        let con = require(`./versions/${seg[1]}/${name}`);
        if(req.url == '/api/v1/users/1')
        {
          return res.end(JSON.stringify(con.read(req, res)));
        }
      }
    }
    res.end('Test');
  });
  server.listen(port, () => console.log(`Listening on port ${port}`));
};