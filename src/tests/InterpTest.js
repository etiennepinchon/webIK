import { InterpolationMode, Interp } from '../tools/Interp';

export default class InterpTest {

  static run() {
    console.log("\n\nRunning InterpTest\n");
    InterpTest.float();
    InterpTest.v3();
  }

  static float() {
    let t = 0.4;
    let mode = InterpolationMode.OutCubic;
    let result = Interp.float(t, mode);

    console.log("float", result);
  }

  static v3() {
    let v1 = new Vector3(12, 13, 14);
    let v2 = new Vector3(42, 22, 11);
    let t = 0.4;
    let mode = InterpolationMode.OutCubic;
    let result = Interp.v3(v1, v2, t, mode);

    console.log("v3", result);
  }

}
