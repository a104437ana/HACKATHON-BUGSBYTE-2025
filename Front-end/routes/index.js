var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/',function(req,res,next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  res.status(200).render("index", {date: date})
})


/* GET products page. */
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
        let reco = resp.data['product_price']
        if (resp.data["20231226"] >= 1) {
          let n = Math.floor(resp.data['product_price']/resp.data["20231226"] - 0.01)
          let x = n + 0.99
          if (x > resp.data['product_price']) {
            x = ((n -1) + 0.99).toFixed(2)
          }
          reco = x
        }
        console.log(reco)
        res.status(200).render("produto", {reco: reco, title: "Produto " + resp.data["product_dsc"], nome: resp.data["product_dsc"], id: resp.data["id"], date: date, suggestions: [],index : resp.data["20231226"], prices : [{store: "Continente", price: resp.data["product_price"]}, {store: "Pingo Doce", price: resp.data["pingo_doce_price"]}, {store: "Mercadona", price: resp.data["mercadona_price"]}, {store: "Minipreço", price: resp.data["minipreco_price"]}
      ]})}
    console.log(resp.data["20231226"])});
})

router.get('/cabazes', async function(req, res, next) {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  let produtos = [6927230, 5254224, 6654470, 2203031, 3795692, 7825575, 2816831, 6919055, 7579107, 5038799, 7403557, 4636366, 7848011, 2597619]
  let indice_cabaz = 0
  let total_cabaz_Cont = 0
  let total_cabaz_Pingo_Doce = 0
  let total_cabaz_Mercadona = 0
  let total_cabaz_Minipreco = 0
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
          total_cabaz_Cont += parseFloat(resp.data["product_price"]);
          total_cabaz_Pingo_Doce += parseFloat(resp.data["pingo_doce_price"]);
          total_cabaz_Mercadona += parseFloat(resp.data["mercadona_price"]);
          total_cabaz_Minipreco += parseFloat(resp.data["minipreco_price"]);
        }
        i += 1
      });
  }
    indice_cabaz = indice_cabaz/i
      res.status(200).render("cabazes", {title: "Cabazes", date: date, ll: ll, lista: lista, cabazes: [{name: "Cabaz essencial", indice: indice_cabaz, totalCont: total_cabaz_Cont.toFixed(2), totalMercadona: total_cabaz_Mercadona.toFixed(2), totalPingo_Doce: total_cabaz_Pingo_Doce.toFixed(2), total_Minipreco: total_cabaz_Minipreco.toFixed(2)}]})
  }); 


router.post('/search', (req, res) => {
  var date = new Date().toLocaleString('pt-PT', { hour12: false });
  const suggestionObject = JSON.parse(req.body.search); 
  const product = suggestionObject.id;
  res.redirect(`/produtos/${product}`);
});


module.exports = router;