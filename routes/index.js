const dotenv = require('dotenv').config();
var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
// var shopModel = require('../models/shop');
// var fullshopModel = require('../models/fullshop');

// const sgMail = require('@sendgrid/mail');

//api keys
const apiKey = '080975c4e45daa64a97c18cc63630346c';
//api secrete keys
const apiSecret = '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';

const scopes = 'write_script_tags,read_products,write_products';
//Forwarding Adderess
const forwardingAddress = "https://newannouncementbarapp.herokuapp.com"; 


//Authentication creation of app
router.get('/shopify', (req, res) => {
    const shop = req.query.shop;
    if (shop) {
      const state = nonce();
      const redirectUri = forwardingAddress + '/shopify/callback';
      const installUrl = 'https://' + shop +
        '/admin/oauth/authorize?client_id=' + apiKey +
        '&scope=' + scopes +
        '&state=' + state +
        '&redirect_uri=' + redirectUri;
  
      res.cookie('state', state);
      res.redirect(installUrl);
    } else {
      return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
    }
  });
  


//Redirect url after getitiing authentication scopes and url
router.get('/shopify/callback', (req, res) => {
    const { shop, hmac, code, state } = req.query;
    const stateCookie = cookie.parse(req.headers.cookie).state;
  
    // if (state !== stateCookie) {
    //   return res.status(403).send('Request origin cannot be verified');
    // }
  
    if (shop && hmac && code) {
      // DONE: Validate request is from Shopify
      const map = Object.assign({}, req.query);
      delete map['signature'];
      delete map['hmac'];
      const message = querystring.stringify(map);
      const providedHmac = Buffer.from(hmac, 'utf-8');
      const generatedHash = Buffer.from(
        crypto
          .createHmac('sha256', apiSecret)
          .update(message)
          .digest('hex'),
          'utf-8'
        );
      let hashEquals = false;
  
      try {
        hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
      } catch (e) {
        hashEquals = false;
      };
  
      if (!hashEquals) {
        return res.status(400).send('HMAC validation failed');
      }
  
      // DONE: Exchange temporary code for a permanent access token
      const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
      const accessTokenPayload = {
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      };
  
      request.post(accessTokenRequestUrl, { json: accessTokenPayload })
      .then((accessTokenResponse) => {
        // Access token -
        const accessToken = accessTokenResponse.access_token;
        // DONE: Use access token to make API call to 'shop' endpoint
        // const shopRequestUrl = 'https://' + shop + '/admin/api/2020-01/shop.json';
        //const shopProduct = 'https://' + shop + '/admin/api/2020-01/products.json';
        // const createScriptTagUrl = 'https://' + shop + '/admin/api/2020-01/script_tags.json'; 
       
        // Header For Api                                                                                                                                                                                                           const shopProduct = 'https://' + shop + '/admin/api/2020-01/products.json';                                                                                                                                                                                                // Header for api to pass token and get acess                                                
            const shopRequestHeaders = {
              'X-Shopify-Access-Token': accessToken,
              'Accept' : "application/json",
              'Content-Type' : "application/json"
            };
            
//########################## shop verification in database ################################################
      
        var shopCheck = shopModel.findOne({shopName:shop});
            shopCheck.exec((err,data)=>{
               // if(err) throw err;
                if(data){
                 
                    var data = {
                        shopToken:accessToken
                      }

                     var shopUpdate = shopModel.findOneAndUpdate({shopName:shop},data);
                         shopUpdate.exec((err,upd)=>{
                             // console.log(upd);
//############################## Script tag APi Count  ########################################################################      
                    
                        var getScriptTag = 'https://'+shop+'/admin/api/2020-01/script_tags/count.json';
                         
                         request.get({
                            url: getScriptTag,
                            // body: scriptTagBody,
                            headers: shopRequestHeaders,
                            json: true
                          }, function (error, response, body) {
                            // console.log(body.count);
                            //Do whatever you want with the body
                        var scriptTagValue = body.count;
                        
                         if(scriptTagValue == 0){  // Tag Value Check

//###################################  Webhook register ##############################################################

                          var webhookUrl = 'https://'+shop+'/admin/api/2020-01/webhooks.json';
                          var webhookBody  = {
                             "webhook": {
                             "topic": "app/uninstalled",
                             "address": "https://newannouncementbarapp.herokuapp.com/api/2020-04/uninstall",
                             "format": "json"
                           }
                         }
                         request.post({
                           url: webhookUrl,
                           body: webhookBody,
                           headers: shopRequestHeaders,
                           json: true

                       }, function (error, response, body) {
                          
                           //Do whatever you want with the body
                       });

//##############################  Webhook register End ##############################################################
                  
//###############################  Script api  ##############################################################
                            
                            var createScriptTagUrl = 'https://'+shop+'/admin/api/2020-01/script_tags.json';
                             
                              var scriptTagBody = {
                                 "script_tag": {
                                     "event": "onload",
                                     "src": "https://newannouncementbarapp.herokuapp.com/server"
                     
                                 }
                             }
                             request.post({
                                 url: createScriptTagUrl,
                                 body: scriptTagBody,
                                 headers: shopRequestHeaders,
                                 json: true
                             }, function (error, response, body) {
                                 
//#################################### Shop data Api and Email APi email #######################################################
                          var getScriptTag = 'https://'+shop+'/admin/api/2020-01/shop.json';
                             
                          request.get({
                            url: getScriptTag,
                            // body: scriptTagBody,
                            headers: shopRequestHeaders,
                            json: true
                        }, function (error, response, body) {
                              
                              var tagrgetEmail = body.shop.email;
                              // console.log(tagrgetEmail);
      //################## Full Shop Update ###################################################
                              const fulldata = {
                                shopName: shop,
                                email: body.shop.email,
                                country_name: body.shop.country_name,
                                phone: body.shop.phone,
                                customer_email: body.shop.customer_email,
                                shop_owner: body.shop.shop_owner,
                                address1: body.shop.address1,
                                zip: body.shop.zip,
                                city: body.shop.city
                              }
                              const fullshopDataupdate = fullshopModel.findOneAndUpdate({shopName:shop},fulldata);
                                 fullshopDataupdate.exec((err,res1)=>{
                                  //  if(err) throw err;
                                  //   console.log(res1);
                                 }); 
                            
//######################### Full Shop Update ###################################################
                              // Do whatever you want with the body
                             
                                  sgMail.setApiKey('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');
                                      const msg = {
                                      to: fulldata.email,
                                      from: 'support@ens.enterprises',
                                      subject: 'Smart Announcement Bar App',
                                      text: 'Smart Announcement Bar App',
                                      html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style></style></head><body><table style="text-align: center;background: linear-gradient(30deg,#fdf2ea 0%,#ffc46c 100%);text-align: center;padding: 10px 30px 30px;"><tr><td><table style="text-align:center; width: 800px; margin: 0 auto"> <thead style="display:block; width:100%"> <tr style="display: block"><td style="display: block"><img src="https://www.ens.enterprises/wp-content/uploads/2019/02/enslogo.png" alt="ens product">   </td> </tr></thead>  </table><div style="width: 800px;margin: 0 auto;background: #fff;text-align: left;padding: 10px 30px;box-sizing: border-box;font-family: arial;font-size: 15px;"><p>Dear : '+fulldata.shopName+' </p>  <p>Thanks for installing Smart announcement Bar App</p> </div> <div style="width: 800px;margin: 0 auto;background: rgb(63, 60, 60);text-align: left;padding: 10px 30px;box-sizing: border-box;font-family: arial;font-size: 15px; color: #fff;"><h3 style="text-align: center;">Why Choose Us ?</h3>  <p>We have established a reputation for consistently delivering mission critical, technically challenging projects under tight time lines, while also providing exceptional customer service and support to our clientele. This in turn has led to extremely positive long-term working relationships with both clients and solution partners alike.</p> <h4>ENS Enterprises Private Limited</h4> </div> </td>  </tr></table> </body> </html>',
                                    };
                              sgMail.send(msg);
                              
                              res.redirect('/index?shop='+shop);

                            });
                                
                             
                        });  

//########################### ##  Script api End ##############################################################                        
                           
                               } // Tag Value condition Check end
                                else {
                                  
                                  res.redirect('/index?shop='+shop);

                              // redirect here

                              } 
                         });    // END getScriptTag end API 
                     });   // -- Update here  -- ##
                           
                }else{
                    const data = {
                        shopName:shop,
                        shopToken:accessToken,
                       // shopEmail:tagrgetEmail
                      }
                      const shopDataInsert = new shopModel(data);
                            shopDataInsert.save((err,res1)=>{  // save data insert tag start
                            // if(err) throw err;
//################################ Script api Count #################################################################################################
                      var getScriptTag = 'https://'+shop+'/admin/api/2020-01/script_tags/count.json';

                       request.get({     
                        url: getScriptTag,
                        // body: scriptTagBody,
                        headers: shopRequestHeaders,
                        json: true
                    }, function (error, response, body) {
                         //  console.log(body.count);
                        // Do whatever you want with the body
                       //  var tagvalue = body.count
                   
                       var scriptTagvalue = body.count;
                      // script tag check 
                       if(scriptTagvalue == 0){

//######################### Webhook register #############################################################

                        var webhookUrl = 'https://'+shop+'/admin/api/2020-01/webhooks.json';
                        var webhookBody  = {
                           "webhook": {
                           "topic": "app/uninstalled",
                           "address": "https://newannouncementbarapp.herokuapp.com/smartAnnouncement/api/2020-04/uninstall",
                           "format": "json"
                         }
                       }
                       request.post({
                         url: webhookUrl,
                         body: webhookBody,
                         headers: shopRequestHeaders,
                         json: true

                     }, function (error, response, body) {
                        
                         //Do whatever you want with the body
                     });
//############################# Webhook register End ####################################################

//############################# Script tag Api ####################################################

                            var createScriptTagUrl = 'https://'+shop+'/admin/api/2020-01/script_tags.json';
                            var scriptTagBody = {
                                "script_tag": {
                                    "event": "onload",
                                    "src": "https://newannouncementbarapp.herokuapp.com/server"
                    
                                }
                            }
                            request.post({
                                url: createScriptTagUrl,
                                body: scriptTagBody,
                                headers: shopRequestHeaders,
                                json: true
                            }, function (error, response, body) {                   
                                //Do whatever you want with the body
//#################################### Shop data Api and Email APi email #######################################################
                          var getScriptTag = 'https://'+shop+'/admin/api/2020-01/shop.json';
                             
                          request.get({

                                url: getScriptTag,
                                // body: scriptTagBody,
                                headers: shopRequestHeaders,
                                json: true

                        }, function (error, response, body) {
                              
                              var tagrgetEmail = body.shop.email;
                              // console.log(tagrgetEmail);
                              // Do whatever you want with the body
              //########### Full Data Insert #############################
                              const fulldata = {

                                shopName: shop,
                                email: body.shop.email,
                                country_name: body.shop.country_name,
                                phone: body.shop.phone,
                                customer_email: body.shop.customer_email,
                                shop_owner: body.shop.shop_owner,
                                address1: body.shop.address1,
                                zip: body.shop.zip,
                                city: body.shop.city

                              }
                              const fullshopDataInsert = new fullshopModel(fulldata);
                                 fullshopDataInsert.save((err,res1)=>{
                                  // if(err) throw err;
                                   // console.log(res1);
                                 });                            

            //########### Full Data Insert End #############################                  
                           //Email 
                                  sgMail.setApiKey('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');
                                      const msg = {
                                      to: fulldata.customer_email,
                                      from: 'support@ens.enterprises',
                                      subject: 'Smart Announcement Bar App',
                                      text: 'Smart Announcement Bar App',
                                      html: '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style></style></head><body><table style="text-align: center;background: linear-gradient(30deg,#fdf2ea 0%,#ffc46c 100%);text-align: center;padding: 10px 30px 30px;"><tr><td><table style="text-align:center; width: 800px; margin: 0 auto"> <thead style="display:block; width:100%"> <tr style="display: block"><td style="display: block"><img src="https://www.ens.enterprises/wp-content/uploads/2019/02/enslogo.png" alt="ens product">   </td> </tr></thead>  </table><div style="width: 800px;margin: 0 auto;background: #fff;text-align: left;padding: 10px 30px;box-sizing: border-box;font-family: arial;font-size: 15px;"><p>Dear : '+fulldata.shopName+' </p>  <p>Thanks for installing Smart announcement Bar App</p> </div> <div style="width: 800px;margin: 0 auto;background: rgb(63, 60, 60);text-align: left;padding: 10px 30px;box-sizing: border-box;font-family: arial;font-size: 15px; color: #fff;"><h3 style="text-align: center;">Why Choose Us ?</h3>  <p>We have established a reputation for consistently delivering mission critical, technically challenging projects under tight time lines, while also providing exceptional customer service and support to our clientele. This in turn has led to extremely positive long-term working relationships with both clients and solution partners alike.</p> <h4>ENS Enterprises Private Limited</h4> </div> </td>  </tr></table> </body> </html>',
                                    };

                              sgMail.send(msg);

                              res.redirect('/index?shop='+shop);

                            });
                                
                              
                        });
//######################## Script Tag api End ####################################################        
               
                      
                      }else{
                        // Redirect here
                        res.redirect('/index?shop='+shop);

                      }
                        
                     
                     });  // End save data insert tag 
                    });   // End Script Tag request Start Here
                }
            })
 
       
         


        .catch((error) => {
          res.status(error.statusCode).send(error.error.error_description);
        });
      })

      .catch((error) => {
        res.status(error.statusCode).send(error.error.error_description);
      });
  
    } else {
      res.status(400).send('Required parameters missing');
    }
  });
 




  module.exports = router;
