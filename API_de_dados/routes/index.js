var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res, next) {
  const url = 'https://www.continente.pt/mercearia/cafe-cha-e-bebidas-soluveis';
  axios.get(url)
    .then(resp => {
      const $ = cheerio.load(resp.data);
      let precos = []
      $('span.ct-price-formatted').each((index, element) => {
        precos.push($(element).text().trim());
        console.log($(element).text());
      });
      res.render('index', { title: 'Express', precos:  precos});
    })
    .catch(error => {
      console.log(error)
      res.render('error', {error: error})
    })
});

module.exports = router;
