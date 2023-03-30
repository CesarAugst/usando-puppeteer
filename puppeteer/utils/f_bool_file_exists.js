/*imports*/
const fs = require("fs");
module.exports = {
//desc: adiciona arquivo ao receber caminho
//params: (string)  caminho do arquivo com o nome, (bool|opcional) varredura detalhada
//return: nenhum
    bool_file_exists(path_file, {include_search_extension=false}={}) {
        //verifica se a busca deve ser detalhada
        if(include_search_extension){
            //verifica se o arquivo existe no caminho recebido com ou sem extensao
            return fs.existsSync(path_file) || fs.existsSync(`${path_file}.processing`)
        }else{
            return fs.existsSync(path_file);
        }
    }
}
