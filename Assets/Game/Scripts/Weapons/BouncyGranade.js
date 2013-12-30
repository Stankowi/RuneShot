private static var ttl: int = 5;

private var collisions: int = 0;
private var launchingPlayer: GameObject = null;
private var explodeAt: int = 0;

function Start() {
    explodeAt = Time.time + ttl;
}

function Update() {
    if (explodeAt < Time.time) {
        Explode();
    }
}

function OnCollisionEnter(collision: Collision) {
    var other: GameObject = collision.gameObject;
    if (other.tag == "Player" && (collisions > 0 ||
                                  (collisions <= 0 && !IsLauncher(other)))) {
        var joint = gameObject.AddComponent(FixedJoint);
        joint.connectedBody = other.rigidBody;
    }

    collisions += 1;
}

function IsLauncher(obj: GameObject): boolean {
    return obj.GetInstanceID() == this.launchingPlayer.GetInstanceID();
}

function GetDamage(): int {
    return Base.health()  * 0.25;
}

 function GetDamageRadius(): int {
    return 2;
 }

 function Explode() {
    var damageRadius: int = GetDamageRadius();

    var colliders: Collider[] = Physics.OverlapSphere(transform.position, damageRadius);

     var damage: int = GetDamage();
     for(var hit in colliders) {
        if(hit.gameObject.tag == "Player") {
            hit.gameObject.GetComponent("Health").ResolveDamage(damage);
        }
     }
     Destroy(gameObject);
 }

function Trigger(launchingPlayer: GameObject, facing: Vector3, pressDuration: int) {
    this.launchingPlayer = launchingPlayer;
    rigidbody.AddRelativeForce(facing * 1000);
}
