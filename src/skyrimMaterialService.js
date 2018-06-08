/* There's a typo in a Dawnguard.esm keyword which forces us to use Materi[ae]l
   in our regex. (see DLC1ArmorMaterielFalmerHeavyOriginal [KYWD:02012CD0])
   In addition, Dragonborn.esm weapon keywords are in the form
   DLC2WeaponMaterial(\w+) where other weapon keywords are in the form
   WeapMaterial(\w+), forcing us to use Weap(?:on) in our regex. */
ngapp.service('skyrimMaterialService', function(keywordService) {
    const materialExpr = /(?:Armor|Weap(?:on)?)Materi[ae]l(\w+)/,
        materialExprMap = {
            'WEAP': 'Weap(?:on)?Materi[ae]l',
            'ARMO': 'Armor?Materi[ae]l'
        };

    let service = this;

    // PRIVATE
    let getMaterialExpr = (str, rec) => {
        let sig = xelib.Signature(rec);
        return new RegExp(materialExprMap[sig] + str + '$');
    };

    // INHERITED FUNCTIONS
    // getMaterial, getMaterialKeyword, setMaterialKeyword
    keywordService.buildFunctions(service, 'Material', materialExpr,
        null, getMaterialExpr);
});