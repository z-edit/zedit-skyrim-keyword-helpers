ngapp.service('skyrimVendorKeywordService', function(keywordService, keywordRuleService) {
    const vendorExpr = /^Vendor(?:Item)?(\w+)/;

    let service = this;

    // PRIVATE
    let getVendorExpr = str => new RegExp('Vendor(?:Item)?' + str + '$');

    // INHERITED FUNCTIONS
    // inferClothingPart
    keywordRuleService.buildFunctions(service, 'Vendor', xelib.Signature);
    // getVendor, getVendorKeyword, setVendorKeyword
    keywordService.buildFunctions(service, 'Vendor', vendorExpr, getVendorExpr);
});