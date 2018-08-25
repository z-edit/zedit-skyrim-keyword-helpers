ngapp.service('skyrimArmorKeywordService', function(keywordService) {
    let service = this;

    // PRIVATE
    let getArmorFlag = rec => {
        return xelib.GetEnabledFlags(rec, '[BODT|BOD2]\\First Person Flags')
            .find(flag => service.armorPartRules.hasOwnProperty(flag));
    };
    let getArmorExpr = str => new RegExp('Armor' + str + '$');

    // INHERITED FUNCTIONS
    // getArmorPart, inferArmorPart,
    // getArmorPartKeyword, setArmorPartKeyword
    keywordService.buildFunctions(this, 'ArmorPart', {
        expr: /^Armor(?!Materi[ae]l|Heavy|Light|Clothing|Jewelry)(\w+)/,
        getExpr: getArmorExpr,
        getRuleKey: getArmorFlag,
        rules: `${patcherPath}\\resources\\skyrimArmorPartRules.json`
    });

    // getArmorType, inferArmorType,
    // getArmorTypeKeyword, setArmorTypeKeyword
    keywordService.buildFunctions(this, 'ArmorType', {
        expr: /^Armor(Heavy|Light|Clothing|Jewelry)$/,
        getExpr: getArmorExpr,
        getRuleKey: xelib.GetArmorType,
        rules: `${patcherPath}\\resources\\skyrimArmorTypeRules.json`
    });
});