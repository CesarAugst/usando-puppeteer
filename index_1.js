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
    await page.setViewport({
        width: 1366,
        height: 768,
        deviceScaleFactor: 1,
    });
    //navega para pagina de login
    await page.goto('https://login.globo.com/login/6908/connect-confirm?url=https%3A%2F%2Fid.globo.com%2Fauth%2Frealms%2Fglobo.com%2Flogin-actions%2Fauthenticate%3Fsession_code%3D-JUCet1QA_mE-8k4tw8jqVdCgxkn2af7v09NaFYBwHI%26execution%3Db5dd88dc-447e-468f-945e-e7c7de4883b7%26client_id%3Dvalor%2540globoid-connect%26tab_id%3DSSZScn76Gxg%26request-context%3DAUWRFX&error=&request-context=AUWRFX');
    //preenche o input de login
    await page.type('#login', 'cassiano@sinopress.com.br');
    //preenche o input de senha
    await page.type('#password', 'sinopress');
    //clica no botao de fazer login
    await page.click('[type="submit"]');
    await delay(10000);
    //acessa pagina de acesso restrito
    await page.goto('https://valor.globo.com/carreira/noticia/2023/03/07/rhs-priorizam-tecnologias-de-monitoramento-de-funcionarios-segundo-pesquisa.ghtml');
    //await page.click('.login-profile__name');
    //await page.click('span.login-profile__name[data-content="user-name"]');
    //await page.click('a.header-color-hover[data-action="logout"]');
    await delay(5000);
    //await page.click('span.fechar-modal-icone');
    //await delay(1000);
    /*
    await page.click('span.header__menu__label');
    await delay(1000);
    await page.click('div.menu-login__item-logout>a')
    await delay(2000);
    await browser.close();

     */
})();