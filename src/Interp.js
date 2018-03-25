/// Interpolation mode.
export const InterpolationMode = {
	None: 0,
	InOutCubic: 1,
	InOutQuintic: 2,
	InOutSine: 3,
	InQuintic: 4,
	InQuartic: 5,
	InCubic: 6,
	InQuadratic: 7,
	InElastic: 8,
	InElasticSmall: 9,
	InElasticBig: 10,
	InSine: 11,
	InBack: 12,
	OutQuintic: 13,
	OutQuartic: 14,
	OutCubic: 14,
	OutInCubic: 15,
	OutInQuartic: 16,
	OutElastic: 17,
	OutElasticSmall: 18,
	OutElasticBig: 19,
	OutSine: 20,
	OutBack: 21,
	OutBackCubic: 22,
	OutBackQuartic: 23,
	BackInCubic: 24,
	BackInQuartic: 25
};

/// Class for various interpolation methods.
export class Interp {

	/// Interpolate the specified t by InterpolationMode mode.
	/// T.
	/// InterpolationMode.
	static float(t, mode) {
		let interpT = 0;

		switch (mode) {
		case InterpolationMode.None:
			interpT = Interp.none(t, 0, 1);
			break;
		case InterpolationMode.InOutCubic:
			interpT = Interp.inOutCubic(t, 0, 1);
			break;
		case InterpolationMode.InOutQuintic:
			interpT = Interp.inOutQuintic(t, 0, 1);
			break;
		case InterpolationMode.InQuintic:
			interpT = Interp.inQuintic(t, 0, 1);
			break;
		case InterpolationMode.InQuartic:
			interpT = Interp.inQuartic(t, 0, 1);
			break;
		case InterpolationMode.InCubic:
			interpT = Interp.inCubic(t, 0, 1);
			break;
		case InterpolationMode.InQuadratic:
			interpT = Interp.inQuadratic(t, 0, 1);
			break;
		case InterpolationMode.OutQuintic:
			interpT = Interp.outQuintic(t, 0, 1);
			break;
		case InterpolationMode.OutQuartic:
			interpT = Interp.outQuartic(t, 0, 1);
			break;
		case InterpolationMode.OutCubic:
			interpT = Interp.outCubic(t, 0, 1);
			break;
		case InterpolationMode.OutInCubic:
			interpT = Interp.outInCubic(t, 0, 1);
			break;
		case InterpolationMode.OutInQuartic:
			interpT = Interp.outInCubic(t, 0, 1);
			break;
		case InterpolationMode.BackInCubic:
			interpT = Interp.backInCubic(t, 0, 1);
			break;
		case InterpolationMode.BackInQuartic:
			interpT = Interp.backInQuartic(t, 0, 1);
			break;
		case InterpolationMode.OutBackCubic:
			interpT = Interp.outBackCubic(t, 0, 1);
			break;
		case InterpolationMode.OutBackQuartic:
			interpT = Interp.outBackQuartic(t, 0, 1);
			break;
		case InterpolationMode.OutElasticSmall:
			interpT = Interp.outElasticSmall(t, 0, 1);
			break;
		case InterpolationMode.OutElasticBig:
			interpT = Interp.outElasticBig(t, 0, 1);
			break;
		case InterpolationMode.InElasticSmall:
			interpT = Interp.inElasticSmall(t, 0, 1);
			break;
		case InterpolationMode.InElasticBig:
			interpT = Interp.inElasticBig(t, 0, 1);
			break;
		case InterpolationMode.InSine:
			interpT = Interp.inSine(t, 0, 1);
			break;
		case InterpolationMode.OutSine:
			interpT = Interp.outSine(t, 0, 1);
			break;
		case InterpolationMode.InOutSine:
			interpT = Interp.inOutSine(t, 0, 1);
			break;
		case InterpolationMode.InElastic:
			interpT = Interp.outElastic(t, 0, 1);
			break;
		case InterpolationMode.OutElastic:
			interpT = Interp.outElastic(t, 0, 1);
			break;
		case InterpolationMode.InBack:
			interpT = Interp.inBack(t, 0, 1);
			break;
		case InterpolationMode.OutBack:
			interpT = Interp.outBack(t, 0, 1);
			break;
		default: interpT = 0;
			break;
		}

		return interpT;
	}

