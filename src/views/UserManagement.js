import React, { Component } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import SmartPropertiesCard, { LIST_ACTION, SAVE_ACTION, UPDATE_ACTION } from "../components/SmartPropertiesCard"
import SmartPropertiesToast from "../components/SmartPropertiesToast"
import SmartPropertiesDeleteModal from "../components/SmartPropertiesDeleteModal"
import SmartPropertiesButton from "../components/SmartPropertiesButton"

const { 
    smartPropertiesUserAll,
    smartPropertiesUserSave,
    smartPropertiesUserUpdate,
    smartPropertiesUserGetByIdentifier,
    smartPropertiesUserDeleteByIdentifier
} = require("../configs/apisConfig")

class UserManagement extends Component {

    initState = {
        users: [],
        email: '',
        name: '',
        rol: 'admin',
        icon: '',
        action: LIST_ACTION,
        loading: true,
        errorMessage: ''
    }
    
    constructor(props) {
        super(props);

        this.state = {
            ...this.initState
        };
        this.toast = React.createRef();
        this.deleteModal = React.createRef();
        this.emailInput = React.createRef();
        
        this.tenant = props.tenant;
        
        this.btn = React.createRef();
    }

    componentDidMount() {
        this.getUsers();
    }

    render() {
        const { action } = this.state;
        const { loading } = this.state;
        const { errorMessage } = this.state;
        const { email } = this.state;
        const { name } = this.state;
        const { rol } = this.state;
        const { icon } = this.state;

        return (
            <>
                <SmartPropertiesCard action={ action } listTitle="Users" saveTitle="Create User" updateTitle="Update User"
                        loading={ loading } errorMessage={ errorMessage }
                    list={(
                        <>
                            <Button variant="primary" size="sm" className="btn-fill pull-right mb-3 py-1 px-2"
                                    onClick={() => {
                                        this.setState({...this.initState, loading: false , action: SAVE_ACTION});
                                    }} >
                                <i className="fa fa-plus"></i>
                            </Button>
                            <ListGroup className="mb-2">{
                            this.state.users.map((user, index) => 
                                <ListGroup.Item key={'user_' + index} className="d-flex align-items-center justify-content-between">
                                    <div>
                                        {user.name}<br/><span className="sub-text">{user.email}</span>                                                    
                                    </div>
                                    <div>
                                        <Button variant="success" size="sm" className="py-1 px-2 me-2"
                                                onClick={() => {
                                                    this.setState({...this.initState , action: UPDATE_ACTION, identifier: user.identifier});
                                                    this.getByIdentifier(user.identifier);
                                                }} >
                                            <i className="fa fa-pencil-alt"></i>
                                        </Button>
                                        <Button variant="danger" size="sm" className="py-1 px-2"
                                                onClick={() => {
                                                    this.deleteModal.current.show(user.name, () => { this.deleteByIdentifier(user.identifier, user.name) });
                                                }} >
                                            <i className="fa fa-trash-alt"></i>
                                        </Button>
                                    </div>
                                </ListGroup.Item>
                            )}
                            </ListGroup>
                        </>
                    )}
                    saveOrUpdate={(
                        <Form>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Email</Form.Label>{
                                action === SAVE_ACTION &&
                                    <Form.Control type="text" placeholder="Enter email" value={email} 
                                            ref={this.emailInput}
                                            onChange={(event) => {
                                                this.setState({email: event.target.value})
                                            }}
                                    />
                                }{
                                action === UPDATE_ACTION &&
                                    <Form.Text as="span">{email}</Form.Text>
                                }
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter name" value={name} 
                                        onChange={(event) => {
                                            this.setState({name: event.target.value})
                                        }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicRol">
                                <Form.Label>Rol</Form.Label>
                                <Form.Select value={rol} 
                                        onChange={(event) => {
                                            this.setState({rol: event.target.value})
                                        }}>
                                    <option value="admin">Administrator</option>
                                    <option value="operator">Operator</option>
                                    <option value="tester">Tester</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicIcon">
                                <Form.Label>Icon</Form.Label>
                                <Form.Control type="text" placeholder="Enter icon url" value={icon} 
                                        onChange={(event) => {
                                            this.setState({icon: event.target.value})
                                        }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 d-flex align-items-center justify-content-between" controlId="formBasicSubmit">
                                <Button variant="secondary" className="btn-fill"  
                                        onClick={() => {
                                            this.setState({...this.initState});
                                            this.getUsers();
                                        }} >
                                    Cancel
                                </Button>
                                <SmartPropertiesButton ref={ this.btn } name = {action === UPDATE_ACTION ? 'Update' : 'Save'} fill={ true } variant="primary"
                                        onClick={() => { action === UPDATE_ACTION ? this.update() : this.save() }} />
                            </Form.Group>
                        </Form>                    
                    )}>
                </SmartPropertiesCard>
                <SmartPropertiesToast ref={this.toast} duration={ 2500 } ></SmartPropertiesToast>
                <SmartPropertiesDeleteModal ref={this.deleteModal}></SmartPropertiesDeleteModal>
            </>
        );
    }
    
    getUsers() {
        smartPropertiesUserAll(this.tenant)
        .then(([status, users]) => {
            if(status === 200){
                console.log("User All: " + users.length);
                this.setState({users, loading : false, errorMessage : ''});
            }else{
                console.log(status + ': ' + JSON.stringify(users));
                this.setState({ loading : false, errorMessage : '(An error occurred getting the user list)'});
            }
        })
        .catch((e) => {
            console.log(e);
            this.setState({ loading : false, errorMessage : '(An unknown error occurred)'});
        });
    }

    save() {
        const {email} = this.state;
        const {name} = this.state;
        const {rol} = this.state;
        const {icon} = this.state;

        smartPropertiesUserSave(this.tenant, email, name, rol, icon)
        .then(([status, data]) => {
            if(status === 201){
                console.log("User Created");
                this.setState({...this.initState});
                this.toast.current.show('User ' + name + ' created');
                this.getUsers();
            }else if(status === 409){
                this.toast.current.showError('User with email ' + email + ' already exists');
                this.emailInput.current.focus();
                console.log(status + ': ' + JSON.stringify(data));
            } else if (status === 400) {
                this.toast.current.showError(data.errorMessage);
                console.log('Bad request: ' + data.errorMessage);
            }else{
                this.toast.current.showError('An error occurred creating user');
                console.log(status + ': ' + JSON.stringify(data));
            }
            this.resetBtn()
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred creating user');
            console.log(e);
        });
    }

    update() {
        const {email} = this.state;
        const {name} = this.state;
        const {rol} = this.state;
        const {icon} = this.state;

        smartPropertiesUserUpdate(this.tenant, email, name, rol, icon)
        .then(([status, data]) => {
            if(status === 200){
                console.log("User Updated");
                this.setState({...this.initState});
                this.toast.current.show('User ' + name + ' updated');
                this.getUsers();
            } else if (status === 400) {
                this.toast.current.showError(data.errorMessage);
                console.log('Bad request: ' + data.errorMessage);
            } else {
                this.toast.current.showError('An error occurred updating user');
                console.log(status + ': ' + JSON.stringify(data));
            }
            this.resetBtn()
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred updating user');
            console.log(e);
        });
    }

    getByIdentifier(identifier) {
        smartPropertiesUserGetByIdentifier(this.tenant, identifier)
        .then(([status, data]) => {
            if(status === 200){
                console.log(data);
                let email = data.email;
                let name = data.name;
                let rol = data.rol;
                let icon = data.icon;

                this.setState({email, name, rol, icon, loading : false, errorMessage : ''});
            }else{
                this.setState({ loading : false, errorMessage : '(An error occurred getting user)'});
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.setState({ loading : false, errorMessage : '(An unknown error occurred getting user)'});
            console.log(e);
        });
    }

    deleteByIdentifier(identifier, name) {
        smartPropertiesUserDeleteByIdentifier(this.tenant, identifier)
        .then(([status, data]) => {
            if(status === 200){
                console.log("User Deleted");
                this.setState({...this.initState});
                this.toast.current.show('User ' + name + ' deleted');
                this.getUsers();
            } else {
                this.toast.current.showError('An error occurred deleting user');
                console.log(status + ': ' + JSON.stringify(data));
            }
            this.deleteModal.current.close();
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred deleting user');
            this.deleteModal.current.close();
            console.log(e);
        });
    }

    resetBtn() {
        if(this.btn.current) this.btn.current.reset();
    }

}

export default UserManagement;