const express = require('express');
const app = express();
const axios = require('axios')

const port = 3333;
const RIOT_API_KEY = "";

app.get('/user', async (req, res) => {
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
         const response = await axios.get('https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/pi/1109', {
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
         res.status(500).send('Erro ao consultar o PUUID do jogador.');
      }
   }

   async function getUserSummoner() {
      try {
         const response = await axios.get(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${userData.puuid}`, {
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
         res.status(500).send('Erro ao consultar os dados do jogador.')
      }
   }

   async function getUserMatchs() {
      try {
         //Essa variavel define quantas partidas serão buscadas.
         let matchsCount = 1
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
               // Adiciona os dados da partida a userData.history.matchsId
               userData.history.matchs.push(matchResponse.data)
            } catch (error) {
               console.error(`Erro ao obter dados da partida ${item}:`, error);
            }
         }

      } catch (error) {
         console.log(error)
         res.status(500).send('Erro ao consultar as partidas do jogador.')
      }
   }
   await getUserRank()

   async function getUserRank() {
      try {
         const response = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${userData.id}`, {
            headers: {
               "X-Riot-Token": RIOT_API_KEY
            }
         })

         userData.ranked = {
            solo_duo: {
               pdl: response.data[1].leaguePoints,
               tier: response.data[1].tier,
               rank: response.data[1].rank,
               wins: response.data[1].wins,
               losses: response.data[1].losses,
            },
            flex: {
               pdl: response.data[2].leaguePoints,
               tier: response.data[2].tier,
               rank: response.data[2].rank,
               wins: response.data[2].wins,
               losses: response.data[2].losses,
            }
         }

      } catch (error) {
         res.status(400).send('Erro ao consultar elo do jogador' + error)
      }
   }
   res.send(userData)
});



app.listen(port, (error) => {
   if (error) {
      console.log(error)
   } console.log(`Server is running: http://localhost:${port}`)
})