import React, { Component } from 'react';
import { Modal, Button } from "react-bootstrap";
import SmartPropertiesButton from "./SmartPropertiesButton"


class SmartPropertiesDeleteModal extends Component {
    
    callback = null;

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            name: ''
        };
    }

    render () {
        const { show } = this.state;
        const { name } = this.state;
        
        return (
            <Modal show={show} onHide={() => { this.close() }} className={ this.props.className ?? '' }>
                <Modal.Header closeButton>
                    <Modal.Title className="mt-0">Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    <p className="p-0">Are you sure you want to delete "{name}"?</p>
                </Modal.Body>
                <Modal.Footer className="mb-3 d-flex align-items-center justify-content-between">
                    <Button variant="secondary" className="btn-fill" onClick={() => { this.close() }}>Cancel</Button>
                    <SmartPropertiesButton name = "Delete" variant="primary" fill = { true } onClick={() => { this.callback() }} />
                </Modal.Footer>
            </Modal>
        )
    }

    show = (name, callback) => {
        this.setState({show: true, name});
        this.callback = callback;
    }

    close = () => {
        this.setState({show: false, name: ''})
        this.callback = null;
    }
}

export default SmartPropertiesDeleteModal;