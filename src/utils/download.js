const fs = require('fs')
const path = require('path')

const { delay, awaitUntil } = require('./commons')
const { executeBrowser } = require('./puppeteer')

const downloadFolder = process.env.DIR_DOWNLOAD

const getFileSize = (filename) => {
    var stats = fs.statSync(filename)
    return (stats.size / (1024 ** 2)).toFixed(0) + ' MB'
}

const download = (url, cb) => {
    return executeBrowser(async (page) => {
        let downloadedFile = undefined
        let downloadedFileName = undefined

        console.log("\nNevigate to Download page")
    
        try {
            console.log("Trying to start download")
            await page.goto(url)

            await cb(page)
            
        } catch (error) {
            console.error("\n!!!!! Error on download !!!!! \n")
            await page.close()
            throw error
        }
        
        console.log("Checking for download status")
               
        await delay(2000)
        await awaitUntil(3000, () => {
            
            const filesDownloading = fs.readdirSync(downloadFolder).filter(s => s.endsWith('.crdownload'))            
            
            if (filesDownloading.length == 0) {
                return true
            } else if (downloadedFile == undefined) {
                downloadedFileName = filesDownloading[0].replace('.crdownload', '')
                downloadedFile = path.join(downloadFolder, downloadedFileName)
            } else {
                process.stdout.write(`Baixando arquivo: [${getFileSize(path.join(downloadFolder, filesDownloading[0]))}] ` + downloadedFileName + '\r')                
            }

            return false
        })

        console.log("Arquivo baixado com sucesso: ", downloadedFileName)
        
        await page.close()

        return downloadedFile
    })
}

module.exports = download