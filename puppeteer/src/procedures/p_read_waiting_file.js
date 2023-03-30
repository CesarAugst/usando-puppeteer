/*imports*/
const {bool_file_exists} = require("../utils/f_bool_file_exists");
const {read_file} = require("../utils/f_read_file");

module.exports = {
//desc: leitura de arquivo
//params: (string) nome do arquivo, (string) caminho de url_aguardando
//return:
    async read_waiting_file(file, PATH_URL_WAITING){
        //array de urls inicia vazia
        var array_url = [];
        //nome do arquivo
        var file_name = `${PATH_URL_WAITING}/${file}.processing`;

        //verifica se o arquivo nao existe
        if(!bool_file_exists(file_name)){
            //tenta sem a extensao
            file_name = `${PATH_URL_WAITING}/${file}`;
        }
        //verifica se o arquivo existe
        if(bool_file_exists(file_name)){
            //tenta sem a extensao
            const file_content = read_file(file_name);
            //converte arquivo em json
            array_url = JSON.parse(file_content)
        }
        //retorna o array de urls apos conversao
        return array_url;
    }
}