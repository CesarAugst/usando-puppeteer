//instancia de puppeteer
const puppeteer = require('puppeteer');

/*FUNCOES UTILITARIAS*/
const { delay } = require('./src/utils/f_delay.js');
const randomUseragent = require("random-useragent");

//funcao auto-executavel que inicia utilizacao do puppeteer
(async () => {
    //inicia um navegador
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--no-zygote', '--no-first-run', '--window-size=1920x1080', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-skip-list', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu', '--hide-scrollbars', '--disable-notifications', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-breakpad', '--disable-component-extensions-with-background-pages', '--disable-extensions', '--disable-features=TranslateUI,BlinkGenPropertyTrees', '--disable-ipc-flooding-protection', '--disable-renderer-backgrounding', '--enable-features=NetworkService,NetworkServiceInProcess', '--force-color-profile=srgb', '--metrics-recording-only', '--mute-audio']});
    //inicia uma pagina no navegador
    const page = await browser.newPage();

    await page.setViewport({
        width: 1820,
        height: 800
    });
    //insere os headers na requisicao
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
    });
    // randomizando view port pra evitar ser bloqueado
    await page.setViewport({
        width: 1820,
        height: 800,
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });
    // randomizando user agent pra evitar ser bloqueado
    const UA = randomUseragent.getRandom(function (ua) {
        return (ua.deviceType === '') && parseFloat(ua.browserVersion) >= 20;
    });
    await page.setUserAgent(UA);


    //navega para uma pagina do valor
    //aguarda periodo determinado para fazer login
    await delay(30000);

    //salva os cookies
    const cookies = await page.cookies();
    console.log(cookies);

})();