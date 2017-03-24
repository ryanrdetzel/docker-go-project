'use strict';

const express = require('express');
const JsonDB = require('node-json-db');
const mustacheExpress = require('mustache-express');

const PORT = 8080;
const app = express();

var db = new JsonDB("db/go-db", true, false);

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

/*
 * Home
 * Responsible for
 *      * listing out all existing links
 *      * deleting links
 *      * instructions?
 */
app.get('/', function (req, res) {
  db.reload();
  var links = getAllLinks();
  res.render('index', {
    links: links, 
    err: req.query.err, 
    added: req.query.added,
    deleted: req.query.deleted
  });
});

/* 
 * Save a new link in the DB
 * Params
 *    tag: go link name, e.g  go/google
 *    url: the url we should redirect to, e.g. http://www.google.com
 */
app.all('/add', function (req, res) {
  var tag = req.query.tag;
  var url = req.query.url;
  if (tag !== "" && url !== ""){
    db.push("/links[]", { tag: tag, url: url });
    res.redirect('/?added=' + tag);
  } else {
    res.redirect('/?err=failed_to_add');
  }
});

/* Delete
 * Delets an item from the database.
*/
app.get('/delete/:tagId', function(req, res) {
  db.reload();

  var tag = req.params.tagId;
  var links = getAllLinks();

  db.delete("/links");
  for(var i=0, len=links.length; i < len; i++){
    var link = links[i];
    if (link.tag !== tag) db.push("/links[]", link);
  }

  res.redirect('/?deleted=' + tag);
});

/* 
 * Find link for tag and redirect
*/
app.get('/:tagId', function(req, res) {
  var link = getLinkForTag(req.params.tagId);
  if (link === ""){
    res.redirect('/?err=invalid_tag');
  } else {
    res.redirect(link);
  }
});

/*
 * Helper methods
*/
function getAllLinks(){
  var links = []
  try {
    links = db.getData("/links");
  } catch(err) {}
  return links;
}

function getLinkForTag(tag){
  db.reload();
  var links = getAllLinks();
  for(var i=0, len=links.length; i < len; i++){
    if (links[i].tag === tag){
      return links[i].url;
    }
  }
  return ""
}

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
