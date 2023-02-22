require('dotenv').config()
const { spawn } = require("child_process")
const fetch = require('node-fetch')

const animesToDownload = []

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

const downloadFromPageUrl = async (url) => {
    // url = 'https://animesup.cx/episodios/kyokou-suiri-2-episodio-7/'

    const chunk = url.split('/')[4]   

    const format = 'fhd'
    const serverList = ['sv1.', 'fast.', 'sv2.', 'sv3.', 'sv4.', 'sv5.']
    const domainList = ['animesup.cx', 'animesup.org', 'animesup.biz']
    const legList = ['', 'leg']
    let episode = zeroPad(chunk.split('-').slice(-1)[0], 2)
    let seasonPossible = chunk.split('-episodio')[0].split('-').slice(-1)[0]
    let anime = chunk.split('-episodio')[0].split('-').slice(0, -1).join('-')
    const firstLetter = anime.charAt(0)
    
    if (anime == '') anime = chunk.split('-episodio')[0]
    if (seasonPossible.indexOf('x') > 0) seasonPossible = seasonPossible.split('x')[0]
    if (episode.indexOf('x') > 0) episode = zeroPad(episode.split('x')[1])
    
    const outputFileName = `${anime}-${episode}.mp4`

    const urls = serverList.flatMap(server => domainList.map(domain => { 
        return server + domain
    })).flatMap(serverDomain => legList.flatMap(leg => [seasonPossible, ''].flatMap(season => {
        return [
            `https://${serverDomain}/animes/${firstLetter}/${anime}/${format}${season ? `/${season}` : ''}${leg ? `/${leg}` : ''}/${episode}/index.m3u8`,
            `https://${serverDomain}/animes/${firstLetter}/${anime}/${format}${leg ? `/${leg}` : ''}${season ? `/${season}` : ''}/${episode}/index.m3u8`
        ]
    })))
    
    https://sv3.animesup.org/animes/t/tensei-shitara-slime-datta-ken/fhd/leg/1/10/index2.ts

    console.log(urls)
    
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    

    for (let i = 0; i < urls.length; i++) {
        const pUrl = urls[i];

        try {
            const ret = await fetch(pUrl, {  
                "method": "GET",
                "mode": "no-cors",
                "credentials": "omit"
            })
            if (ret.status == 200) {
                console.log(`[OK] [${ret.status}] ` + pUrl)
                return pUrl
            } else {
                console.log(`[NOT] [${ret.status}] ` + pUrl)
            }
        } catch (error) {}
        
    }
    
}

const download = (url) => new Promise(async (res) => {

    
    const command = `ffmpeg -i ${url} -c copy -bsf:a aac_adtstoasc ${outputFileName} -y`

    const ls = spawn('time', [command], { shell: true, cwd: process.env.DIR_TO_DOWNLOAD })

    ls.stdout.on("data", data => {
        console.log(`stdout: ${data}`)
    })

    ls.stderr.on("data", data => {
        const sizeFile = (""+data).split(" ").filter(s => s.indexOf("kB") > 0)
        if (sizeFile.length > 0) process.stdout.write(`Baixando arquivo... ${sizeFile[0]}\r`)
        console.log(data)
    })

    ls.on('error', (error) => {
        console.log(`error: ${error.message}`)
    })

    ls.on("close", code => {
        console.log(`child process exited with code ${code}`)        
        res('asdsad')        
    })

})


console.log(downloadFromPageUrl('https://animesup.cx/episodios/tensei-shitara-slime-datta-ken-1x10/'))




