var testTokenizer = function (input, expect) {
  console.log("*************Tokenize****************");

  let test = new JOITokenizer(input);
  let res = [];
  for (let i = 0; !test.isEmpty(); i++)
    res[i] = test.nextToken();
  let resultString = JSON.stringify(res);
  if (resultString.valueOf() !== expect.valueOf())
    console.log("TOKENIZER BUG!! " + input);
};

var testComp = function (input, expect) {
  console.log("*************TEST****************");
  console.log(input);
  let res = JOIParser.parse(input);
  console.log(res);
  console.log(JSON.stringify(res, undefined, 2));
  console.log("*********************************");
};
let test1 = '[{"type":"name","value":"A"},{"type":"@","value":"@"},{"type":"name","value":"a"},{"type":":","value":":"},{"type":"\"","value":"hello"},{"type":",","value":","},{"type":"name","value":"b"},{"type":":","value":":"},{"type":"number","value":2},{"type":",","value":","},{"type":"name","value":"c"},{"type":":","value":":"},{"type":"name","value":"goFigure"},{"type":",","value":","},{"type":"name","value":"d"},{"type":":","value":":"},{"type":"number","value":5},{"type":"space","value":"  "},{"type":"name","value":"C"},{"type":"@","value":"@"},{"type":"name","value":"A"},{"type":"!","value":"!"},{"type":"name","value":"a"},{"type":":","value":":"},{"type":"operator","value":"+"},{"type":"\"","value":" JOI"},{"type":",","value":","},{"type":"name","value":"b"},{"type":":","value":":"},{"type":"operator","value":"/"},{"type":"number","value":2},{"type":",","value":","},{"type":"name","value":"d"},{"type":":","value":":"},{"type":"number","value":-1},{"type":"space","value":" "},{"type":"name","value":"C"},{"type":"!","value":"!"},{"type":",","value":","},{"type":",","value":","},{"type":"operator","value":"+"},{"type":"number","value":2}]';
testTokenizer(' A@a:"hello",b:2,c:goFigure,d:5  C@A!a:+" JOI",b:/2,d:-1 C!,,+2 ', test1);
testComp(' A@a:"hello",b:2,c:goFigure,d:5  C@A!a:+" JOI",b:/2,d:-1 C!,,+2 ', null);
// testComp(' A@"hello" B@goFigure C@A!B! C!', null);
JOI.parse(' A@"hello " B@+goFigure C@A!B! C!', false);
// JOI.parse(' A@a:"hello",b:2,c:goFigure,d:5  C@A!a:+" JOI",b:/2,d:-1 C!,,+2 ', false);

// testComp("a [b] c",
//   null);
//
// testComp("a|b  [c d]  f|e|[a b]  b|a  @a|[c c]|b|[a|a c]  g|+0.9 **.7 /2 2 -2.3 *3 +-3 /-.6234 @a ,,5 name:'John and Oliver and Ingvill'",
//   null);
//
// testComp("a@c",
//   null);
//
// testComp("a!c!d",
//   null);
//
// testTokenizer("a|b  [c d]  f|e|[a b]  b|a  @a|[c c]|b|[a|a c]  g|+0.9 **.7 /2 2 -2.3 *3 +-3 /-.6234 @a ,,5 name:'John and Oliver and Ingvill'",
//   null, null);