import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import SmartPropertiesButton from "../components/SmartPropertiesButton"

const {
    smartPropertiesWorkspaceCreateApiToken
} = require("../configs/apisConfig")

class SmartPropertiesTokenModal extends Component {
    
    callback = null;
    
    constructor(props) {
        super(props);

        this.tenant = props.tenant;
        this.workspace = props.workspace;
        this.hasToken = props.hasToken;
        this.state = {
            show: false,
            message: ''
        };
        this.generated = false;
        this.btnGenerate = React.createRef();
    }

    render () {
        const { show } = this.state;
        const { message } = this.state;
        
        return (
            <Modal show={show} onHide={() => {}} className={ this.props.className ?? '' }>
                <Modal.Header>
                    <Modal.Title className="mt-0">{ this.hasToken ? 'Replace existing Token' : 'Create new Token' }</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    <p className="p-0">
                        {`You will create a secure Smart Properties API token for your workspace ${this.workspace}.`}<br/>
                        {'Make sure to safely copy the token before closing the dialog.'}
                    </p>
                </Modal.Body>
                <Modal.Footer className="mb-3 d-flex align-items-center justify-content-between">
                    <Button variant="secondary" className="btn-fill" onClick={() => { this.close() }}>{ message ? 'Close' : 'Cancel'}</Button>{                    
                    message ? 
                        <div className={'text-center input-like ' + (this.isOk(message) ? 'text-monospace' : 'text-red')}>
                            { this.isOk(message) ?(<>{message} <i className="fa fa-copy a-link" onClick={ () => {
                                    navigator.clipboard.writeText(message);
                                }}></i></>) : message }
                        </div> :
                        <SmartPropertiesButton ref={ this.btnGenerate } className="pull-right" name="Generate" fill={ true } variant="primary" onClick={ () => { this.generateToken() }}/>
                        }
                </Modal.Footer>
            </Modal>
        )
    }

    show = (callback) => {
        this.setState({show: true, message: ''});
        this.callback = callback;
        this.generated = false;
    }

    close = () => {
        this.setState({show: false, message: ''});
        this.callback(this.generated);
        this.callback = null;
        this.generated = false;
    }

    generateToken = () => {
        smartPropertiesWorkspaceCreateApiToken(this.tenant, this.workspace)
        .then(([status, data]) => {
            if(status === 201){
                this.generated = true;
                this.setState({message: data.token});
            }else{
                this.setState({message: 'An error occurred. Try again later'});
                console.log('Error generating token: ' + status);
                this.generated = false;
            }
        })
        .catch((e) => {
            this.setState({message: 'An error occurred. Try again later'});
            console.log(e);
            this.generated = false;
        })

    }

    isOk = (message) => {
        return message.indexOf('error') < 0;
    }
}

export default SmartPropertiesTokenModal;