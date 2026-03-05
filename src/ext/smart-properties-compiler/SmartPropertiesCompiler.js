"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartPropertiesException = exports.Variable = exports.Node = exports.Value = exports.Funct = exports.Assignment = exports.Block = exports.Token = exports.SmartPropertiesCompiler = void 0;
const node_fetch_1 = require("node-fetch");
const SmartPropertiesLexicalAnalyzer_1 = require("./SmartPropertiesLexicalAnalyzer");
const SmartPropertiesSemanticAnalyzer_1 = require("./SmartPropertiesSemanticAnalyzer");
const SmartPropertiesSyntaxAnalyzer_1 = require("./SmartPropertiesSyntaxAnalyzer");
const SmartPropertiesUtils_1 = require("./SmartPropertiesUtils");
const SmartPropertiesWords_1 = require("./SmartPropertiesWords");
const ErrorCodes = {
    ERROR_001: "Compile Error: {0}",
    ERROR_101: "Compile Error Parameter {0} not found",
    ERROR_201: "Compile Error The condition isn't a boolean expression",
    ERROR_301: "Compile Error Inconsistent types in expression",
    ERROR_302: "Compile Error Parameter type incorrect: {0}",
    ERROR_401: "Compile Error Properties value wasn't returned in program",
    ERROR_402: "Compile Error Properties class {0} doesn't match with returned type of program",
    ERROR_501: "Compile Error Function parameter {0} has wrong type. Expect {1}, received {2}",
    ERROR_502: "Compile Error Function {0} not found",
    ERROR_503: "Compile Error Function wrong parameter size. Expect {0}, received {1}",
    ERROR_504: "Compile Error Function missing return value. Function name: {0}",
    ERROR_505: "Compile Error Function array index is out of. Expect index range [0...{0}], received {1}"
};
class SmartPropertiesApi {
    constructor(apiUrl, tenant, workspace, apiToken) {
        this.smartPropertiesCodeMap = {};
        this.smartPropertiesCodeMapLoaded = false;
        this.apiUrl = apiUrl;
        this.tenant = tenant;
        this.workspace = workspace;
        this.apiToken = apiToken;
    }
    initialize(callback) {
        this.loadSmartPropertiesCodeMap(callback);
    }
    executeLexicalAnalyzer(code) {
        let lexicalAnalyzer = new SmartPropertiesLexicalAnalyzer_1.SmartPropertiesLexicalAnalyzer(code);
        lexicalAnalyzer.execute();
        return lexicalAnalyzer.getTokens();
    }
    executeSemanticAnalyzer(code) {
        let analyzer = new SmartPropertiesSemanticAnalyzer_1.SmartPropertiesSemanticAnalyzer(code);
        analyzer.execute();
        if (analyzer.checkError()) {
            return new SmartPropertiesException(ErrorCodes.ERROR_001, [analyzer.getErrorMessage()]);
        }
        return analyzer.getProgram();
    }
    compile(program, variables, skipDefault) {
        let smartPropCompiler = new SmartPropertiesCompiler(this);
        let result = smartPropCompiler.compile(program, variables, skipDefault);
        let consoleStr = smartPropCompiler.getConsole();
        if (result instanceof SmartPropertiesException) {
            return result;
        }
        if (consoleStr !== '') {
            console.log('Console > ');
            console.log(consoleStr);
        }
        if (smartPropCompiler.wasDefaultReturned()) {
            console.log('Default Value was returned!');
        }
        return result;
    }
    getJSONString(program) {
        return SmartPropertiesSemanticAnalyzer_1.SmartPropertiesSemanticAnalyzer.getJSONString(program);
    }
    static validateFunction(token) {
        return SmartPropertiesSyntaxAnalyzer_1.SmartPropertiesSyntaxAnalyzer.validateFunction(token);
    }
    loadSmartPropertiesCodeMap(callback) {
        console.log('Loading Smart Property map');
        this.callSmartPropertiesCodesService().then((result) => {
            this.setSmartPropertiesCodeData(result);
            if (callback) {
                callback();
            }
        });
    }
    setSmartPropertiesCodeData(result) {
        for (let smartProperty of result) {
            console.log(' > ' + smartProperty.key);
            if (smartProperty.code) {
                this.smartPropertiesCodeMap[smartProperty.key] = SmartPropertiesCompiler.parseBlock(JSON.parse(smartProperty.code));
            }
        }
    }
    isSmartPropMapLoaded() {
        return this.smartPropertiesCodeMapLoaded;
    }
    getSmartPropertiesCodeBlockByKey(key) {
        return this.smartPropertiesCodeMap[key];
    }
    reset() {
        this.loadSmartPropertiesCodeMap();
    }
    callSmartPropertiesCodesService() {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.apiUrl + '/' + this.tenant + '/smart-property-code/' + this.workspace;
            let response = yield (0, node_fetch_1.default)(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.apiToken
                }
            });
            return yield response.json();
        });
    }
    getSmartPropertiesCodeMap() {
        return this.smartPropertiesCodeMap;
    }
}
exports.default = SmartPropertiesApi;
class SmartPropertiesCompiler {
    constructor(smartPropertiesApi) {
        this.smartPropertiesApi = smartPropertiesApi;
        this.defaultReturned = false;
        this.console = '';
    }
    compile(program, variables, skipDefault) {
        let existsDefaultValue = false;
        if (program.getDefaultValue() && program.getDefaultValue().isInitialized() && !skipDefault) {
            existsDefaultValue = true;
        }
        if (program.getType() === null) {
            if (existsDefaultValue) {
                this.defaultReturned = true;
                return program.getDefaultValue();
            }
            else {
                return null;
            }
        }
        let variablesMap = {};
        let returnVar = new Variable('');
        console.log('Variables IN :');
        for (let variable of variables) {
            console.log(' > name = ' + variable.getName() + ', value = ' + variable.toString());
            variablesMap[variable.getName()] = variable;
        }
        let result = this.compileBlock(program, variablesMap, returnVar);
        if (result instanceof SmartPropertiesException) {
            if (existsDefaultValue) {
                this.defaultReturned = true;
                return program.getDefaultValue();
            }
            else {
                return result;
            }
        }
        for (let name in variablesMap) {
            let value = variablesMap[name];
            let varFound = false;
            for (let variable of variables) {
                if (variable.getName() === name) {
                    variable.setValue(value);
                    varFound = true;
                    break;
                }
            }
            if (!varFound) {
                variables.push(variablesMap[name]);
            }
        }
        console.log('Variables OUT:');
        for (let variable of variables) {
            console.log(' > name = ' + variable.getName() + ', value = ' + variable.toString());
            variablesMap[variable.getName()] = variable;
        }
        if (returnVar.isInitialized()) {
            return returnVar;
        }
        else if (existsDefaultValue) {
            this.defaultReturned = true;
            return program.getDefaultValue();
        }
        else {
            return null;
        }
    }
    compileBlock(block, variables, returnVar) {
        if (block.getCondition() != null) {
            let value = this.evaluateExpression(block.getCondition(), variables, true);
            if (value instanceof Value) {
                if (value.isValueBoolean()) {
                    block.setConditionResult(value.getValueBoolean());
                    if (!block.getConditionResult()) {
                        return;
                    }
                }
                else {
                    return new SmartPropertiesException(ErrorCodes.ERROR_201, []);
                }
            }
            else {
                return value;
            }
        }
        let q = [];
        q = q.concat(block.getInstructions());
        let lastIfCondition = null;
        while (q.length > 0) {
            let instruction = q.shift();
            if (instruction instanceof Assignment) {
                let assignment = instruction;
                let variable = assignment.getVariable();
                let expression = assignment.getExpression();
                let value = this.evaluateExpression(expression, variables);
                if (value instanceof Node) {
                    variable.setValue(value);
                    variables[variable.getName()] = variable;
                    lastIfCondition = null;
                }
                else {
                    return value;
                }
            }
            else if (instruction instanceof Block) {
                let blockChild = instruction;
                if (lastIfCondition != null && lastIfCondition && blockChild.getName().indexOf("else") >= 0) {
                    continue;
                }
                let result = this.compileBlock(blockChild, variables, returnVar);
                if (result instanceof SmartPropertiesException) {
                    return result;
                }
                if (returnVar.isInitialized()) {
                    return;
                }
                lastIfCondition = null;
                if (blockChild.getName().indexOf("if") >= 0) {
                    lastIfCondition = blockChild.getConditionResult();
                }
                if (blockChild.getName() === 'while' && blockChild.getConditionResult()) {
                    q.unshift(blockChild);
                }
            }
            else if (instruction instanceof Funct) {
                let funct = instruction;
                let result = this.evaluateFunction(funct, variables);
                lastIfCondition = null;
                if (result instanceof SmartPropertiesException) {
                    return result;
                }
            }
        }
        if (block.getReturn() != null) {
            let value = this.evaluateExpression(block.getReturn(), variables);
            if (value instanceof Value) {
                returnVar.setValue(value);
            }
            else {
                return value;
            }
        }
    }
    evaluateExpression(node, variables, isBooleanOperator = false) {
        if (!this.hasChildren(node)) {
            if (node.isVariable()) {
                if (variables[node.getVariable()]) {
                    let varValue = variables[node.getVariable()];
                    if (!isBooleanOperator || varValue.isValueBoolean()) {
                        node.setValue(varValue);
                    }
                    else {
                        node.setValueBoolean(true);
                    }
                }
                else {
                    if (!isBooleanOperator) {
                        return new SmartPropertiesException(ErrorCodes.ERROR_101, [node.getVariable()]);
                    }
                    else {
                        node.setValueBoolean(false);
                    }
                }
            }
            else if (node.isFunction()) {
                let funct = node.getFunct();
                let value = this.evaluateFunction(funct, variables);
                if (value instanceof SmartPropertiesException) {
                    return value;
                }
                else {
                    if (value.isInitialized()) {
                        node.setValue(value);
                    }
                    else {
                        return new SmartPropertiesException(ErrorCodes.ERROR_504, [funct.getName()]);
                    }
                }
            }
        }
        else {
            let result = this.operateNodeChildren(node, variables);
            if (result instanceof SmartPropertiesException) {
                return result;
            }
        }
        return node;
    }
    evaluateFunction(funct, variables) {
        let name = funct.getName();
        let paramValues = [];
        for (let i = 0; i < funct.getParameters().length; i++) {
            let paramExpressin = funct.getParameters()[i];
            let value = this.evaluateExpression(paramExpressin, variables);
            if (value instanceof SmartPropertiesException) {
                return value;
            }
            else {
                paramValues.push(value);
            }
        }
        return this.executeFunction(name, paramValues, variables);
    }
    executeFunction(name, paramValues, variables) {
        switch (name) {
            case 'call': return this.executeCallFunction(paramValues, variables);
            case 'sqrt': return this.executeSquareRootFunction(paramValues);
            case 'array': return this.executeArrayFunction(paramValues);
            case 'get': return this.executeGetFunction(paramValues);
            case 'length': return this.executeLengthFunction(paramValues);
            case 'push': return this.executePushFunction(paramValues);
            case 'pop': return this.executePopFunction(paramValues);
            case 'unshift': return this.executeUnshiftFunction(paramValues);
            case 'shift': return this.executeShiftFunction(paramValues);
            case 'pushall': return this.executePushAllFunction(paramValues);
            case 'print': return this.executePrintFunction(paramValues);
            default: return new SmartPropertiesException(ErrorCodes.ERROR_502, [name]);
        }
    }
    executeCallFunction(paramValues, variables) {
        let funcParamsLength = 1;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0 = paramValues[0];
            if (!param0.isValueString()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'string', param0.getType()]);
            }
            else {
                let paramKey = param0.getValueString();
                let resultBlock = this.smartPropertiesApi.getSmartPropertiesCodeBlockByKey(paramKey);
                let returnVar = new Variable('');
                console.log(`Function call (${paramKey})`);
                let result = this.compileBlock(resultBlock, variables, returnVar);
                if (result instanceof SmartPropertiesException) {
                    return result;
                }
                return returnVar;
            }
        }
    }
    executeSquareRootFunction(paramValues) {
        let funcParamsLength = 1;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0 = paramValues[0];
            if (!param0.isValueFloat() && !param0.isValueInt()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'int/float', param0.getType()]);
            }
            else {
                let value = param0.isValueFloat() ? param0.getValueFloat() : param0.getValueInt();
                let squareValue = new Value();
                squareValue.setValueFloat(Math.sqrt(value));
                return squareValue;
            }
        }
    }
    executeArrayFunction(paramValues) {
        let valueArray = new Value();
        valueArray.setValueArray(paramValues);
        return valueArray;
    }
    executeGetFunction(paramValues) {
        let funcParamsLength = 2;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0Array = paramValues[0];
            let param1Index = paramValues[1];
            if (!param0Array.isValueArray()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'array', param0Array.getType()]);
            }
            else if (!param1Index.isValueInt()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [2, 'int', param1Index.getType()]);
            }
            else {
                let index = param1Index.getValueInt();
                let arraySize = param0Array.getValueArray().length;
                if (index < 0 || index >= arraySize) {
                    return new SmartPropertiesException(ErrorCodes.ERROR_505, [arraySize - 1, index]);
                }
                else {
                    let gettedValue = new Value();
                    gettedValue.setValue(param0Array.getValueArray()[index]);
                    return gettedValue;
                }
            }
        }
    }
    executeLengthFunction(paramValues) {
        let funcParamsLength = 1;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0Array = paramValues[0];
            if (!param0Array.isValueArray()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'array', param0Array.getType()]);
            }
            else {
                let lengthValue = new Value();
                lengthValue.setValueInt(param0Array.getValueArray().length);
                return lengthValue;
            }
        }
    }
    executePushFunction(paramValues) {
        let funcParamsLength = 2;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0Array = paramValues[0];
            let param1Value = paramValues[1];
            if (!param0Array.isValueArray()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'array', param0Array.getType()]);
            }
            else {
                param0Array.getValueArray().push(param1Value);
                return new Value();
            }
        }
    }
    executePopFunction(paramValues) {
        let funcParamsLength = 1;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0Array = paramValues[0];
            if (!param0Array.isValueArray()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'array', param0Array.getType()]);
            }
            else {
                let valueArray = param0Array.getValueArray();
                if (valueArray.length > 0) {
                    return valueArray.pop();
                }
                else {
                    return new Value();
                }
            }
        }
    }
    executeUnshiftFunction(paramValues) {
        let funcParamsLength = 2;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0Array = paramValues[0];
            let param1Value = paramValues[1];
            if (!param0Array.isValueArray()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'array', param0Array.getType()]);
            }
            else {
                param0Array.getValueArray().unshift(param1Value);
                return new Value();
            }
        }
    }
    executeShiftFunction(paramValues) {
        let funcParamsLength = 1;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0Array = paramValues[0];
            if (!param0Array.isValueArray()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'array', param0Array.getType()]);
            }
            else {
                let valueArray = param0Array.getValueArray();
                if (valueArray.length > 0) {
                    return valueArray.shift();
                }
                else {
                    return new Value();
                }
            }
        }
    }
    executePushAllFunction(paramValues) {
        let funcParamsLength = 2;
        if (paramValues.length !== funcParamsLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsLength, paramValues.length]);
        }
        else {
            let param0Array = paramValues[0];
            let param1Array = paramValues[1];
            if (!param0Array.isValueArray()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [1, 'array', param0Array.getType()]);
            }
            else if (!param1Array.isValueArray()) {
                return new SmartPropertiesException(ErrorCodes.ERROR_501, [2, 'array', param1Array.getType()]);
            }
            else {
                param0Array.getValueArray().push(...param1Array.getValueArray());
                return new Value();
            }
        }
    }
    executePrintFunction(paramValues) {
        let funcParamsMaxLength = 1;
        if (paramValues.length > funcParamsMaxLength) {
            return new SmartPropertiesException(ErrorCodes.ERROR_503, [funcParamsMaxLength, paramValues.length]);
        }
        else {
            if (paramValues.length === 1) {
                this.console += paramValues[0].toString();
            }
            this.console += '\n';
            return new Value();
        }
    }
    operateNodeChildren(node, variables) {
        let operator = node.getOperator();
        let nodeRight = node.getRight();
        let nodeLeft = node.getLeft();
        let nodeChildA = this.evaluateExpression(nodeRight, variables, this.isBooleanOperator(operator));
        // evaluate the right result for conditional to not evaluate left
        if (this.isBooleanOperator(operator) && nodeChildA instanceof Node && nodeChildA.isValueBoolean()) {
            if (operator === '&' && !nodeChildA.getValueBoolean()) {
                node.setValueBoolean(false);
                return;
            }
            else if (operator === '|' && nodeChildA.getValueBoolean()) {
                node.setValueBoolean(true);
                return;
            }
        }
        let nodeChildB = this.evaluateExpression(nodeLeft, variables, this.isBooleanOperator(operator));
        if (nodeChildA instanceof Node && nodeChildB instanceof Node) {
            if (nodeChildA.isValueString() && nodeChildB.isValueString() && (this.isStringOperator(operator) || this.isCompareOperator(operator))) {
                if (this.isCompareOperator(operator)) {
                    node.setValueBoolean(this.compareStrings(operator, nodeChildA.getValueString(), nodeChildB.getValueString()));
                }
                else {
                    node.setValueString(nodeChildA.getValueString() + nodeChildB.getValueString());
                }
            }
            else if (((nodeChildA.isValueString() && !nodeChildB.isValueString()) || (!nodeChildA.isValueString() && nodeChildB.isValueString()))
                && this.isStringOperator(operator)) {
                node.setValueString(nodeChildA.toString() + nodeChildB.toString());
            }
            else if (nodeChildA.isValueInt() && nodeChildB.isValueInt() && (this.isNumberOperator(operator) || this.isCompareOperator(operator))) {
                if (this.isCompareOperator(operator)) {
                    node.setValueBoolean(this.compareInt(operator, nodeChildA.getValueInt(), nodeChildB.getValueInt()));
                }
                else {
                    node.setValueInt(this.operateInt(operator, nodeChildA.getValueInt(), nodeChildB.getValueInt()));
                }
            }
            else if (nodeChildA.isValueFloat() && nodeChildB.isValueFloat() && (this.isNumberOperator(operator) || this.isCompareOperator(operator))) {
                if (this.isCompareOperator(operator)) {
                    node.setValueBoolean(this.compareFloat(operator, nodeChildA.getValueFloat(), nodeChildB.getValueFloat()));
                }
                else {
                    node.setValueFloat(this.operateFloat(operator, nodeChildA.getValueFloat(), nodeChildB.getValueFloat()));
                }
            }
            else if (nodeChildA.isValueInt() && nodeChildB.isValueFloat() && (this.isNumberOperator(operator) || this.isCompareOperator(operator))) {
                if (this.isCompareOperator(operator)) {
                    node.setValueBoolean(this.compareFloat(operator, nodeChildA.getValueInt(), nodeChildB.getValueFloat()));
                }
                else {
                    node.setValueFloat(this.operateFloat(operator, nodeChildA.getValueInt(), nodeChildB.getValueFloat()));
                }
            }
            else if (nodeChildA.isValueFloat() && nodeChildB.isValueInt() && (this.isNumberOperator(operator) || this.isCompareOperator(operator))) {
                if (this.isCompareOperator(operator)) {
                    node.setValueBoolean(this.compareFloat(operator, nodeChildA.getValueFloat(), nodeChildB.getValueInt()));
                }
                else {
                    node.setValueFloat(this.operateFloat(operator, nodeChildA.getValueFloat(), nodeChildB.getValueInt()));
                }
            }
            else if (nodeChildA.isValueBoolean() && nodeChildB.isValueBoolean() && (this.isBooleanOperator(operator) || this.isEqualsOperator(operator))) {
                node.setValueBoolean(this.operateBoolean(operator, nodeChildA.getValueBoolean(), nodeChildB.getValueBoolean()));
            }
            else {
                return new SmartPropertiesException(ErrorCodes.ERROR_301, []);
            }
        }
        else if (nodeChildA instanceof SmartPropertiesException) {
            return nodeChildA;
        }
        else if (nodeChildB instanceof SmartPropertiesException) {
            return nodeChildB;
        }
    }
    isBooleanOperator(operator) {
        return "&|!".indexOf(operator) >= 0;
    }
    isNumberOperator(operator) {
        return "+-*/".indexOf(operator) >= 0;
    }
    isStringOperator(operator) {
        return "+" === operator;
    }
    isCompareOperator(operator) {
        return "<=>=".indexOf(operator) >= 0;
    }
    isEqualsOperator(operator) {
        return "=" === operator;
    }
    compareStrings(operator, a, b) {
        switch (operator) {
            case "=": return a === b;
            case "<": return a.localeCompare(b) < 0;
            case ">": return a.localeCompare(b) > 0;
            case "<=": return a.localeCompare(b) <= 0;
            case ">=": return a.localeCompare(b) >= 0;
        }
        return false;
    }
    operateInt(operator, a, b) {
        switch (operator) {
            case "+": return a + b;
            case "-": return a - b;
            case "*": return a * b;
            case "/": return Math.floor(a / b);
        }
        return 0;
    }
    compareInt(operator, a, b) {
        switch (operator) {
            case "=": return a === b;
            case "<": return a < b;
            case ">": return a > b;
            case "<=": return a <= b;
            case ">=": return a >= b;
        }
        return false;
    }
    operateFloat(operator, a, b) {
        switch (operator) {
            case "+": return a + b;
            case "-": return a - b;
            case "*": return a * b;
            case "/": return a / b;
        }
        return 0.0;
    }
    compareFloat(operator, a, b) {
        switch (operator) {
            case "=": return a === b;
            case "<": return a < b;
            case ">": return a > b;
            case "<=": return a <= b;
            case ">=": return a >= b;
        }
        return false;
    }
    operateBoolean(operator, a, b) {
        switch (operator.toUpperCase()) {
            case "&": return a && b;
            case "|": return a || b;
            case "!": return !b;
            case "=": return a === b;
        }
        return false;
    }
    hasChildren(node) {
        return node.getLeft() != null && node.getRight() != null;
    }
    static parseBlock(blockJson) {
        let block = new Block();
        if (blockJson.name)
            block.setName(blockJson.name);
        if (blockJson.type)
            block.setType(blockJson.type);
        if (blockJson.condition)
            block.setCondition(this.parseExpression(blockJson.condition));
        if (blockJson['return'])
            block.setReturn(this.parseExpression(blockJson['return']));
        if (blockJson.defaultValue)
            block.setDefaultValue(this.parseValue(blockJson.defaultValue));
        if (blockJson.instructions) {
            for (let instruction of blockJson.instructions) {
                if (instruction.type === 'block') {
                    block.getInstructions().push(this.parseBlock(instruction));
                }
                else if (instruction.type === 'assignment') {
                    block.getInstructions().push(this.parseAssignment(instruction));
                }
                else if (instruction.type === 'funct') {
                    block.getInstructions().push(this.parseFunct(instruction));
                }
            }
        }
        else {
            block.setInstructions(null);
        }
        return block;
    }
    static parseAssignment(assignmentJson) {
        let variable = new Variable(assignmentJson.variable.name);
        let assignment = new Assignment(variable);
        assignment.setType(assignmentJson.type);
        assignment.setExpression(this.parseExpression(assignmentJson.expression));
        return assignment;
    }
    static parseFunct(functJson) {
        let funct = new Funct(functJson.name);
        funct.setType(functJson.type);
        for (let parameter of functJson.parameters) {
            funct.getParameters().push(this.parseExpression(parameter));
        }
        return funct;
    }
    static parseExpression(nodeJson) {
        let node = new Node();
        this._parseValue(node, nodeJson);
        if (nodeJson.left)
            node.setLeft(this.parseExpression(nodeJson.left));
        if (nodeJson.right)
            node.setRight(this.parseExpression(nodeJson.right));
        if (nodeJson.funct)
            node.setFunct(this.parseFunct(nodeJson.funct));
        return node;
    }
    static parseValue(valueJson) {
        let value = new Value();
        this._parseValue(value, valueJson);
        return value;
    }
    static _parseValue(value, valueJson) {
        if (valueJson.variable)
            value.setVariable(valueJson.variable);
        if (valueJson.operator)
            value.setOperator(valueJson.operator);
        if (valueJson.valueString)
            value.setValueString(valueJson.valueString);
        if (valueJson.valueInt)
            value.setValueInt(valueJson.valueInt);
        if (valueJson.valueFloat)
            value.setValueFloat(valueJson.valueFloat);
        if (valueJson.valueBoolean)
            value.setValueBoolean(valueJson.valueBoolean);
    }
    getConsole() {
        return this.console;
    }
    wasDefaultReturned() {
        return this.defaultReturned;
    }
}
exports.SmartPropertiesCompiler = SmartPropertiesCompiler;
class Token {
    constructor(value, type, line, lastCharIndex) {
        this.value = value;
        this.type = type;
        this.line = line;
        this.lastCharIndex = lastCharIndex;
    }
    getValue() {
        return this.value;
    }
    setType(type) {
        this.type = type;
    }
    getType() {
        return this.type;
    }
    getLine() {
        return this.line;
    }
    setLine(line) {
        this.line = line;
    }
    getLastCharIndex() {
        return this.lastCharIndex;
    }
    isVariable() {
        return this.getType() === Token.VARIABLE;
    }
    isNotVariable() {
        return !this.isVariable();
    }
    isValue() {
        return this.getType() === Token.VALUE;
    }
    isNotValue() {
        return !this.isValue();
    }
    isReserved() {
        return this.getType() === Token.RESERVED;
    }
    isNotReserved() {
        return !this.isReserved();
    }
    isError() {
        return this.getType() === Token.ERROR;
    }
    isNotError() {
        return !this.isError();
    }
    isEndOfLine() {
        return this.getType() === Token.END_OF_LINE;
    }
    isNotEndOfLine() {
        return !this.isEndOfLine();
    }
    isEndOfFile() {
        return this.getType() === Token.END_OF_FILE;
    }
    isNotEndOfFile() {
        return !this.isEndOfFile();
    }
    isComment() {
        return this.getType() === Token.COMMENT;
    }
    isNotComment() {
        return !this.isComment();
    }
    isAssignedSymbol() {
        return this.getValue() === Token.ASSIGN_SYMBOL;
    }
    isNotAssignedSymbol() {
        return !this.isAssignedSymbol();
    }
    isString() {
        return this.getValue().indexOf('"') === 0;
    }
    isNotString() {
        return !this.isString();
    }
    isOperator() {
        return this.getValue() === '+' || this.getValue() === '-' || this.getValue() === '*' || this.getValue() === '/';
    }
    isNotOperator() {
        return !this.isOperator();
    }
    isSign() {
        return this.getValue() === '+' || this.getValue() === '-';
    }
    isConditionalOperator() {
        return this.getValue() === '>' || this.getValue() === '<' || this.getValue() === '>=' || this.getValue() === '<=' || this.getValue() === '=';
    }
    isNotConditionalOperator() {
        return !this.isConditionalOperator();
    }
    isLogicalOperator() {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(this, SmartPropertiesWords_1.SmartPropertiesWords.LOG_OP_AND) || SmartPropertiesUtils_1.SmartPropertiesUtils.equals(this, SmartPropertiesWords_1.SmartPropertiesWords.LOG_OP_OR);
    }
    isNotLogicalOperator() {
        return !this.isLogicalOperator();
    }
    isLogicalAndOperator() {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(this, SmartPropertiesWords_1.SmartPropertiesWords.LOG_OP_AND);
    }
    isLogicalOrOperator() {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(this, SmartPropertiesWords_1.SmartPropertiesWords.LOG_OP_OR);
    }
    isLogicalNotOperator() {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(this, SmartPropertiesWords_1.SmartPropertiesWords.LOG_OP_NOT);
    }
    isBooleanTrue() {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(this, SmartPropertiesWords_1.SmartPropertiesWords.BOOL_TRUE);
    }
    isBooleanFalse() {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(this, SmartPropertiesWords_1.SmartPropertiesWords.BOOL_FALSE);
    }
    isOperatorAll() {
        return this.isOperator() || this.isConditionalOperator() || this.isLogicalOperator() || this.isLogicalNotOperator();
    }
    isOpenParenthesis() {
        return this.getValue() === '(';
    }
    isNotOpenParenthesis() {
        return !this.isOpenParenthesis();
    }
    isComma() {
        return this.getValue() === ',';
    }
    isNotComma() {
        return !this.isComma();
    }
    isCloseParenthesis() {
        return this.getValue() === ')';
    }
    isNotCloseParenthesis() {
        return !this.isCloseParenthesis();
    }
    isNumber() {
        return !isNaN(Number(this.getValue()));
    }
    getTypeName() {
        switch (this.getType()) {
            case Token.ERROR: return 'error';
            case Token.END_OF_FILE: return 'endOfFile';
            case Token.END_OF_LINE: return 'endOfLine';
            case Token.VARIABLE: return 'variable';
            case Token.SYMBOL: return 'symbol';
            case Token.RESERVED: return 'reserved';
            case Token.VALUE: return 'value';
            case Token.COMMENT: return 'comment';
        }
        return '';
    }
}
exports.Token = Token;
Token.ERROR = -2;
Token.END_OF_FILE = -1;
Token.END_OF_LINE = 0;
Token.VARIABLE = 1;
Token.SYMBOL = 2;
Token.RESERVED = 3;
Token.VALUE = 4;
Token.COMMENT = 5;
Token.ASSIGN_SYMBOL = '=';
class Instruction {
    constructor() {
        this.type = '';
    }
    setType(type) {
        this.type = type;
    }
    getType() {
        return this.type;
    }
}
class Block extends Instruction {
    constructor() {
        super();
        this.name = null;
        this.instructions = [];
        this['return'] = null;
        this.condition = null;
        this.setType('block');
        this.conditionResult = null;
        this.defaultValue = null;
    }
    setName(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
    setCondition(condition) {
        this.condition = condition;
    }
    getCondition() {
        return this.condition;
    }
    getConditionResult() {
        return this.conditionResult;
    }
    setConditionResult(conditionResult) {
        this.conditionResult = conditionResult;
    }
    setInstructions(instructions) {
        this.instructions = instructions;
    }
    getInstructions() {
        return this.instructions;
    }
    setReturn(returnP) {
        this['return'] = returnP;
    }
    getReturn() {
        return this['return'];
    }
    getDefaultValue() {
        return this.defaultValue;
    }
    setDefaultValue(value) {
        this.defaultValue = value;
    }
}
exports.Block = Block;
class Assignment extends Instruction {
    constructor(variable) {
        super();
        this.variable = variable;
        this.setType('assignment');
    }
    setVariable(variable) {
        this.variable = variable;
    }
    getVariable() {
        return this.variable;
    }
    setExpression(expression) {
        this.expression = expression;
    }
    getExpression() {
        return this.expression;
    }
}
exports.Assignment = Assignment;
class Funct extends Instruction {
    constructor(name) {
        super();
        this.name = name;
        this.parameters = [];
        this.setType('funct');
    }
    setName(name) {
        return this.name = name;
    }
    getName() {
        return this.name;
    }
    getParameters() {
        return this.parameters;
    }
}
exports.Funct = Funct;
class Value {
    constructor() {
        this.variable = null;
        this.operator = null;
        this.valueString = null;
        this.valueInt = null;
        this.valueFloat = null;
        this.valueBoolean = null;
        this.valueArray = null;
        this.boolInitialized = false;
        this.boolVariable = false;
        this.boolOperator = false;
        this.boolValueString = false;
        this.boolValueInt = false;
        this.boolValueFloat = false;
        this.boolValueBoolean = false;
        this.boolValueArray = false;
    }
    setValue(value) {
        if (value.isValueString()) {
            this.setValueString(value.getValueString());
        }
        else if (value.isValueInt()) {
            this.setValueInt(value.getValueInt());
        }
        else if (value.isValueFloat()) {
            this.setValueFloat(value.getValueFloat());
        }
        else if (value.isValueBoolean()) {
            this.setValueBoolean(value.getValueBoolean());
        }
        else if (value.isValueArray()) {
            this.setValueArray(value.getValueArray());
        }
    }
    getVariable() {
        return this.variable;
    }
    setVariable(variable) {
        this.variable = variable;
        this.boolVariable = true;
    }
    getOperator() {
        return this.operator;
    }
    setOperator(operator) {
        this.operator = operator;
        this.boolOperator = true;
    }
    getValueString() {
        return this.valueString;
    }
    setValueString(valueString) {
        this.valueString = valueString;
        this.boolInitialized = true;
        this.boolValueString = true;
        this.valueInt = null;
        this.valueFloat = null;
        this.valueBoolean = null;
        this.valueArray = null;
        this.boolValueInt = false;
        this.boolValueFloat = false;
        this.boolValueBoolean = false;
        this.boolValueArray = false;
    }
    getValueInt() {
        return this.valueInt;
    }
    setValueInt(valueInt) {
        this.valueInt = valueInt;
        this.boolInitialized = true;
        this.boolValueInt = true;
        this.valueString = null;
        this.valueFloat = null;
        this.valueBoolean = null;
        this.valueArray = null;
        this.boolValueString = false;
        this.boolValueFloat = false;
        this.boolValueBoolean = false;
        this.boolValueArray = false;
    }
    getValueFloat() {
        return this.valueFloat;
    }
    setValueFloat(valueFloat) {
        this.valueFloat = valueFloat;
        this.boolInitialized = true;
        this.boolValueFloat = true;
        this.valueString = null;
        this.valueInt = null;
        this.valueBoolean = null;
        this.valueArray = null;
        this.boolValueString = false;
        this.boolValueInt = false;
        this.boolValueBoolean = false;
        this.boolValueArray = false;
    }
    getValueBoolean() {
        return this.valueBoolean;
    }
    setValueBoolean(valueBoolean) {
        this.valueBoolean = valueBoolean;
        this.boolInitialized = true;
        this.boolValueBoolean = true;
        this.valueString = null;
        this.valueInt = null;
        this.valueFloat = null;
        this.valueArray = null;
        this.boolValueString = false;
        this.boolValueInt = false;
        this.boolValueFloat = false;
        this.boolValueArray = false;
    }
    getValueArray() {
        return this.valueArray;
    }
    setValueArray(valueArray) {
        this.valueArray = valueArray;
        this.boolInitialized = true;
        this.boolValueArray = true;
        this.valueString = null;
        this.valueInt = null;
        this.valueFloat = null;
        this.valueBoolean = null;
        this.boolValueString = false;
        this.boolValueInt = false;
        this.boolValueFloat = false;
        this.boolValueBoolean = false;
    }
    isInitialized() {
        return this.boolInitialized;
    }
    isVariable() {
        return this.boolVariable;
    }
    isOperator() {
        return this.boolOperator;
    }
    isValueString() {
        return this.boolValueString;
    }
    isValueInt() {
        return this.boolValueInt;
    }
    isValueFloat() {
        return this.boolValueFloat;
    }
    isValueBoolean() {
        return this.boolValueBoolean;
    }
    isValueArray() {
        return this.boolValueArray;
    }
    toString() {
        if (this.boolValueBoolean) {
            return this.valueBoolean + '';
        }
        else if (this.boolValueInt) {
            return this.valueInt + '';
        }
        else if (this.boolValueFloat) {
            return this.valueFloat + '';
        }
        else if (this.boolValueString) {
            return this.valueString + '';
        }
        else if (this.boolValueArray) {
            return this.valueArray + '';
        }
        return '';
    }
    getType() {
        if (this.boolValueBoolean) {
            return 'boolean';
        }
        else if (this.boolValueInt) {
            return 'int';
        }
        else if (this.boolValueFloat) {
            return 'float';
        }
        else if (this.boolValueString) {
            return 'string';
        }
        else if (this.boolValueArray) {
            return 'array';
        }
        return '';
    }
}
exports.Value = Value;
class Node extends Value {
    constructor() {
        super();
        this.left = null;
        this.right = null;
        this.funct = null;
    }
    getLeft() {
        return this.left;
    }
    setLeft(left) {
        this.left = left;
    }
    getRight() {
        return this.right;
    }
    setRight(right) {
        this.right = right;
    }
    setFunct(funct) {
        this.funct = funct;
    }
    getFunct() {
        return this.funct;
    }
    isFunction() {
        return this.funct != null;
    }
}
exports.Node = Node;
class Variable extends Value {
    constructor(name) {
        super();
        this.name = name;
    }
    setName(name) {
        this.name = name;
    }
    getName() {
        return this.name;
    }
}
exports.Variable = Variable;
class SmartPropertiesException {
    constructor(message, args) {
        this.message = message.replace(/{(\d+)}/g, function (match, number) {
            return '' + (typeof args[parseInt(number)] != 'undefined' ? args[parseInt(number)] : match);
        });
        console.error(this.message);
    }
    setMessage(message) {
        this.message = message;
    }
    getMessage() {
        return this.message;
    }
}
exports.SmartPropertiesException = SmartPropertiesException;
