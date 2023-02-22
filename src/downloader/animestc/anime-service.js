require('dotenv').config()

const fs = require('fs')
const stringSimilarity = require("string-similarity");

let animesDownloaded = []

const ANIMES_TO_NOT_CONVERT = [
    'Ayakashi Triangle',
    'Benriya Saitou-san, Isekai ni Iku',
    'Bofuri S2',
    'Buddy Daddies',
    'Eiyuuou, Bu wo Kiwameru Tame Tenseisu',
    'Fumetsu no Anata e S2',
    'Hyouken no Majutsushi ga Sekai wo Suberu',
    'Inu ni Nattara Suki na Hito ni Hirowareta',
    'Isekai Nonbiri Nouka',
    'Isekai Ojisan',
    'Kage no Jitsuryokusha ni Naritakute',
    'Kaiko sareta Ankoku Heishi (30-dai) no Slow na Second Life',
    'Kami-tachi ni Hirowareta Otoko S2',
    'Koori Zokusei Danshi to Cool na Douryou Joshi',
    'Kubo-san wa Mob wo Yurusanai',
    'Kyokou Suiri',
    'Maou Gakuin no Futekigousha S2',
    'Mononogatari',
    'Ningen Fushin',
    'Nokemono-tachi no Yoru',
    'Oniichan wa Oshimai!',
    'Otonari no Tenshi-sama ni Itsunomanika Dame Ningen ni Sareteita Ken',
    'Rougo ni Sonaete Isekai de 8-manmai no Kinka wo Tamemasu',
    'Saikyou Onmyouji no Isekai Tenseiki',
    'Shinka no Mi S2',
    'Spy Kyoushitsu',
    'Sugar Apple Fairy Tale',
    'Tomo-chan wa Onnanoko!',
    'Tondemo Skill de Isekai Hourou Meshi',
    'Tsundere Akuyaku Reijou Liselotte to Jikkyou no Endou-kun to Kaisetsu no Kobayashi-san',    
]

const shouldConvertAnime = (name) => {
    const bestMatch = stringSimilarity.findBestMatch(normalize(name), ANIMES_TO_NOT_CONVERT.map(normalize))
    
    return bestMatch.bestMatch.rating < 0.70   
}

const saveAnimeDownloaded = (anime, path) => {
    animesDownloaded.push({anime, path})
    saveDB()
}

const animeAlreadyDownloaded = (anime) => {
    const findedOnList = animesDownloaded.filter(a => a.anime == anime).length > 0

    if (findedOnList) return true

    const filesFromDownloadFolder = fs.readdirSync(process.env.DIR_TO_DOWNLOAD)
    const filesFromHDFolder = fs.readdirSync('/media/lourran/BiggHD\ 3\ Lourran3')

    const allFiles = [].concat(filesFromHDFolder).concat(filesFromDownloadFolder).map(normalize)
    const nomalizedAnime = normalize(anime)
    const bestMatch = stringSimilarity.findBestMatch(nomalizedAnime, allFiles)

    if (bestMatch.bestMatch.rating > 0.98) return true
    
    if (bestMatch.bestMatch.rating > 0.60) {
        return  nomalizedAnime.replace(/\D/g,'') === bestMatch.bestMatch.target.replace(/\D/g,'')
    }

    return false
}
const normalize = (str) => {
    return str.split('-').join(' ').split('_').join(' ')
        .replace('1080p', ' ').replace('720p', ' ').replace('480p', ' ')
        .replace('.mp4', ' ').replace('.mkv', ' ')
        .replace('Episódio', ' ').replace('Episodio', ' ').replace('Epi', ' ')
        .replace(' S1 ', ' ').replace(' S2 ', ' ').replace(' S3 ', ' ').replace(' S4 ', ' ').replace(' S5 ', ' ')
        .replace(' I ', ' ').replace(' II ', ' ').replace(' III ', ' ').replace(' IV ', ' ')
        .replace('[AnimesTC]', ' ')
        .replace('1º Temporada', ' ').replace('2º Temporada', ' ').replace('3º Temporada', ' ').replace('4º Temporada', ' ')
        .replace('1ª Temporada', ' ').replace('2ª Temporada', ' ').replace('3ª Temporada', ' ').replace('4ª Temporada', ' ')
        .replace('1° Temporada', ' ').replace('2° Temporada', ' ').replace('3° Temporada', ' ').replace('4° Temporada', ' ')        
        .replace(/\s/g,'')
        .replace(/[^\w\s]/gi, '')
}

const saveDB = () => {    
    fs.writeFileSync('animes-db.json', JSON.stringify(animesDownloaded, null, 4))
}

const readDB = () => {    
    try {
        animesDownloaded = JSON.parse(fs.readFileSync('animes-db.json' ,{encoding:'utf8', flag:'r'}))        
    } catch (error) {}
}

readDB()

module.exports = {
    animeAlreadyDownloaded,
    saveAnimeDownloaded,
    shouldConvertAnime
}