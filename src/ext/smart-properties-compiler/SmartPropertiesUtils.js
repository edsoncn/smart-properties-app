"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartPropertiesUtils = void 0;
class SmartPropertiesUtils {
    static equalsToken(token, values) {
        for (let value of values) {
            if (this.validateReservedWord(token, value)) {
                return true;
            }
        }
        return false;
    }
    static equals(token, values) {
        return SmartPropertiesUtils.equalsToken(token.getValue(), values);
    }
    static validateReservedWord(tokenValue, reservedWord) {
        return tokenValue.charAt(0) === reservedWord.charAt(0) && tokenValue.toUpperCase() === reservedWord;
    }
}
exports.SmartPropertiesUtils = SmartPropertiesUtils;
