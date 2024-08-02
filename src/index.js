const express = require('express');
const axios = require('axios')
const cors = require('cors');
const app = express();

const fs = require('fs')

app.use(cors());  
require('dotenv').config();

//Declando váriveis de ambiente.
const LATEST_PATCH = process.env.LATEST_PATCH //Patch do jogo ex: 14.14.1
const PORT = process.env.PORT; //Porta que irá rodar a aplicação
const RIOT_API_KEY = process.env.RIOT_API_KEY; //Api key que a riot disponibiliza.

app.get('/runeSecondaryIcon/:runeID', (req, res) => {
   const rune = req.params.runeID
   const errorToSearchImage = `${__dirname}/assets/${LATEST_PATCH}/img/error-img.png`

   if (!rune) {
      return res.sendFile(errorToSearchImage)
   }
   const RUNE_JSON = require(`${__dirname}/assets/api-json/searchRuneImg.json`)
   for (let firstStyle in RUNE_JSON) {
      if (RUNE_JSON[firstStyle].id == rune) {
         const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/perk-images/styles/${RUNE_JSON[firstStyle].key}.png`
         return res.sendFile(imagePath)
      }
   }
   return res.sendFile(errorToSearchImage)

})

app.get('/runeIcon/:runeID', (req, res) => {
   const rune = req.params.runeID
   const errorToSearchImage = `${__dirname}/assets/${LATEST_PATCH}/img/error-img.png`

   if (!rune) {
      return res.sendFile(errorToSearchImage)
   }
   const RUNE_JSON = require(`${__dirname}/assets/api-json/searchRuneImg.json`)
   for (let firstStyle in RUNE_JSON) {
      for (let runeID in RUNE_JSON[firstStyle].runes) {
         if (RUNE_JSON[firstStyle].runes[runeID].id == rune) {
            const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/perk-images/styles/${RUNE_JSON[firstStyle].key}/${RUNE_JSON[firstStyle].runes[runeID].key}/${RUNE_JSON[firstStyle].runes[runeID].key}.png`
            return res.sendFile(imagePath)
         }
      }
   }
})

app.get('/itemIcon/:itemIconID', (req, res) => {
   const itemIconID = req.params.itemIconID
   const errorToSearchImage = `${__dirname}/assets/${LATEST_PATCH}/img/error-img.png`
   if (!itemIconID) {
      return res.sendFile(errorToSearchImage)
   }
   const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/item/${itemIconID}.png`
   if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath)
   } else {
      return res.sendFile(errorToSearchImage)
   }
})

//Rota para conseguir icone de champion
app.get('/championIcon/:championName', (req, res) => {
   const championName = req.params.championName
   const errorToSearchImage = `${__dirname}/assets/${LATEST_PATCH}/img/error-img.png`
   if (!championName) {
      return res.sendFile(errorToSearchImage)
   }
   const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/champion/${championName}.png`
   if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath)
   } else {
      return res.sendFile(errorToSearchImage)
   }
})

//Rota para conseguir icone de jogador
app.get(`/playerIcon/:playerIconID`, (req, res) => {
   const playerIconID = req.params.playerIconID
   const errorToSearchImage = `${__dirname}/assets/${LATEST_PATCH}/img/error-img.png`

   if (!playerIconID) {
      return res.sendFile(errorToSearchImage)
   }

   const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/profileicon/${playerIconID}.png`
   if (fs.existsSync(imagePath)) {
      return res.sendFile(imagePath)
   } else {
      return res.sendFile(errorToSearchImage)
   }
})

//Rota para conseguir icone do elo
app.get(`/elo/:eloName`, (req, res) => {
   const errorToSearchImage = `${__dirname}/assets/${LATEST_PATCH}/img/error-img.png`
   const eloName = req.params.eloName

   if (!eloName) {
      return res.sendFile(errorToSearchImage)
   }
   const searchEloImgJSON = require('./assets/api-json/searchEloImg.json')
   for (let key in searchEloImgJSON) {
      if (searchEloImgJSON[key].name == eloName) {
         const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/elo/${key}.png`
         return res.sendFile(imagePath)
      }
   }

   return res.sendFile(errorToSearchImage)
})
//Rota para conseguir icone dos talentos
app.get(`/talentIcon/:idTalent`, (req, res) => {
   const idTalent = req.params.idTalent
   const errorToSearchImage = `${__dirname}/assets/${LATEST_PATCH}/img/error-img.png`
   if (!idTalent) {
      return res.sendFile(errorToSearchImage)
   }
   const searchTalentImg = require('./assets/api-json/searchTalentImg.json')
   for (let key in searchTalentImg) {
      if (searchTalentImg[key].key == idTalent) {
         const imagePath = `${__dirname}/assets/${LATEST_PATCH}/img/summoner-talents/${searchTalentImg[key].name}.webp`
         return res.sendFile(imagePath)
      }
   }
   return res.sendFile(errorToSearchImage)
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
   try {
      await getUserPUUID();
      await getUserSummoner();
      await getUserMatchs();
      await getUserRank();
      return res.send(userData);
   } catch (error) {
      console.log(error)
      return res.status(500).send("Erro ao consultar dados do usuário, pedimos que teste novamente mais tarde.");
   }

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
      } catch (error) {
         throw new Error('Erro ao consultar o PUUID do jogador.');
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

      } catch (error) {
         throw new Error('Erro ao consultar os dados do jogador.');
      }
   }

   async function getUserMatchs() {
      try {
         //Essa variavel define quantas partidas serão buscadas.
         let matchsCount = 1
         //Consultando os id do json para indentificar o tipo da partida ex: Ranqueada, normal...
         const queueIdJson = require('./assets/api-json/queueId.json')
         const response = await axios.get(`https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/${userData.puuid}/ids?count=${matchsCount}&queue=420`, {
            headers: {
               "X-Riot-Token": RIOT_API_KEY
            }
         })
         console.log("Começou a buscar as partidas")
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
               throw new Error(`Erro ao obter dados da partida ${item}:`, error);
            }
         }
         console.log("Terminou de buscar")

         userData.history.matchs.forEach(item => {
            for (let key in queueIdJson) {
               if (item.info.queueId == queueIdJson[key].queueId) {
                  item.info.queueId = queueIdJson[key].description
               }
            }
         })
      } catch (error) {
         throw new Error('Erro ao consultar as partidas do jogador.');
      }
   }
   async function getUserRank() {
      try {
         const response = await axios.get(`https://${regionValue}.api.riotgames.com/lol/league/v4/entries/by-summoner/${userData.id}`, {
            headers: {
               "X-Riot-Token": RIOT_API_KEY
            }
         })
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

         if (userData.ranked.flex.tier == 0) {
            userData.ranked.flex.tier = 'Unranked'
         }
         if (userData.ranked.solo_duo.tier == 0) {
            userData.ranked.solo_duo.tier = 'Unranked'
         }
      } catch (error) {
         throw new Error('Erro ao consultar elo do jogador' + error)
      }
   }
});

app.listen(PORT, (error) => {
   if (error) {
      console.log(error)
   } console.log(`Server is running: http://localhost:${PORT}`)
})