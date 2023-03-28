const { Cluster } = require('puppeteer-cluster');
const vanillaPuppeteer = require('puppeteer');
const { addExtra } = require('puppeteer-extra');

//permitou rastrear sites com cloud flare protection habilitado
const Stealth = require('puppeteer-extra-plugin-stealth');
//utiliza agende randomico
const randomUseragent = require('random-useragent');
//sistema de arquivos
const fs = require("fs");
//compactacao
const util = require('util');
const zlib = require('zlib');
const gzip = util.promisify(zlib.gzip);

// dica de:
//https://hackernoon.com/tips-and-tricks-for-web-scraping-with-puppeteer-ed391a63d952
const skippedResources = [
    'quantserve',
    'adzerk',
    'doubleclick',
    'adition',
    'exelator',
    'sharethrough',
    'cdn.api.twitter',
    'google-analytics',
    'googletagmanager',
    'google',
    'fontawesome',
    'facebook',
    'analytics',
    'optimizely',
    'clicktale',
    'mixpanel',
    'zedo',
    'clicksor',
    'tiqcdn',
];

const options = {
    headless: false,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        //'--single-process',
        '--no-zygote',
        '--no-first-run',
        //`--window-size=${options.width || 1280},${options.height || 800}`,
        '--window-size=1920x1080',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-skip-list',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--hide-scrollbars',
        '--disable-notifications',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-breakpad',
        '--disable-component-extensions-with-background-pages',
        '--disable-extensions',
        '--disable-features=TranslateUI,BlinkGenPropertyTrees',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--mute-audio'
    ]
};

//array representando a fila
var queue = [];
//quantidade de registros da fila
var queue_lenght = 0;
//armazena nome do arquivo
var file_name = "";
//mensagem de erro
var error_msg = "";
//tipo de conteudo
var content_type = "";
//status da resposta
var status_response = "";

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
        //estrutura da resposta
        var jsonResponse = {
            id: Number(data.id),
            url: '',
            http_code: 0,
            content_type: '',
            size_download: 0,
            total_time: 0,
            erro_msg: '',
            html: ''
        }
        //tente executar isso
        try {
            //url recebida
            let url = data.url;
            //se vai exibir todos os recursos (normalmente nao)
            let carregar_todos_recursos = (data.carregar_todos_recursos === 1);
            //compacta a url
            let url_gzip = await gzip(url);
            //coloca na resposta convertendo o binario
            jsonResponse['url'] = url_gzip.toString('base64');
            //insere os headers na requisicao
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
            });
            // randomizando view port pra evitar ser bloqueado
            await page.setViewport({
                width: 1920 + Math.floor(Math.random() * 100),
                height: 3000 + Math.floor(Math.random() * 100),
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
            //interceptacao ao fazer requisicao no momento do download dos arquivos
            await page.setRequestInterception(true);
            //verifica os arquivos que serao baixados/descartados
            page.on('request', (request) => {
                if (request.resourceType() === 'document'
                    || request.resourceType() === 'script'
                    || request.resourceType() === 'xhr'
                    || request.resourceType() === 'fetch'
                    || (carregar_todos_recursos && (request.resourceType() === 'other' || request.resourceType() === 'image' ||  request.resourceType() === 'stylesheet'))
                ) {
                    const requestUrl = request.url().split('?')[0].split('#')[0];
                    if (skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)) {
                        request.abort();
                    } else {
                        request.continue();
                    }
                } else {
                    request.abort();
                }
            });

            //ao ter resposta da requisicao
            page.on('response', response => {
                //se for o arquivo referente a pagina
                if (response.url() === (url)) {
                    //pega o status de resposta
                    status_response = response.status();
                    //pega os cabecalhos da requisicao
                    const headers = response.headers();
                    //pega o tipo de conteudo
                    content_type = headers['content-type']
                }
            });
            //armazena a resposta da requisicao
            let httpResponse = await page.goto(url, {'waitUntil': 'networkidle0', 'timeout': 20000});
            //espera pelo carregamento do body
            await page.waitForSelector('body');
            //pega o conteudo html da pagina
            let htmlContent = await page.content();
            //compacta o conteudo
            htmlContent = await gzip(htmlContent);
            //insere na resposta convertendo o binario em string
            jsonResponse['html'] = htmlContent.toString('base64');
            //console.log(`Obteve conteudo de ${Number(data.id)}#${htmlContent.toString('base64').substring(0,5)}`)
            //converte o status_http recebido em numero e insere na resposta
            jsonResponse['http_code'] = Number(status_response);
            //opcionais
            jsonResponse['size_download'] = 0;
            jsonResponse['total_time'] = 0;
            //pega da resposta a url envolvida e compacta ela
            //let url_final = await gzip(url).toString('base64');
            //adiciona a resposta da requisicao a conversao de binario em string da url
            jsonResponse['url'] = url;
            //compacta o tipo de contudo
            //let contentType = await gzip(content_type).toString('base64');
            //anexa a resposta convertendo em string
            jsonResponse['content_type'] = content_type;
        } catch (err) {
            //se houve erro compacta
            //let erro = await gzip(err.toString()).toString('base64');
            //adiciona a resposta convertendo binario em string
            jsonResponse['erro_msg'] = err.toString();
        } finally {
            //adiciona ao array de resposta
            queue.push(jsonResponse);
            //verifica se e a ultima ocorrencia
            if(queue.length === queue_lenght) {
                //finalizacao do processo de requisicao em lote
                finishing_array_requisitions();
            }
        }
    });

    /*Trabalhando com os arquivos*/
    //loop infinito
    while(true){
        //acessa o diretorio
        fs.readdir("./url_aguardando", (err, files) => {
            //percorre o diretorio e faz um loop com o nome dos arquivos
            files.forEach(async(file) => {
                //verifica se nao possui o sufixo de quando ja esta sendo processado por outra instancia
                if (!file.endsWith('.processing')) {
                    //renomeia para processamento
                    await fs.rename(`./url_aguardando/${file}`, `./url_aguardando/${file}.processing`, () => {})
                    //faz a leitura do conteudo do arquivo pegando o array de urls dentro dele
                    const array_url = await read_waiting_file(file);
                    //armazena em variavel global o tamanho da fila
                    queue_lenght = array_url.length;
                    //armazena em variavel global o nome do arquivo
                    file_name = file;
                    //percorre o array de url
                    array_url.forEach((obj_url, index) => {
                        //coloca na fila a url
                        cluster.queue({id: obj_url.id, carregar_todos_recursos: 0, url: obj_url.url});
                    });
                }
            })
        })
        //espera 1 segundo para verificar novamente o diretorio
        await delay(1000);
    }
})();

