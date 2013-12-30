#pragma strict
// The intention of a one shot particle effect is to emit particles once, 
//  and then kill itself once those particles are gone.


// Some effects, like smoke, take a while to clear.
public var despawnTimer : float = 15;

// It's too bad there isn't a "FirstUpdate" monobehaviour function.
var runOnce = false;


function Update () {
    // Running this in the first update gives the particle systems enough time to emit once.
    // If "DisableEmission" happens in Start, then no particles ever emit.
    if(!runOnce) {
        runOnce = true;
        DisableEmission();
    }
    UpdateDespawnTimer();
}

function DisableEmission() {
    var particleSystems = GetComponentsInChildren(ParticleEmitter);
    for(var particleSystem in particleSystems) {
        particleSystem.particleEmitter.emit = false;
    }
}

function UpdateDespawnTimer() {
    if(despawnTimer > 0) {
        despawnTimer -= Time.deltaTime;
        if(despawnTimer <= 0) {
            GameObject.Destroy(gameObject);
        }    
    }
}