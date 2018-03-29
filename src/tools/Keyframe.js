export default class Keyframe {

  get time() {
    return this.m_Time;
  }
  set time(value) {
    this.m_Time = value;
  }

  get value() {
    return this.m_Value;
  }
  set value(value) {
    this.m_Value = value;
  }

  get inTangent() {
    return this.m_InTangent;
  }
  set inTangent(value) {
    this.m_InTangent = value;
  }

  get outTangent() {
    return this.m_OutTangent;
  }
  set outTangent(value) {
    this.m_OutTangent = value;
  }

  get tangentMode() {
    return this.m_TangentMode;
  }
  set tangentMode(value) {
    this.m_TangentMode = value;
  }

  constructor(time, value, inTangent = 0, outTangent = 0) {
    this.m_Time = time;
    this.m_Value = value;
    this.m_InTangent = inTangent;
    this.m_OutTangent = outTangent;
    this.m_TangentMode = 0;
  }
}
