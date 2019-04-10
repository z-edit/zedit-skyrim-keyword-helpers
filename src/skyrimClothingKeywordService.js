ngapp.service('skyrimClothingKeywordService', function(keywordService) {
    let service = this;

    // PRIVATE
    let getClothingFlag = rec => {
        return xelib.GetEnabledFlags(rec, '[BODT|BOD2]\\First Person Flags')
            .find(flag => service.clothingPartRules.hasOwnProperty(flag));
    };

    // INHERITED FUNCTIONS
    // getClothingPart, inferClothingPart,
    // getClothingPartKeyword, setClothingPartKeyword
    keywordService.buildFunctions(this, 'ClothingPart', {
        expr: /^Clothing(\w+)/,
        getExpr: str => new RegExp('Clothing' + str + '$'),
        getRuleKey: getClothingFlag,
        rules: `${modulePath}\\resources\\skyrimClothingPartRules.json`
    });
});