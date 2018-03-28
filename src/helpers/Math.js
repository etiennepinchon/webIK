// Math

const radToDeg = (180.0 / Math.PI);
const degToRad = (Math.PI / 180.0);
const FULL_ANGLE = 360;

// Interpolates between a and b by t. t is clamped between 0 and 1
Math.lerp = function (a,  b,  t) {
  return a + (b - a) * Math.clamp01(t);
}

// Interpolates between a and b by t without clamping the interpolant
Math.lerpUnclamped = function(a, b, t) {
  return a + (b - a) * t;
}

// / Clamps value between min and max and returns value
Math.clamp = function(value, min, max) {
  return Math.min(Math.max(value, min), max);
};

// Clamps value between 0 and 1 and returns value
Math.clamp01 = function(value) {
  if (value < 0)
    return 0;
  else if (value > 1)
    return 1;
  else
    return value;
};

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * degToRad;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * radToDeg;
};

// Loops the value t, so that it is never larger than length and never smaller than 0.
Math.repeat = function(t, length) {
  return Math.clamp(t - Math.floor(t / length) * length, 0, length);
}

// Calculates the shortest difference between two given angles given in degrees.
Math.deltaAngle = function(current, target) {
  let delta = Math.repeat((target - current), 360);
  if (delta > 180)
      delta -= 360;
  return delta;
}

// Gradually changes a value towards a desired goal over time.
Math.smoothDamp = function (current, target, currentVelocity, smoothTime, maxSpeed = Infinity, deltaTime) {
    if (!deltaTime) deltaTime = Time.deltaTime;

    smoothTime = Math.max(0.0001, smoothTime);
    let omega = 2 / smoothTime;

    let x = omega * deltaTime;
    let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    let originalTo = target;

    // Clamp maximum speed
    let maxChange = maxSpeed * smoothTime;
    change = Math.clamp(change, -maxChange, maxChange);
    target = current - change;

    let temp = (currentVelocity + omega * change) * deltaTime;
    currentVelocity = (currentVelocity - omega * temp) * exp;
    let output = target + (change + temp) * exp;

    // Prevent overshooting
    if (originalTo - current > 0.0 == output > originalTo) {
        output = originalTo;
        currentVelocity = (output - originalTo) / deltaTime;
    }

    return output;
}

// Moves a value current towards target.
// This is essentially the same as Mathf.Lerp but
// instead the function will ensure that the speed never exceeds maxDelta.
// Negative values of maxDelta pushes the value away from target.
Math.moveTowards = function(current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) {
        return target;
    }
    return current + Math.sign(target - current) * maxDelta;
}
