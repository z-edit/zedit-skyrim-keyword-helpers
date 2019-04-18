/* global ngapp, xelib, modulePath */

// == BEGIN ANGULAR SERVICES ==
ngapp.service('keywordCacheService', function() {
    let service = this;

    // PRIVATE
    let reportMatches = function(matches, expr) {
        let lastMatch = matches.last();
        logger.warn(`Found multiple matches for ${expr}, using ${lastMatch}`);
        logger.warn(matches.slice(0, -1)
            .reduce((str, m) => `${str}\r\n- ${m}`, 'Duplicates:'));
    };

    // PUBLIC API
    this.cache = {};
    this.cacheBuilt = false;

    this.buildCache = function() {
        xelib.WithEachHandle(xelib.GetRecords(0, 'KYWD'), rec => {
            service.cache[xelib.EditorID(rec)] = xelib.LongName(rec);
        });
        service.cacheBuilt = true;
    };

    this.resolveKeyword = function(rec, str, getExpr) {
        if (service.cache.hasOwnProperty(str)) return service.cache[str];
        let expr = getExpr && getExpr(str, rec);
        if (!expr) throw new Error(`Could not resolve keyword matching ${str} for ${xelib.LongName(rec)}`);
        let matches = Object.keys(service.cache)
            .filter(keyword => expr.test(keyword));
        if (!matches.length) throw new Error(`Could not resolve keyword matching ${expr} for ${xelib.LongName(rec)}`);
        if (match.length > 1) reportMatches(matches, search);
        return matches.last();
    };
});
ngapp.service('keywordRuleService', function() {
    let conditionFunctions = {
        'HasKeyword': function(rec, condition) {
            return xelib.HasKeyword(rec, condition.keyword);
        },
        'TestValue': function(rec, cond, valueCache) {
            if (!valueCache.hasOwnProperty(cond.path))
                valueCache[cond.path] = xelib.GetValue(rec, cond.path);
            let value = valueCache[cond.path];
            if (cond.hasOwnProperty('equals'))
                return value === cond.equals;
            if (cond.hasOwnProperty('matches'))
                return cond.expr.test(value);
        },
        'FlagEnabled': function(rec, cond, valueCache) {
            if (!valueCache.hasOwnProperty(cond.path))
                valueCache[cond.path] = xelib.GetEnabledFlags(rec, cond.path);
            let flags = valueCache[cond.path],
                matches = flags.filter(flag => cond.flags.includes(flag));
            return matches.length > 1;
        }
    };

    let findMatchingRule = function(rules, rec) {
        if (!rules) return;
        if (rules.constructor !== Array) return rules;
        let valueCache = {};
        return rules.find(({condition}) => {
            if (!condition) return true;
            let fn = conditionFunctions[condition.function || 'TestValue'];
            return fn(rec, condition, valueCache);
        });
    };

    this.addConditionFunction = function(key, fn) {
        conditionFunctions[key] = fn;
    };

    this.buildInfer = function(service, key, options) {
        let {getRuleKey, rules} = options,
            rulesKey = `${key.uncapitalize()}Rules`;
        if (!rules) return;

        let getRules = function() {
            return typeof rules === 'object' ? rules : fh.loadJsonFile(rules);
        };

        let loadRules = function() {
            service[rulesKey] = getRules();
            Object.values(service[rulesKey]).forEach(rules => {
                if (rules.constructor !== Array) return;
                rules.forEach(r => {
                    if (!r.condition || !r.condition.matches) return;
                    r.condition.expr = new RegExp(r.condition.matches);
                });
            });
        };

        service[`infer${key}`] = function(rec) {
            if (!service[rulesKey]) loadRules();
            let ruleKey = getRuleKey(rec),
                rules = service[rulesKey][ruleKey],
                rule = findMatchingRule(rules, rec);
            return rule ? rule.keyword : defaultValue;
        };

        return service[`infer${key}`];
    };
});
ngapp.service('keywordService', function(keywordCacheService, keywordRuleService) {
    let {cache, buildCache, resolveKeyword} = keywordCacheService;
    let {buildInfer} = keywordRuleService;

    this.buildFunctions = function(service, key, options) {
        let {expr, getExpr} = options;

        let infer = buildInfer(service, key, options);

        let get = function(rec) {
            if (!xelib.HasElement(rec, 'KWDA')) return;
            let elements = xelib.GetElements(rec, 'KWDA');
            return xelib.WithHandles(elements, keywords => {
                for (let i = 0; i < keywords.length; i++) {
                    let keyword = xelib.GetRefEditorID(keywords[i], ''),
                        match = keyword.match(expr);
                    if (match) return match[1];
                }
            });
        };

        let getKeyword = function(rec) {
            if (!xelib.HasElement(rec, 'KWDA')) return;
            let elements = xelib.GetElements(rec, 'KWDA');
            return xelib.WithHandles(elements, keywords => {
                for (let i = 0; i < keywords.length; i++) {
                    let keyword = keywords[i],
                        edid = xelib.GetRefEditorID(keyword, '');
                    if (expr.test(edid)) return xelib.GetElement(keyword);
                }
            });
        };

        let addKeyword = function(rec, value) {
            if (!value) return;
            let keyword = getKeyword(rec);
            if (!keyword) return xelib.AddKeyword(rec, value);
            xelib.SetValue(keyword, value);
            return keyword;
        };

        let setKeyword = function(rec, str) {
            if (!str) str = infer && infer(rec);
            if (!str) return;
            if (!keywordCacheService.cacheBuilt) buildCache();
            let keyword = resolveKeyword(rec, str, getExpr);
            return addKeyword(rec, cache[keyword]);
        };

        service[`get${key}`] = get;
        service[`get${key}Keyword`] = getKeyword;
        service[`set${key}Keyword`] = setKeyword;
    };
});
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
        rules: `${modulePath}\\resources\\skyrimArmorPartRules.json`
    });

    // getArmorType, inferArmorType,
    // getArmorTypeKeyword, setArmorTypeKeyword
    keywordService.buildFunctions(this, 'ArmorType', {
        expr: /^Armor(Heavy|Light|Clothing|Jewelry)$/,
        getExpr: getArmorExpr,
        getRuleKey: xelib.GetArmorType,
        rules: `${modulePath}\\resources\\skyrimArmorTypeRules.json`
    });
});
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
/* There's a typo in a Dawnguard.esm keyword which forces us to use Materi[ae]l
   in our regex. (see DLC1ArmorMaterielFalmerHeavyOriginal [KYWD:02012CD0])
   In addition, Dragonborn.esm weapon keywords are in the form
   DLC2WeaponMaterial(\w+) where other weapon keywords are in the form
   WeapMaterial(\w+), forcing us to use Weap(?:on) in our regex. */
