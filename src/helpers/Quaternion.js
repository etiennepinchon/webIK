const radToDeg = (180.0 / Math.PI);
const degToRad = (Math.PI / 180.0);

const Vector2 = THREE.Vector2;
const Vector3 = THREE.Vector3;
const Vector4 = THREE.Vector4;
//const Quaternion = THREE.Quaternion;

// Represents a Quaternion.
export default class Quaternion {


  /// Defines the identity quaternion.
  // Tested: OK
  static get identity() {
    return new Quaternion(0, 0, 0, 1);
  }

  // Return vector3 component of the quaternion
  // Tested: OK
  get xyz() {
    return new Vector3(this.x, this.y, this.z);
  }

  set xyz(value) {
    this.x = value.x;
    this.y = value.y;
    this.z = value.z;
  }

  // Construct a new Quaternion
  constructor(x = 0, y = 0, z = 0, w = 0) {
    this.set(x, y, z, w);
  }

  set(x = 0, y = 0, z = 0, w = 0) {
    // Fields
    this.xyz = new Vector3(x, y, z);
    this.w = w;
    return this;
  }

  // Set quaternion from other quaternion
  setFromQuaternion(qua) {
    this.set(qua.x, qua.y, qua.z, qua.w);
  }

  // Clone quaternion
  clone () {
		return new Quaternion( this.x, this.y, this.z, this.w );
	}

  // Cause issues, values not correct
  // Creates a rotation which rotates from fromDirection to toDirection.
  setFromToRotation(fromDirection, toDirection) {
		this.setFromQuaternion( Quaternion.fromToRotation(fromDirection, toDirection) );
    return this;
	}

  // Creates a rotation with the specified forward and upwards directions.
  setLookRotation(view, up = Vector3.up) {
    this.setFromQuaternion( Quaternion.lookRotation(view, up) );
    return this;
  }

  // Construct a new Quaternion from vector and w components
  setFromVector3AndW(v, w) {
    this.xyz = v.clone();
    this.w = w;
  }

  /// Construct a new Quaternion from given Euler angles
  /// <param name="pitch">The pitch (attitude), rotation around X axis</param>
  /// <param name="yaw">The yaw (heading), rotation around Y axis</param>
  /// <param name="roll">The roll (bank), rotation around Z axis</param>
  setFromEulerAngle(pitch, yaw, roll) {
      yaw *= 0.5;
      pitch *= 0.5;
      roll *= 0.5;

      let c1 = Math.cos(yaw);
      let c2 = Math.cos(pitch);
      let c3 = Math.cos(roll);
      let s1 = Math.sin(yaw);
      let s2 = Math.sin(pitch);
      let s3 = Math.sin(roll);

      this.w = c1 * c2 * c3 - s1 * s2 * s3;
      this.x = s1 * s2 * c3 + c1 * c2 * s3;
      this.y = s1 * c2 * c3 + c1 * s2 * s3;
      this.z = c1 * s2 * c3 - s1 * c2 * s3;

      return this;
  }

  toAngleAxis() {
      let q = this.clone()
      q = q.normalize();

      let sqrLength = q.x * q.x + q.y * q.y + q.z * q.z;
      let angle, axis = new Vector3();
      if (sqrLength == 0) {
          angle = 0;
          axis.setX(1);
          axis.setY(0);
          axis.setZ(0);
      } else {
          angle = (2 * Math.acos(q.w));
          let invLength = (1 / Math.sqrt(sqrLength));
          axis.setX(q.x * invLength);
          axis.setY(q.y * invLength);
          axis.setZ(q.z * invLength);
      }
      angle *= radToDeg;
      return { axis, angle };
  }


  // OK
  // The dot product between two rotations.
  dot ( v ) {
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	}


  /// Gets the length (magnitude) of the quaternion.
  /// <seealso cref="LengthSquared"/>
  length() {
    return Math.sqrt(this.w * this.w + this.xyz.clone().lengthSq() );
  }

  /// <summary>
  /// Gets the square of the quaternion length (magnitude).
  /// </summary>
  lengthSq() {
      return this.w * this.w + this.xyz.clone().lengthSq();
  }

  /// <summary>
  /// Returns a copy of the Quaternion scaled to unit length.
  /// </summary>
  normalized() {
      return q.clone().normalize();
  }

  /// <summary>
  /// Scales the Quaternion to unit length.
  /// </summary>
  normalize() {
    let scale = 1.0 / this.length();
    this.xyz = this.xyz.multiplyScalar(scale);
    this.w *= scale;
    return this;
  }

