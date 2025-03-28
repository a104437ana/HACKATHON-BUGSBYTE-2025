const axios = require('axios');
const cheerio = require('cheerio');

async function scrape() {
  try {
    const url = 'https://continente.pt/mercearia/cafe-cha-e-bebidas-soluveis';
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    $(span.preco).each((index, element) => {
      console.log(element);
    });
  } catch (error) {
    console.error('Erro ao fazer o scrape:', error);
  }
}

scrape();
