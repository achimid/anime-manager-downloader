const fs = require('fs')
const { spawn } = require("child_process")

const ENCODED_STR = '[Encoded]_'
const ORIGINAL_STR = '[Original]_'


if (!fs.existsSync(ENCODED_STR)) fs.mkdirSync(ENCODED_STR)
if (!fs.existsSync(ORIGINAL_STR)) fs.mkdirSync(ORIGINAL_STR)

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
    const ls = spawn('time', [command], { shell: true })
    
    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        resolve({from, to})
    })
})

const isSizeElegible = (f) => (getFilesizeInBytes(f) / (1024 ** 2)) > 500

const encode = (file) => new Promise((resolve, rej) => {
    console.log(`Starting file encode: ${file}`)

    const fileName = shellescape([file])
    const fileNameEncoded = shellescape([`${ENCODED_STR}${file.replace('.mkv', '.mp4')}`])
    
    const command = `ffmpeg -i ${fileName} -c:v libx264 -crf 24 -c:a aac -b:a 128k \-movflags +faststart -vf subtitles="${fileName}",format=yuv420p ${fileNameEncoded} -y`
    const ls = spawn('time', [command], { shell: true })

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
})

const processFile = async (file) => {
    const info = await encode(file)
    
    console.log(info)
    
    await moveFile(shellescape([info.fileName]),        shellescape([`./${ORIGINAL_STR}/${info.fileName}`]))
    await moveFile(shellescape([info.fileNameEncoded]), shellescape([`./${ENCODED_STR}/${info.fileName.replace('.mkv', '.mp4')}`]))
}

const getFilesizeInBytes = (filename) => {
    var stats = fs.statSync(filename)
    return stats.size
}


let started = false

const getAllFilesToEncode = () => {
    const files = fs.readdirSync('./')

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
    console.log(allFilesToEncode)

    while (allFilesToEncode.length > 0) {

        const file = allFilesToEncode.pop()
        
        console.log(file)
        await processFile(file) 

        await sleep(30000) // 30 segundos
    }

    console.log('Finalizando execução...')

    started = false
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

(async () => {
    
    startExecution()
    setInterval(() => { startExecution() }, 120000)     // 2 minuto
    
})()