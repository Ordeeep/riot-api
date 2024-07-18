#### Neste projeto você será capaz de consumir a API do league of legends e enviar para o seu projeto.

### Desenvolvido utilizando as seguintes tecnologias:
<div style="display: flex">
    <img aling="center" alt="js" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
    <img aling="center" alt="NodeJS" src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white">
</div>

## Como executar o projeto:

Comandos basicos para inicializar o projeto:

1) npm init (Inicializa o ambiente)
2) npm start (Roda o projeto)

Após ter utilizado o comando npm init, você deve criar um arquivo na pasta raiz do projeto com o seguinte nome .env, dentro dela vai ficar as variaveis de ambiente como a PORT, RIOT_API_KEY, LATEST_PATCH.

+ PORT - Defina qual será a porta que o projeto irá rodar.
+ RIOT_API_KEY - Pegue a key da api do league of legends e coloque nessa váriavel.
+ LATEST_PATCH - Defina qual será o patch do jogo ex: 14.13.1

Mesmo seguindos os passos acima você ainda não será capaz de executar o projeto 100%, devemos pegar as imagens de campeões, icones, runas, talentos e etc...

A proria Riot Games nos disponibiliza esses dados, vá até o seguinte site e baixe.
https://developer.riotgames.com/docs/lol#data-dragon

As pastas do projeto devem ficar assim:

    /src
        /assets
            /14.13.1
                /img
                    /champion
                    /elo
                    /item
                    error-img.png
                /api-json
                    /language
                        en_US.json
                        pt_BR.json
                    queueid.json
    index.js

Uma breve explicaçao sobre a hieraquia das páginas.
    
A pasta 14.13.1 deve ser o patch que o Data Dragon deu, como no meu exemplo estou utilizando a ultima versão do jogo que no dia 17/07/2024 foi a 14.13.1.  
Nela ficará todas as imagens de personagens, items, elos e etc.

A pasta api-json serve para colocar todos os json que vocé irá utilizar, alguns a propria riot não fornece então você terá que criar, por exemplo: Language tem o proposito de traduzir para o idioma preferivel. 
