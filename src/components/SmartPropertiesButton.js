import React, { Component } from 'react';
import { Button, Spinner } from "react-bootstrap";

class SmartPropertiesButton extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            pause: false
        };
        this.fill = this.props.fill;
        this.variant = this.props.variant;
        this.onClick = this.props.onClick;
        this.name = this.props.name;
    }

    render () {
        const { loading } = this.state;
        const { pause } = this.state;
        
        return (
            <Button className={ (this.fill ? 'btn-fill' : 'btn') + ' pull-right ' + (this.props.className ?? '') } variant={ this.variant ?? 'primary' } 
                    onClick={(e) => {
                        if( !pause && this.onClick ){
                            this.setState({ loading: true, pause: true });
                            this.onClick(e, this);
                        }
                    }}>{ 
                loading && 
                    <span><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />&nbsp;</span> 
                } { this.name }
            </Button>
        )
    }

    pause () {
        this.setState({ pause: true });
    }

    reset () {
        this.setState({ loading: false, pause: false });
    }

}

export default SmartPropertiesButton;