

const trackerList = [
    'wss://tracker.openwebtorrent.com', 'udp://tracker.opentrackr.org:1337', 'udp://tracker.opentrackr.org:1337/announce', 'udp://9.rarbg.com:2810/announce', 'udp://tracker.openbittorrent.com:6969/announce', 'udp://tracker.torrent.eu.org:451/announce', 'udp://exodus.desync.com:6969/announce', 'udp://tracker.moeking.me:6969/announce', 'udp://tracker.dler.org:6969/announce', 'udp://open.demonii.com:1337/announce', 'udp://explodie.org:6969/announce', 'udp://chouchou.top:8080/announce', 'udp://zecircle.xyz:6969/announce', 'udp://yahor.ftp.sh:6969/announce', 'https://tracker.nanoha.org:443/announce', 'http://tracker.openbittorrent.com:80/announce', 'https://opentracker.i2p.rocks:443/announce', 'https://tracker.lilithraws.org:443/announce', 'http://vps02.net.orel.ru:80/announce', 'http://tracker3.ctix.cn:8080/announce', 'http://tracker.mywaifu.best:6969/announce', 'wss://tracker.btorrent.xyz', 'wss://tracker.fastcast.nz', 'wss://tracker.btorrent.xyz', 'wss://tracker.openwebtorrent.com', 'udp://explodie.org:6969', 'udp://tracker.empire-js.us:1337',
]

let WebTorrent = null
let client = null
const intervalCache = {}

const initWebTorrent = async () => {
    if (!!client) return

    WebTorrent = await (await import('webtorrent-hybrid')).default
    client = new WebTorrent()
}

const createTorrentSeed = (file) => new Promise(async (res) => {
    await initWebTorrent()

    client.seed(file, { announce: trackerList }, function (torrent) {
        console.log('************* Client is seeding ' + torrent.magnetURI)
        
        intervalCache[torrent.infoHash] = setInterval(() => {
            process.stdout.write(`[${torrent.files[0].name}] - Peers: ${torrent.numPeers} - Progress: ${(torrent.progress * 100).toFixed(1)}  - Download: ${torrent.downloadSpeed} - Upload: ${torrent.uploadSpeed}`)
        }, 2000)

        res(torrent.magnetURI)
    })
})

module.exports = {
    initWebTorrent,
    createTorrentSeed
}