import React, { Component } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import SmartPropertiesCard, { LIST_ACTION, SAVE_ACTION, UPDATE_ACTION } from "../components/SmartPropertiesCard"
import SmartPropertiesToast from "../components/SmartPropertiesToast"
import SmartPropertiesDeleteModal from "../components/SmartPropertiesDeleteModal"

const { 
    smartPropertiesTenantAll, 
    smartPropertiesTenantSave, 
    smartPropertiesTenantUpdate, 
    smartPropertiesTenantGetByIdentifier, 
    smartPropertiesTenantDeleteByIdentifier 
} = require("../configs/apisConfig")

class TenantManagement extends Component {

    initState = {
        tenants: [],
        identifier: '',
        name: '',
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
        this.identifierInput = React.createRef();
    }

    componentDidMount() {
        this.getTenants();
    }

    render() {
        const { action } = this.state;
        const { loading } = this.state;
        const { errorMessage } = this.state;
        const { identifier } = this.state;
        const { name } = this.state;
        const { icon } = this.state;

        return (
            <>
                <SmartPropertiesCard action={ action } listTitle="Tenants" saveTitle="Create Tenant" updateTitle="Update Tenant"
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
                            this.state.tenants.map((tenant, index) => 
                                <ListGroup.Item key={'tenant_' + index} className="d-flex align-items-center justify-content-between">
                                    <div>
                                        {tenant.name}<br/><span className="sub-text">{tenant.identifier}</span>                                                    
                                    </div>
                                    <div>
                                        <Button variant="success" size="sm" className="py-1 px-2 me-2"
                                                onClick={() => {
                                                    this.setState({...this.initState , action: UPDATE_ACTION, identifier: tenant.identifier});
                                                    this.getByIdentifier(tenant.identifier);
                                                }} >
                                            <i className="fa fa-pencil-alt"></i>
                                        </Button>
                                        <Button variant="danger" size="sm" className="py-1 px-2"
                                                onClick={() => {
                                                    this.deleteModal.current.show(tenant.name, () => {this.deleteByIdentifier(tenant.identifier)});
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
                            <Form.Group className="mb-3" controlId="formBasicIdentifier">
                                <Form.Label>Identifier</Form.Label>{
                                action === SAVE_ACTION &&
                                    <Form.Control type="text" placeholder="Enter identifier" value={identifier} 
                                            ref={this.identifierInput}
                                            onChange={(event) => {
                                                this.setState({identifier: event.target.value})
                                            }}
                                    />
                                }{
                                action === UPDATE_ACTION &&
                                    <Form.Text as="span">{identifier}</Form.Text>
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
                            <Form.Group className="mb-3" controlId="formBasicIcon">
                                <Form.Label>Icon</Form.Label>
                                <Form.Control type="text" placeholder="Enter icon url" value={icon} 
                                        onChange={(event) => {
                                            this.setState({icon: event.target.value})
                                        }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 text-right" controlId="formBasicSubmit">
                                <Button variant="secondary" className="btn-fill pull-right me-3"  
                                        onClick={() => {
                                            this.setState({...this.initState});
                                            this.getTenants();
                                        }} >
                                    Cancel
                                </Button>
                                <Button variant="primary" className="btn-fill pull-right"  
                                        onClick={() => {action === UPDATE_ACTION ? this.update() : this.save()}} >
                                    {action === UPDATE_ACTION ? 'Update' : 'Save'}
                                </Button>
                            </Form.Group>
                        </Form>                    
                    )}>
                </SmartPropertiesCard>
                <SmartPropertiesToast ref={this.toast} duration={ 2500 } ></SmartPropertiesToast>
                <SmartPropertiesDeleteModal ref={this.deleteModal}></SmartPropertiesDeleteModal>
            </>
        );
    }

    getTenants() {
        smartPropertiesTenantAll()
        .then(([status, tenants]) => {
            if(status === 200){
                console.log("Tenant All: " + tenants.length);
                this.setState({tenants, loading : false, errorMessage : ''});
            }else{
                console.log(status + ': ' + JSON.stringify(status));
                this.setState({ loading : false, errorMessage : '(An error occurred getting the tenant list)'});
            }
        })
        .catch((e) => {
            console.log(e);
            this.setState({ loading : false, errorMessage : '(An unknown error occurred)'});
        });
    }

    save() {
        const {identifier} = this.state;
        const {name} = this.state;
        const {icon} = this.state;

        smartPropertiesTenantSave(identifier, name, icon)
        .then(([status, data]) => {
            if(status === 201){
                console.log("Tenant Created");
                this.setState({...this.initState});
                this.toast.current.show('Tenant ' + name + ' created');
                this.getTenants();
            }else if(status === 409){
                this.toast.current.showError('Tenant ' + identifier + ' identifier already exists');
                this.identifierInput.current.focus();
                console.log(status + ': ' + JSON.stringify(data));
            }else{
                this.toast.current.showError('An error occurred creating tenant');
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred creating tenant');
            console.log(e);
        });
    }

    update() {
        const {identifier} = this.state;
        const {name} = this.state;
        const {icon} = this.state;

        smartPropertiesTenantUpdate(identifier, name, icon)
        .then(([status, data]) => {
            if(status === 200){
                console.log("Tenant Updated");
                this.setState({...this.initState});
                this.toast.current.show('Tenant ' + name + ' updated');
                this.getTenants();
            } else {
                this.toast.current.showError('An error occurred updating tenant');
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred updating tenant');
            console.log(e);
        });
    }

    getByIdentifier(identifier) {
        smartPropertiesTenantGetByIdentifier(identifier)
        .then(([status, data]) => {
            if(status === 200){
                console.log(data);
                let name = data.name;
                let icon = data.icon;

                this.setState({name, icon, loading : false, errorMessage : ''});
            }else{
                this.setState({ loading : false, errorMessage : '(An error occurred getting tenant)'});
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.setState({ loading : false, errorMessage : '(An unknown error occurred)'});
            console.log(e);
        });
    }

    deleteByIdentifier(identifier) {
        smartPropertiesTenantDeleteByIdentifier(identifier)
        .then(([status, data]) => {
            if(status === 200){
                console.log("Tenant Deleted");
                this.setState({...this.initState});
                this.toast.current.show('Tenant ' + identifier + ' deleted');
                this.getTenants();
            } else {
                this.toast.current.showError('An error occurred deleting tenant');
                console.log(status + ': ' + JSON.stringify(data));
            }
            this.deleteModal.current.close();
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred deleting tenant');
            this.deleteModal.current.close();
            console.log(e);
        });
    }

}

export default TenantManagement;