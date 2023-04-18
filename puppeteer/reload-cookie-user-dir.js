const puppeteer = require('puppeteer');
const url = "https://valor.globo.com/carreira/noticia/2023/03/07/rhs-priorizam-tecnologias-de-monitoramento-de-funcionarios-segundo-pesquisa.ghtml";
(async () => {
    //inicia o browser
    const browser = await puppeteer.launch({
        //(false abre o navegador)
        headless: false,
    });
    //instancia nova pagina no browser
    const page = await browser.newPage();
    //escala da pagina
    await page.setViewport({
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
    });

    /* Login globo */
    await do_login_in_o_globo_web_page(page);

})();
function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}


//desc: auxilia no login no globo
//params: (obj) page
//return: nenhum
async function do_login_in_o_globo_web_page(page){
    //navega para uma pagina privada qualquer do site
    await page.goto('https://valor.globo.com/carreira/noticia/2023/03/07/rhs-priorizam-tecnologias-de-monitoramento-de-funcionarios-segundo-pesquisa.ghtml');
    await delay(5000);
    //clica em "Entrar" para ir na tela de login
    //await page.click("#header > div > div.header__actions > div.header__actions__action.header__login > div.header__login__signedin.login-signedout-spot > a > span");
    //5 segundos para carregar a tela de login
    await delay(5000)
    //inserir login
    await page.type('#login', 'cassiano@sinopress.com.br');
    //inserir senha
    await page.type('#password', 'sinopress');
    //clica no botao de fazer login
    await page.click('#login-form > div.actions > button');
    //fecha o navegador
    await delay(15000)
}