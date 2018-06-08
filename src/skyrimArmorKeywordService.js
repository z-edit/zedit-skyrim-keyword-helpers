ngapp.service('skyrimArmorKeywordService', function(keywordService, keywordRuleService) {
    const armorPartExpr = /^Armor(?!Materi[ae]l|Heavy|Light|Clothing|Jewelry)(\w+)/,
        armorTypeExpr = /^Armor(Heavy|Light|Clothing|Jewelry)$/,
        flagsPath = '[BODT|BOD2]\\First Person Flags';

    let service = this;

    // PRIVATE
    let getArmorFlag = rec => {
        return xelib.GetEnabledFlags(rec, flagsPath)
            .find(flag => service.armorPartRules.hasOwnProperty(flag));
    };
    let getArmorType = rec => xelib.GetArmorType(rec);
    let getArmorExpr = str => new RegExp('Armor' + str + '$');

    // INHERITED FUNCTIONS
    // inferArmorPart
    keywordRuleService.buildFunctions(service, 'ArmorPart', getArmorFlag);
    // inferArmorType
    keywordRuleService.buildFunctions(service, 'ArmorType', getArmorType);
    // getArmorPart, getArmorPartKeyword, setArmorPartKeyword
    keywordService.buildFunctions(service, 'ArmorPart', armorPartExpr, getArmorExpr);
    // getArmorType, getArmorTypeKeyword, setArmorTypeKeyword
    keywordService.buildFunctions(service, 'ArmorType', armorTypeExpr, getArmorExpr);
});