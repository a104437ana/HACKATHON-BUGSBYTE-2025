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

router.get('/produtos/:id',function(req,res,next) {
  var product = req.params.id;
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
    axios.get(`http://localhost:3001/produtos/${product}`)
    .then(resp => {
      if (resp.data["product_dsc"] === undefined) {
        res.render('error',{title: "Erro", date: date, m:"Produto não existe"});
      } else {
        console.log(resp.data['product_price'])
        res.status(200).render("produto", {title: "Produto " + resp.data["product_dsc"], nome: resp.data["product_dsc"], id: resp.data["id"], date: date, suggestions: [], pa : resp.data['product_price'], prices : [{store: "Continente", price: resp.data["20231226"]}
      ]})}
    console.log(resp.data["20231226"])});
})

router.get('/cabazes', async function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  let produtos = [6927230, 5254224, 6654470, 2456648, 6022110, 6927230, 3795692]
  let indice_cabaz = 0
  let total_cabaz = 0
  let i = 0
  let lista = []
  let ll = []

  for (let product of produtos) {
    await axios.get(`http://localhost:3001/produtos/${product}`)
      .then(resp => {
        lista.push(resp.data["product_dsc"])
        ll.push(resp.data["id"])
        indice_cabaz += resp.data["20231226"];
        if (resp.data["product_price"]) {
          total_cabaz += parseFloat(resp.data["product_price"]);
        }
        i += 1
      });
  }
    indice_cabaz = indice_cabaz/i
    console.log(total_cabaz)
      res.status(200).render("cabazes", {title: "Cabazes", date: date, ll: ll, lista: lista, cabazes: [{name: "Cabaz essencial", indice: indice_cabaz, total: total_cabaz.toFixed(1)}]})
  }); 


router.post('/search', (req, res) => {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  const suggestionObject = JSON.parse(req.body.search); 
  const product = suggestionObject.id;
  res.redirect(`/produtos/${product}`);
});

router.get('/atualizaprecos', async function(req, res, next) {
  let pagina = 0
  for (pagina = 0; pagina < 150; pagina+=1) {
    await axios.get(`http://localhost:3001/continente/${pagina}`)
    console.log(`Pagina ${pagina}`)
  }
});

module.exports = router;