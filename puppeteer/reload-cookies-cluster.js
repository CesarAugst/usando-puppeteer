/*CONSTANTES DE VALOR*/
const time_to_wait_in_page = 25000; //milisseconds que fica em cada pagina antes de encerrar como timeout
const PATH_URL_WAITING = './url_aguardando'; //caminho ate a pasta de url_aguardando
const PATH_URL_FINISHED = './url_finalizado'; //caminho ate a pasta de url_finalizado
const skippedResources = ['quantserve', 'adzerk', 'doubleclick', 'adition', 'exelator', 'sharethrough', 'cdn.api.twitter', 'google-analytics', 'googletagmanager', 'google', 'fontawesome', 'facebook', 'analytics', 'optimizely', 'clicktale', 'mixpanel', 'zedo', 'clicksor', 'tiqcdn']; // dica de: https://hackernoon.com/tips-and-tricks-for-web-scraping-with-puppeteer-ed391a63d952
const options = { headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-infobars', '--no-zygote', '--no-first-run', '--window-size=1920x1080', '--window-position=0,0', '--ignore-certificate-errors', '--ignore-certificate-errors-skip-list', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu', '--hide-scrollbars', '--disable-notifications', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-breakpad', '--disable-component-extensions-with-background-pages', '--disable-extensions', '--disable-features=TranslateUI,BlinkGenPropertyTrees', '--disable-ipc-flooding-protection', '--disable-renderer-backgrounding', '--enable-features=NetworkService,NetworkServiceInProcess', '--force-color-profile=srgb', '--metrics-recording-only', '--mute-audio']}; //config do puppeteer

/*Importacoes*/
const { Cluster } = require('puppeteer-cluster');
const vanillaPuppeteer = require('puppeteer');
const { addExtra } = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth'); //permitiu rastrear sites com cloud flare protection habilitado
const randomUseragent = require('random-useragent'); //utiliza agente randomico
const fs = require("fs"); //sistema de arquivos
const util = require('util'); //compactacao
const zlib = require('zlib'); //compactacao
const gzip = util.promisify(zlib.gzip); //compactacao

/*VARIAVEIS DE CONTEXTO*/
var queue = []; //array representando a fila
var queue_lenght = 0; //quantidade de registros da fila
var file_name = ""; //armazena nome do arquivo
var error_msg = ""; //mensagem de erro
var content_type = ""; //tipo de conteudo
var status_response = ""; //status da resposta

/*FUNCOES UTILITARIAS*/
const { delay } = require('./src/utils/f_delay.js');
const {remove_file} = require("./src/utils/f_remove_file");
const {write_file} = require("./src/utils/f_write_file");
const {bool_file_exists} = require("./src/utils/f_bool_file_exists");

/*PROCEDIMENTOS*/
const { read_waiting_file } = require("./src/procedures/p_read_waiting_file");

//fucnao com auto-execucao
(async () => {
    await vanillaPuppeteer.createBrowserFetcher().download(vanillaPuppeteer.PUPPETEER_REVISIONS.chromium)
    //instancia o puppeteer
    const puppeteer = addExtra(vanillaPuppeteer);
    puppeteer.use(Stealth());
    //instancia o navegador
    const cluster = await Cluster.launch({
        puppeteer,
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 30,
        puppeteerOptions: options
    });

    //o que fazer com cada url na fila
    await cluster.task(async ({ page, data }) => {
        //tente executar isso
        try {
            //url recebida
            let url = data.url;
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
            //armazena a resposta da requisicao
            let httpResponse = await page.goto(url);
            //salva os cookies
            let cookies = await page.cookies();
            //loop com os cookies
            while(true){
                //salva os cookies
                const cookies2 = await page.cookies();
                //se os novos cookies forem diferentes dos anteriores
                if(cookies !== cookies2){
                    console.log('NOVOS COOKIES QUENTINHOS DIRETO DO FORNO: ')
                    console.log(cookies);
                }
                //delay
                await delay(1000);
            }
        } catch (err) {
            //imprime o erro
            console.log("Deu erro: " + err.toString());
        }
    });
    //vai pro google pesquisando valor
    await cluster.queue({url: "https://www.google.com/search?q=valor"});

})();