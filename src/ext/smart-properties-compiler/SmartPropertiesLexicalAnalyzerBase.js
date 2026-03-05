"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartPropertiesLexicalAnalyzerBase = void 0;
const SmartPropertiesCompiler_1 = require("./SmartPropertiesCompiler");
class SmartPropertiesLexicalAnalyzerBase {
    constructor(text, states, statesAction) {
        this.tokens = [];
        this.text = text;
        this.state = 0;
        this.states = states;
        this.statesAction = statesAction;
        this.token = SmartPropertiesLexicalAnalyzerBase.EMPTY;
        this.charIndex = 0;
        this.lastState = -1;
        this.lineCount = 1;
    }
    nextTokenAll() {
        let character = this.getChar();
        let tokenObj;
        //console.log('Next Token');
        while (character !== SmartPropertiesLexicalAnalyzerBase.EMPTY) {
            //console.log('> character: ' + character);            
            let position = this.getPosition(character);
            if (position < 0) {
                console.log('Error: incorrect character at line ' + this.lineCount + ' and position ' + this.charIndex);
                return new SmartPropertiesCompiler_1.Token('Lexical Error in line ' + this.lineCount + ' and position ' + this.charIndex, SmartPropertiesCompiler_1.Token.ERROR, this.lineCount, this.charIndex);
            }
            this.changeState(this.getNextState(this.getState(), position));
            if (this.getState() < 0) {
                console.log('Error: incorrect state');
                return new SmartPropertiesCompiler_1.Token('Lexical Error in line ' + this.lineCount + ' and position ' + this.charIndex, SmartPropertiesCompiler_1.Token.ERROR, this.lineCount, this.charIndex);
            }
            // states actions
            //  - 0: continue, 1: end and go back, 2: end and next, 3: end and start again
            let action = this.getStateAction();
            switch (action) {
                case 0:
                    this.token += character;
                    this.increaseCharIndex();
                    break;
                case 1:
                    // variable by default, the correct type will be setted later
                    tokenObj = this.createToken(this.charIndex - 1);
                    this.token = SmartPropertiesLexicalAnalyzerBase.EMPTY;
                    return tokenObj;
                case 2:
                    this.token += character;
                    tokenObj = this.createToken(this.charIndex);
                    this.token = SmartPropertiesLexicalAnalyzerBase.EMPTY;
                    this.increaseCharIndex();
                    this.validateLineCount(character);
                    return tokenObj;
                case 3:
                    this.token += character;
                    tokenObj = this.createToken(this.charIndex);
                    this.token = SmartPropertiesLexicalAnalyzerBase.EMPTY;
                    this.increaseCharIndex();
                    this.validateLineCount(character);
                    this.changeState(0);
                    return tokenObj;
            }
            // character update  
            character = this.getChar();
        }
        tokenObj = new SmartPropertiesCompiler_1.Token(SmartPropertiesLexicalAnalyzerBase.EMPTY, SmartPropertiesCompiler_1.Token.END_OF_FILE, this.lineCount, this.charIndex);
        return tokenObj;
    }
    execute() {
        console.log('Executing Lexical');
        let tokenObj;
        do {
            tokenObj = this.nextTokenAll();
            //console.log(' - token value: ' + tokenObj.getValue() + ', type: ' + tokenObj.getType() + ', lineCount: ' + tokenObj.getLine());
            if (tokenObj.getType() === SmartPropertiesCompiler_1.Token.ERROR) {
                return;
            }
            this.addToken(tokenObj);
        } while (tokenObj.getType() >= 0);
        /**
        console.log('Token List:');
        for(let i = 0; i < this.tokens.length; i++){
            tokenObj = this.tokens[i];
            console.log('> Token value: ' + tokenObj.getValue() + ', type: ' + tokenObj.getType() + ', lineCount: ' + tokenObj.getLine());
        }
        **/
    }
    createToken(lastCharIndex) {
        return new SmartPropertiesCompiler_1.Token(this.token, this.getTokenType(this.token), this.lineCount, lastCharIndex);
    }
    getTokenType(token) {
        if (/^[A-Z]/.test(token)) { // Validate first letter uppercase
            return SmartPropertiesCompiler_1.Token.RESERVED;
        }
        else if (/^[a-z]/.test(token)) { // Validate first letter lowercase
            return SmartPropertiesCompiler_1.Token.VARIABLE;
        }
        else if (/^\/\//.test(token)) { // Validate comment
            return SmartPropertiesCompiler_1.Token.COMMENT;
        }
        else {
            return SmartPropertiesCompiler_1.Token.VALUE;
        }
    }
    getChar() {
        //console.log(' - charIndex: ' + this.charIndex)        
        if (this.charIndex >= 0 && this.charIndex < this.getTextSize()) {
            return this.text.charAt(this.charIndex);
        }
        else if (this.charIndex === this.getTextSize()) {
            if (this.text.charAt(this.getTextSize() - 1) === SmartPropertiesLexicalAnalyzerBase.NEW_LINE) {
                return SmartPropertiesLexicalAnalyzerBase.EMPTY;
            }
            else {
                return SmartPropertiesLexicalAnalyzerBase.NEW_LINE;
            }
        }
        else {
            return SmartPropertiesLexicalAnalyzerBase.EMPTY;
        }
    }
    getTextSize() {
        return this.text.length;
    }
    increaseCharIndex() {
        this.charIndex++;
    }
    validateLineCount(character) {
        if (character === SmartPropertiesLexicalAnalyzerBase.NEW_LINE)
            this.lineCount++;
    }
    addToken(token) {
        this.tokens.push(token);
    }
    getState() {
        return this.state;
    }
    getLastState() {
        return this.lastState;
    }
    changeState(state) {
        //console.log(' - state: ' + this.state);
        //console.log(' - new state: ' + state);
        this.lastState = this.state;
        this.state = state;
    }
    getNextState(state, position) {
        return this.states[state][position];
    }
    getStateAction() {
        let action = this.statesAction[this.getLastState()][this.getState()];
        //console.log(' - action: ' + action);
        return action;
    }
    getTokens() {
        return this.tokens;
    }
}
exports.SmartPropertiesLexicalAnalyzerBase = SmartPropertiesLexicalAnalyzerBase;
SmartPropertiesLexicalAnalyzerBase.EMPTY = '';
SmartPropertiesLexicalAnalyzerBase.NEW_LINE = '\n';
