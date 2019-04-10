ngapp.service('skyrimWeaponKeywordService', function(keywordService) {
    // INHERITED FUNCTIONS
    // getWeaponType, inferWeaponType,
    // getWeaponTypeKeyword, setWeaponTypeKeyword
    keywordService.buildFunctions(this, 'WeaponType', {
        expr: /WeapType(\w+)/,
        getExpr: str => new RegExp('WeapType' + str + '$'),
        getRuleKey: rec => xelib.GetValue(rec, 'DNAM\\Animation Type'),
        rules: `${modulePath}\\resources\\skyrimWeaponTypeRules.json`
    });
});