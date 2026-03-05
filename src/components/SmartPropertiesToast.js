import React, { Component } from 'react';
import { Toast } from "react-bootstrap";

class SmartPropertiesToast extends Component {

    constructor(props) {
        super(props);

        this.state = {
            show: false,
            message: '',
            duration: props.duration,
            variant: 'info', 
            isAnimatedOut: false
        };
        this.showTimeout = null;
        this.animatedOutTimeOut = null;
    }

    render () {
        const { show } = this.state;
        const { message } = this.state;
        const { variant } = this.state;
        const { isAnimatedOut } = this.state;

        return (
            <div className="position-fixed top-50 end-0 translate-middle-y p-3" style={{ zIndex: 1050 }}>
            <Toast show={ show } bg={ variant } 
                style={{ width: 'auto', maxWidth: '100%' }}
                className={ !isAnimatedOut ? 'toast-slide-in' : 'toast-slide-out'}>
                <Toast.Body>{ message && <b>{ message }</b>}</Toast.Body>
            </Toast>
            </div>
        )
    }

    showError = (message) => {
        this.show(message, 'danger');
    }

    show = (message, variant) => {
        const { duration } = this.state;
        if(!variant) variant = 'info';

        if(this.showTimeout){
            clearTimeout(this.showTimeout);            
            this.showTimeout = null;
        }
        
        this.setState({ show : true, message, variant });
        this.showTimeout = setTimeout(() => {
            this.setState({ isAnimatedOut : true });
            
            if(this.animatedOutTimeOut){
                clearTimeout(this.animatedOutTimeOut);            
                this.animatedOutTimeOut = null;
            }
        
            this.animatedOutTimeOut = setTimeout(() => {
                this.setState({ show : false, message : '', isAnimatedOut : false });
                this.animatedOutTimeOut = null;
            }, 600);
        }, duration)
    }

}

export default SmartPropertiesToast;