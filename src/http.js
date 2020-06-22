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
  const routes = {};
  const server = http.createServer();
  
  // Create Request
  server.on('request', (req, res) => {
    const seg = req.url.split('/').filter(i=>i!='');

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    
    
    for(let items of config.resource) {
      let path = `/${seg[0]}/${seg[1]}`;

      for(let name in items) {
        const item = items[name];
        
        path += `/${name}`;

        routes[name] = [
          ['GET', path, 'index', false],
          ['POST', path, 'create', false],
        ]
        
        path += `/${item['var']}`
        // Route with unique ID
        routes[name] = routes[name].concat([
          ['GET', path, 'read', false],
          ['PUT', path, 'update', false],
          ['DELETE', path, 'delete', false]
        ])
        
        // Iterate routes and add rule
        for(let route of routes[name]) {
          if(seg.length > 1) {

            let con = require(`./versions/${seg[1]}/${name}`);
            if(req.url == route[1]) {
              return res.end(JSON.stringify(con.read(req, res)));
            }
          }
        }
      }
    }
    res.end('Test');
  });
  server.listen(port, () => console.log(`Listening on port ${port}`));
};