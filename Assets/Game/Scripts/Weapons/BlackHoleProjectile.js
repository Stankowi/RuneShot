var smallExplosion: Transform;
var bigExplosion: Transform;
var blackHole: Transform;

var triggered: boolean = false;

// Use this for initialization
function Start () {
}

// Update is called once per frame
function Update () {
}

function OnCollisionEnter(collision: Collision) {
    var other: GameObject = collision.gameObject;
    collider.enabled = false;
    
    if(other.tag == "Player" || other.tag == "NPC") {
        var blast = Instantiate(smallExplosion, transform.position, Quaternion.identity);
        Destroy(gameObject);
    } else if (other.tag == "plasma") {
        var biggerBlast = Instantiate(bigExplosion, transform.position, Quaternion.identity);
        var blackHole = Instantiate(blackHole, transform.position, Quaternion.identity);
        Destroy(gameObject);
    } else {
        var networkChar = ComponentUtil.GetComponentInHierarchy(collision.gameObject,typeof(CharacterNetwork)) as CharacterNetwork;
        if ( networkChar) {
            var motor:CharacterMotor = collision.GetComponent(CharacterMotor);
            if (motor) {
                var dir: Vector3 = collision.gameObject.transform.position - transform.position;
                var newVelocity: Vector3 = dir.normalized * 50.0f;
                motor.SetVelocity(newVelocity);
            }
        }
        var explosion = Instantiate(smallExplosion, transform.position, Quaternion.identity);
        Destroy(gameObject);    
    }
}