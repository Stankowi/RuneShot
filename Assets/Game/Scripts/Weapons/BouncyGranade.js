private var power: int = 2;
private var collisions: int = 0;
private var lastCollider: GameObject = null;
private var launchingPlayer: GameObject = null;

function Update() {
    if ((gameObject.rigidbody.IsSleeping) && (rigidbody.velocity.magnitude == 0)) {
        Explode();
    }
}

function OnCollisionEnter(collision : Collision) {
    var other: GameObject = collision.gameObject;
    Debug.Log("Collisions " + (other.GetInstanceID() == this.launchingPlayer.GetInstanceID()));
    if (other.tag == "Player" &&
        (collisions > 0 ||
         (collisions <= 0 && ! IsLauncher(other)))) {
        Debug.Log("Collided xxx");
        Explode();
    } else if (other != lastCollider) {
        collisions += 1;
        lastCollider = other;
        Debug.Log("Collided " + collisions + " times");
    }
}

function IsLauncher(obj: GameObject) {
    return obj.GetInstanceID() == this.launchingPlayer.GetInstanceID();
}

function GetDamage() {
    return Mathf.Pow(power, (collisions + 1));
 }

 function GetDamageRadius() {
    return power * collisions;
 }

 function Explode() {
    var damageRadius: int = GetDamageRadius();
    Debug.Log("Damage radius is " + damageRadius);

    var colliders : Collider[] = Physics.OverlapSphere(transform.position, damageRadius);

     var damage: int = GetDamage();
     for(var hit in colliders) {
        if(hit.gameObject.tag == "Player") {
            //hit.rigidbody.AddExplosionForce(power, transform.position, damageRadius, 3.0);
            hit.gameObject.GetComponent("Health").ResolveDamage(damage);

        }
     }
     Destroy(gameObject);

 }

function Trigger(launchingPlayer: GameObject, facing: Vector3, force: int) {
    this.launchingPlayer = launchingPlayer;
    rigidbody.AddRelativeForce(facing * force, ForceMode.Force);
}