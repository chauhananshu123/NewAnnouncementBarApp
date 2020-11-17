const dotenv = require('dotenv').config();
var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
var shopModel = require('../models/shop');
var fullshopModel = require('../models/fullshop');

// const sgMail = require('@sendgrid/mail');

const myInstaller = require('./Controler/Installer');
const Auth = require('./Controler/Auth');
//api keys
const apiKey = '80975c4e45daa64a97c18cc63630346c';
//api secrete keys
const apiSecret = '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';

const scopes = 'write_script_tags,read_products,write_products';
//Forwarding Adderess
const forwardingAddress = "https://newannouncementbarapp.herokuapp.com"; 


//Authentication creation of app
router.get('/shopify',myInstaller.installer);
router.get('/og',myInstaller.me)


//Redirect url after getitiing authentication scopes and url
router.get('/shopify/callback',Auth.Auth );
 
module.exports = router;