var express = require('express');
var router = express.Router();
const Users = require('./Controler/Users');
const cors = require('cors');

/* GET users listing. */
router.get('/',Users.Urlpage);
 
//  // Index page views
//  router.get('/index',Users.Redirectpage);

  // // Index page views
  // router.get('/document',Users.Redirectpage);

  router.get('/index', (req, res) => {
    const shop = req.query.shop;
    const index = "/index?shop="+shop;
    const document = "/document?shop="+shop; 

  
    res.render('index',{
      shop:shop,
      index:index,
      document:document

    });
  });

  router.get('/document',(req, res)=> {

    res.sendFile(__dirname+'/Controler/script/document/Smart Mobile aap banner document.pdf'); 
  
    // res.render('document',{
    //   shop:shop,
    //   index:index,
    //   document:document
    //  });
  });

// script router
router.get('/server',Users.Scripttag);

router.get("/path",cors(),(req,res)=>{
    res.send("heyyyy");
})

module.exports = router;








module.exports = router;