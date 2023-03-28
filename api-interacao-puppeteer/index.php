<?php
//marca inicio da execucao
$initial_time_execution = time();
//recebendo array de urls via body_params
$url_from_get = json_decode(file_get_contents('php://input'));
//reescrita pois em producao nao pegou na com a linha anterior (ambiente dev 7.4 e em prod 8.2)
$url_from_get = $_REQUEST[0];
die(var_dump($url_from_get));
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
    $response = ["url"=>$url, "status"=>$status];
endif;
//status da requisicao no cabecalho
header("HTTP/1.1 $status");
//exibe resposta
echo json_encode($response);

function gera_arquivo_txt($url){
//    $file_name = md5($url);
    $file_name = md5(time());
    //novo arquivo usanod o hash e o array de urls no conteudo
    file_put_contents("../url_aguardando/$file_name", json_encode($url)); //armazena resultado em html
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
                sleep(1);
                //pega o conteudo do arquivo
                $source_code = file_get_contents("../url_finalizado/" . $file_info->getFilename());
                //verifica se o conteudo recebido e nulo
                if(!$source_code){
                    //espera mais 1 segundo e meio
                    sleep(2);
                    //tenta novamente
                    $source_code = file_get_contents("../url_finalizado/" . $file_info->getFilename());
                }

                //sai do foreach
                break;
            endif;
        endforeach;
    }
    //retorna o conteudo do arquivo
    return $source_code;
}
