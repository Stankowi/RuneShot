class SpeedPowerup extends Powerup {

    // tuning vars
    private var speedMultiplier = 1.5f;

    // getters
    public function GetSpeedMultiplier() {
       return speedMultiplier;
    }
    
    // operations
    function Start () {
        powerupType = PowerupType.Speed;
        super.Start();
    }

}