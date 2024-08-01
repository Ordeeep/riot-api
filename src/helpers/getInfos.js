const axios = require('axios')
const fs = require('fs')

require('dotenv').config();

const queueIdJson = require('../assets/api-json/queueId.json')
const RIOT_API_KEY = process.env.RIOT_API_KEY; //Api key que a riot disponibiliza.

async function getUserPUUID(playerGameName, playerTagLine, regionValue, userData) {
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
       return await getUserSummoner(regionValue, userData)
    } catch (error) {
       throw new Error(error);
    }
 }

 async function getUserSummoner(regionValue, userData) {
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
       return userData
    } catch (error) {
       throw new Error('Erro ao consultar os dados do jogador.');
    }
 }

 async function getUserMatchs(userData) {
    try {
       //Essa variavel define quantas partidas serão buscadas.
       let matchsCount = 5
       //Consultando os id do json para indentificar o tipo da partida ex: Ranqueada, normal...
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
               // participantInfos = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${matchResponse.data.info.participants[key].summonerId}`, {
               //    headers: {
               //       "X-Riot-Token": RIOT_API_KEY
               //    }
               // });
               //    for(let rankType in participantInfos.data){
               //       if(participantInfos.data[rankType].queueType == "RANKED_SOLO_5x5"){
               //          matchResponse.data.info.participants[key].rank = participantInfos.data[rankType].rank
               //          matchResponse.data.info.participants[key].tier = participantInfos.data[rankType].tier
               //       }
               //    }
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
      return userData
      } catch (error) {
       throw new Error(error);
    }
 }
 async function getUserRank(regionValue, userData) {
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
      return userData
    } catch (error) {
       throw new Error('Erro ao consultar elo do jogador' + error)
    }
 }
 module.exports = {getUserMatchs, getUserPUUID, getUserRank, getUserSummoner}