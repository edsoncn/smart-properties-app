import React, { Component } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import SmartPropertiesCard, { LIST_ACTION, SAVE_ACTION, UPDATE_ACTION } from "../components/SmartPropertiesCard"
import SmartPropertiesToast from "../components/SmartPropertiesToast"
import SmartPropertiesDeleteModal from "../components/SmartPropertiesDeleteModal"
import SmartPropertiesTokenModal from "../components/SmartPropertiesTokenModal"
import SmartPropertiesButton from "../components/SmartPropertiesButton"

const {
    smartPropertiesWorkspaceAll,
    smartPropertiesWorkspaceSave,
    smartPropertiesWorkspaceUpdate,
    smartPropertiesWorkspaceGetByIdentifier,
    smartPropertiesWorkspaceDeleteByIdentifier
} = require("../configs/apisConfig")

class WorkspaceManagement extends Component {

    initState = {
        workspaces: [],
        identifier: '',
        name: '',
        icon: '',
        refreshUrl: '',
        hasToken: '',
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
        this.tokenModal = React.createRef();
        
        this.tenant = props.tenant;
    }

    componentDidMount() {
        this.getWorkspaces();
    }

    render() {
        const { action } = this.state;
        const { loading } = this.state;
        const { errorMessage } = this.state;
        const { identifier } = this.state;
        const { name } = this.state;
        const { icon } = this.state;
        const { refreshUrl } = this.state;
        const { hasToken } = this.state;

        return (
            <>
                <SmartPropertiesCard action={ action } listTitle="Workspaces" saveTitle="Create Workspace" updateTitle="Update Workspace"
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
                            this.state.workspaces.map((workspace, index) => 
                                <ListGroup.Item key={'workspace_' + index} className="d-flex align-items-center justify-content-between">
                                    <div>
                                        {workspace.name}<br/><span className="sub-text">{workspace.identifier}</span>                                                    
                                    </div>
                                    <div>
                                        <Button variant="success" size="sm" className="py-1 px-2 me-2"
                                                onClick={() => {
                                                    this.setState({...this.initState , action: UPDATE_ACTION, identifier: workspace.identifier});
                                                    this.getByIdentifier(workspace.identifier);
                                                }} >
                                            <i className="fa fa-pencil-alt"></i>
                                        </Button>
                                        <Button variant="danger" size="sm" className="py-1 px-2"
                                                onClick={() => {
                                                    this.deleteModal.current.show(workspace.name, () => { this.deleteByIdentifier(workspace.identifier, workspace.name) });
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
                                    <Form.Control type="text" placeholder="Enter Identifier" value={identifier} 
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
                            <Form.Group className="mb-3" controlId="formBasicWorkspace">
                                <Form.Label>Refresh URL</Form.Label>
                                <Form.Control type="text" placeholder="Enter refresh URL" value={refreshUrl} 
                                        onChange={(event) => {
                                            this.setState({refreshUrl: event.target.value})
                                        }}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 text-right" controlId="formBasicWorkspace">
                                <a className="a-link" onClick={(e) => { 
                                        e.preventDefault();
                                        this.tokenModal.current.show( (generated) => {
                                                if(!hasToken && generated){
                                                    this.setState({hasToken: true})
                                                }
                                            }) 
                                        }} >{ hasToken ? 'Replace existing token' : 'Create token' }</a>
                            </Form.Group>
                            <Form.Group className="mb-3 d-flex align-items-center justify-content-between" controlId="formBasicSubmit">
                                <Button variant="secondary" className="btn-fill"  
                                        onClick={() => {
                                            this.setState({...this.initState});
                                            this.getWorkspaces();
                                        }} >
                                    Cancel
                                </Button>
                                <SmartPropertiesButton fill={ true } name = {action === UPDATE_ACTION ? 'Update' : 'Save'}
                                        onClick={() => { action === UPDATE_ACTION ? this.update() : this.save() }} />
                            </Form.Group>
                            <SmartPropertiesTokenModal ref={this.tokenModal} tenant={this.tenant} workspace={identifier} hasToken={hasToken}></SmartPropertiesTokenModal>
                        </Form>                    
                    )}>
                </SmartPropertiesCard>
                <SmartPropertiesToast ref={this.toast} duration={ 2500 } ></SmartPropertiesToast>
                <SmartPropertiesDeleteModal ref={this.deleteModal}></SmartPropertiesDeleteModal>
            </>
        );
    }
    
    getWorkspaces() {
        smartPropertiesWorkspaceAll(this.tenant)
        .then(([status, workspaces]) => {
            if(status === 200){
                console.log("Workspace All: " + workspaces.length);
                this.setState({workspaces, loading : false, errorMessage : ''});
            }else{
                console.log(status + ': ' + JSON.stringify(workspaces));
                this.setState({ loading : false, errorMessage : '(An error occurred getting the workspace list)'});
            }
        })
        .catch((e) => {
            console.log(e);
            this.setState({ loading : false, errorMessage : '(An unknown error occurred)'});
        });
    }

    save() {
        const { identifier } = this.state;
        const { name } = this.state;
        const { icon } = this.state;
        const { refreshUrl } = this.state;

        smartPropertiesWorkspaceSave(this.tenant, identifier, name, icon, refreshUrl)
        .then(([status, data]) => {
            if(status === 201){
                console.log("Workspace Created");
                this.setState({...this.initState});
                this.toast.current.show('Workspace ' + name + ' created');
                this.getWorkspaces();
            }else if(status === 409){
                this.toast.current.showError('Workspace with identifier ' + identifier + ' already exists');
                this.identifierInput.current.focus();
                console.log(status + ': ' + JSON.stringify(data));
            }else{
                this.toast.current.showError('An error occurred creating workspace');
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred creating workspace');
            console.log(e);
        });
    }

    update() {
        const { identifier } = this.state;
        const { name } = this.state;
        const { icon } = this.state;
        const { refreshUrl } = this.state;

        smartPropertiesWorkspaceUpdate(this.tenant, identifier, name, icon, refreshUrl)
        .then(([status, data]) => {
            if(status === 200){
                console.log("Workspace Updated");
                this.setState({...this.initState});
                this.toast.current.show('Workspace ' + name + ' updated');
                this.getWorkspaces();
            } else {
                this.toast.current.showError('An error occurred updating workspace');
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred updating workspace');
            console.log(e);
        });
    }

    getByIdentifier(identifier) {
        smartPropertiesWorkspaceGetByIdentifier(this.tenant, identifier)
        .then(([status, data]) => {
            if(status === 200){
                console.log(data);
                let identifier = data.identifier;
                let name = data.name;
                let icon = data.icon;
                let refreshUrl = data.refreshUrl;
                let hasToken = data.hasToken

                this.setState({identifier, name, icon, refreshUrl, hasToken, loading : false, errorMessage : ''});
            }else{
                this.setState({ loading : false, errorMessage : '(An error occurred getting workspace)'});
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.setState({ loading : false, errorMessage : '(An unknown error occurred)'});
            console.log(e);
        });
    }

    deleteByIdentifier(identifier, name) {
        smartPropertiesWorkspaceDeleteByIdentifier(this.tenant, identifier)
        .then(([status, data]) => {
            if(status === 200){
                console.log("Workspace Deleted");
                this.setState({...this.initState});
                this.toast.current.show('Workspace ' + name + ' deleted');
                this.getWorkspaces();
            } else {
                this.toast.current.showError('An error occurred deleting workspace');
                console.log(status + ': ' + JSON.stringify(data));
            }
            this.deleteModal.current.close();
        })
        .catch((e) => {
            this.toast.current.showError('An error occurred deleting workspace');
            this.deleteModal.current.close();
            console.log(e);
        });
    }

}

export default WorkspaceManagement;