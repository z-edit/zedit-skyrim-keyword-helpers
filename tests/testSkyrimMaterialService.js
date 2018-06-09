/* global zedit, xelib */
let {skyrimMaterialService} = zedit,
    log = console.log;

// TEST WEAPONS
log('== Testing Weapon Materials ==');
let weapons = xelib.GetRecords(0, 'WEAP').filter(rec => {
    return xelib.HasElement(rec, 'FULL') &&
        !xelib.HasElement(rec, 'CNAM') &&
        !xelib.HasElement(rec, 'EITM') &&
        xelib.HasElement(rec, 'KWDA') &&
        (xelib.GetValue(rec, 'DNAM\\Animation Type') !== 'Staff');
});

log(`${weapons.length} weapons found.`);

// test getMaterial
let obj = {};
weapons.forEach(rec => {
    let material = skyrimMaterialService.getMaterial(rec) + '';
    if (!obj.hasOwnProperty(material)) obj[material] = [];
    obj[material].push(xelib.LongName(rec));
});

log(JSON.stringify(obj, null, 2));