	/// Interpolate between two verctors by InterpolationMode mode
	static v3(v1, v2, t, mode) {
		let interpT = Interp.float(t, mode);
		return ((1 - interpT) * v1) + (interpT * v2);
	}

	/// Linear interpolation of value towards target.
	static lerpValue(value, target, increaseSpeed, decreaseSpeed) {
		if (value == target) return target;
		if (value < target) return Math.clamp(value + Time.deltaTime * increaseSpeed, -Infinity, target);
		else return Math.clamp(value - Time.deltaTime * decreaseSpeed, target, Infinity);
	}

	static none (t, b, c) { // time, b, distance,
		return b + c * (t);
	}

	static inOutCubic(t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (-2 * tc + 3 * ts);
	}

	static inOutQuintic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
	}

	static inQuintic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (tc * ts);
	}

	static inQuartic (t, b, c) {
		let ts = t * t;
		return b + c * (ts * ts);
	}

	static inCubic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (tc);
	}

	static inQuadratic (t, b, c) {
		let ts = t * t;
		return b + c * (ts);
	}

	static outQuintic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (tc * ts + -5 * ts * ts + 10 * tc + -10 * ts + 5 * t);
	}

	static outQuartic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (-1 * ts * ts + 4 * tc + -6 * ts + 4 * t);
	}

	static outCubic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (tc + -3 * ts + 3 * t);
	}

	static outInCubic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (4 * tc + -6 * ts + 3 * t);
	}

	static outInQuartic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (6 * tc + -9 * ts + 4 * t);
	}

	static backInCubic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c *(4 * tc + -3 * ts);
	}

	static backInQuartic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (2 * ts * ts + 2 * tc + -3 * ts);
	}

	static outBackCubic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (4 * tc + -9 * ts + 6 * t);
	}

	static outBackQuartic (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (-2 * ts * ts + 10 * tc + -15 * ts + 8 * t);
	}

	static outElasticSmall (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t);
	}

	static outElasticBig (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b+c*(56*tc*ts + -175*ts*ts + 200*tc + -100*ts + 20*t);
	}

	static inElasticSmall (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (33 * tc * ts + -59 * ts * ts + 32 * tc + -5 * ts);
	}

	static inElasticBig (t, b, c) {
		let ts = t * t;
		let tc = ts * t;
		return b + c * (56 * tc * ts + -105 * ts * ts + 60 * tc + -10 * ts);
	}

	static inSine (t, b, c) {
		c -= b;
		return -c * Math.cos(t / 1 * (Math.PI / 2)) + c + b;
	}

	static outSine (t, b, c) {
		c -= b;
		return c * Math.sin(t / 1 * (Math.PI / 2)) + b;
	}

	static inOutSine (t, b, c) {
		c -= b;
		return -c / 2 * (Math.cos(Math.PI * t / 1) - 1) + b;
	}

	static inElastic (t, b, c) {
		c -= b;

		let d = 1;
		let p = d * .3;
		let s = 0;
		let a = 0;

		if (t == 0) return b;

		if ((t /= d) == 1) return b + c;

		if (a == 0 || a < Math.abs(c)) {
			a = c;
			s = p / 4;
		}
		else {
			s = p / (2 * Math.PI) * Math.asin(c / a);
		}

		return -(a * Math.pow(2, 10 * (t-=1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	}

	static outElastic (t, b, c) {
		c -= b;

		let d = 1;
		let p = d * .3;
		let s = 0;
		let a = 0;

		if (t == 0) return b;

		if ((t /= d) == 1) return b + c;

		if (a == 0 || a < Math.abs(c)){
			a = c;
			s = p / 4;
		}
		else {
			s = p / (2 * Math.PI) * Math.asin(c / a);
		}

		return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
	}

	static inBack(t, b, c){
		c -= b;
		t /= 1;
		let s = 1.70158;
		return c * (t) * t * ((s + 1) * t - s) + b;
	}

	static outBack (t, b, c) {
		let s = 1.70158;
		c -= b;
		t = (t / 1) - 1;
		return c * ((t) * t * ((s + 1) * t + s) + 1) + b;
	}
}
