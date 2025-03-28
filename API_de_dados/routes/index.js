var express = require('express');
var router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

/* GET home page. */
router.get('/', function(req, res, next) {
  const url = 'https://epl.di.uminho.pt/~jcr/AULAS/EngWeb2025/aulas.html';
  axios.get(url)
    .then(resp => {
      const $ = cheerio.load(resp.data);
      let precos = []
      $('h2').each((index, element) => {
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
