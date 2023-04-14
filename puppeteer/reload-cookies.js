//instancia de puppeteer
const puppeteer = require('puppeteer');

//funcao auto-executavel que inicia utilizacao do puppeteer
(async () => {
    //inicia um navegador
    const browser = await puppeteer.launch();
    //inicia uma pagina no navegador
    const page = await browser.newPage();
    //navega para uma pagina
    await page.goto('https://example.com');
    //tira print da pagina navegada
    await page.screenshot({ path: 'example.png'});

    //fecha o navegador
    await browser.close();
})();