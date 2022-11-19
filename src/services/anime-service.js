const fs = require('fs')
const stringSimilarity = require("string-similarity");

let animesDownloaded = []

const ANIMES_TO_DOWNLOAD = [
    // 'Koukyuu no Karasu',
    'SPY×FAMILY ',
    'Yuusha Party wo Tsuihou Sareta Beast Tamer, Saikyoushu no Nekomimi Shoujo to Deau ',
    'Uzaki-chan wa Asobitai! ω 2° temporada',
    'Akuyaku Reijou nano de Last Boss wo Kattemimashita',
    // 'Arknights: Reimei Zensou',
    // 'Hoshi no Samidare',
    'Seiken Densetsu: Legend of Mana - The Teardrop Crystal',
    'Akiba Maid Sensou',
    'Mushikaburi-hime',
    'Futoku no Guild',
    'Renai Flops',
    'Kage no Jitsuryokusha ni Naritakute!',
    'Tensei Shitara Ken Deshita',
    'Mob Psycho 100 III 3° Temporada',
    'Shinmai Renkinjutsushi no Tenpo Keiei',
    'Shinobi no Ittoki',
    'Shinmai Renkinjutsushi no Tenpo Keiei',
    'Chainsaw Man',
    'Peter Grill to Kenja no Jikan: Super Extra 2° temporada',
    'Fuufu Ijou, Koibito Miman',
    'Fumetsu no Anata e 2° Temporada',
    'Noumin Kanren no Skill Bakka Agetetara Naze ka Tsuyoku Natta.',
    // 'One Piece',
    // 'Utawarerumono: Futari no Hakuoro',
    'Uchi no Shishou wa Shippo ga Nai'
]

const saveAnimeDownloaded = (anime, path) => {
    animesDownloaded.push({anime, path})
    saveDB()
}

const animeAlreadyDownloaded = (anime) => {
    const findedOnList = animesDownloaded.filter(a => a.anime == anime).length > 0

    if (findedOnList) return true

    const filesFromDownloadFolder = fs.readdirSync('/home/lourran/Downloads')
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
    ANIMES_TO_DOWNLOAD
}