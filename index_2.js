const puppeteer = require('puppeteer');

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

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
    //navega para uma pagina privada qualquer do site
    await page.goto('https://valor.globo.com/carreira/noticia/2023/03/07/rhs-priorizam-tecnologias-de-monitoramento-de-funcionarios-segundo-pesquisa.ghtml');
    //clica em "Entrar" para ir na tela de login
    await page.click("#header > div > div.header__actions > div.header__actions__action.header__login > div.header__login__signedin.login-signedout-spot > a > span");
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
    //encaminha para pagina da noticia
    await page.goto('https://valor.globo.com/carreira/noticia/2023/03/07/rhs-priorizam-tecnologias-de-monitoramento-de-funcionarios-segundo-pesquisa.ghtml');
    //encaminha para pagina de outra noticia
    await page.goto('https://valor.globo.com/empresas/noticia/2023/03/14/o-discreto-gutierrez-fica-agora-sob-os-holofotes.ghtml');
    //encaminha para pagina de outra noticia
    await page.goto('https://valor.globo.com/financas/noticia/2023/03/13/btg-compra-r-124-milhes-em-aes-em-opa-do-banco-econmico.ghtml');
    //fecha o navegador depois de 2 segundos
    await delay(10000);
    await browser.close();

})();