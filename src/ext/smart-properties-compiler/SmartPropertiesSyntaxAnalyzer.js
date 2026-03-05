"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartPropertiesSyntaxAnalyzer = void 0;
const SmartPropertiesLexicalAnalyzer_1 = require("./SmartPropertiesLexicalAnalyzer");
const SmartPropertiesUtils_1 = require("./SmartPropertiesUtils");
const SmartPropertiesWords_1 = require("./SmartPropertiesWords");
const SmartPropertiesCompiler_1 = require("./SmartPropertiesCompiler");
class SmartPropertiesSyntaxAnalyzer {
    constructor(code, semanticAnalizer) {
        this.lexicalAnalyzer = new SmartPropertiesLexicalAnalyzer_1.SmartPropertiesLexicalAnalyzer(code);
        this.semanticAnalizer = semanticAnalizer;
        this.token = new SmartPropertiesCompiler_1.Token(SmartPropertiesLexicalAnalyzer_1.SmartPropertiesLexicalAnalyzer.EMPTY, SmartPropertiesCompiler_1.Token.END_OF_FILE, 0, -1);
        this.error = null;
        this.semanticProgramBlock = null;
        this.semanticBlockStack = [];
        this.semanticFunctionStack = [];
        this.tokenQueue = [];
    }
    nextToken() {
        let token = this.lexicalAnalyzer.nextToken();
        if (token.isError()) {
            this.setError(token, 'Syntax Error There is an Lexical error');
        }
        else {
            this.tokenQueue.push(token);
            console.info('> token value: ' + token.getValue() + ', type: ' + token.getType() + ', lineCount: ' + token.getLine());
        }
        return token;
    }
    execute() {
        this.program();
    }
    program() {
        console.info('Syntax init');
        // Semantic
        this.semanticProgramBlock = new SmartPropertiesCompiler_1.Block();
        this.semanticProgramBlock.setName("program");
        this.semanticBlockStack.push(this.semanticProgramBlock);
        this.block();
        if (this.checkError())
            return;
        // Semantic
        this.semanticBlockStack.pop();
        if (this.token.isNotEndOfFile()) {
            this.setError(this.token, 'Syntax Error Missing end of program');
        }
        else {
            console.info('Syntax success');
        }
    }
    block() {
        do {
            this.token = this.nextToken();
            if (this.checkError())
                return;
            if (this.token.isEndOfFile() || this.isEnd(this.token) || this.isElse(this.token)) {
                return;
            }
            else if (this.token.isVariable()) {
                this.assignments();
                if (this.checkError())
                    return;
            }
            else if (this.isIf(this.token)) {
                this.blockIf(false);
                if (this.checkError())
                    return;
            }
            else if (this.isWhile(this.token)) {
                this.blockWhile();
                if (this.checkError())
                    return;
            }
            else if (this.isFunction(this.token)) {
                this.functionInstruction();
                if (this.checkError())
                    return;
            }
            else if (this.isReturn(this.token)) {
                break;
            }
            else {
                this.setError(this.token, 'Syntax Error Unknown token in block');
                return;
            }
        } while (true);
        this['return']();
        if (this.checkError())
            return;
        this.token = this.nextToken();
        if (this.checkError())
            return;
        if (!(this.token.isEndOfFile() || this.isEnd(this.token) || this.isElse(this.token))) {
            this.setError(this.token, 'Syntax Error Missing end of the block');
        }
    }
    assignments() {
        if (this.token.isNotVariable()) {
            this.setError(this.token, 'Syntax Error Missing variable in assignments');
            return;
        }
        // Semantic
        let assignment = new SmartPropertiesCompiler_1.Assignment(new SmartPropertiesCompiler_1.Variable(this.token.getValue()));
        this.token = this.nextToken();
        if (this.checkError())
            return;
        if (this.token.isNotAssignedSymbol()) {
            this.setError(this.token, 'Syntax Error Missing assigment symbol ' + SmartPropertiesCompiler_1.Token.ASSIGN_SYMBOL + ' in assigment');
            return;
        }
        // Semantic
        this.resetTokenQueue();
        this.expression();
        if (this.checkError())
            return;
        // Semantic
        assignment.setExpression(this.semanticAnalizer.expressionEvaluateGetNode(this.tokenQueue));
        this.getParentBlock().getInstructions().push(assignment);
        if (this.token.isNotEndOfLine()) {
            this.setError(this.token, 'Syntax Error Missing end of line in assigment');
        }
    }
    expression(insideParenthesis = false, insideFunction = false) {
        this.a(insideFunction);
        if (this.checkError())
            return;
        if (this.token.isOperatorAll()) {
            this.b();
            if (this.checkError())
                return;
        }
        if (insideParenthesis) {
            if (this.token.isNotCloseParenthesis()) {
                this.setError(this.token, 'Syntax Error Missing close parenthesis in expression');
                return;
            }
            this.token = this.nextToken();
            if (this.checkError())
                return;
        }
    }
    a(insideFunction = false) {
        console.info('>> a');
        this.token = this.nextToken();
        if (this.checkError())
            return;
        if (this.token.isSign() || this.token.isLogicalNotOperator()) {
            this.handleSignOrNot();
            this.token = this.nextToken();
            if (this.checkError())
                return;
        }
        if (this.token.isValue() || this.token.isVariable() || this.token.isString()) {
            this.token = this.nextToken();
            if (this.checkError())
                return;
        }
        else if (this.token.isOpenParenthesis()) {
            this.expression(true);
            if (this.checkError())
                return;
        }
        else if (this.isFunction(this.token)) {
            let funct = new SmartPropertiesCompiler_1.Funct(this.getFirstFunctionName(this.token.getValue()));
            this.function(funct);
            if (this.checkError())
                return;
            this.semanticFunctionStack.push(funct);
        }
        else if (insideFunction) {
            if (this.token.isNotCloseParenthesis() && this.token.isNotComma()) {
                this.setError(this.token, 'Syntax Error Unknown token in a');
            }
        }
        else {
            this.setError(this.token, 'Syntax Error Unknown token in a');
        }
    }
    b() {
        console.info('>> b');
        this.expression();
        if (this.checkError())
            return;
    }
    blockIf(isElseIf) {
        console.info('>> blockIf');
        // Semantic
        let newBlock = new SmartPropertiesCompiler_1.Block();
        newBlock.setName(isElseIf ? "else-if" : "if");
        this.getParentBlock().getInstructions().push(newBlock);
        this.semanticBlockStack.push(newBlock);
        if (this.isNotIf(this.token)) {
            this.setError(this.token, 'Syntax Error Missing ' + SmartPropertiesWords_1.SmartPropertiesWords.IC_IF + ' in if control instruction');
            return;
        }
        this.condition();
        if (this.checkError())
            return;
        if (this.isNotThen(this.token)) {
            this.setError(this.token, 'Syntax Error Missing ' + SmartPropertiesWords_1.SmartPropertiesWords.IC_THEN + ' in if control instruction');
            return;
        }
        this.token = this.nextToken();
        if (this.checkError())
            return;
        if (this.token.isNotEndOfLine()) {
            this.setError(this.token, 'Syntax Error Missing end of file in if control instruction');
            return;
        }
        this.block();
        if (this.checkError())
            return;
        if (this.isElse(this.token)) {
            // Semantic
            this.semanticBlockStack.pop();
            this.token = this.nextToken();
            if (this.checkError())
                return;
            if (this.isIf(this.token)) {
                this.blockIf(true);
                return;
            }
            else {
                if (this.token.isNotEndOfLine()) {
                    this.setError(this.token, 'Syntax Error Missing end of file for else in if control instruction');
                    return;
                }
                // Semantic
                let elseBlock = new SmartPropertiesCompiler_1.Block();
                elseBlock.setName("else");
                this.getParentBlock().getInstructions().push(elseBlock);
                this.semanticBlockStack.push(elseBlock);
                this.block();
                if (this.checkError())
                    return;
                if (this.isNotEnd(this.token)) {
                    this.setError(this.token, 'Syntax Error Missing ' + SmartPropertiesWords_1.SmartPropertiesWords.IC_END + ' in if control instruction');
                    return;
                }
                this.token = this.nextToken();
                if (this.checkError())
                    return;
                if (this.token.isNotEndOfLine()) {
                    this.setError(this.token, 'Syntax Error Missing end of file for end in if control instruction');
                    return;
                }
                // Semantic
                this.semanticBlockStack.pop();
            }
        }
        else {
            if (this.isNotEnd(this.token)) {
                this.setError(this.token, 'Syntax Error Missing ' + SmartPropertiesWords_1.SmartPropertiesWords.IC_END + ' in if control instruction');
                return;
            }
            this.token = this.nextToken();
            if (this.checkError())
                return;
            if (this.token.isNotEndOfLine()) {
                this.setError(this.token, 'Syntax Error Missing end of file for end in if control instruction');
                return;
            }
            // Semantic
            this.semanticBlockStack.pop();
        }
    }
    blockWhile() {
        console.info('>> blockWhile');
        // Semantic
        let newBlock = new SmartPropertiesCompiler_1.Block();
        newBlock.setName("while");
        this.getParentBlock().getInstructions().push(newBlock);
        this.semanticBlockStack.push(newBlock);
        if (this.isNotWhile(this.token)) {
            this.setError(this.token, 'Syntax Error Missing ' + SmartPropertiesWords_1.SmartPropertiesWords.IC_WHILE + ' in while control instruction');
            return;
        }
        this.condition();
        if (this.checkError())
            return;
        if (this.isNotThen(this.token)) {
            this.setError(this.token, 'Syntax Error Missing ' + SmartPropertiesWords_1.SmartPropertiesWords.IC_THEN + ' in while control instruction');
            return;
        }
        this.token = this.nextToken();
        if (this.checkError())
            return;
        if (this.token.isNotEndOfLine()) {
            this.setError(this.token, 'Syntax Error Missing end of file while in control instruction');
            return;
        }
        this.block();
        if (this.checkError())
            return;
        if (this.isNotEnd(this.token)) {
            this.setError(this.token, 'Syntax Error Missing ' + SmartPropertiesWords_1.SmartPropertiesWords.IC_END + ' in while control instruction');
            return;
        }
        this.token = this.nextToken();
        if (this.checkError())
            return;
        if (this.token.isNotEndOfLine()) {
            this.setError(this.token, 'Syntax Error Missing end of file for end in while control instruction');
            return;
        }
        // Semantic
        this.semanticBlockStack.pop();
    }
    condition() {
        console.info('>> condition');
        // Semantic
        this.resetTokenQueue();
        this.expression();
        if (this.checkError())
            return;
        // Semantic
        this.tokenQueue.pop();
        this.getParentBlock().setCondition(this.semanticAnalizer.expressionEvaluateGetNode(this.tokenQueue));
    }
    functionInstruction() {
        console.info('>> functionInstruction');
        // Semantic
        let funct = new SmartPropertiesCompiler_1.Funct(this.getFirstFunctionName(this.token.getValue()));
        this.function(funct);
        if (this.token.isNotEndOfLine()) {
            this.setError(this.token, 'Syntax Error Missing end of line in function instruction');
        }
        // Semantic
        this.getParentBlock().getInstructions().push(funct);
    }
    function(funct) {
        console.info('>> functionInstruction');
        if (this.isNotFunction(this.token)) {
            this.setError(this.token, 'Syntax Error Unknow Function Name');
            return;
        }
        // Semantic save tokens
        let tokenQueueAux = [];
        tokenQueueAux = tokenQueueAux.concat(this.tokenQueue);
        this.token = this.nextToken();
        if (this.checkError())
            return;
        if (this.token.isNotOpenParenthesis()) {
            this.setError(this.token, 'Syntax Error Missing open parenthesis in function');
            return;
        }
        do {
            // Semantic
            this.resetTokenQueue();
            this.expression(false, true);
            if (this.checkError())
                return;
            console.log("TOKEN QUEUE");
            console.log(this.tokenQueue);
            // Semantic
            this.tokenQueue.pop();
            let resultNode = this.semanticAnalizer.expressionEvaluateGetNode(this.tokenQueue);
            if (resultNode) {
                funct.getParameters().push(resultNode);
            }
            if (this.token.isCloseParenthesis()) {
                // Semantic reset and restore tokens
                this.resetTokenQueue();
                this.tokenQueue = this.tokenQueue.concat(tokenQueueAux);
                this.token = this.nextToken();
                if (this.checkError())
                    return;
                break;
            }
            else if (this.token.isNotComma()) {
                this.setError(this.token, 'Syntax Error Missing comma in function');
                return;
            }
        } while (true);
    }
    'return'() {
        if (this.isNotReturn(this.token)) {
            this.setError(this.token, 'Syntax Error Missing ' + SmartPropertiesWords_1.SmartPropertiesWords.IC_RETURN + ' in return');
            return;
        }
        // Semantic
        this.resetTokenQueue();
        this.expression();
        if (this.checkError())
            return;
        // Semantic
        this.getParentBlock().setReturn(this.semanticAnalizer.expressionEvaluateGetNode(this.tokenQueue));
        if (this.token.isNotEndOfLine()) {
            this.setError(this.token, 'Syntax Error Missing end of line in return');
        }
    }
    handleSignOrNot() {
        this.tokenQueue.pop();
        if (this.token.getValue() === '-') {
            this.tokenQueue.push(new SmartPropertiesCompiler_1.Token('-1', SmartPropertiesCompiler_1.Token.VALUE, this.token.getLine(), -1));
            this.tokenQueue.push(new SmartPropertiesCompiler_1.Token('*', SmartPropertiesCompiler_1.Token.SYMBOL, this.token.getLine(), -1));
        }
        else if (this.token.isLogicalNotOperator()) {
            this.tokenQueue.push(new SmartPropertiesCompiler_1.Token(SmartPropertiesWords_1.SmartPropertiesWords.BOOL_FALSE[0], SmartPropertiesCompiler_1.Token.VALUE, this.token.getLine(), -1));
            this.tokenQueue.push(new SmartPropertiesCompiler_1.Token(SmartPropertiesWords_1.SmartPropertiesWords.LOG_OP_NOT[0], SmartPropertiesCompiler_1.Token.SYMBOL, this.token.getLine(), -1));
        }
    }
    isIf(token) {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(token, SmartPropertiesWords_1.SmartPropertiesWords.IC_IF);
    }
    isNotIf(token) {
        return !this.isIf(token);
    }
    isElse(token) {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(token, SmartPropertiesWords_1.SmartPropertiesWords.IC_ELSE);
    }
    isNotElse(token) {
        return !this.isElse(token);
    }
    isWhile(token) {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(token, SmartPropertiesWords_1.SmartPropertiesWords.IC_WHILE);
    }
    isNotWhile(token) {
        return !this.isWhile(token);
    }
    isThen(token) {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(token, SmartPropertiesWords_1.SmartPropertiesWords.IC_THEN);
    }
    isNotThen(token) {
        return !this.isThen(token);
    }
    isReturn(token) {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(token, SmartPropertiesWords_1.SmartPropertiesWords.IC_RETURN);
    }
    isNotReturn(token) {
        return !this.isReturn(token);
    }
    isEnd(token) {
        return SmartPropertiesUtils_1.SmartPropertiesUtils.equals(token, SmartPropertiesWords_1.SmartPropertiesWords.IC_END);
    }
    isNotEnd(token) {
        return !this.isEnd(token);
    }
    isFunction(token) {
        return SmartPropertiesSyntaxAnalyzer.validateFunction(token);
    }
    isNotFunction(token) {
        return !this.isFunction(token);
    }
    static validateFunction(token) {
        if (token.isReserved()) {
            for (let f of SmartPropertiesWords_1.SmartPropertiesWords.FUNCTIONS) {
                for (let name of f) {
                    if (token.getValue().toUpperCase() === name) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    getFirstFunctionName(name) {
        let nameUpper = name.toUpperCase();
        for (let f of SmartPropertiesWords_1.SmartPropertiesWords.FUNCTIONS) {
            for (let n of f) {
                if (nameUpper === n) {
                    return f[0].toLowerCase();
                }
            }
        }
        return '';
    }
    checkError() {
        return this.error != null;
    }
    setError(token, message) {
        this.error = new SyntaxError(token, message);
        this.error.showMessage();
    }
    getErrorMessage() {
        return this.error.getMessage();
    }
    resetTokenQueue() {
        this.tokenQueue = [];
    }
    // Semantic
    getSemanticProgramBlock() {
        return this.semanticProgramBlock;
    }
    getSemanticFunctionStack() {
        return this.semanticFunctionStack;
    }
    getParentBlock() {
        let parentBlock = this.semanticBlockStack.pop();
        this.semanticBlockStack.push(parentBlock);
        return parentBlock;
    }
}
exports.SmartPropertiesSyntaxAnalyzer = SmartPropertiesSyntaxAnalyzer;
class SyntaxError {
    constructor(token, message) {
        this.token = token;
        this.message = message;
    }
    getMessage() {
        return this.message + ': token: ' + this.token.getValue() + ', line: ' + this.token.getLine() + ', type: ' + this.token.getType();
    }
    showMessage() {
        console.error(this.getMessage());
    }
}
