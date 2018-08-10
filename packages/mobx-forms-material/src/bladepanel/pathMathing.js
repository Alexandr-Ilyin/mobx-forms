"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MatchRule {
    constructor(path) {
        this.names = [];
        this.path = path;
        this.re = new RegExp(path.replace(/\{.*?\}/g, v => {
            this.names.push(v.substring(1, v.length - 1));
            return "(.*?)";
        }), "i");
    }
    getMatchParams(segment) {
        let m = this.re.exec(segment);
        if (!m)
            return null;
        let res = this.names.reduce((p, name, i) => {
            p[name] = m[i + 1];
            return p;
        }, {});
        res['path'] = this.path;
        res['segment'] = segment;
        return res;
    }
}
exports.MatchRule = MatchRule;
