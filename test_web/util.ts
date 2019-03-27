// test index
export function successCallback(res) {
    try {
        console.assert(!res.code, res)
    } catch (e) {
        console.assert(false, res)
    }
}

export function errorCallback(err) {
    console.assert(false, err)
}

export function log(bool, ...objects) {
    if (bool) {
        console.log('OK', ...objects);
    } else {
        console.assert(false, ...objects);
    }
}

export function isSuccess(err, res?) {
    let bool = false;
    if (arguments.length === 2) {
        bool = !(!err || err.code || err instanceof Error || res.code);
    } else if (arguments.length === 1) {
        bool = !(!err || err.code || err instanceof Error);
    }
    return bool;
}

export function deepEqual(a, b) {
    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (Object.keys(a).length !== Object.keys(b).length) return false;
        for (let key in a) if (!deepEqual(a[key], b[key])) return false;
        return true;
    } else return a === b
}