  /// <summary>
  /// Inverts the Vector3 component of this Quaternion.
  /// </summary>
  inverse() {
    this.xyz = this.xyz.negate();
    return this;
  }

  static equals(a, b) {
	 return (a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w)
 }

  /// <summary>
  /// Add two quaternions
  /// </summary>
  /// <param name="left">The first operand</param>
  /// <param name="right">The second operand</param>
  /// <returns>The result of the addition</returns>
  add(right) {
    this.setFromVector3AndW( this.xyz.clone().add(right.xyz), this.w + right.w );
    return this;
  }

  /// <summary>
   /// Subtracts two instances.
   /// </summary>
   /// <param name="left">The left instance.</param>
   /// <param name="right">The right instance.</param>
   /// <returns>The result of the operation.</returns>
   sub(right) {
     this.setFromVector3AndW( this.xyz.clone().sub( right.xyz ), this.w - right.w );
     return this;
   }

   /// <summary>
    /// Multiplies two instances.
    /// </summary>
    /// <param name="left">The first instance.</param>
    /// <param name="right">The second instance.</param>
    /// <returns>A new instance containing the result of the calculation.</returns>
    multiply(right) {
      if (right.w === undefined) return this.multiplyVector3(right);

      this.setFromVector3AndW(
                this.xyz.clone().multiplyScalar(right.w).add(
                  right.xyz.clone().multiplyScalar(this.w)).add(
                    this.xyz.clone().cross(right.xyz) ),
                this.w * right.w - this.xyz.clone().dot(right.xyz) );
      return this;
    }

    multiplyScalar(scale) {
      this.x * scale;
      this.y * scale;
      this.z * scale;
      this.w * scale;
      return this;
    }


    /// <summary>
    /// Build a quaternion from the given axis and angle in radians
    /// </summary>
    /// <param name="axis">The axis to rotate about</param>
    /// <param name="angle">The rotation angle in radians</param>
    /// <returns>The equivalent quaternion</returns>
    static fromAxisAngle(axis, angle) {
        if (axis.lengthSq() === 0) {
            return Quaternion.identity;
        }

        let result = Quaternion.identity;

        angle *= 0.5;
        axis.normalize();
        result.xyz = axis.clone().multiplyScalar( Math.sin(angle) );
        result.w = Math.cos(angle);

        return result.normalize();
    }


    /// <summary>
    /// Builds a Quaternion from the given euler angles in radians
    /// The rotations will get applied in following order:
    /// 1. pitch (X axis), 2. yaw (Y axis), 3. roll (Z axis)
    /// </summary>
    /// <param name="pitch">The pitch (attitude), counterclockwise rotation around X axis</param>
    /// <param name="yaw">The yaw (heading), counterclockwise rotation around Y axis</param>
    /// <param name="roll">The roll (bank), counterclockwise rotation around Z axis</param>
    /// <returns></returns>
    static fromEulerAngles(pitch, yaw, roll) {
      return new Quaternion().setFromEulerAngle(pitch, yaw, roll);
    }

    /// <summary>
    /// Builds a Quaternion from the given euler angles in radians.
    /// The rotations will get applied in following order:
    /// 1. X axis, 2. Y axis, 3. Z axis
    /// </summary>
    /// <param name="eulerAngles">The counterclockwise euler angles as a vector</param>
    /// <returns>The equivalent Quaternion</returns>
    static fromVector3EulerAngles(eulerAngles) {
      return new Quaternion().setFromEulerAngle(eulerAngles.x, eulerAngles.y, eulerAngles.z);
    }


    /// <summary>
    /// Builds a Quaternion from the given euler angles in radians.
    /// The rotations will get applied in following order:
    /// 1. Around X, 2. Around Y, 3. Around Z
    /// </summary>
    /// <param name="eulerAngles">The counterclockwise euler angles a vector</param>
    /// <param name="result">The equivalent Quaternion</param>
    setFromEulerAngles(eulerAngles) {
        let c1 = Math.cos(eulerAngles.x * 0.5);
        let c2 = Math.cos(eulerAngles.y * 0.5);
        let c3 = Math.cos(eulerAngles.z * 0.5);
        let s1 = Math.sin(eulerAngles.x * 0.5);
        let s2 = Math.sin(eulerAngles.y * 0.5);
        let s3 = Math.sin(eulerAngles.z * 0.5);

        this.w = c1 * c2 * c3 - s1 * s2 * s3;
        this.x = s1 * c2 * c3 + c1 * s2 * s3;
        this.y = c1 * s2 * c3 - s1 * c2 * s3;
        this.z = c1 * c2 * s3 + s1 * s2 * c3;
    }

