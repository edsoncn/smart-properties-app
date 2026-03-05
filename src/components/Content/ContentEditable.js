
import React, { Component } from "react";

class ContentEditable extends Component{

    lastHtml = ''

    render(){
        return <div
            onBlur={(e) => {this.emitChange(e)}}
            onKeyUp={(e) => {this.emitChange(e)}}
            id={this.props.id}
            name={this.props.name}
            contentEditable={this.props.editable ?? 'true'}
            spellCheck="false"
            dangerouslySetInnerHTML={{__html: this.props.html}}
            className={ 'form-control textarea-code-div ' + this.props.className }></div>;
    }

    shouldComponentUpdate(nextProps){
        return nextProps.html !== this.props.html;
    }

    emitChange(e){
        let html = e.target.innerText;
        if (this.props.onChange && html !== this.lastHtml) {
            this.props.onChange(e.target, e.code);
        }
        this.lastHtml = html;
    }

}

export default ContentEditable;