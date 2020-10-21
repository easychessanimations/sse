const MAX_SSE_CONNECTIONS = parseInt(process.env.MAX_SSE_CONNECTIONS || "100")
const TICK_INTERVAL = parseInt(process.env.TICK_INTERVAL || "10000")

function middleware(req, res, next) {
    res.sseSetup = function() {
        res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
        })
    }

    res.sseSend = function(data) {
        let blob = "data: " + JSON.stringify(data) + "\n\n"        
        res.write(blob);
    }

    next()
}

let sseconnections = []

function setupStream(app){
    app.get('/stream', function(req, res) {  
        res.sseSetup()  
        sseconnections.push(res)    
        while(sseconnections.length > MAX_SSE_CONNECTIONS) sseconnections.shift()
        console.log(`new stream ${req.hostname} conns ${sseconnections.length}`)
    })
}

function ssesend(obj){    
    for(let i = 0; i < sseconnections.length; i++){
        sseconnections[i].sseSend(obj)
    }
}

setInterval(function(){
    ssesend({
        kind: "tick"
    })
}, TICK_INTERVAL)

module.exports = {
    middleware: middleware,
    setupStream: setupStream,
    ssesend: ssesend,
    TICK_INTERVAL: TICK_INTERVAL
}
