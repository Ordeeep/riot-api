const express = require('express');
const axios = require('axios')
const cors = require('cors');
const app = express();
const language = require('./assets/api-json/language/pt_BR.json')


const fs = require('fs')

app.use(cors());

require('dotenv').config();
const LATEST_PATCH = process.env.LATEST_PATCH
const PORT = process.env.PORT;
const RIOT_API_KEY = process.env.RIOT_API_KEY;

//Rota para conseguir icone de champion
app.get('/championIcon/:championName', (req, res) => {
   const championName = req.params.championName
   console.log(championName)
   res.sendFile(__dirname + `/assets/${LATEST_PATCH}/img/champion/${championName}.png`);
})

//Rota para conseguir icone de jogador
app.get(`/playerIcon/:playerIconID`, (req, res) => {
   const playerIconID = req.params.playerIconID
   const errorToSearchImage = `${__dirname}/assets/img/error-img.png`

   if (!playerIconID) {
      return res.sendFile(errorToSearchImage)
   }

   const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/profileicon/${playerIconID}.png`
   if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath)
   } else {
      return res.sendFile(errorToSearchImage)
   }
})

//Rota para conseguir icone do elo
app.get(`/elo/:eloName`, (req, res) => {
   const eloName = req.params.eloName
   const errorToSearchImage = `${__dirname}/assets/img/error-img.png`
   if (!eloName) {
      return res.sendFile(errorToSearchImage)
   }
   for (let searchElo in language[0].ranked.tier) {
      if (language[0].ranked.tier[searchElo].translate === eloName) {
         const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/elo/${searchElo}.png`
         console.log(searchElo + ' ' + imagePath)
         return res.sendFile(imagePath)
      }
   }
  
})

app.get('/user/:gameName/:tagLine/:regionValue', async (req, res) => {
   const playerGameName = req.params.gameName
   const playerTagLine = req.params.tagLine
   const regionValue = req.params.regionValue
   let userData = {
      id: '',
      puuid: '',
      gameName: '',
      tagLine: '',
      profileIconId: 0,
      revisionDate: 0,
      summonerLevel: 0,
      history: {
         matchs: []
      },
      ranked: {
         solo_duo: {
            pdl: 0,
            tier: '',
            rank: '',
            wins: 0,
            losses: 0,
         },
         flex: {
            pdl: 0,
            tier: '',
            rank: '',
            wins: 0,
            losses: 0,
         }
      }
   };
   await getUserPUUID()

   async function getUserPUUID() {
      try {
         const response = await axios.get(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${playerGameName}/${playerTagLine}`, {
            headers: {
               "X-Riot-Token": RIOT_API_KEY
            }
         });
         //Buscando os dados pela tag do usuário e conseguimos o seguinte retorno
         userData = {
            ...userData,
            puuid: response.data.puuid,
            gameName: response.data.gameName,
            tagLine: response.data.tagLine,

         }
         await getUserSummoner()
      } catch (error) {
         console.log(error)
         return res.status(500).send('Erro ao consultar o PUUID do jogador.');
      }
   }

   async function getUserSummoner() {
      try {
         const response = await axios.get(`https://${regionValue}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${userData.puuid}`, {
            headers: {
               "X-Riot-Token": RIOT_API_KEY
            }
         })
         userData = {
            ...userData,
            id: response.data.id,
            profileIconId: response.data.profileIconId,
            revisionDate: response.data.revisionDate,
            summonerLevel: response.data.summonerLevel,
         }

         await getUserMatchs()
      } catch (error) {
         console.log(error)
         return res.status(500).send('Erro ao consultar os dados do jogador.')
      }
   }

   async function getUserMatchs() {
      try {
         //Essa variavel define quantas partidas serão buscadas.
         let matchsCount = 3
         //Consultando os id do json para indentificar o tipo da partida ex: Ranqueada, normal...
         const queueIdJson = require('./assets/api-json/queueId.json')
         const response = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${userData.puuid}/ids?count=${matchsCount}`, {
            headers: {
               "X-Riot-Token": RIOT_API_KEY
            }
         })
         //Procurando as 20 partidas que estão no response e adicionando no objeto userData
         for (const item of response.data) {
            try {
               //Buscando dados de cada partida que está contida em matchs[]
               const matchResponse = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/${item}`, {
                  headers: {
                     "X-Riot-Token": RIOT_API_KEY
                  }
               });


               for (let key in matchResponse.data.info.participants) {
                  
                  if (userData.puuid === matchResponse.data.info.participants[key].puuid) {
                     matchResponse.data.info.win = matchResponse.data.info.participants[key].win
                  }
               }
               // Adiciona os dados da partida a userData.history.matchsId
               userData.history.matchs.push(matchResponse.data)

            } catch (error) {
               console.error(`Erro ao obter dados da partida ${item}:`, error);
            }
         }

         userData.history.matchs.forEach(item => {
            for (let key in queueIdJson) {
               if (item.info.queueId == queueIdJson[key].queueId) {
                  item.info.queueId = queueIdJson[key].description
               }
            }
         })
      } catch (error) {
         return res.status(500).send('Erro ao consultar as partidas do jogador.')
      }
   }
   await getUserRank()

   async function getUserRank() {
      try {
         const response = await axios.get(`https://${regionValue}.api.riotgames.com/lol/league/v4/entries/by-summoner/${userData.id}`, {
            headers: {
               "X-Riot-Token": RIOT_API_KEY
            }
         })
         //console.log(response.data)
         response.data.forEach(item => {
            if (item.queueType == 'RANKED_SOLO_5x5') {
               userData.ranked.solo_duo = {
                  pdl: item.leaguePoints,
                  tier: item.tier,
                  rank: item.rank,
                  wins: item.wins,
                  losses: item.losses,
               }
            }
            else if (item.queueType == 'RANKED_FLEX_SR') {
               userData.ranked.flex = {
                  pdl: item.leaguePoints,
                  tier: item.tier,
                  rank: item.rank,
                  wins: item.wins,
                  losses: item.losses,
               }
            }
         });

         if(userData.ranked.flex.tier == 0){
            userData.ranked.flex.tier = 'Unranked'
         }
         if(userData.ranked.solo_duo.tier == 0){
            userData.ranked.solo_duo.tier = 'Unranked'
         }
         translateData()
      } catch (error) {
         return res.status(400).send('Erro ao consultar elo do jogador' + error)
      }
   }

   function translateData() {
      for (let searchElo in language[0].ranked.tier) {
         if (language[0].ranked.tier[searchElo].tier_elo_name === userData.ranked.solo_duo.tier) {
            userData.ranked.solo_duo.tier = language[0].ranked.tier[searchElo].translate
         }
         if (language[0].ranked.tier[searchElo].tier_elo_name === userData.ranked.flex.tier) {
            userData.ranked.flex.tier = language[0].ranked.tier[searchElo].translate
         }
      }
   }
   return res.send(userData)
});

app.listen(PORT, (error) => {
   if (error) {
      console.log(error)
   } console.log(`Server is running: http://localhost:${PORT}`)
})