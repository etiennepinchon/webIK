window.Vector2 = THREE.Vector2;
window.Vector3 = THREE.Vector3;
window.Quaternion = THREE.Quaternion;

// Math
Math.lerp = function (a,  b,  c) {
    return a + c * (b - a);
}

Math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * (Math.PI / 180);
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * (180 / Math.PI);
};

const FULL_ANGLE = 360;

Math.deltaAngle = function(current, target) {
  if (Math.abs(current) > FULL_ANGLE) {
    current %= FULL_ANGLE;
  }

  if (Math.abs(target) > FULL_ANGLE) {
    target %= FULL_ANGLE;
  }

  return target - current;
}


Math.smoothDamp = function (current, target, currentVelocity, smoothTime, maxSpeed=Infinity, deltaTime) {
    if (!deltaTime) deltaTime = Time.deltaTime;

    smoothTime = Math.max(0.0001, smoothTime);
    let num = 2 / smoothTime;
    let num2 = num * deltaTime;
    let num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
    let num4 = current - target;
    let num5 = target;
    let num6 = maxSpeed * smoothTime;
    num4 = Math.clamp (num4, -num6, num6);
    target = current - num4;
    let num7 = (currentVelocity + num * num4) * deltaTime;
    currentVelocity = (currentVelocity - num * num7) * num3;
    let num8 = target + (num4 + num7) * num3;
    if (num5 - current > 0 === num8 > num5)
    {
        num8 = num5;
        currentVelocity = (num8 - num5) / deltaTime;
    }
    return num8;
}

// Math.moveTowards
Math.moveTowards = function(current, target, maxDelta)
{
    if (Math.abs(target - current) <= maxDelta)
    {
        return target;
    }
    return current + Math.sign(target - current) * maxDelta;
}


// Vector3

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

Vector3.prototype.orthoNormalize = function( tangent ) {
    this.normalize();
    tangent.normalize();

    return tangent.cross( this );
}

Vector3.prototype.slerp = function(end, percent) {
    let start = this;

     // Dot product - the cosine of the angle between 2 vectors.
     let dot = start.dot(end);
     // Clamp it to be in the range of Acos()
     // This may be unnecessary, but floating point
     // precision can be a fickle mistress.
     Math.clamp(dot, -1.0, 1.0);
     // Acos(dot) returns the angle between start and end,
     // And multiplying that by percent returns the angle between
     // start and the final result.
     let theta = Math.acos(dot) * percent;
     let RelativeVec = end.clone().sub(start.clone().multiply(dot));
     RelativeVec.normalize();     // Orthonormal basis
     // The final result.
     return ((start.clone().multiplyScalar(Math.cos(theta))) + (RelativeVec.clone().multiplyScalar(Math.sin(theta))));
}

Vector3.prototype.projectOnVector = function ( vector ) {
  if (!vector.length()) return Vector3.zero;
	var scalar = vector.dot( this ) / vector.lengthSq();
	return this.copy( vector ).multiplyScalar( scalar );
}


// QUATERNION

Object.defineProperty(Quaternion, 'identity', { get: function() { return new Quaternion(); } });
Object.defineProperty(Quaternion.prototype, 'xyz', {
  get: function() { return new Vector3(this.x, this.y, this.z); },
  set: function(value) {
    this.x = value.x;
    this.y = value.y;
    this.z = value.z;
  }
});



Quaternion.prototype.setFromQuaternion = function(quaternion) {
  this.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
}

Quaternion.prototype.lerp = function(t, e) {
  return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this.w += (t.w - this.w) * e, this;
}

// Converts a rotation to angle-axis representation (angles in degrees).
Quaternion.prototype.toAngleAxis = function() {
  return new THREE.Euler().setFromQuaternion( this );
}

const radToDeg = (180.0 / Math.PI);
const degToRad = (Math.PI / 180.0);

// Returns the angle in degrees between two rotations a and b.
Quaternion.Angle = function(a, b) {
	// const inv = a.clone().inverse();
	// const res = b.clone().multiply(inv);
	// return Math.acos(res.w) * 57.2957795;

  let f = a.clone().dot(b.clone());
	return Math.acos(Math.min(Math.abs(f), 1)) * 2 * radToDeg;
}

// Creates a rotation which rotates from fromDirection to toDirection.
// Quaternion.FromToRotation = function(from, to) {
//   if (to === from) return Quaternion.identity;
//   return to.clone().multiply(from.clone().negate());
// }



Quaternion.FromToRotation = function(fromDirection, toDirection) {
	return Quaternion.RotateTowards(
    Quaternion.LookRotation(fromDirection.clone()),
    Quaternion.LookRotation(toDirection.clone()),
    Number.MAX_VALUE
  );
}

Quaternion.RotateTowards = function(from, to, maxDegreesDelta) {
	let num = Quaternion.Angle(from, to);
	if (num == 0) {
		return to;
	}
	let t = Math.min(1, maxDegreesDelta / num);
	return Quaternion.SlerpUnclamped(from, to, t);
}



