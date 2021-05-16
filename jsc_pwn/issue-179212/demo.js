var p = new Proxy({}, {
    getPrototypeOf: function() {
    print(123);
    return {};
    }
})
for( let i in p ) {
    print(i)
}
