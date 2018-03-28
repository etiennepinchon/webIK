const radToDeg = (180.0 / Math.PI);
const degToRad = (Math.PI / 180.0);

const Vector2 = THREE.Vector2;
const Vector3 = THREE.Vector3;
const Quaternion = THREE.Quaternion;

Object.defineProperty(Vector3, 'zero', { get: function() { return new Vector3(); } });
Object.defineProperty(Vector3, 'back', { get: function() { return new Vector3(0, 0, -1); } });
Object.defineProperty(Vector3, 'forward', { get: function() { return new Vector3(0, 0, 1); } });
Object.defineProperty(Vector3, 'up', { get: function() { return new Vector3(0, 1, 0); } });
Object.defineProperty(Vector3, 'down', { get: function() { return new Vector3(0, -1, 0); } });
Object.defineProperty(Vector3, 'left', { get: function() { return new Vector3(-1, 0, 0); } });
Object.defineProperty(Vector3, 'right', { get: function() { return new Vector3(1, 0, 0); } });
Object.defineProperty(Vector3, 'negativeInfinity', { get: function() { return new Vector3(-Infinity, -Infinity, -Infinity); } });
Object.defineProperty(Vector3, 'positiveInfinity', { get: function() { return new Vector3(Infinity, Infinity, Infinity); } });

Vector3.prototype.setFromVector3 = function(vector3) {
  this.set(vector3.x, vector3.y, vector3.z);
}

// Makes vectors normalized and orthogonal to each other.
Vector3.prototype.orthoNormalize = function( tangent ) {
    this.normalize();
    let proj = this.clone().multiplyScalar( tangent.dot(this) );
    tangent.sub( proj );
    tangent.normalize();
}

Vector3.prototype.slerp = function(target, alpha = 0) {
  let dot = this.clone().dot(target);

  // If the inputs are too close for comfort, simply linearly interpolate.
  if (dot > 0.9995 || dot < -0.9995) return this.clone().lerp(target, alpha);

  // theta0 = angle between input vectors
  let theta0 = Math.acos(dot);

  // theta = angle between this vector and result
  let theta = theta0 * alpha;

  let st = Math.sin(theta);

  let tx = target.x - this.x * dot;
  let ty = target.y - this.y * dot;
  let tz = target.z - this.z * dot;
  let l2 = tx * tx + ty * ty + tz * tz;
  let dl = st * ((l2 < 0.0001) ? 1 : 1 / Math.sqrt(l2));

  return this.clone().multiplyScalar( Math.cos(theta) ).add( new Vector3(tx * dl, ty * dl, tz * dl) ).normalize();
}


Vector3.prototype.slerp = function(to, t = 0) {

  let from = this;

  let omega, sinom, scale0, scale1;

	if (t <= 0)
		return from.clone();
	else if (t >= 1)
		return to.clone();

	let v2 	= to.clone();
	let v1 	= from.clone();
	let len2 	= to.length();
	let len1 	= from.length();
	v2.divideScalar(len2);
	v1.divideScalar(len1);

	let len 	= (len2 - len1) * t + len1;
	let cosom = v1.clone().dot(v2);

	if (1 - cosom > 1e-6) {
		omega 	= Math.acos(cosom);
		sinom 	= Math.sin(omega);
		scale0 	= Math.sin((1 - t) * omega) / sinom;
		scale1 	= Math.sin(t * omega) / sinom;
  }
  else {
		scale0 = 1 - t;
		scale1 = t;
	}

	v1.multiplyScalar(scale0);
	v2.multiplyScalar(scale1);
	v2.add(v1);
	v2.multiplyScalar(len);

	return v2;
}


Vector3.angle = function(from, to) {
	return Math.acos(Math.clamp(from.clone().normalize().dot(to.clone().normalize()), -1, 1)) * radToDeg;
}

Vector3.prototype.equals = function(other) {
  return (this.x === other.x && this.y === other.y && this.z === other.z);
}