Quaternion.LookRotation = function(forward, up) {
  if (!up) up = Vector3.up;

	forward = forward.normalize();
	let right = up.cross(forward).normalize();
	up = forward.cross(right);
	var m00 = right.x;
	var m01 = right.y;
	var m02 = right.z;
	var m10 = up.x;
	var m11 = up.y;
	var m12 = up.z;
	var m20 = forward.x;
	var m21 = forward.y;
	var m22 = forward.z;

	let num8 = (m00 + m11) + m22;
	var quaternion = new Quaternion();

	if (num8 > 0) {
		var num = Math.sqrt(num8 + 1);
		quaternion.w = num * 0.5;
		num = 0.5 / num;
		quaternion.x = (m12 - m21) * num;
		quaternion.y = (m20 - m02) * num;
		quaternion.z = (m01 - m10) * num;
		return quaternion;
	}
	if ((m00 >= m11) && (m00 >= m22))
	{
		var num7 = Math.sqrt(((1 + m00) - m11) - m22);
		var num4 = 0.5 / num7;
		quaternion.x = 0.5 * num7;
		quaternion.y = (m01 + m10) * num4;
		quaternion.z = (m02 + m20) * num4;
		quaternion.w = (m12 - m21) * num4;
		return quaternion;
	}
	if (m11 > m22)
	{
		var num6 = Math.sqrt(((1 + m11) - m00) - m22);
		var num3 = 0.5 / num6;
		quaternion.x = (m10 + m01) * num3;
		quaternion.y = 0.5 * num6;
		quaternion.z = (m21 + m12) * num3;
		quaternion.w = (m20 - m02) * num3;
		return quaternion;
	}
	var num5 = Math.sqrt(((1 + m22) - m00) - m11);
	var num2 = 0.5 / num5;
	quaternion.x = (m20 + m02) * num2;
	quaternion.y = (m21 + m12) * num2;
	quaternion.z = 0.5 * num5;
	quaternion.w = (m01 - m10) * num2;
	return quaternion;
}





Quaternion.SlerpUnclamped = function(a, b, t) {
	// if either input is zero, return the other.
	if (a.lengthSq() === 0)
	{
		if (b.lengthSq() === 0)
		{
			return Quaternion.identity;
		}
		return b;
	}
	else if (b.lengthSq() == 0)
	{
		return a;
	}

	let cosHalfAngle = a.w * b.w + a.xyz.clone().dot(b.xyz);// Float

	if (cosHalfAngle >= 1 || cosHalfAngle <= -1) {
		return a;
	}
	else if (cosHalfAngle < 0) {
		b.xyz = b.xyz.negate();
		b.w = -b.w;
		cosHalfAngle = -cosHalfAngle;
	}

	let blendA, blendB;
	if (cosHalfAngle < 0.99) {
		// do proper slerp for big angles
		let halfAngle = Math.acos(cosHalfAngle);
		let sinHalfAngle = Math.sin(halfAngle);
		let oneOverSinHalfAngle = 1 / sinHalfAngle;
		blendA = Math.sin(halfAngle * (1.0 - t)) * oneOverSinHalfAngle;
		blendB = Math.sin(halfAngle * t) * oneOverSinHalfAngle;
	}
	else
	{
		// do lerp if angle is really small.
		blendA = 1.0 - t;
		blendB = t;
	}

  let resultVec3 = a.xyz.clone().multiplyScalar(blendA).add( b.xyz.clone().multiplyScalar(blendB) );
  let resultW = blendA * a.w + blendB * b.w;

	let result = new Quaternion(resultVec3.x, resultVec3.y, resultVec3.z, resultW);
	if (result.lengthSq() > 0)
		return result.normalize();
	else
		return Quaternion.identity;
}
















// Creates a rotation with the specified forward and upwards directions
// Quaternion.LookRotation = function(dir, up) {
//    if (dir == Vector3.zero) {
//        return Quaternion.identity;
//    }
//    if (up.length() != dir.length()) {
//        up.clone().normalize();
//        let v =  dir.clone().add( up.clone().multiply( up.clone().dot(dir).negate() ));
//        let q = Quaternion.FromToRotation(Vector3.forward, v);
//        return Quaternion.FromToRotation(v, dir).multiply(q);
//    }
//    else {
//        return Quaternion.FromToRotation(Vector3.forward, dir);
//    }
// }










// Patch the fact that threejs does not handle quaternion
// multiplied by vector3 out of the box..
Quaternion.prototype.multiply = function(q) {
  if (q.w == undefined) return this.multiplyVector3(q);
  return this.multiplyQuaternions( this, q );
}

Quaternion.prototype.multiplyVector3 = function(vec) {
  if (vec.w) throw new Error('NO.. multiplyVector3 on a quaternion..')
  let num = this.x * 2;
  let num2 = this.y * 2;
  let num3 = this.z * 2;
  let num4 = this.x * num;
  let num5 = this.y * num2;
  let num6 = this.z * num3;
  let num7 = this.x * num2;
  let num8 = this.x * num3;
  let num9 = this.y * num3;
  let num10 = this.w * num;
  let num11 = this.w * num2;
  let num12 = this.w * num3;
  let result = new Vector3();
  result.x = (1 - (num5 + num6)) * vec.x + (num7 - num12) * vec.y + (num8 + num11) * vec.z;
  result.y = (num7 + num12) * vec.x + (1 - (num4 + num6)) * vec.y + (num9 - num10) * vec.z;
  result.z = (num8 - num11) * vec.x + (num9 + num10) * vec.y + (1 - (num4 + num5)) * vec.z;
  return result;
}
