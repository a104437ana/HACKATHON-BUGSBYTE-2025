var express = require('express');
var router = express.Router();
var axios = require('axios');
const bodyParser = require('body-parser');

// Middleware para processar o corpo da requisição
router.use(bodyParser.urlencoded({ extended: true }));


/* GET home page. */
router.get('/produtos', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  axios.get('http://localhost:3001/produtos_info')
  .then(resp => res.status(200).render("produtos", {title: "Produtos", date: date, suggestions: resp.data}))
});

router.get('/cabazes', function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.status(200).render("cabazes", {title: "Cabazes", date: date});
});


router.post('/search', (req, res) => {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  console.log(req.body)
  const suggestionObject = JSON.parse(req.body.search); 
  const product = suggestionObject.sku;
  axios.get(`http://localhost:3001/produtos/${product.sku}`)
  .then(resp => res.status(200).render("produtos", {title: "Produtos", date: date, suggestions: [], prices : resp.data["20231226"]}));
});

module.exports = router;