//desc: leitura de arquivo
//params: (string) nome do arquivo
//return:
async function read_waiting_file(file){
    //array de urls inicia vazia
    var array_url = [];
    //nome do arquivo
    var file_name = `./url_aguardando/${file}.processing`;

    //verifica se o arquivo nao existe
    if(!fs.existsSync(file_name)){
        //tenta sem a extensao
        file_name = `./url_aguardando/${file}`;
    }
    //verifica se o arquivo existe
    if(fs.existsSync(file_name)){
        //tenta sem a extensao
        const file_content = fs.readFileSync(file_name,'utf8');
        //converte arquivo em json
        const parsed_file_content = JSON.parse(file_content)
        //resgata chave onde tem as urls convertendo em array-
        array_url = (JSON.parse(parsed_file_content.url))
    }

    //retorna o array de urls apos conversao
    return array_url;
}

//desc: finaliza o lote de requisicoes
//params:
//return:
function finishing_array_requisitions(){
    //tenta fazer gestao com arquivos
    try{
        //faz criacao do arquivo com o conteudo
        fs.writeFileSync(`./url_finalizado/${file_name}`, JSON.stringify(queue), {encoding: 'utf-8'});
        //remove o arquivo de processamento atual
        fs.unlink(`./url_aguardando/${file_name}.processing`, ()=>{});
    }catch(error){
        //se nao puder exibe erro
        console.log(error)
    }finally{ //independente, faz limpeza da metadata
        //limpa a fila
        queue = [];
        //limpa o nome do arquivo
        file_name = "";
        //limpa a mensagem de erro
        error_msg = "";
        //limpa o tipo de conteudo
        content_type = "";
        //limpa o status de resposta
        status_response = "";
    }
}

//desc: equivalente a sleep
//params: (number) quantidade de milisegundos que ficara esperando
//return: nenhum
function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}