ngapp.service('skyrimMaterialService', function(keywordService) {
    const materialExprMap = {
        WEAP: 'Weap(?:on)?Materi[ae]l',
        ARMO: 'Armor?Materi[ae]l'
    };

    // INHERITED FUNCTIONS
    // getMaterial, getMaterialKeyword, setMaterialKeyword
    keywordService.buildFunctions(this, 'Material', {
        expr: /(?:Armor|Weap(?:on)?)?Materi[ae]l(\w+)/,
        getExpr: (str, rec) => {
            let sig = xelib.Signature(rec);
            return new RegExp(materialExprMap[sig] + str + '$');
        }
    });
});
ngapp.service('skyrimVendorKeywordService', function(keywordService) {
    // INHERITED FUNCTIONS
    // getVendor, inferVendor,
    // getVendorKeyword, setVendorKeyword
    keywordService.buildFunctions(this, 'Vendor', {
        expr: /^Vendor(?:Item)?(\w+)/,
        getExpr: str => new RegExp('Vendor(?:Item)?' + str + '$'),
        getRuleKey: xelib.Signature,
        rules: `${modulePath}\\resources\\skyrimVendorRules.json`
    });
});
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
// == END ANGULAR SERVICES ==

ngapp.run(function(interApiService, skyrimArmorKeywordService, skyrimClothingKeywordService, skyrimMaterialService, skyrimVendorKeywordService, skyrimWeaponKeywordService, keywordCacheService) {
    interApiService.register({
        api: {
            skyrimArmorKeywordService,
            skyrimClothingKeywordService,
            skyrimMaterialService,
            skyrimVendorKeywordService,
            skyrimWeaponKeywordService,
            keywordCacheService
        }
    });
});