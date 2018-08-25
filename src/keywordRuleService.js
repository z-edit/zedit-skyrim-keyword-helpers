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