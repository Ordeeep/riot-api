const express = require('express')
const routes = express.Router()
const { getUserMatchs, getUserPUUID, getUserRank } = require("./helpers/getInfos")
require('dotenv').config();
const LATEST_PATCH = process.env.LATEST_PATCH //Patch do jogo ex: 14.14.1

routes.get('/runeSecondaryIcon/:runeID', (req, res) => {
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
 
 .get('/runeIcon/:runeID', (req, res) => {
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
 
 .get('/itemIcon/:itemIconID', (req, res) => {
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
 .get('/championIcon/:championName', (req, res) => {
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
 .get(`/playerIcon/:playerIconID`, (req, res) => {
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
 .get(`/elo/:eloName`, (req, res) => {
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
 .get(`/talentIcon/:idTalent`, (req, res) => {
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
 
 .get('/user/:gameName/:tagLine/:regionValue', async (req, res) => {
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
       userData = await getUserPUUID(playerGameName, playerTagLine, regionValue, userData);
       userData = await getUserMatchs(userData);
       userData = await getUserRank(regionValue, userData);
       return res.send(userData);
    } catch (error) {
       console.log(error)
       return res.status(500).send("Erro ao consultar dados do usuário, pedimos que teste novamente mais tarde.");
    }
 })

 module.exports = routes;