    lerp(b, t) {
    	t = Math.clamp(t, 0, 1);
    	return this.slerp(b, t).normalize();
    }


    /// <summary>
    /// Do Spherical linear interpolation between two quaternions
    /// </summary>
    /// <param name="q1">The first quaternion</param>
    /// <param name="q2">The second quaternion</param>
    /// <param name="blend">The blend factor</param>
    /// <returns>A smooth blend between the given quaternions</returns>
    slerp(q2, blend) {
       blend = Math.clamp(blend, 0, 1);

        // if either input is zero, return the other.
        if (this.lengthSq() === 0)
        {
            if (q2.lengthSq() === 0)
            {
                return Quaternion.identity;
            }
            return q2;
        }
        else if (q2.lengthSq() === 0)
        {
            return this;
        }


        let cosHalfAngle = this.w * q2.w + this.xyz.dot(q2.xyz);

        if (cosHalfAngle >= 1 || cosHalfAngle <= -1) {
            // angle = 0.0f, so just return one input.
            return this;
        }
        else if (cosHalfAngle < 0)
        {
            q2.xyz = q2.xyz.negate();
            q2.w = -q2.w;
            cosHalfAngle = -cosHalfAngle;
        }

        let blendA;
        let blendB;
        if (cosHalfAngle < 0.99)
        {
            // do proper slerp for big angles
            let halfAngle = Math.acos(cosHalfAngle);
            let sinHalfAngle = Math.sin(halfAngle);
            let oneOverSinHalfAngle = 1 / sinHalfAngle;
            blendA = Math.sin(halfAngle * (1 - blend)) * oneOverSinHalfAngle;
            blendB = Math.sin(halfAngle * blend) * oneOverSinHalfAngle;
        }
        else
        {
            // do lerp if angle is really small.
            blendA = 1 - blend;
            blendB = blend;
        }

        let resultVec3 = this.xyz.clone().multiplyScalar(blendA).add( q2.xyz.clone().multiplyScalar(blendB) );
        let resultW = blendA * this.w + blendB * q2.w;

        let result = new Quaternion(resultVec3.x, resultVec3.y, resultVec3.z, resultW);

        if (result.lengthSq() > 0) {
            return result;
        }
        else {
            return Quaternion.identity;
        }
    }

    // OK
    static angle(a, b) {
      let f = a.clone().dot(b.clone());
    	return Math.acos(Math.min(Math.abs(f), 1)) * 2 * radToDeg;
    }

    // OK
    // 	Creates a rotation which rotates angle degrees around axis.
    // AngleAxis(angle: float, axis: Vector3): Quaternion;
    static angleAxis(degress, axis) {
    	if (axis.lengthSq() === 0)
        return Quaternion.identity;

    	let result = Quaternion.identity;
    	var radians = degress * degToRad;
    	radians *= 0.5;

    	axis = axis.normalize();
    	axis = axis.clone().multiplyScalar( Math.sin(radians) );

    	result.x = axis.x;
    	result.y = axis.y;
    	result.z = axis.z;
    	result.w = Math.cos(radians);

    	return result.normalize();
    }


    // Returns a rotation that rotates z degrees around the z axis, x degrees around the x axis, and y degrees around the y axis.
    static euler(x, y, z) {
		   return Quaternion.fromEulerRad( new Vector3(x, y, z).multiplyScalar(degToRad) );
	  }

