require('dotenv').config()
const fs = require('fs')
const { spawn } = require("child_process")

const ENCODED_STR = '[Encoded]_'
const ORIGINAL_STR = '[Original]_'
const SUBTITLE_STR = '[Subtitle]_'

const DIR_TO_ENCODE = process.env.DIR_TO_ENCODE

const DIR_ENCODED =  DIR_TO_ENCODE + '/' + ENCODED_STR
const DIR_ORIGINAL = DIR_TO_ENCODE + '/' + ORIGINAL_STR
const DIR_SUBTITLE = DIR_TO_ENCODE + '/' + SUBTITLE_STR


if (!fs.existsSync(DIR_ENCODED)) fs.mkdirSync(DIR_ENCODED)
if (!fs.existsSync(DIR_ORIGINAL)) fs.mkdirSync(DIR_ORIGINAL)
if (!fs.existsSync(DIR_SUBTITLE)) fs.startedmkdirSync(DIR_SUBTITLE)

function shellescape(a) {
    var ret = [];
  
    a.forEach(function(s) {
      if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
        s = "'"+s.replace(/'/g,"'\\''")+"'";
        s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
          .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
      }
      ret.push(s);
    });
  
    return ret.join(' ');
} 

const moveFile = (from, to) => new Promise((resolve, rej) => {
    const command = `mv ${from} ${to}`
    const ls = spawn('time', [command], { shell: true, cwd: process.env.DIR_TO_ENCODE })
    
    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        resolve({from, to})
    })
})

const extractSubtitle = (file) => new Promise((resolve, rej) => {
    console.log(`Starting file subtitle extraction: ${file}`)

    const fileName = shellescape([file])
    const fileNameEncoded = shellescape([`${SUBTITLE_STR}${file.replace('.mkv', '.ass')}`])

    const command = `ffmpeg -i ${fileName} -map 0:s:0 ${fileNameEncoded} -y`
    console.log(command)
    const ls = spawn('time', [command], { shell: true, cwd: process.env.DIR_TO_ENCODE })
    
    spawnLog(ls, resolve, fileName, fileNameEncoded)
})

const encode = (file) => new Promise((resolve, rej) => {
    console.log(`Starting file encode: ${file}`)

    const fileName = shellescape([file])
    const fileNameEncoded = shellescape([`${ENCODED_STR}${file.replace('.mkv', '.mp4')}`])
    
    // const command = `cpulimit -f -l 650 -- ffmpeg -i ${fileName} -c:v libx264 -crf 24 -c:a aac -b:a 128k \-movflags +faststart -vf subtitles="${fileName}",format=yuv420p ${fileNameEncoded} -y`
    const command = `cpulimit -f -l 300 -- ffmpeg -i ${fileName} -c:v libx264 -crf 24 -c:a aac -b:a 128k \-movflags +faststart -vf subtitles="${fileName}",format=yuv420p ${fileNameEncoded} -y`
    // const command = `ffmpeg -i ${fileName} -c:v libx264 -crf 24 -c:a aac -b:a 128k \-movflags +faststart -vf subtitles="${fileName}",format=yuv420p ${fileNameEncoded} -y`
    const ls = spawn('time', [command], { shell: true, cwd: process.env.DIR_TO_ENCODE })

    spawnLog(ls, resolve, fileName, fileNameEncoded)
})

const spawnLog = (ls, resolve, fileName, fileNameEncoded) => {
    ls.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on("data", data => {
        process.stdout.write(data);
    });

    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        resolve({
            fileName: fileName.replace("'", '').replace("'", ''), 
            fileNameEncoded: fileNameEncoded.replace("'", '').replace("'", '')
        })
    })
}

const processFile = async (file) => {
    const infoSub = await extractSubtitle(file)        
    console.log(infoSub)

    await moveFile(shellescape([infoSub.fileNameEncoded]), shellescape([`${DIR_SUBTITLE}/${infoSub.fileNameEncoded}`]))

    const info = await encode(file)    
    console.log(info)
    
    await moveFile(shellescape([info.fileName]),        shellescape([`${DIR_ORIGINAL}/${info.fileName}`]))
    await moveFile(shellescape([info.fileNameEncoded]), shellescape([`${DIR_ENCODED}/${info.fileName.replace('.mkv', '.mp4')}`]))
}

let started = false

const getAllFilesToEncode = () => {
    const files = fs.readdirSync(DIR_TO_ENCODE)

    const allFilesEligible = files.filter(f => f.endsWith('.mkv')).filter(f => !f.startsWith(ENCODED_STR))
    const allFilesEncoded = files.filter(f => f.startsWith(ENCODED_STR)).map(f => f.replace(ENCODED_STR, ''))

    return allFilesEligible.filter(f => !allFilesEncoded.includes(f))
}


const startExecution = async () => {
    if (started) {
        console.log('Execução ignorada, processo ainda em execução...')
        return
    }

    started = true

    const allFilesToEncode = getAllFilesToEncode()
    if (allFilesToEncode.length == 0) {
        // console.log('Nenhum arquivo encontrado para conversão')
    } else {
        console.log(allFilesToEncode)
    }

    while (allFilesToEncode.length > 0) {

        const file = allFilesToEncode.pop()
        
        console.log(file)
        await processFile(file) 

        await sleep(30000) // 30 segundos
    }

    started = false
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

const main = async () => {
    startExecution()
}

const start = () => {
    main()
    setInterval(main, 60000)
}

module.exports = {
    start
}
