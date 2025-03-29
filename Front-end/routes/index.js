var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/produtos', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.status(200).render("produtos", {title: "Produtos", date: date, suggestions: ['Arroz', 'Leite']});
});

router.get('/cabazes', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.status(200).render("cabazes", {title: "Cabazes", date: date});
});

module.exports = router;
