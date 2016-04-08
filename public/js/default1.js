'use-strict';

var thePRE = document.getElementsByTagName('pre');
// console.log(thePRE);

var lines = thePRE[0].textContent;
console.log(thePRE[0].textContent.split('\n'));


var length = thePRE[0].textContent.split('\n').length;
var content = thePRE[0].textContent.split('\n');

for(var i = 0; i < length; i++) {
  console.log(content[i])
}
//
// for(var i = 0; i < length; i++) {
//   //console.log(content[i]);
//   var items = content[i].split('/');
//   console.log(items);
// }
//
// console.log(items.length);
// console.log(items[0][0]);
// console.log(items[0][1]);
