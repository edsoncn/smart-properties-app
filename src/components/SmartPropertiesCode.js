import React, { Component } from 'react';
import SmartPropertiesApi, { Token }  from '../ext/smart-properties-compiler/SmartPropertiesCompiler.js';
import ContentEditable from "./Content/ContentEditable";
import EditCaretPositioning from "./Content/EditCaretPositioning"

class SmartPropertiesCode extends Component {

    constructor(props) {
        super(props);

        this.onChange = props.onChange;
        this.smartPropertiesApi = props.smartPropertiesApi;
    }

    render () {
        return (
            <ContentEditable id="codeContent" className={ this.props.className ?? '' } 
                    name="code" html={this.props.code} editable={ this.props.editable ?? 'true' }
                    onChange={this.handleChangeCode.bind(this)} />
        )
    }
    
    handleChangeCode(element, keyCode){        
        let savedCaretPosition = null;
        if(keyCode){
            savedCaretPosition = EditCaretPositioning.saveSelection(element, keyCode);
        }

        let callback = () => {
            this.contentEditableOnInput(element, keyCode, savedCaretPosition);
        }

        this.onChange(element.innerText, callback);
    }

    contentEditableOnInput(element, keyCode, savedCaretPosition){
        if(!element){
            element = document.getElementById('codeContent');
        }

        let text = element.innerText;
        let lines = text.split(/\n/);
        let line = '';
        let newCode = '';
        let lineNumber = 1;
        let sizeAdded = 0;        
        let tokens = this.smartPropertiesApi.executeLexicalAnalyzer(text);
        
        for(let token of tokens){
			if(token.getValue() === '\n'){
				newCode += line + '\n'; 
				line = '';
				lineNumber++;
			}else if(token.getType() !== Token.ERROR){
				let word = token.getValue();
				let wordSize = word.length;
                if(!/^\s+$/.test(word) && (token.getType() === Token.RESERVED || 
                		token.getType() === Token.COMMENT || 
                		token.getType() === Token.VALUE || 
                		token.getType() === Token.VARIABLE || 
                		token.getType() === Token.SYMBOL)){
					let type = token.getTypeName();
					
					if(token.getType() === Token.RESERVED && SmartPropertiesApi.validateFunction(token)){
						type = 'funct';
					}
                    word = this.colorWord(word, type);
                    if(keyCode && newCode.length - sizeAdded <= savedCaretPosition.end - 1){
						sizeAdded += word.length - wordSize;
                    }
                }
				line += word;
			}
		}
        for(let i = lineNumber - 1; i < lines.length; i++){
        	newCode += lines[i];
        	if( i < lines.length - 1){
        		newCode += '\n';
			}
        }
        
        if(keyCode){
            let caretPositionEnd = sizeAdded + savedCaretPosition.end;
            if(caretPositionEnd > 0){
                if(keyCode && keyCode === 'Enter' && (caretPositionEnd === 1 || newCode.charAt(caretPositionEnd - 2) === '\n') && newCode.charAt(caretPositionEnd - 1) === '\n'){
                    newCode = newCode.substring(0, caretPositionEnd - 1) + newCode.substring(caretPositionEnd);
                }
            }
        }
        element.innerHTML = newCode;
        if(keyCode){
            EditCaretPositioning.restoreSelection(element, savedCaretPosition);
        }        
    }
    
    colorWord(word, type){
        let prefix = '<span class="' + type + '-word">';
        let suffix = '</span>';
        
        return word = prefix + word + suffix;
	}
	
}

export default SmartPropertiesCode;