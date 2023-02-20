require('dotenv').config()
const { spawn } = require("child_process")
const fetch = require('node-fetch')

const animesToDownload = []

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

const downloadFromPageUrl = async (url) => {
    url = 'https://animesup.cx/episodios/kyokou-suiri-2-episodio-7/'

    const chunk = url.split('/')[4]   

    const format = 'fhd'
    const serverList = ['sv1.', 'sv2.', 'sv3.', 'sv4.', 'sv5.']
    const domainList = ['animesup.cx', 'animesup.org', 'animesup.biz']
    const episode = zeroPad(chunk.split('-').slice(-1)[0], 2)
    const season = chunk.split('-episodio')[0].split('-').slice(-1)
    const anime = chunk.split('-episodio')[0].split('-').slice(0, -1).join('-')
    const firstLetter = anime.charAt(0)
    const outputFileName = `${anime}-${episode}.mp4`

    const urls = serverList.flatMap(server => domainList.map(domain => { 
        return server + domain
    })).map(serverDomain => {
        return `https://${serverDomain}/animes/${firstLetter}/${anime}/${format}${season ? `/${season}` : ''}/${episode}/index.m3u8`
    })
    
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
                console.log(pUrl)
                return pUrl
            }
        } catch (error) {}
        
    }
    
}

const download = (url) => new Promise(async (res) => {

    
    const command = `ffmpeg -i ${url} -c copy -bsf:a aac_adtstoasc ${outputFileName} -y`

    const ls = spawn('time', [command], { shell: true, cwd: process.env.DIR_DOWNLOAD })

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


console.log(downloadFromPageUrl('https://animesup.cx/episodios/kyokou-suiri-2-episodio-7/'))




