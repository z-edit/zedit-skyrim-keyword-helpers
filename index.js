/* global ngapp, xelib, modulePath */
let loadResource = function(resourceName) {
    let resourcePath = `${patcherPath}\\resources\\${resourceName}.json`;
    return fh.loadJsonFile(resourcePath);
};

//= require src/*.js