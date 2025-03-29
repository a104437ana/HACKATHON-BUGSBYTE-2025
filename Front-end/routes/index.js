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

router.get('/cabazes', async function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  let produtos = [6927230, 5254224, 6654470, 2456648, 6022110, 6927230, 3795692]
  let total_cabaz = 0
  let i = 0
  let lista = []

  for (let product of produtos) {
    await axios.get(`http://localhost:3001/produtos/${product}`)
      .then(resp => {
        lista.push(resp.data["product_dsc"])
        total_cabaz += resp.data["20231226"];
        i += 1
      });
  }
    total_cabaz = total_cabaz/i
    console.log(total_cabaz)
      res.status(200).render("cabazes", {title: "Cabazes", date: date, lista: lista, cabazes: [{name: "Cabaz essencial", price: total_cabaz}]})
  }); 


router.post('/search', (req, res) => {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  const suggestionObject = JSON.parse(req.body.search); 
  const product = suggestionObject.id;
  axios.get(`http://localhost:3001/produtos/${product}`)
  .then(resp => {res.status(200).render("produto", {title: "Produto " + resp.data["product_dsc"], nome: resp.data["product_dsc"], id: resp.data["id"], date: date, suggestions: [], prices : [{store: "Continente", price: resp.data["20231226"]}]})
  console.log(resp.data["20231226"])});
});

router.get('/atualizaprecos', async function(req, res, next) {
  let pagina = 0
  for (pagina = 0; pagina < 150; pagina+=1) {
    await axios.get(`http://localhost:3001/continente/${pagina}`)
    console.log(`Pagina ${pagina}`)
  }
});

module.exports = router;