class CrazyPowerup extends Powerup {

    // tuning vars
    private var directionFlipTime = 10.0f;

    // getters
    public function GetDirectionFlipTime() {
       return directionFlipTime;
    }
    
    // operations
    function Start () {
        powerupType = PowerupType.Crazy;
        super.Start();
    }

}