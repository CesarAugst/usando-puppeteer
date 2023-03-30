/*imports*/
const fs = require("fs");
module.exports = {
//desc: remove arquivo ao receber caminho
//params: (string)  caminho do arquivo com o nome
//return: nenhum
    remove_file(path_file) {
        //abre a tentativa
        try{
            //remove o arquivo no caminho indicado
            fs.unlink(path_file, ()=>{});
        }catch (error) {
            //log de erro
            console.log(`Não foi possivel excluir o arquivo no caminho ${path_file}. O motivo é: ${error}`)
        }
    }
}
