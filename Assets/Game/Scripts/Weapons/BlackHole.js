private var forceMultiplier: float = 65.0f;
private var ttl: float = 2.5f;
private var dieAt: float = 0.0f;

function Start() {
    dieAt = Time.time + ttl;
}

function Update() {
    if (dieAt < Time.time) {
        Destroy(gameObject);
    }
}

function OnTriggerEnter(other: Collider) {
    var networkChar = ComponentUtil.GetComponentInHierarchy(other.gameObject,typeof(CharacterNetwork)) as CharacterNetwork;
    if ( networkChar) 
    {
        var motor:CharacterMotor = other.GetComponent(CharacterMotor);
        if (motor) {
            var dir: Vector3 = other.gameObject.transform.position - transform.position;
            var newVelocity: Vector3 = dir.normalized * -1.0f * forceMultiplier;
            Debug.Log(newVelocity);
            motor.SetVelocity(newVelocity);
        }
    }
}