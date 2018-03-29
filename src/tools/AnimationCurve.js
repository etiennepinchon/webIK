import Keyframe from './Keyframe';

export default class AnimationCurve {

    constructor(keys=[]) {
      this.keys = keys;
		}




    // Evalute animation curve at position t.
    evaluate(t) {
      let keyframe0, keyframe1;
      for (let i = 0; i < this.keys.length; i++) {
        if (i+1 <= this.keys.length-1) {
          if (t >= this.keys[i].time && t <= this.keys[i+1].time) {
            keyframe0 = this.keys[i];
            keyframe1 = this.keys[i+1];
            break;
          }
        }
      }

      let dt = keyframe1.time - keyframe0.time;

      let m0 = keyframe0.outTangent * dt;
      let m1 = keyframe1.inTangent * dt;

      let t2 = t * t;
      let t3 = t2 * t;

      let a = 2 * t3 - 3 * t2 + 1;
      let b = t3 - 2 * t2 + t;
      let c = t3 - t2;
      let d = -2 * t3 + 3 * t2;

      return a * keyframe0.value + b * m0 + c * m1 + d * keyframe1.value;
    }



    // @TODO: not necessary but could be done.
		addKey(time, value) {}
    moveKey(index, key) {}
    removeKey(index) {}
    smoothTangents(index, weight) {}




    static linear(timeStart, valueStart, timeEnd, valueEnd) {
			const num = (valueEnd - valueStart) / (timeEnd - timeStart);
			const keys = [
				new Keyframe(timeStart, valueStart, 0, num),
				new Keyframe(timeEnd, valueEnd, num, 0)
			];
			return new AnimationCurve(keys);
		}




		static easeInOut(timeStart, valueStart, timeEnd, valueEnd) {
			const keys = [
				new Keyframe(timeStart, valueStart, 0, 0),
				new Keyframe(timeEnd, valueEnd, 0, 0)
			];
			return new AnimationCurve(keys);
		}
}
