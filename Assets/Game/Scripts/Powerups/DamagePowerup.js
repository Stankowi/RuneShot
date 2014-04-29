class DamagePowerup extends Powerup {

    // tuning vars
    private var damageMultiplier = 4.0f;

    // getters
    public function GetDamageMultiplier() {
       return damageMultiplier;
    }
    
    // operations
    function Start () {
        powerupType = PowerupType.Damage;
        super.Start();
    }

}