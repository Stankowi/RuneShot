#pragma strict

static function RotateY( v : Vector3, angle : float ) {
    var sin = Mathf.Sin( angle );
    var cos = Mathf.Cos( angle );
    var tx = v.x;
    var tz = v.z;
    v.x = (cos * tx) + (sin * tz);
    v.z = (cos * tz) - (sin * tx);
    return v;
}