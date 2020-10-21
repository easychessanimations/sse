let lastSourceTick

let isFirstSourceTick = true

function setupSource(processSource, TICK_INTERVAL){
    lastSourceTick = performance.now()

    source = new EventSource('/stream')

    source.addEventListener('message', e => {                        
        try{
            let blob = JSON.parse(e.data)               

            let isTick = (blob.kind == "tick")

            if(isTick){
                lastSourceTick = performance.now()                
            }

            processSource(blob)

            if(isTick) isFirstSourceTick = false
        }catch(err){console.log(err)}        
    }, false)

    source.addEventListener('open', _ => {            
        
    }, false)

    source.addEventListener('error', e => {
        if (e.readyState == EventSource.CLOSED) {                
            
        }else{            
            source.close()
        }
    }, false)

    setInterval(_=>(_=>{
        let elapsed = performance.now() - lastSourceTick

        if(elapsed > 2 * TICK_INTERVAL){
            console.log("stream timed out")

            setupSource()
        }       
    }), TICK_INTERVAL)
}
