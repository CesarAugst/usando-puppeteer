<?php
/*CONSTANTES DE VALOR*/
$TIME_TO_WAIT_IN_ARCHIVE = 25; //segundos que a requisicao espera a geracao de arquivo antes de encerrar com o campo null
$PATH_URL_WAITING = "../puppeteer/url_aguardando"; //caminho ate a pasta de url_aguardando
$PATH_URL_FINISHED = "../puppeteer/url_finalizado"; //caminho ate a pasta de url_finalizado
/*---*/

//marca inicio da execucao
$initial_time_execution = time();
//recebendo array de urls via body_params
$url_from_get = json_decode(file_get_contents('php://input'));
//se recebeu o array
if($url_from_get):
    //gera o arquivo txt com base no rray de urls recebidas
    $file_name = gera_arquivo_txt($url_from_get);
    //aguarda o recebimento do conteudo do html
    $array_content_html = busca_arquivo_html($file_name, $initial_time_execution);
    //status da requisicao
    $status = $array_content_html != "" //se retornou com o content preenchido
        ? 200 //status 200 ok
        : 500; //status 500 erro interno do servidor
    //reposta da requisicao
    $response = [
        "http_status"=>$status,
        "content_url_array"=>json_decode($array_content_html)
    ];

else:
    //status da requisicao
    $status = 422;
    //url recebida
    $url = $url_from_get;
    //reposta da requisicao
    $response = ["content_url_array"=>"", "http_status"=>$status];
endif;
//status da requisicao no cabecalho
header("HTTP/1.1 $status");
//exibe resposta
echo json_encode($response);

//desc:
//params:
//return:
function gera_arquivo_txt($url){
    //conteudo global
    global $PATH_URL_WAITING; //cmainho para url_aguardando
    //nome do arquivo em hash
    $file_name = md5(time());
    //novo arquivo usanod o hash e o array de urls no conteudo
    file_put_contents("$PATH_URL_WAITING/$file_name", json_encode($url)); //armazena resultado em html
    //retorna nome do arquivo
    return $file_name;
}

//desc:
//params:
//return:
function busca_arquivo_html($file_name, $initial_time_execution){
    //conteudo global
    global $TIME_TO_WAIT_IN_ARCHIVE; //tempo para aguardar a requisicao
    global $PATH_URL_FINISHED; //cmainho para url_finalizado
    //pega os arquivos do diretorio
    $array_dir_files = new DirectoryIterator($PATH_URL_FINISHED);
    //inicia como nulo a variavel do codigo fonte
    $source_code = null;
    //repete infinitamente
    while($source_code == null){
        //calcula o tmepo gasto
        $time_processing = time() - $initial_time_execution;
        //se o tempo ultrapassar 25seg
        if($time_processing > $TIME_TO_WAIT_IN_ARCHIVE):
            $source_code = "";
            //para execucao do while
            break;
        endif;
        foreach ($array_dir_files as $file_info):
            //se o arquivo for dessa reequisicao
            if($file_info->getFilename() == $file_name):
                sleep(1);
                //pega o conteudo do arquivo
                $source_code = file_get_contents("$PATH_URL_FINISHED/" . $file_info->getFilename());
                //verifica se o conteudo recebido e nulo
                if(!$source_code){
                    //espera mais 1 segundo e meio
                    sleep(2);
                    //tenta novamente
                    $source_code = file_get_contents("$PATH_URL_FINISHED/" . $file_info->getFilename());
                }

                //sai do foreach
                break;
            endif;
        endforeach;
    }
    //retorna o conteudo do arquivo
    return $source_code;
}
