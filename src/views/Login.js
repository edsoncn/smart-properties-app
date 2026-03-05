import React, { Component } from 'react';
import { Card, Container, Row, Col, Form, InputGroup, Alert } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import SmartPropertiesButton from "../components/SmartPropertiesButton"

const { smartPropertiesSignin } = require("../configs/apisConfig")
const { setUserSessionData } = require("../configs/authConfig") 

class Login extends Component {

    state = {
        email: '',
        password: '',
        isLoggedIn: false,
        errorMessage: ''
    }

    constructor(props) {
        super(props);

        this.tenant = props.tenant;
        this.btnLogin = React.createRef();
    }

    render() {
        const { errorMessage } = this.state;

        return (
            <Container>
                <Row className="justify-content-center mt-3 text-center">
                    <Col lg="5">
                        <h2 className='mb-0'>Smart Properties</h2>
                    </Col>
                </Row>
                <Row className="justify-content-center">
                    <Col lg="5">
                        <Card className="shadow-lg border-0 rounded-lg mt-5 p-2">
                            <Card.Header>
                                <Card.Title as="h4" className="text-center my-4">Login</Card.Title>
                            </Card.Header>
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <InputGroup className="mb-3">
                                            <InputGroup.Text><i className="fa fa-user"></i></InputGroup.Text>
                                            <Form.Control type="email" placeholder="Enter email" autoComplete="username" 
                                                    value={this.state.email} onChange={(event) => {
                                                        this.setState({email: event.target.value, errorMessage: ''});
                                                    }} onKeyUp={(event) => { if(event.key === 'Enter') this.btnLogin.current.onClick() }} />
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <InputGroup className="mb-3">
                                            <InputGroup.Text><i className="fa fa-key"></i></InputGroup.Text>
                                            <Form.Control type="password" placeholder="Password" autoComplete="current-password"
                                                    value={this.state.password} onChange={(event) => {
                                                        this.setState({password: event.target.value, errorMessage: ''});
                                                    }} onKeyUp={(event) => { if(event.key === 'Enter') this.btnLogin.current.onClick() }} />
                                        </InputGroup>
                                    </Form.Group>{
                                    errorMessage && 
                                        <Form.Group className="mb-3 text-center">
                                            <Alert variant="danger" className="diplay-inline-block mb-2"><b>{ errorMessage }</b></Alert>
                                        </Form.Group>}
                                    <Form.Group className="d-flex align-items-center justify-content-between mt-4 mb-0">
                                        <a className="small" href="password.html">Forgot Password?</a>
                                        <SmartPropertiesButton ref={ this.btnLogin } name="Login" fill={ true }
                                                onClick={ () => {
                                                    this.login();
                                                }}
                                        />
                                    </Form.Group>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>{
                this.state.isLoggedIn && (
                    <Navigate to={"/" + this.tenant + "/admin/smart-properties"} />
                )}
            </Container>
        )
    }

    login() {
        console.log(this.state);
        const {email} = this.state;
        const {password} = this.state;

        smartPropertiesSignin(this.tenant, email, password)
        .then(([status, data]) => {
            if(status === 200){
                setUserSessionData(data);
                this.setState({ isLoggedIn: true });
            }else if(status === 401){
                this.setState({ errorMessage: 'Incorrect username or password' });
            }else{
                this.setState({ errorMessage: '(An error occurred during login)' });
                console.log(status + ': ' + JSON.stringify(data));
            }
            if(this.btnLogin.current){
                this.btnLogin.current.reset(); 
            }
        })
        .catch((e) => {
            this.setState({ errorMessage: '(An unknown error occurred during login)' })
            console.log(e);
            if(this.btnLogin.current){
                this.btnLogin.current.reset(); 
            }
        });
    }
}

export default Login;