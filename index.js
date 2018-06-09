/* global ngapp, xelib, modulePath */
let loadResource = function(resourceName) {
    let resourcePath = `${patcherPath}\\resources\\${resourceName}.json`;
    return fh.loadJsonFile(resourcePath);
};

// == BEGIN ANGULAR SERVICES ==
//= require src/*.js
// == END ANGULAR SERVICES ==

ngapp.run(function(interApiService, skyrimArmorKeywordService, skyrimClothingKeywordService, skyrimMaterialService, skyrimVendorKeywordService, skyrimWeaponKeywordService) {
    interApiService.register({
        api: {
            skyrimArmorKeywordService,
            skyrimClothingKeywordService,
            skyrimMaterialService,
            skyrimVendorKeywordService,
            skyrimWeaponKeywordService
        }
    });
});