private var health: int = 100;

function ResolveDamage(damage: int) {
   health -= damage;
   Debug.Log("Health is now " + health);
   
   if (health <= 0) {
        // probably not the right way to handle death, but works for now.
        Destroy(gameObject);
   }
}

