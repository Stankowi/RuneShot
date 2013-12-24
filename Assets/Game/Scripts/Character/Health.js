private static var defaultHealth: int = 100;
private var health: int = defaultHealth;;

function ResolveDamage(damage: int) {
    health -= damage;
    Debug.Log("Health is now " + health);

    if (health <= 0) {
        // probably not the right way to handle death, but works for now.
        Die();
    }
}

function Die() {
    var spawnPoints: GameObject[] = GameObject.FindGameObjectsWithTag("SpawnPoint");
    var pointIndex: int = Random.Range(0.0, spawnPoints.length);
    var spawnPoint: GameObject = spawnPoints[pointIndex];

    ResetHealth();
    gameObject.transform.position = spawnPoint.transform.position;
}


function ResetHealth() {
    health = defaultHealth;
}