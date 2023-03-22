<?php
//marca inicio da execucao
$initial_time_execution = time();
//recebimento da url
$url_from_get = isset($_GET["url"]) //verifica se recebeu
    ? $_GET["url"] //se recebeu usa ela
    : null; //se nao deixa nulo como default
//se recebeu a url
if($url_from_get):
    //url recebida
    $url = $url_from_get;
    //gera o arquivo txt com base na url recebida
    $file_name = gera_arquivo_txt($url);
    //aguarda o recebimento do conteudo do html
    $content_html = busca_arquivo_html($file_name, $initial_time_execution);
    //status da requisicao
    $status = $content_html != "" //se retornou com o content preenchido
        ? 200 //status 200 ok
        : 500; //status 500 erro interno do servidor
    //reposta da requisicao
    $response = ["url"=>$url, "status"=>$status, "nome do arquivo"=>$file_name, "content_html"=>$content_html];
else:
    //status da requisicao
    $status = 422;
    //url recebida
    $url = $url_from_get;
    //reposta da requisicao
    $response = ["url"=>$url, "status"=>$status];
endif;
//status da requisicao no cabecalho
header("HTTP/1.1 $status");
//exibe resposta
echo json_encode($response);

function gera_arquivo_txt($url){
    $file_name = md5($url);
    //novo arquivo usanod o hash e a url no conteudo
    file_put_contents("../url_aguardando/$file_name", $url); //armazena resultado em html
    //retorna nome do arquivo
    return $file_name;
}

function busca_arquivo_html($file_name, $initial_time_execution){
    //pega os arquivos do diretorio
    $array_dir_files = new DirectoryIterator("../url_finalizado");
    //inicia como nulo a variavel do codigo fonte
    $source_code = null;
    //repete infinitamente
    while($source_code == null){
        //calcula o tmepo gasto
        $time_processing = time() - $initial_time_execution;
        //se o tempo ultrapassar 25seg
        if($time_processing > 25):
            $source_code = "";
            //para execucao do while
            break;
        endif;
        foreach ($array_dir_files as $file_info):
            //se o arquivo for dessa reequisicao
            if($file_info->getFilename() == $file_name):
                //pega o conteudo do arquivo
                $source_code = file_get_contents("../url_finalizado/" . $file_info->getFilename());
                //sai do foreach
                break;
            endif;
        endforeach;
    }
    //retorna o conteudo do arquivo
    return $source_code;
}
