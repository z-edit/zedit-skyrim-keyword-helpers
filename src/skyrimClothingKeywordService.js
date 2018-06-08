ngapp.service('skyrimClothingKeywordService', function(keywordService, keywordRuleService) {
    const clothingPartExpr = /^Clothing(\w+)/,
        flagsPath = '[BODT|BOD2]\\First Person Flags';

    let service = this;

    // PRIVATE
    let getArmorFlag = rec => {
        return xelib.GetEnabledFlags(rec, flagsPath)
            .find(flag => service.clothingPartRules.hasOwnProperty(flag));
    };
    let getClothingPartExpr = str => new RegExp('Clothing' + str + '$');

    // INHERITED FUNCTIONS
    // inferClothingPart
    keywordRuleService.buildFunctions(service, 'ClothingPart', getArmorFlag);
    // getClothingPart, getClothingPartKeyword, setClothingPartKeyword
    keywordService.buildFunctions(service, 'ClothingPart', clothingPartExpr, getClothingPartExpr);
});