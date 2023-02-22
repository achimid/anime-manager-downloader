const { delay } = require('../../utils/commons')
const { executeBrowser } = require('../../utils/puppeteer')

const { notify } = require('../../utils/notify')

const download = require('./download-service')
const animeService = require('./anime-service')


const execute = async () => {

    const atcAnimes = await extractLinks()
    const atcAnimesToDownload = atcAnimes.filter(a => !animeService.animeAlreadyDownloaded(a.title))
    
    const linksToDownload = atcAnimesToDownload
        .map(a => [...a.FullHD, ...a.HD, ...a.SD])
        .map(d => d.filter(a => a.mirror == "Drive" || a.mirror == "Gofile"))    
    
    console.log(`\nForam encontrados ${atcAnimesToDownload.length} novos episódios para realizar o download`)
    atcAnimesToDownload.forEach(a => console.log(a.title))

    console.log('\n')
    for (let i = 0; i < linksToDownload.length; i++) {
        const animeMirror = linksToDownload[i];
        const animePost = atcAnimesToDownload[i]
        
        console.log('Downloading anime ', animePost.title)

        let fileDownload
        try {
            const driveLink = await desprotectLink(animeMirror.filter(d => d.mirror == "Drive")[0].url)
            fileDownload = await download.drive(driveLink)    
        } catch (error) {
            const gofileLink = await desprotectLink(animeMirror.filter(d => d.mirror == "Gofile")[0].url)
            fileDownload = await download.gofile(gofileLink)
        }

        console.log(fileDownload)

        animeService.saveAnimeDownloaded(animePost.title, fileDownload)

        // if (fileDownload.indexOf('[AnimesTC]') >= 0) move(path.basename(fileDownload))

        notify(`[OK] ${animePost.title}`)
    }
    
}


const extractLinks = async () => {
    return executeBrowser(async (page) => {
        console.log("Navigating to AnimesTC")
        await page.goto('https://www.animestc.net/');
        
        const protectedLinks = await page.evaluate(`
            function sleep(time) {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve();
                    }, time);
                });
            }
            
            Promise.all([...document.querySelectorAll('header.episode-info-title')].map(async (header) => {
            
                // Click on MP4 quality    
                const qualityMP4Btn = header.parentElement.querySelector('.episode-info-tabs-item.episode-info-tabs-item-blue')
                if (qualityMP4Btn) {
                    qualityMP4Btn.click()
                    await sleep(500)
                }    
            
                // Extract Links MP4
                const qualityMP4 = [...header.parentElement
                    .querySelectorAll('.episode-info-links-item.episode-info-links-item-blue')]
                    .map(e => {
                        return {
                            url: e.href,
                            mirror: e.innerText.trim()
                        }
                    })
            
            
                // Click on 720p quality    
                const quality720pBtn = header.parentElement.querySelector('.episode-info-tabs-item.episode-info-tabs-item-green')
                if (quality720pBtn) {
                    quality720pBtn.click()
                    await sleep(500)
                }    
            
                // Extract Links 720p
                const quality720p = [...header.parentElement
                    .querySelectorAll('.episode-info-links-item.episode-info-links-item-green')]
                    .map(e => {
                        return {
                            url: e.href,
                            mirror: e.innerText.trim()
                        }
                    })
            
            
                // Click on 1080p quality    
                const quality1080pBtn = header.parentElement.querySelector('.episode-info-tabs-item.episode-info-tabs-item-red')
                if (quality1080pBtn) {
                    quality1080pBtn.click()
                    await sleep(500)
                }    
            
                // Extract Links 1080p
                const quality1080p = [...header.parentElement
                    .querySelectorAll('.episode-info-links-item.episode-info-links-item-red')]
                    .map(e => {
                        return {
                            url: e.href,
                            mirror: e.innerText.trim()
                        }
                    })
                    
                return {
                    title: header.innerText,
                    FullHD: quality1080p,
                    HD: quality720p,
                    SD: qualityMP4
                }
            }))
        `)

        console.log(`Animes found: ${protectedLinks.length}`)

        return protectedLinks
    })
    
}

const desprotectLink = async (link) => {    
    try {
        return await desprotectLinkPrivate(link)        
    } catch (error) {
        console.log('Retry desproct')
        return await desprotectLinkPrivate(link)        
    }
}

const desprotectLinkPrivate = async (link) => {  
    return executeBrowser(async (page) => {        

        console.log("Desprotecting link: " + link)    

        await page.goto(link)
        await delay(6000)

        const linkDesprotected = await page.evaluate(`
            id = document.querySelector('#link-id').getAttribute("value");

            fetch("https://protetor.animestc.xyz/api/link/" + id)
                .then(res => res.json())
                .then(body => body.link) 
        `)
        
        console.log("Desproted link: " + linkDesprotected)    

        return linkDesprotected
    })      
}

module.exports = {
    execute
}