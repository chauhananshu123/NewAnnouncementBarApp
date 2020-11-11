var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res) => {
  res.render('url_page');
 });
 
 // Index page views
 router.get('/index', (req, res) => {
  const shop = req.query.shop;
  res.render('index',{shop:shop});
});

// // script router
// router.get('/server', (req, res) => {
//   res.sendFile(__dirname+'/script/load.js');
//  });
 router.get('/style', (req, res) => {
   res.render('main');
 });
 router.get('/document', (req, res) => {
 // res.render('main');
 res.sendFile(__dirname+'/script/document/Smart-Announcement-Bar-Document.pdf');
});
router.get('/load/css', (req, res) => {
  // res.render('main');
  res.sendFile(__dirname+'/script/document/load.css');
 });








module.exports = router;