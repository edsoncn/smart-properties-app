import React, { Component } from "react";
import { Card, Col, Row } from "react-bootstrap";
import SmartPropertiesCard, { LIST_ACTION } from "../components/SmartPropertiesCard"
import { customWithRouter } from "../helpers/utils"

const { smartPropertiesWorkspaceAll } = require("../configs/apisConfig")

class SmartPropertiesHomeManagement extends Component {

    initState = {
        workspaces: [],
        loading: true,
        errorMessage: ''
    }
    
    constructor(props) {
        super(props);

        this.state = {
            ...this.initState
        };
        this.tenant = props.tenant;
    }

    componentDidMount() {
        this.getWorkspaces();
    }

    render() {
        const { loading } = this.state;
        const { errorMessage } = this.state;
        const { workspaces } = this.state;

        return (
            <SmartPropertiesCard action={ LIST_ACTION } listTitle="Smart Properties"     plain="true"
                    loading={ loading } errorMessage={ errorMessage } lg="8"
                list={(
                    <Row>{
                        workspaces.map((workspace, index) =>                           
                            <Col md="4" key={'workspace_col_' + index}>
                                <Card key={'workspace_card_' + index} className="card-cursor-pointer" 
                                        onClick={() => {
                                            window.location += '/' + workspace.identifier
                                        }}>
                                    <Card.Body>
                                        <Card.Title className="mt-5 pt-3">{workspace.name}</Card.Title>
                                        <Card.Subtitle className="mt-1 text-muted">{workspace.identifier}</Card.Subtitle>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )
                    }</Row>
                )}>
            </SmartPropertiesCard>
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

}

export default customWithRouter(SmartPropertiesHomeManagement);