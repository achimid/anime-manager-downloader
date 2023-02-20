const { delay } = require('../../utils/commons')
const { executeBrowser } = require('../../utils/puppeteer')

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
    extractLinks,
    desprotectLink,
}