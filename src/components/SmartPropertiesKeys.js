import React, { Component } from 'react';
import { Row, Col, ListGroup, Button } from "react-bootstrap";
import SmartPropertiesCard, { LIST_ACTION } from "../components/SmartPropertiesCard"
import SmartPropertiesToast from "../components/SmartPropertiesToast"
import SmartPropertiesDeleteModal from "../components/SmartPropertiesDeleteModal"
import SmartPropertiesButton from "../components/SmartPropertiesButton"

const { 
    smartPropertiesKeysAll,
    smartPropertiesSmartPropertyDeleteByIdentifier,
    smartPropertiesWorkspaceGetByIdentifier
} = require("../configs/apisConfig")

class SmartPropertiesKeys extends Component {

    initState = {
        keys: [],
        selectedKey: '',
        loading: true,
        errorMessage: ''
    }

    constructor(props) {
        super(props);

        this.state = {
            ...this.initState
        }
        this.onSelectKey = props.onSelectKey;
        this.onInitNew = props.onInitNew;
        this.onReset = props.onReset;
        this.tenant = props.tenant;
        this.workspace = props.workspace;
        this.rol = props.rol;
        this.refreshUrl = '';
        this.showDeploy = this.rol === 'admin' || this.rol === 'super.admin';

        this.toast = React.createRef();
        this.deleteModal = React.createRef();
        this.btnDeploy = React.createRef();
    }
    
    render() {
        const { keys } = this.state;
        const { selectedKey } = this.state;
        const { loading } = this.state;
        const { errorMessage } = this.state;

        return (
            <>
                <SmartPropertiesCard action={ LIST_ACTION } 
                        listTitle="Smart Properties List" 
                        listSubTitle="Add or find your Smart Property to code you business logic"
                        loading={ loading } errorMessage={ errorMessage } onlyCard={ true }
                        className={ this.props.className ?? '' }
                    list={(
                        <Row>{
                            this.rol !== 'tester' &&
                                <Col className="pb-3 d-flex align-items-center justify-content-between" md="12">
                                    <Button className="btn-fill pull-right" type="submit" 
                                            onClick={ () => {
                                                this.setState({ selectedKey : '' })
                                                this.onInitNew()
                                            }}>
                                        Add
                                    </Button>{
                                    this.showDeploy && 
                                        <SmartPropertiesButton ref={ this.btnDeploy } name="Deploy" fill={ true } variant="danger"
                                                onClick={ () => {                                                    
                                                    if(this.refreshUrl === ''){
                                                        this.btnDeploy.current.reset();
                                                        this.toast.current.show('Setup a refresh url on Workspaces Management');
                                                    } else {
                                                        this.callRefreshUrl();
                                                    }
                                                }}
                                        />}
                                </Col>}
                            <Col md="12">
                                <ListGroup>{ 
                                keys.map((key) => (
                                    <ListGroup.Item key={ 'listItem_' + key } action active={ key === selectedKey } className='d-flex align-items-center justify-content-between'
                                            onClick={ (e) => this.selectKeyOrDelete(e, key) }>
                                        <div>{ key }</div>
                                        <div className="mt-1"><span className='delete-link' ><i className="nc-icon nc-simple-remove"></i></span></div>
                                    </ListGroup.Item>
                                ))}
                                </ListGroup>
                            </Col>
                        </Row>
                    )}>
                </SmartPropertiesCard>
                <SmartPropertiesToast ref={this.toast} duration={ 2500 } ></SmartPropertiesToast>
                <SmartPropertiesDeleteModal ref={this.deleteModal}></SmartPropertiesDeleteModal>
            </>
        )
    }


    componentDidMount() {
        this.loadKeys(null);

        if(this.showDeploy) {
            this.getWorkspace();
        } 
    }

    selectKeyOrDelete(e, key) {
        if (e.target.className.indexOf('nc-simple-remove') >= 0) {
            this.deleteModal.current.show(key, () => {this.delete(key)});
        } else {
            if(this.state.selectedKey !== key) {
                this.setState({ selectedKey : key })
                this.onSelectKey(key);
            } else {
                this.setState({ selectedKey : '', loading: false, errorMessage: '' });
                this.onReset();
            }
        }
    }
    
    loadKeys(preselectKey) {
        if(preselectKey) this.setState({ loading : true, errorMessage : '' });
        smartPropertiesKeysAll(this.tenant, this.workspace)
        .then(([status, keys]) => {
            if(status === 200) {
                keys.sort();
                this.setState({ keys, loading : false, errorMessage : '' });
                if(preselectKey){
                    this.setState({ selectedKey : preselectKey })
                    this.onSelectKey(preselectKey)
                }
            } else {
                console.log('Error loading keys: ' + status);
                this.setState({ loading : false, errorMessage : '(An error occurred getting the keys)'});
            }
        })
        .catch((e) => {
            this.setState({ loading : false, errorMessage : '(An unknown error occurred getting the keys)'});
            console.log(e);
        });
    }

    delete(key) {
        smartPropertiesSmartPropertyDeleteByIdentifier(this.tenant, this.workspace, key)
        .then(([status]) => {
            if(status === 200) {
                console.log('Smart Property '+ key +' Deleted');
                this.toast.current.show('Smart Property ' + key + ' deleted');
                this.setState({ ...this.initState });
                this.onReset();
                this.loadKeys(null);
            } else {
                this.toast.current.showError('An error occurred deleting Smart Property');
                console.log(status + ': ' + status);
            }
            this.deleteModal.current.close();
        })
        .catch((e) => {
            this.toast.current.showError('An unknow error occurred deleting Smart Property');
            this.deleteModal.current.close();
            console.log(e);
        });
    }

    getWorkspace() {
        smartPropertiesWorkspaceGetByIdentifier(this.tenant, this.workspace)
        .then(([status, data]) => {
            if(status === 200){
                console.log(data);
                this.refreshUrl = data.refreshUrl;
            }else{
                this.toast.current.showError('An error occurred getting workspace');
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.toast.current.showError('An unknown error occurred getting workspace');
            console.log(e);
        });
    }

    callRefreshUrl() {
        console.log(this.refreshUrl);        
        fetch(this.refreshUrl).then((res) => {
            if(res.status === 200){
                this.toast.current.show('Deployed!');
            } else {
                this.toast.current.showError('An error deploying');
            }
            this.btnDeploy.current.reset();
        })
        .catch((e) => {
            this.toast.current.showError('An unknown error occurred deploying');
            console.log(e);
            this.btnDeploy.current.reset();
        });
    }

}

export default SmartPropertiesKeys;
