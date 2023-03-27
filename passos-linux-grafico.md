#Passos para configuração de instância

##Primeira instância: 

a base do procedimento foi retirada desse video:
https://www.youtube.com/watch?v=kJjMHymvNFg
a base dos scripts foi retirada desse repositório:
https://github.com/henrylle/bia/tree/main/scripts

passo 1: clonar o repositorio
	 git clone https://github.com/henrylle/bia.git projeto
	 cd project/scripts
	 
passo 2: executar setup_bia_dev_ubuntu_ui.sh
	- o conteudo desse script faz a instalação do docker, do node e do aws cli e configurações de permissao do usuario docker
	- dessa etapa apenas usamos o node e o docker
	primeiro dar permissao com chmod 777 setup_bia_dev_ubuntu_ui.sh
			
passo 3: executar setup_vscode+chrome.sh
	- o conteudo desse script instala o vscode (sudo snap install) e o chrome (wget e sudo dpkg)
	primeiro dar permissao com chmod 777 setup_vscode+chrome.sh
	
passo 4: executar setup_ui_ubuntu.sh
	- o conteudo desse script instala xfce4 e xfce-goodies, processo necessário para utilização de interface gráfica
		- comando utilizado: sudo apt install xfce4 xfce4-goodies -y
	- também instala o chrome remote desktop, usado para o acesso remoto
		- comando utilizado: wget https://dl.google.com/linux/direct/chrome-remote-desktop_current_amd64.deb && \
			sudo apt install ./chrome-remote-desktop_current_amd64.deb -y
	- primeiro dar permissao com chmod 777 setup_ui_ubuntu.sh
	- ao executar uma vez da erro, depois de usar 'sudo apt --fix-broken install' e executar novamente o script ok
	
passo 5: acesso do chrome remote desktop
	- url: remotedesktop.google.com/access/
	- navegar para "configurar por SSH"
	- avançar até chegar a tela com "Configurar outro computador" e copiar o comando para Debian Linux
	- colar esse comando no terminal e inserir uma senha de 6 digitos
	- (no exemplo seguido houve um erro dizendo que houve falha ao criar config directory - FILE_ERROR_ACCESS_DENIED)
		- a partir do erro apresentado, necessita dar permissao a pasta do apache "sudo chmod 777 /home/ubuntu/.config/" 
			e dar reboot na maquina "sudo reboot"
	- quando a maquina voltar executar novamente o comando copiado
	- no navegador navegador para "Acesso remoto" e a conexao nomeada pelo ip damaquina ja estará disponivel, para acessar inserir a senha
	
	
	
	----
##Segunda instância:
Seguindo instruções do link: https://dev.to/alexandrefreire/como-instalar-o-php-7-4-no-ubuntu-463f

- atualizar as informaçções dos pacotes do sistema
	- sudo apt update
- atualizar pacotes do sistema
	- sudo apt -y upgrade
- adicionar PPA para PHP 7.4
	- sudo apt install software-properties-common
	- sudo add-apt-repository ppa:ondrej/php
	- sudo apt update
- instalando o PHP 7.4
	- sudo apt install php7.4
- instalar extensoes do PHP 7.4
	- sudo apt install php7.4-common php7.4-mysql php7.4-xml php7.4-xmlrpc php7.4-curl php7.4-gd php7.4-imagick php7.4-cli php7.4-dev php7.4-imap php7.4-mbstring php7.4-opcache php7.4-soap php7.4-zip php7.4-intl -y	
- verificar instalação
	- php -v