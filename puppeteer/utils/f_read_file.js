/*imports*/
const fs = require("fs");
module.exports = {
//desc: leitura de arquivo ao receber caminho
//params: (string)  caminho do arquivo com o nome
//return: nenhum
    read_file(path_file) {
        //abre a tentativa
        try{
            //leitura do arquivo no caminho indicado
            return fs.readFileSync(path_file,'utf8');
        }catch (error) {
            //log de erro
            console.log(`Não foi possivel ler o arquivo no caminho ${path_file}. O motivo é: ${error}`)
            //retorno vazio
            return "";
        }
    }
}
