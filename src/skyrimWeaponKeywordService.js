ngapp.service('skyrimWeaponKeywordService', function(keywordService, keywordRuleService) {
    const weapTypeExpr = /WeapType(\w+)/;

    let service = this;

    // PRIVATE
    let getAnimType = rec => xelib.GetValue(rec, 'DNAM\\Animation Type');
    let getWeapTypeExpr = str => new RegExp('WeapType' + str + '$');

    // INHERITED FUNCTIONS
    // inferWeaponType
    keywordRuleService.buildFunctions(service, 'WeaponType', getAnimType);
    // getWeaponType, getWeaponTypeKeyword, setWeaponTypeKeyword
    keywordService.buildFunctions(service, 'WeaponType', weapTypeExpr, getWeapTypeExpr);
});