
const { execute } = require('./animestc/atc-service')

let running = false

const start = () => {
    main()
    setInterval(main, 60000 * 5)
}

const main = async () => {
        
        if (running) {
            console.log("Execução ignorada...")
            return
        }

        running = true
        console.log("Iniciando execução...")

        try {
            await execute()            
        } catch (error) {
            console.log("Execução finalizada com erro...")
            console.error("Error: ", error)
        }        

        console.log("Execução finalizada com sucesso...")
        running = false    

}

module.exports = {
    start
}