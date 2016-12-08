const operArr = ["+","-","/","*","**"];

var testJOI = function() {
  let str1Arr = [];
  let tmplArr = [];
  for (let i = 1; i <= 2; i++) {
    tmplArr.push("tmpl"+i+"!");
    str1Arr[i] = "tmpl"+i+"@";
    str1Arr[i] += "numProp:"+i+",";
    str1Arr[i] += "strProp:'I`m a template #"+i+"'";
    console.log(str1Arr[i]);
  }
  
  let str2Arr = [];
  for (let i = 0; i < tmplArr.length; i++) {
    str2Arr.push(tmplArr[i]);
  };

  str2Arr.push(tmplArr.join("|"));
  
  // str2Arr.push(tmplArr.join("")); // doesn't work

  for (let i = 0; i < operArr.length; i++) {
    str2Arr.push(tmplArr[0]+"numProp:"+operArr[i]+"2"); // with or without 'numProp' doesn't work
  }

  str2Arr.push(tmplArr[1]+",,");
 
  str = str1Arr.join(" ") + " " + str2Arr.join(" ");
  console.log(str2Arr.join(" "));
  console.log(str);
  return JOI.parse(str);
}