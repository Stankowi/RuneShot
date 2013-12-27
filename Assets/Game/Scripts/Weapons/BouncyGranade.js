private var power: int = 2;
private var collisions: int = 0;
private var lastCollider: GameObject = null;
private var launchingPlayer: GameObject = null;

function Update() {
    if ((gameObject.rigidbody.IsSleeping) && (rigidbody.velocity.magnitude == 0)) {
        Explode();
    }
}

function OnCollisionEnter(collision: Collision) {
    var other: GameObject = collision.gameObject;
    if (other.tag == "Player" &&
        (collisions > 0 ||
         (collisions <= 0 && ! IsLauncher(other)))) {
        Explode();
    } else if (other != lastCollider) {
        collisions += 1;
        lastCollider = other;
    }
}

function IsLauncher(obj: GameObject): boolean {
    return obj.GetInstanceID() == this.launchingPlayer.GetInstanceID();
}

function GetDamage(): int {
    return Mathf.Pow(power, (collisions + 1));
 }

 function GetDamageRadius(): int {
    return power * collisions;
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

@RPC
function Trigger(launchingPlayer: GameObject, facing: Vector3, pressDuration: int) {
    this.launchingPlayer = launchingPlayer;
    rigidbody.AddRelativeForce(facing * Power(pressDuration));
}

function Power(pressDuration: int): int {
    var power: int = Mathf.Min(Mathf.Pow(2, pressDuration + 1), 64);
    return Mathf.Min(power * 250, 5000);
}