    // from http://stackoverflow.com/questions/11492299/quaternion-to-euler-angles-algorithm-how-to-convert-to-y-up-and-between-ha
    static fromEulerRad(euler, order = 'YXZ') {

      var x = euler.x, y = euler.y, z = euler.z;

      let result = new Quaternion();

      var cos = Math.cos;
  		var sin = Math.sin;

  		var c1 = cos( x / 2 );
  		var c2 = cos( y / 2 );
  		var c3 = cos( z / 2 );

  		var s1 = sin( x / 2 );
  		var s2 = sin( y / 2 );
  		var s3 = sin( z / 2 );

  		if ( order === 'XYZ' ) {

  			result.x = s1 * c2 * c3 + c1 * s2 * s3;
  			result.y = c1 * s2 * c3 - s1 * c2 * s3;
  			result.z = c1 * c2 * s3 + s1 * s2 * c3;
  			result.w = c1 * c2 * c3 - s1 * s2 * s3;

  		} else if ( order === 'YXZ' ) { // --

  			result.x = s1 * c2 * c3 + c1 * s2 * s3;
  			result.y = c1 * s2 * c3 - s1 * c2 * s3;
  			result.z = c1 * c2 * s3 - s1 * s2 * c3;
  			result.w = c1 * c2 * c3 + s1 * s2 * s3;

  		} else if ( order === 'ZXY' ) {

  			result.x = s1 * c2 * c3 - c1 * s2 * s3;
  			result.y = c1 * s2 * c3 + s1 * c2 * s3;
  			result.z = c1 * c2 * s3 + s1 * s2 * c3;
  			result.w = c1 * c2 * c3 - s1 * s2 * s3;

  		} else if ( order === 'ZYX' ) {

  			result.x = s1 * c2 * c3 - c1 * s2 * s3;
  			result.y = c1 * s2 * c3 + s1 * c2 * s3;
  			result.z = c1 * c2 * s3 - s1 * s2 * c3;
  			result.w = c1 * c2 * c3 + s1 * s2 * s3;

  		} else if ( order === 'YZX' ) {

  			result.x = s1 * c2 * c3 + c1 * s2 * s3;
  			result.y = c1 * s2 * c3 + s1 * c2 * s3;
  			result.z = c1 * c2 * s3 - s1 * s2 * c3;
  			result.w = c1 * c2 * c3 - s1 * s2 * s3;

  		} else if ( order === 'XZY' ) {

  			result.x = s1 * c2 * c3 - c1 * s2 * s3;
  			result.y = c1 * s2 * c3 - s1 * c2 * s3;
  			result.z = c1 * c2 * s3 + s1 * s2 * c3;
  			result.w = c1 * c2 * c3 + s1 * s2 * s3;

  		}

      return result;

    }






    // from http://stackoverflow.com/questions/12088610/conversion-between-euler-quaternion-like-in-unity3d-engine
	// static toEulerRad(rotation) {
  //
	// 	let sqw = rotation.w * rotation.w;
	// 	let sqx = rotation.x * rotation.x;
	// 	let sqy = rotation.y * rotation.y;
	// 	let sqz = rotation.z * rotation.z;
	// 	let unit = sqx + sqy + sqz + sqw; // if normalised is one, otherwise is correction factor
	// 	let test = rotation.x * rotation.w - rotation.y * rotation.z;
	// 	let v = new Vector3();
  //
	// 	if (test > 0.4995 * unit) {
  //     // singularity at north pole
	// 		v.y = 2 * Math.atan2(rotation.y, rotation.x);
	// 		v.x = Math.PI / 2;
	// 		v.z = 0;
	// 		return Quaternion.normalizeAngles( v.clone().multiplyScalar( radToDeg ) );
	// 	}
  //
	// 	if (test < -0.4995 * unit) {
  //     // singularity at south pole
	// 		v.y = -2 * Math.atan2(rotation.y, rotation.x);
	// 		v.x = -Math.PI / 2;
	// 		v.z = 0;
	// 		return Quaternion.normalizeAngles( v.clone().multiplyScalar(radToDeg) );
	// 	}
  //
	// 	let q = new Quaternion(rotation.w, rotation.z, rotation.x, rotation.y);
	// 	v.y = Math.atan2(2 * q.x * q.w + 2 * q.y * q.z, 1 - 2 * (q.z * q.z + q.w * q.w));     // Yaw
	// 	v.x = Math.asin(2 * (q.x * q.z - q.w * q.y));                             // Pitch
	// 	v.z = Math.atan2(2 * q.x * q.y + 2 * q.z * q.w, 1 - 2 * (q.y * q.y + q.z * q.z));      // Roll
  //
	// 	return Quaternion.normalizeAngles( v.clone().multiplyScalar(radToDeg) );
	// }



