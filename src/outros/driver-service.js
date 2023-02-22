const fs = require('fs')
const path = require( "path" )

const { delay } = require('../utils/commons')
const { executeBrowser } = require('../utils/puppeteer')

const downloadPath = process.env.DIR_TO_DOWNLOAD

const download = async (url) => {
    return executeBrowser(async (page) => {
        console.log("Nevigate to Drive Download page")
        
        try {
            console.log("Trying to start download")
        
            await page.goto(parserToDownloadLink(url));
            await page.waitForFunction(
                () => {            
                    return !!document.querySelector('#uc-download-link')
                },
                { polling: 'raf', timeout: 1000 },
            )

            const fileName = await page.evaluate(`document.querySelector('a').innerText`)
            console.log("File Name: " + fileName)

            await page.evaluate(`document.querySelector('#uc-download-link').click()`)
        } catch (error) {
            console.error("!!!!! Error on download from Drive !!!!! ")
            await page.close()
            throw error
        }
        
        const getFileSize = (filename) => {
            var stats = fs.statSync(filename)
            return (stats.size / (1024 ** 2))
        }
        
        
        console.log("Checking for download status")
        setInterval(() => {
            
            const filesDownloading = fs.readdirSync(downloadPath).filter(s => s.endsWith('.crdownload'))            
            console.log(filesDownloading.map(f => {
                return {
                    name: f,
                    size: getFileSize(path.join(downloadPath, f))
                }
            }))
        }, 1000)

        await delay(2000)
        await page.waitForFunction(() => {
            console.log(fs.readdirSync(downloadPath).filter(s => s.endsWith('.crdownload')).length)
            console.log(fs.readdirSync(downloadPath).filter(s => s.endsWith('.crdownload')).length != 0)
            return false
            // return fs.readdirSync(downloadPath).filter(s => s.endsWith('.crdownload')).length != 0
        }, { polling: 1000, timeout: 0 },)

        // await page.goto('chrome://downloads/')
        // await page.bringToFront()

        
        // await delay(2000);

        // console.log("Waiting for download")
        // await page.waitForFunction(
        //     () => {            
        //         const dm = document.querySelector('downloads-manager').shadowRoot
        //         return !dm.querySelector('#frb0').shadowRoot.querySelector('#show').parentElement.hidden
        //     },
        //     { polling: 'raf', timeout: 0 },
        // )

        // const path = await page.evaluate(`
        //     dm = document.querySelector('downloads-manager').shadowRoot
        //     dm.querySelector('#frb0').shadowRoot.querySelector('#show').title
        // `)

        // console.log("Download finalizado")

        // await page.evaluate(`dm.querySelector('#frb0').shadowRoot.querySelector('#remove').click()`)        
        // await page.close()

        return path
    })    
}

const parserToDownloadLink = (viewLink) => {    
    if (viewLink.indexOf('export=download') >= 0) return viewLink

    const fileId = viewLink.replace('https://drive.google.com/file/d/', '').replace('/view', '').replace('?usp=sharing', '')
    const driveUrlExport = `https://drive.google.com/u/1/uc?id=${fileId}&export=download`

    return driveUrlExport   
}

module.exports = {
    download,
    parserToDownloadLink
}