class HealthPowerup extends Powerup {

    // tuning vars
    private var healthRegen = 2.5f;

    // getters
    public function GetHealthRegen(deltaTime : float) {
        return healthRegen * deltaTime;
    }

    // operations
    function Start () {
        powerupType = PowerupType.Health;
        super.Start();
    }

}