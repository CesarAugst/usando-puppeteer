/*imports*/
const { bool_file_exists } = require("../utils/f_bool_file_exists");
const { write_file } = require("../utils/f_write_file");
const { remove_file } = require("../utils/f_remove_file");

module.exports = {
//desc: finaliza o lote de requisicoes
//params: (string) nome do arquivo, (array) fila de urls, (string) caminho de url_aguardando, (string) caminho de url_finalizado
//return:
    finishing_array_requisitions(file_name, queue, PATH_URL_WAITING, PATH_URL_FINISHED){
        //tenta fazer gestao com arquivos
        try{
            //verifica se o arquivo ainda existe na area de aguarde (com ou sem extensao)
            if(bool_file_exists(`${PATH_URL_WAITING}/${file_name}`, {include_search_extension: true})){
                //faz criacao do arquivo com o conteudo
                write_file(`${PATH_URL_FINISHED}/${file_name}`, JSON.stringify(queue));
            }
            //remove o arquivo de processamento atual
            remove_file(`${PATH_URL_WAITING}/${file_name}.processing`);
        }catch(error){
            //se nao puder exibe erro
            console.log(`Não foi possível criar a resposta do arquivo ${file_name}. Motivo: ${error}`);
        }
    }
}