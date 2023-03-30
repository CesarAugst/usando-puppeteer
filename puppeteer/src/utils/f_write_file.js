/*imports*/
const fs = require("fs");
module.exports = {
//desc: adiciona arquivo ao receber caminho
//params: (string)  caminho do arquivo com o nome, (string) conteudo do arquivo
//return: nenhum
    write_file(path_file, file_content) {
        //abre a tentativa
        try{
            //faz criacao do arquivo com o conteudo
            fs.writeFileSync(path_file, file_content, {encoding: 'utf-8'});
        }catch (error) {
            //log de erro
            console.log(`Não foi possivel inlcuir o arquivo no caminho ${path_file}. O motivo é: ${error}`)
        }
    }
}
