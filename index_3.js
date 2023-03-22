const puppeteer = require('puppeteer');

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

(async () => {
    /* Browser */
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

    /* Manipulacao dos arquivos */
    //utiliza file system
    const fs = require('fs');
    //loop infinito
    while(true){
        //acessa diretorio
        fs.readdir("../url_aguardando", (err, files) => {
            //se houve erro ao abrir o arquivo
            if(err){
                //imprime o erro encontrado
                console.error(err);
                //encerra a execucao
                return;
            }
            //percorre os nomes dos arquivos
            files.forEach(async(file) => {
                //verifica se nao possui o sufixo de quando ja esta sendo processado por outra instancia
                if (!file.endsWith('.processing')) {
                    //renomeia para
                    rename_archive_to_processing_status(file);
                    //leitura do arquivo
                    const link = read_file_during_process(file);
                    //navega para a pagina inserida no arquivo
                    const source_code = await goto_link_in_this_file_content(page, link);
                    //cria arquivo com o html da pagina
                    write_file_with_html_page(file, source_code);
                    //deleta arquivo apos processar
                    delete_file_after_process(file, 'url_aguardando');
                }
                //verifica se ja possui uma tentativa de processamento apra tentar novamente
                if(file.endsWith('.processed')){
                    //renomeia para processado
                    rename_archive_to_processing_status(file);
                    //leitura do arquivo
                    const link = read_file_during_process(file);
                    //navega para a pagina inserida no arquivo
                    const source_code = await goto_link_in_this_file_content(page, link);
                    //cria arquivo com o html da pagina
                    write_file_with_html_page(file, source_code);
                    //deleta arquivo apos processar
                    delete_file_after_process(file, 'url_aguardando');
                }
                /*Implementar logica de descarte aqui se necessario*/
                //deleta arquivo nos resultados
                //delete_file_after_process(file, 'url_finalizado');
                //deleta arquivo nos que estap aguardando
                //delete_file_after_process(file, 'url_aguardando');
            });
        })
        //espera 1 segundo para verificar novamente o diretorio
        await delay(1000);
    }

})();

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

//desc: renomeia um arquivo adicionando status de processamento a ele
//parasm: (string) nome do arquivo
//return: nenhum
function rename_archive_to_processing_status(file, processed = false){
    //armazena status de processamento
    const status = processed //se ja foi processado
        ? "processed" // ja processado
        : "processing" //em processamento
    //utiliza file system
    const fs = require('fs');

    //renomeia para
    fs.rename(`../url_aguardando/${file}`, `../url_aguardando/${file}.${status}`, () => {})
}

//desc: remove arquivo
//params: (string)nome do arquivo, (boolean) se esta na pasta de finalizados
//return: nenhum
function delete_file_after_process(file, directory_name){
    //utiliza file system
    const fs = require('fs');
    //Informando o endereço do arquivo para remoção do mesmo
    fs.unlink(`../${directory_name}/${file}.processing`, ()=>{});
}

//desc: leitura do arquivo durante o processamento
//params: (string) nome do arquivo
//return: (string) conteudo do arquivo
function read_file_during_process(file){
    //utiliza file system
    const fs = require('fs');
    //retorna o conteudo do arquivo apos leitura
    return file_content = fs.readFileSync(`../url_aguardando/${file}`,'utf8');
}

//desc: realiza navegacao para o link inserido no arquivo
//params: (string) link para abrir
//return: nenhum
async function goto_link_in_this_file_content(page, link){
    try{
        //encaminha para pagina do link presente no arquivo
        await page.goto(link, {
            waitUntil: "networkidle2",
            timeout: 25000
        });
        //retorna o codigo fonte
        return await page.content();
    } catch (error) {
        console.log(error.message);
        return ""
    }

}

//desc: com o conteudo da pagina cria um arquivo com o codigo fonte
//params: (string) nome do arquivo, (string) codigo fonte
//return: nenhum
function write_file_with_html_page(file_name, source_code){
    //utiliza file system
    const fs = require('fs');
    //faz criacao do arquivo com o conteudo
    fs.writeFileSync(`../url_finalizado/${file_name}`, source_code, {encoding: 'utf-8'});
}
