/* global zedit, xelib */
let {skyrimMaterialService} = zedit,
    log = console.log;

log('== Testing skyrimMaterialService ==');

// HELPER FUNCTIONS
let logReducedObj = function(records, getKey) {
    let obj = {};
    records.forEach(rec => {
        let key = getKey(rec);
        if (!obj.hasOwnProperty(key)) obj[key] = [];
        obj[key].push(xelib.LongName(rec));
    });

    log(JSON.stringify(obj, null, 2));
};

let getMaterialStr = rec => {
    return skyrimMaterialService.getMaterial(rec) + '';
};

let getMaterialKeywordValue = rec => {
    let keyword = skyrimMaterialService.getMaterialKeyword(rec);
    return keyword ? xelib.GetValue(keyword) : 'undefined';
};

// LOAD WEAPONS
log('Loading weapon records...');
let weapons = xelib.GetRecords(0, 'WEAP').filter(rec => {
    return xelib.HasElement(rec, 'FULL') &&
        !xelib.HasElement(rec, 'CNAM') &&
        !xelib.HasElement(rec, 'EITM') &&
        xelib.HasElement(rec, 'KWDA') &&
        (xelib.GetValue(rec, 'DNAM\\Animation Type') !== 'Staff');
});

log(`${weapons.length} weapons found.`);

// LOAD ARMORS
log('Loading armor records...');
let armors = xelib.GetRecords(0, 'ARMO').filter(rec => {
    return xelib.HasElement(rec, 'FULL') &&
        !xelib.HasElement(rec, 'CNAM') &&
        !xelib.HasElement(rec, 'EITM') &&
        xelib.HasElement(rec, 'KWDA');
});

log(`${armors.length} armors found.`);

// test getMaterial
logReducedObj(weapons, getMaterialStr);
logReducedObj(armors, getMaterialStr);

// test getMaterialKeyword
logReducedObj(weapons, getMaterialKeywordValue);
logReducedObj(armors, getMaterialKeywordValue);

// test setMaterialKeyword
// TODO