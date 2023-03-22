const { Cluster } = require('puppeteer-cluster');
const fs = require("fs");
const util = require('util');
const zlib = require('zlib');
const gzip = util.promisify(zlib.gzip);

//array representando a fila
var queue = [];
//quantidade de registros da fila
var queue_lenght = 0;
//armazena nome do arquivo
var file_name = "";
//mensagem de erro
var error_msg = "";

(async () => {
    //instancia o navegador
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 4,
        puppeteerOptions:{
            headless: false,
        }
    });

    /*Trabalhando com os arquivos*/
    //loop infinito
    while(true){
        //acessa o diretorio
        fs.readdir("../url_aguardando", (err, files) => {
            //percorre o diretorio e faz um loop com o nome dos arquivos
            files.forEach(async(file) => {
                //verifica se nao possui o sufixo de quando ja esta sendo processado por outra instancia
                if (!file.endsWith('.processing')) {
                    //renomeia para processamento
                    fs.rename(`../url_aguardando/${file}`, `../url_aguardando/${file}.processing`, () => {})
                    //faz a leitura do conteudo do arquivo pegando o array de urls dentro dele
                    const array_url = JSON.parse(fs.readFileSync(`../url_aguardando/${file}`,'utf8'));
                    //armazena em variavel global o tamanho da fila
                    queue_lenght = array_url.length;
                    //armazena em variavel global o nome do arquivo
                    file_name = file;
                    //percorre o array de url
                    array_url.forEach((obj_url, index) => {
                        //coloca na fila a url
                        cluster.queue(async ({ page }) => {
                            //busca o conteudo html da pagina
                            const {http_response, html_content} = await find_html_content(page, obj_url.url);
                            //define o status da requisicao dessa pagina especifica
                            const status_page = define_http_status(html_content);
                            //encontra o content type no header da requisicao
                            const content_type = "";
                            //adiciona o conteudo da pagina ao array da fila
                            queue.push({
                                "id": Number(obj_url.id),
                                "http_code": status_page,
                                "size_download": 0,
                                "total_time": 0,
                                "content_type": content_type.toString(),
                                "url": obj_url.url,
                                "html": html_content.toString(),
                                "error_msg": error_msg
                            });
                            //se apos inserir no array da fila ela ficar com o tamanho maximo
                            if(queue.length === queue_lenght) {
                                //finalizacao do processo de requisicao em lote
                                finishing_array_requisitions();
                            }
                        });
                    });
                }
            })
        })
        //espera 1 segundo para verificar novamente o diretorio
        await delay(1000);
    }
})();

//desc: finaliza o lote de requisicoes
//params:
//return:
function finishing_array_requisitions(){
    //faz criacao do arquivo com o conteudo
    fs.writeFileSync(`../url_finalizado/${file_name}`, JSON.stringify(queue), {encoding: 'utf-8'});
    //remove o arquivo de processamento atual
    fs.unlink(`../url_aguardando/${file_name}.processing`, ()=>{});
    //limpa a fila
    queue = [];
    //limpa o nome do arquivo
    file_name = "";
    //limpa a mensagem de erro
    error_msg = "";
}
//desc: com base no conteudo recebido da pagina estabelece o status da requisicao
//params: (string) corpo da pagina apos requisicao
//return: (number) status da requisicao da pagina
function define_http_status(html_content){
    //define o status da pagina especifica com base no conteudo recebido
    return html_content === ""
        ? 500 //500 se estiver em branco
        : 200; //200 se estiver preenchido
}

//desc: busca o conteudo html da pagina
//params: (obj) instancia da pagina, (string) url
//return (string) conteudo html
async function find_html_content(page, url){
    //inicia vazia a variavel que armazena o conteudo da pagina
    var html_content = "";
    var http_response = "";
    //tenta navegar para pagina
    try{
        //navega para a url definindo timeout
        http_response = await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 20000
        });
        console.log('respone');
        console.log(http_response);
        //espera ate o body carregar
        await page.waitForSelector('body');
        //armazena o conteudo
        html_content = await page.content();
        //compacta o conteudo
        html_content = await gzip(html_content);
    }catch (error) {
        //se houver erro imprime o erro
        console.log(error.message);
        //preenche a variavel de erro com a mensagem
        error_msg = error.message;
        //conteudo em branco
        html_content = "";
        http_response = "";
    }
    //retorna o conteudo html
    return {http_response, html_content};
}

//desc: equivalente a sleep
//params: (number) quantidade de milisegundos que ficara esperando
//return: nenhum
function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}