private var currentPowerup : Powerup;
private var directionFlipTimeRemaining : float = 0.0f;

public function Update() {
    directionFlipTimeRemaining -= Time.deltaTime;
    directionFlipTimeRemaining = Mathf.Max(0.0f, directionFlipTimeRemaining);
}

public function set Powerup(value : Powerup) {
    currentPowerup = value;
}

public function get Powerup() : Powerup {
    return currentPowerup;
}

public function set DirectionFlipTimeRemaining(value : float) {
    directionFlipTimeRemaining = value;
}

public function get DirectionFlipTimeRemaining() : float {
    return directionFlipTimeRemaining;
}