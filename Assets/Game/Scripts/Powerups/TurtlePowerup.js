class TurtlePowerup extends Powerup {

    // tuning vars
    private var damageMultiplier = 0.25f;
    private var speedMultiplier = 0.5f;

    // getters
    public function GetDamageMultiplier() {
       return damageMultiplier;
    }
    
    // getters
    public function GetSpeedMultiplier() {
       return speedMultiplier;
    }
    
    // operations
    function Start () {
        powerupType = PowerupType.Turtle;
        super.Start();
    }

}