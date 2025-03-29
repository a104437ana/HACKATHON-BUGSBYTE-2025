var express = require('express');
var router = express.Router();
var axios = require('axios');
const bodyParser = require('body-parser');

// Middleware para processar o corpo da requisição
router.use(bodyParser.urlencoded({ extended: true }));


/* GET home page. */
router.get('/produtos', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.status(200).render("produtos", {title: "Produtos", date: date, suggestions: ['Arroz', 'Leite']});
});

router.get('/cabazes', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.status(200).render("cabazes", {title: "Cabazes", date: date});
});

function getPriceForProduct(productName) {
  return [
    { store: 'Loja OI', competitor: 'A', price: 100 },
    { store: 'Loja OI', competitor: 'B', price: 95 },
    { store: 'Loja XYZ', competitor: 'A', price: 110 },
  ];
}


router.post('/search', (req, res) => {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  const productName = req.body.search;
  const prices = getPriceForProduct(productName);
  console.log(prices)
  res.status(200).render("produtos", {title: "Produtos", date: date, suggestions: ['Arroz', 'Leite'], prices : prices});
});

module.exports = router;