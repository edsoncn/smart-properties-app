"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartPropertiesSemanticAnalyzer = void 0;
const SmartPropertiesSyntaxAnalyzer_1 = require("./SmartPropertiesSyntaxAnalyzer");
const SmartPropertiesCompiler_1 = require("./SmartPropertiesCompiler");
class SmartPropertiesSemanticAnalyzer {
    constructor(code) {
        this.syntaxAnalyzer = new SmartPropertiesSyntaxAnalyzer_1.SmartPropertiesSyntaxAnalyzer(code, this);
        this.program = null;
        this.errorMessage = null;
    }
    execute() {
        this.syntaxAnalyzer.execute();
        this.program = this.syntaxAnalyzer.getSemanticProgramBlock();
        // If there is no instructions or return (no code) then set null to clean Json
        if (!this.program.getReturn() && this.program.getInstructions().length === 0) {
            this.program.setType(null);
            this.program.setName(null);
            this.program.setInstructions(null);
        }
        if (this.syntaxAnalyzer.checkError()) {
            this.errorMessage = this.syntaxAnalyzer.getErrorMessage();
        }
        else {
            console.log("\nSemantic Program v2.9");
            console.log(this.getJSONString());
        }
    }
    checkError() {
        return this.errorMessage != null;
    }
    getErrorMessage() {
        return this.errorMessage;
    }
    getProgram() {
        return this.program;
    }
    expressionEvaluateGetNode(tokenQueue) {
        let node;
        let stackOperators = [];
        let stackChildNodes = [];
        let end = false;
        while (tokenQueue.length > 0 && !end) {
            let token = tokenQueue.shift();
            if (token.isOpenParenthesis()) {
                node = this.expressionEvaluateGetNode(tokenQueue);
                stackChildNodes.push(node);
            }
            else if (token.isCloseParenthesis() || token.isEndOfLine()) {
                end = true;
            }
            else if (token.isOperatorAll()) {
                let lastOperator = stackOperators.pop();
                let nextOperator = token;
                if (lastOperator) {
                    while (lastOperator && this.expressionOperatorsPriority(nextOperator) <= this.expressionOperatorsPriority(lastOperator)) {
                        node = this.expressionBuildNewNode(lastOperator, stackChildNodes.pop(), stackChildNodes.pop());
                        stackChildNodes.push(node);
                        lastOperator = stackOperators.pop();
                    }
                    if (lastOperator) {
                        stackOperators.push(lastOperator);
                    }
                    stackOperators.push(nextOperator);
                }
                else {
                    stackOperators.push(token);
                }
            }
            else {
                node = new SmartPropertiesCompiler_1.Node();
                this.expressionSetValue(node, token);
                stackChildNodes.push(node);
            }
        }
        let lastOperator = stackOperators.pop();
        while (lastOperator) {
            node = this.expressionBuildNewNode(lastOperator, stackChildNodes.pop(), stackChildNodes.pop());
            stackChildNodes.push(node);
            lastOperator = stackOperators.pop();
        }
        return node;
    }
    expressionBuildNewNode(operator, nodeLeft, nodeRight) {
        let node = new SmartPropertiesCompiler_1.Node();
        if (operator.isLogicalAndOperator()) {
            node.setOperator('&');
        }
        else if (operator.isLogicalOrOperator()) {
            node.setOperator('|');
        }
        else if (operator.isLogicalNotOperator()) {
            node.setOperator('!');
        }
        else {
            node.setOperator(operator.getValue());
        }
        node.setLeft(nodeLeft);
        node.setRight(nodeRight);
        return node;
    }
    expressionOperatorsPriority(token) {
        if (token.isLogicalOperator()) {
            return 0;
        }
        else if (token.isLogicalNotOperator()) {
            return 4;
        }
        else {
            switch (token.getValue()) {
                case '>':
                case '<':
                case '>=':
                case '<=':
                case '=': return 1;
                case '+':
                case '-': return 2;
                case '*':
                case '/': return 3;
            }
            return 0;
        }
    }
    expressionSetValue(node, token) {
        if (token.isVariable()) {
            node.setVariable(token.getValue());
        }
        else if (token.isString()) {
            node.setValueString(JSON.parse(token.getValue()));
        }
        else if (token.isNumber()) {
            if (token.getValue().indexOf('.') < 0) {
                node.setValueInt(Number(token.getValue()));
            }
            else {
                node.setValueFloat(Number(token.getValue()));
            }
        }
        else if (token.isBooleanTrue()) {
            node.setValueBoolean(true);
        }
        else if (token.isBooleanFalse()) {
            node.setValueBoolean(false);
        }
        else if (token.isReserved()) {
            let funct = this.syntaxAnalyzer.getSemanticFunctionStack().shift();
            node.setFunct(funct);
        }
    }
    getJSONString() {
        return SmartPropertiesSemanticAnalyzer.getJSONString(this.program);
    }
    static getJSONString(program) {
        return JSON.stringify(program, (k, v) => {
            if (v !== null) {
                if (k === 'type') {
                    if (v === 'block' || v === 'assignment' || v === 'funct') {
                        return v;
                    }
                }
                else if (k !== 'line' && k.lastIndexOf('bool') !== 0) {
                    return v;
                }
            }
        });
    }
}
exports.SmartPropertiesSemanticAnalyzer = SmartPropertiesSemanticAnalyzer;
