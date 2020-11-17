var express = require('express');
var router = express.Router();
const Users = require('./Controler/Users');

/* GET users listing. */
router.get('/',Users.Urlpage);
 
 // Index page views
 router.get('/index',Users.Redirectpage);

// // script router
// router.get('/server',Users.Scripttag);

 
// router.get('/document', (req, res) => {
//     res.sendFile(__dirname+'/Controler/script/document/smart sticky add to cart document.pdf');
//    });
   
module.exports = router;