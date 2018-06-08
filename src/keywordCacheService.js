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