  /**
   * Sets the passed vector3 "result" with the Euler angles translated from the current Quaternion.
   */
   static toEulerAngles(q) {

      var qz = q.z;
      var qx = q.x;
      var qy = q.y;
      var qw = q.w;

      var sqw = qw * qw;
      var sqz = qz * qz;
      var sqx = qx * qx;
      var sqy = qy * qy;

      var zAxisY = qy * qz - qx * qw;
      var limit = .4999999;

      let result = Vector3.zero;

      if (zAxisY < -limit) {
          result.y = 2 * Math.atan2(qy, qw);
          result.x = Math.PI / 2;
          result.z = 0;
      } else if (zAxisY > limit) {
          result.y = 2 * Math.atan2(qy, qw);
          result.x = -Math.PI / 2;
          result.z = 0;
      } else {
          result.z = Math.atan2(2.0 * (qx * qy + qz * qw), (-sqz - sqx + sqy + sqw));
          result.x = Math.asin(-2.0 * (qz * qy - qx * qw));
          result.y = Math.atan2(2.0 * (qz * qx + qy * qw), (sqz - sqx - sqy + sqw));
      }

      return result;

  }





//
// static toEulerAngles(q) {
// 	let x = q.x;
// 	let y = q.y;
// 	let z = q.z;
// 	let w = q.w;
//
// 	let check = 2 * (y * z - w * x);
//
// 	if (check < 0.999) {
// 		if (check > -0.999) {
// 			let v = new Vector3( -Math.asin(check),
// 						Math.atan2(2 * (x * z + w * y), 1 - 2 * (x * x + y * y)),
// 						Math.atan2(2 * (x * y + w * z), 1 - 2 * (x * x + z * z)))
// 			v = SanitizeEuler(v)
// 			v.multiplyScalar(radToDeg)
// 			return v
//     }
// 		else {
// 			let v = new Vector3(Math.PI * 0.5, Math.atan2(2 * (x * y - w * z), 1 - 2 * (y * y + z * z)), 0)
// 			v = SanitizeEuler(v)
// 			v.multiplyScalar(radToDeg)
// 			return v
// 		}
//   }
// 	else {
// 		let v = new Vector3(-Math.PI * 0.5, Math.atan2(-2 * (x * y - w * z), 1 - 2 * (y * y + z * z)), 0)
// 		v = SanitizeEuler(v)
// 		v.multiplyScalar(radToDeg)
// 		return v;
// 	}
// }










	static normalizeAngles(angles) {

		angles.x = Quaternion.normalizeAngle(angles.x);
		angles.y = Quaternion.normalizeAngle(angles.y);
		angles.z = Quaternion.normalizeAngle(angles.z);

		return angles;
	}


	static normalizeAngle(angle) {
		while (angle > 360)
			angle -= 360;
		while (angle < 0)
			angle += 360;
		return angle;
	}






  // ?
  multiplyVector3(vec) {
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



  // OK
  // Rotates a rotation from towards to.
  static rotateTowards(from, to, maxDegreesDelta) {
  	let num = Quaternion.angle(from, to);
  	if (num == 0) {
  		return to;
  	}
  	let t = Math.min(1, maxDegreesDelta / num);
  	return from.clone().slerp(to, t);
  }



  static lookRotation(forward, up) {
    if (!up) up = Vector3.up;

  	forward = forward.normalize();

    let right = up.clone().cross(forward).normalize();
  	up = forward.clone().cross(right);

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

  static fromToRotation(from, to) {
    let q = Quaternion.identity;
    let v0 = from.clone().normalize()
  	let v1 = to.clone().normalize()
  	let d = v0.clone().dot(v1)

  	if (d > -1 + 1e-6) {
  		let s = Math.sqrt((1+d) * 2)
  		let invs = 1 / s
  		let c = v0.clone().cross(v1).multiplyScalar( invs );
  		q.set(c.x, c.y, c.z, s * 0.5)
    }
  	else if (d > 1 - 1e-6) {
  		return Quaternion.identity;
    }
  	else {
  		let axis = Vector3.right.cross(v0)

  		if (axis.lengthSq() < 1e-6) {
  			axis = Vector3.forward.cross(v0)
  		}
  		q.set(axis.x, axis.y, axis.z, 0);
  		return q;
  	}
  	return q;
  }

}





//
//
// let pi = Math.PI;
// let half_pi = pi * 0.5;
// let two_pi = 2 * pi;
// let negativeFlip = -0.0001;
// let positiveFlip = two_pi - 0.0001;
//
// function SanitizeEuler(euler)	{
// 	if (euler.x < negativeFlip) {
// 		euler.setX( euler.x + two_pi );
//   }
// 	else if (euler.x > positiveFlip) {
// 		euler.setX( euler.x - two_pi );
// 	}
//
// 	if (euler.y < negativeFlip) {
// 		euler.setY( euler.y + two_pi );
//   }
// 	else if (euler.y > positiveFlip) {
// 		euler.setY( euler.y - two_pi );
// 	}
//
// 	if (euler.z < negativeFlip) {
// 		euler.setZ( euler.z + two_pi );
//   }
// 	else if (euler.z > positiveFlip) {
// 		euler.setZ( euler.z + two_pi );
// 	}
//
//   return euler;
// }
