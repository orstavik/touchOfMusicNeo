class Finger {
  constructor(options) {
    this.row = options.row;
    this.finger = options.finger;
    this.alt = options.alt;
  }

  fingerName() {
    var fingerArray = [
			"RightThumb",
			"RightIndex",
			"RightLongfinger",
			"RightRingfinger",
			"RightPinky",
			"LeftThumb",
			"LeftIndex",
			"LeftLongfinger",
			"LeftRingfinger",
			"LeftPinky"
    ];
		return fingerArray[this.finger];
  }
}