const MAX_SSE_CONNECTIONS = parseInt(process.env.MAX_SSE_CONNECTIONS || "100")
const TICK_INTERVAL = parseInt(process.env.TICK_INTERVAL || "10000")

function sseMiddleware(req, res, next) {
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

function ssesendFunc(obj){    
    for(let i = 0; i < sseconnections.length; i++){
        sseconnections[i].sseSend(obj)
    }
}

function ssesend(obj){
    setTimeout(_=>ssesendFunc(obj), 100)
}

setInterval(function(){
    ssesend({
        kind: "tick"
    })
}, TICK_INTERVAL)

module.exports = {
    sseMiddleware: sseMiddleware,
    setupStream: setupStream,
    ssesend: ssesend,
    TICK_INTERVAL: TICK_INTERVAL
}
