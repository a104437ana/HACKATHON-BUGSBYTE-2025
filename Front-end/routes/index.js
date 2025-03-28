var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.status(200).render("index", {title: "Contratos", date: date});
});

module.exports = router;
