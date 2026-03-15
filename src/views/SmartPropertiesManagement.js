import React, { Component } from 'react';
import SmartPropertiesCard, { SAVE_ACTION, UPDATE_ACTION } from "../components/SmartPropertiesCard"
import SmartPropertiesKeys from "../components/SmartPropertiesKeys"
import { Card, Container, Row, Col, Form, Button, Table, Breadcrumb, Spinner } from "react-bootstrap";
import SmartPropertiesApi, { SmartPropertiesCompiler, Variable, SmartPropertiesException, Value } from '../ext/smart-properties-compiler/SmartPropertiesCompiler.js';
import SmartPropertiesToast from "../components/SmartPropertiesToast"
import SmartPropertiesDeleteModal from "../components/SmartPropertiesDeleteModal"
import SmartPropertiesButton from "../components/SmartPropertiesButton"
import SmartPropertiesCode from "../components/SmartPropertiesCode"
import { customWithRouter } from "../helpers/utils"

const { SMART_PROPERTIES_API_V2 } = require("../helpers/constants")
const {
    smartPropertiesSmartPropertyByIdentifier,
    smartPropertiesSmartPropertySave,
    smartPropertiesSmartPropertyUpdate,
    smartPropertiesCodeAll,
    smartPropertiesAiExplainCode,
    smartPropertiesAiGenerateTestCases,
    smartPropertiesAiGenerateCode,
    smartPropertiesAiUpdateCode
} = require("../configs/apisConfig")
const typeList = [
    { name: 'String', value: 'string'},
    { name: 'Integer', value: 'int'},
    { name: 'Float', value: 'float'},
    { name: 'Boolean', value: 'boolean'}
]
const typeWithNoneList = [
    { name: '(none)', value: 'none'},
    ...typeList
]

class SmartPropertiesManagement extends Component {

    initState = {
        action: '',
        loading: false,
        errorMessage: '',
        aiExplainCodeText: null,
        aiExplainCodeTitle: null,
        aiGenerateCodeShow: false,
        aiGenerateCodeText: '',
        aiUpdateCodeShow: false,
        aiUpdateCodeText: ''
    }

    initSelectedState = {
        name: '',
        key: '',
        defaultValue: '',
        defaultValueType: 'none',
        code: '',
        sets: []
    }

    constructor(props) {
        super(props);

        this.state = {
            selected: { ...this.initSelectedState },
            ...this.initState
        }

        this.tenant = props.tenant;
        this.workspace = this.props.router.params.workspace;
        this.smartPropertiesApi = new SmartPropertiesApi(SMART_PROPERTIES_API_V2, this.tenant, this.workspace, '');
        
        this.smartPropertiesKeys = React.createRef();
        this.toast = React.createRef();
        this.deleteModal = React.createRef();
        this.identifierInput = React.createRef();
        this.smartPropertiesCode = React.createRef();
        this.btnGenerateTestCases = React.createRef();
        this.btnExplainCode = React.createRef();
        this.btnGenerateCode = React.createRef();
        this.btnUpdateCode = React.createRef();

        this.btnSave = React.createRef();
        this.btnUpdate = React.createRef();
        this.btns = [
            this.btnSave,
            this.btnUpdate,
            this.btnGenerateTestCases,
            this.btnExplainCode,
            this.btnGenerateCode,
            this.btnUpdateCode
        ]
        
        this.rol = sessionStorage.getItem("userRol");
    }

    componentDidMount() {
        this.loadSmartPropertiesCodeData();
    }

    render() {
        const { action } = this.state;
        const { loading } = this.state;
        const { errorMessage } = this.state;
        const { aiExplainCodeText } = this.state
        const { aiExplainCodeTitle } = this.state
        const { aiGenerateCodeShow } = this.state
        const { aiGenerateCodeText } = this.state
        const { aiUpdateCodeShow } = this.state
        const { aiUpdateCodeText } = this.state
        
        let selected = { ...this.state.selected };

        return (
            <Container fluid>
                <Row>                
                    <Col md="12">
                        <Breadcrumb>
                            <Breadcrumb.Item href={ '/' + this.tenant + '/admin/smart-properties' }>Smart Properties</Breadcrumb.Item>
                            <Breadcrumb.Item active>{ this.workspace }</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                </Row>
                <Row>
                    <Col md="4">
                        <SmartPropertiesKeys ref={ this.smartPropertiesKeys } tenant={ this.tenant } workspace={ this.workspace } rol={ this.rol }
                                onInitNew={ () => { this.initNew() } } onReset={ () => { this.resetState() } } onSelectKey={ (key) => { this.selectKey(key) } } />
                    </Col>{
                    action &&
                        <Col md="8">
                            <SmartPropertiesCard action={ action } saveTitle="New Smart Property" updateTitle={ (this.rol !== 'tester' ? 'Update ' : 'Test ') + selected.name }
                                    loading={ loading } errorMessage={ errorMessage } plain={ true } onlyCard={ true }
                                saveOrUpdate={(
                                    <>
                                        { action === SAVE_ACTION && 
                                            <Row className='mb-3'>
                                                <Col md="6">
                                                    <Form.Group>
                                                        <Form.Label>Name</Form.Label>
                                                        <Form.Control key="control-name" type="text" name="name" onChange={this.handleChangeInput.bind(this)} value={selected.name} />
                                                    </Form.Group>
                                                </Col>
                                                <Col className="pe-1" md="6">
                                                    <Form.Group>
                                                        <Form.Label>Identifier</Form.Label>
                                                        <Form.Control key="control-identifier" ref={ this.identifierInput } type="text" name="key" onChange={this.handleChangeInput.bind(this)} value={selected.key} />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        }
                                        { action === UPDATE_ACTION && 
                                            <Row className='mb-3'>
                                                <Col md="6">
                                                    <Form.Group>
                                                        <Form.Label>Name</Form.Label>
                                                        <Form.Control key="control-name" type="text" name="name" onChange={this.handleChangeInput.bind(this)} value={selected.name} />
                                                    </Form.Group>
                                                </Col>
                                                <Col className="pe-1" md="6">
                                                    <Form.Group>
                                                        <Form.Label>Identifier</Form.Label>
                                                        <Form.Text className='fw-bold'>{ selected.key }</Form.Text>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        }
                                        <Row className='mb-3'>{
                                            this.rol !== 'tester' && <>
                                                <Col className="pe-1" md="3">
                                                    <Form.Label>Default Type</Form.Label>
                                                    <Form.Select key="control-def-type-select" name="defaultValueType" onChange={this.handleChangeInput.bind(this)} value={selected.defaultValueType}>
                                                        {typeWithNoneList.map( type => (
                                                            <option value={type.value}>{type.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>
                                                <Col className="pe-1" md="6">
                                                    <Form.Group>
                                                        <Form.Label>Default value</Form.Label>
                                                        { selected.defaultValueType !== 'boolean' &&
                                                            <Form.Control key="control-def-value" type="text" name="defaultValue" onChange={this.handleChangeInput.bind(this)} value={selected.defaultValue} disabled={selected.defaultValueType === 'none'} />
                                                        }
                                                        { selected.defaultValueType === 'boolean' &&
                                                            <Form.Select key="control-def-value-boolean" name="defaultValue" onChange={this.handleChangeInput.bind(this)} value={selected.defaultValue}>
                                                                <option value="true">True</option>
                                                                <option value="false">False</option>
                                                            </Form.Select>
                                                        }   
                                                    </Form.Group>
                                                </Col></>}{                                             
                                            this.rol === 'tester' && 
                                                <Col className="pe-1" md="6">
                                                    <Form.Group>
                                                        <Form.Label>Default value</Form.Label>
                                                        <Form.Text>{ (selected.defaultValue ? selected.defaultValue + ' ' : '' ) + 
                                                                '( ' + (selected.defaultValueType ?? 'none') + ' )'}</Form.Text>
                                                    </Form.Group>
                                                </Col>}
                                        </Row>
                                        <Row className='mb-3'>
                                            <Col md="12">
                                                <Form.Group>
                                                    <Form.Label>Code</Form.Label>
                                                    <SmartPropertiesCode ref={ this.smartPropertiesCode } code={selected.code} smartPropertiesApi={ this.smartPropertiesApi }
                                                            onChange={ this.handleChangeCode.bind(this) } editable = {this.rol !== 'tester'} />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row className='mb-3'>
                                            { aiExplainCodeText !== null && 
                                            <Col className='mb-3' md="12">
                                                    <Card className="genai-response-container p-2 mb-0">
                                                        {aiExplainCodeText !== '' && 
                                                            <Card.Header><h5>{ aiExplainCodeTitle }</h5></Card.Header>
                                                        }
                                                        <Card.Body>
                                                            {aiExplainCodeText === '' && 
                                                                <Spinner animation="border" variant="primary" /> }
                                                            {aiExplainCodeText !== '' && 
                                                                <div className="genai-response-text">
                                                                    <p className='mb-0'>{ aiExplainCodeText }</p>
                                                                </div> }
                                                        </Card.Body>
                                                    </Card>
                                            </Col> }
                                            <Col md="12">
                                                { this.rol !== 'tester' && (
                                                    <Button className='btn-genai rounded-pill me-2' onClick={() => this.aiGenerateCodeAction()} variant='info'>✨ Generate the code</Button>
                                                )}
                                                <SmartPropertiesButton ref={ this.btnGenerateTestCases } className='btn-genai rounded-pill me-2' onClick={() => this.aiGenerateTestCases()} variant='info' name = "✨ Generate test cases" />
                                                <SmartPropertiesButton ref={ this.btnExplainCode } className='btn-genai rounded-pill me-2' onClick={() => this.aiExplainCode()} variant='info' name = "✨ Explain the code" />
                                                { this.rol !== 'tester' && (
                                                 <Button className='btn-genai rounded-pill' onClick={() => this.aiUpdateCodeAction()} variant='info'>✨ Update the code</Button>
                                                )}
                                            </Col>
                                            { aiGenerateCodeShow &&
                                            <Col className='mt-3' md="12">
                                                <Card className="genai-response-container p-2 mb-0">
                                                    <Card.Body>
                                                        <Row>
                                                            <Col md="12">
                                                                <Form.Control as={'textarea'} rows={4} placeholder="Describe your code..." 
                                                                        value={aiGenerateCodeText} onChange={this.handleChangeSelectInputs.bind(this, 'aiGenerateCodeText')} />
                                                            </Col>
                                                            <Col md="12" className='d-flex justify-content-end'>
                                                                <SmartPropertiesButton ref={ this.btnGenerateCode } className='btn-genai rounded-pill mt-3' onClick={() => this.aiGenerateCode()} variant='info' name="✨ Generate" />
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            </Col> }
                                            { aiUpdateCodeShow &&
                                            <Col className='mt-3' md="12">
                                                <Card className="genai-response-container p-2 mb-0">
                                                    <Card.Body>
                                                        <Row>
                                                            <Col md="12">
                                                                <Form.Control as={'textarea'} rows={4} placeholder="Describe the update for your code..." 
                                                                        value={aiUpdateCodeText} onChange={this.handleChangeSelectInputs.bind(this, 'aiUpdateCodeText')} />
                                                            </Col>
                                                            <Col md="12" className='d-flex justify-content-end'>
                                                                <SmartPropertiesButton ref = { this.btnUpdateCode } className='btn-genai rounded-pill mt-3' onClick={() => this.aiUpdateCode()} variant='info' name="✨ Update" />
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            </Col> }
                                        </Row>
                                        <Row>
                                            <Col md="12">
                                                <Form.Group>
                                                    <Form.Label className='mb-2'>Test cases</Form.Label>
                                                    
                                                    { selected.sets === null && 
                                                        <Spinner animation="border" variant="primary" /> }
                                                    { selected.sets !== null && selected.sets.map((set, setIndex) => (
                                                        <Card>
                                                            <Card.Body>
                                                                <Row>
                                                                    <Col className="ps-4 pt-2 mb-3" md="12">
                                                                        <Form.Label className="me-2 d-inline">Name: </Form.Label>
                                                                        { set.edit &&
                                                                            <Form.Control type="text" name="name" key={'set-name-' + setIndex} value={set.name} onChange={this.handleChangeSetInputs.bind(this, setIndex)} />
                                                                        }
                                                                        { !set.edit &&
                                                                            <Form.Text className='fw-bold'>{ set.name }</Form.Text>
                                                                        }
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col className="ps-4 mb-1" md="12">
                                                                        <Form.Label>Input Variables</Form.Label>
                                                                    </Col>
                                                                </Row>
                                                                { set.edit && set.variables.map((variable, index) => (
                                                                    <Row className='mb-3'>
                                                                        <Col className="pe-2 ps-4" md="4">
                                                                            <Form.Label>Name</Form.Label>
                                                                            <Form.Control type="text" name="name" key={'var-name-' + setIndex + '-' + index} value={variable.name} onChange={this.handleChangeVariablesInput.bind(this, setIndex, index)} />
                                                                        </Col>
                                                                        <Col md="2">
                                                                            <Form.Label>Type</Form.Label>
                                                                            <Form.Select name="type" key={'var-type-' + setIndex + '-' + index} value={variable.type} onChange={this.handleChangeVariablesInput.bind(this, setIndex, index)}>
                                                                                {typeList.map( type => (
                                                                                    <option value={type.value}>{type.name}</option>
                                                                                ))}
                                                                            </Form.Select>
                                                                        </Col>
                                                                        <Col className="pe-2 ps-2" md="4">
                                                                            <Form.Label>Value</Form.Label>
                                                                            { variable.type !== 'boolean' &&
                                                                                <Form.Control type="text" name="value" key={'var-value-' + setIndex + '-' + index} value={variable.value} onChange={this.handleChangeVariablesInput.bind(this, setIndex, index)} />
                                                                            }
                                                                            { variable.type === 'boolean' &&
                                                                                <Form.Select name="value" key={'var-value-' + setIndex + '-' + index} value={variable.value} onChange={this.handleChangeVariablesInput.bind(this, setIndex, index)}>
                                                                                    <option value="true">True</option>
                                                                                    <option value="false">False</option>
                                                                                </Form.Select>
                                                                            }
                                                                        </Col>
                                                                        <Col className="pe-4" md="2">
                                                                            <Form.Label>&nbsp;</Form.Label>
                                                                            <Button className="btn-bold" variant="danger" onClick={() => this.removeVariable(setIndex, index)}><i className="fa fa-remove"></i></Button>
                                                                        </Col>
                                                                    </Row>
                                                                ))}
                                                                { set.edit && 
                                                                    <Row className='mb-3'>
                                                                        <Col className="pe-4 d-flex justify-content-center" md="12">
                                                                            <Button className="btn-bold" onClick={() => this.addNewVariable(setIndex)}><i className="fa fa-plus"></i></Button>
                                                                        </Col>
                                                                    </Row>
                                                                }                 			
                                                                { !set.edit && set.variables.length > 0 &&
                                                                    <Row className='mb-3'>
                                                                        <Col className="pe-4 pt-1 ps-4" md="12">
                                                                            <Table striped bordered hover className="variable-table">
                                                                                <thead>
                                                                                    <tr key="vars-table-head">
                                                                                        <th className="table-th-30">Name</th>
                                                                                        <th className="table-th-25">Type</th>
                                                                                        <th>Value</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    { !set.edit && set.variables.map((variable, index) => (
                                                                                        <tr key={'vars-table-row' + index}>
                                                                                            <td>{variable.name}</td>
                                                                                            <td>{variable.type}</td>
                                                                                            <td>{variable.value}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </Table>
                                                                        </Col>
                                                                    </Row>
                                                                }
                                                                <Row>
                                                                    <Col className="ps-4 mb-1" md="12">
                                                                        <Form.Label>Expected value</Form.Label>
                                                                    </Col>
                                                                </Row>
                                                                { set.edit &&
                                                                    <Row className='mb-3'>
                                                                        <Col md="2" className='ps-4'>
                                                                            <Form.Label>Type</Form.Label>
                                                                            <Form.Select name="type" key={'expected-' + setIndex} value={set.expected.type} onChange={this.handleChangeSetExpectedInputs.bind(this, setIndex)}>
                                                                                {typeWithNoneList.map( type => (
                                                                                    <option value={type.value}>{type.name}</option>
                                                                                ))}
                                                                                <option value="array">Array</option>
                                                                            </Form.Select>
                                                                        </Col>
                                                                        <Col className="pe-2 ps-2" md="4">
                                                                            <Form.Label>Value</Form.Label>
                                                                            { set.expected.type !== 'boolean' &&
                                                                                <Form.Control type="text" name="value" key={'expected-' + setIndex} value={set.expected.value} onChange={this.handleChangeSetExpectedInputs.bind(this, setIndex)} disabled={set.expected.type === 'none'} />
                                                                            }
                                                                            { set.expected.type === 'boolean' &&
                                                                                <Form.Select name="value" key={'expected-' + setIndex} value={set.expected.value} onChange={this.handleChangeSetExpectedInputs.bind(this, setIndex)}>
                                                                                    <option value="true">True</option>
                                                                                    <option value="false">False</option>
                                                                                </Form.Select>
                                                                            }
                                                                        </Col>
                                                                    </Row>
                                                                }
                                                                { !set.edit &&
                                                                    <Row className='mb-3'>
                                                                        <Col md="8" className='ps-4'>
                                                                            { set.expected && set.expected.type !== 'none' &&
                                                                                <Table striped bordered hover className="variable-table">
                                                                                    <thead>
                                                                                        <tr>
                                                                                            <th className="table-th-25">Type</th>
                                                                                            <th>Value</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        <tr>
                                                                                            <td>{set.expected.type}</td>
                                                                                            <td>{set.expected.value}</td>
                                                                                        </tr>
                                                                                    </tbody>
                                                                                </Table>}
                                                                            { (!set.expected || set.expected.type === 'none') &&
                                                                                <span className='results-text-console'>(none)</span>
                                                                            }
                                                                        </Col>
                                                                    </Row>
                                                                }
                                                                <Row className='mb-3'>
                                                                    <Col className="ps-4" md="12">
                                                                        <Form.Check key={'check-skip-default-' + setIndex} name="skipDefault" type="switch" label="Skip default value" checked={set.skipDefault} 
                                                                                onChange={(e) => { selected.sets[setIndex].skipDefault = !set.skipDefault; this.setState({selected : selected});}} />
                                                                    </Col>
                                                                </Row>
                                                                <Row className='mb-3'>
                                                                    <Col className="ps-4" md="12">
                                                                        { set.edit && 
                                                                            <Button className="btn-bold me-3" onClick={() => {selected.sets[setIndex].edit = false; this.setState({selected : selected})}}><i className="fa fa-check"></i></Button>
                                                                        }
                                                                        { !set.edit && 
                                                                            <Button className="btn-bold me-3" onClick={() => {selected.sets[setIndex].edit = true; this.setState({selected : selected})}}><i className="fa fa-pencil-alt"></i></Button>
                                                                        }
                                                                        <SmartPropertiesButton name="Run" fill={ true } variant="danger"
                                                                                onClick={ (e, smartBtn) => {
                                                                                    this.compileCode(smartBtn, setIndex);
                                                                                }}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                                { set.run && set.run.error &&
                                                                    <Row>
                                                                        <Col className="pb-1 ps-4 pe-4 pt-1" md="12">
                                                                            <Form.Label>Error</Form.Label>
                                                                            <Card bg="danger" text="white" className="mb-2">
                                                                                <Card.Body className="results-console">
                                                                                    <Card.Text className="results-text-console">{set.run.error}</Card.Text>
                                                                                </Card.Body>
                                                                            </Card>
                                                                        </Col>
                                                                    </Row>
                                                                }
                                                                { set.run && (set.run.result || set.run.result === '') &&
                                                                    <Row>
                                                                        <Col className="pb-1 ps-4 pe-4 pt-1" md="12">
                                                                            <Form.Label>Return Value</Form.Label>
                                                                            <Card bg="success" text="white" className="mb-2">
                                                                                <Card.Body className="results-console">
                                                                                    <Card.Text className="results-text-console">{set.run.result}</Card.Text>
                                                                                </Card.Body>
                                                                            </Card>
                                                                        </Col>
                                                                    </Row>
                                                                }
                                                                { set.run && set.run.console &&
                                                                    <Row>
                                                                        <Col className="pb-1 ps-4 pe-4" md="12">
                                                                            <Form.Label>Console</Form.Label>
                                                                            <Card bg="dark" text="white" className="mb-2">
                                                                                <Card.Body className="results-console">
                                                                                    <Card.Text className="results-text-console" dangerouslySetInnerHTML={{__html: set.run.console}}></Card.Text>
                                                                                </Card.Body>
                                                                            </Card>
                                                                        </Col>
                                                                    </Row>
                                                                }
                                                                { set.run && set.run.variables && <>
                                                                    <Row>
                                                                        <Col className="ps-4 pe-4" md="12">
                                                                            <Form.Label>Output Variables</Form.Label>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Col className="pb-2 ps-4 pe-4" md="12">
                                                                            <Table striped bordered hover className="variable-table">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th className="table-th-30">Name</th>
                                                                                        <th className="table-th-25">Type</th>
                                                                                        <th>Value</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    { set.run.variables.map((variable, index) => (
                                                                                        <tr key={'variable-' + setIndex + '-' + index}>
                                                                                            <td>{variable.name}</td>
                                                                                            <td>{variable.getType()}</td>
                                                                                            <td>{variable.toString()}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </Table>
                                                                        </Col>
                                                                    </Row></>
                                                                }                                                    
                                                            </Card.Body>
                                                        </Card>
                                                    ))}		    
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        { selected.sets !== null && 
                                            <Row className='mb-12'>
                                                <Col className="pe-4 d-flex justify-content-center" md="12">
                                                    <Button onClick={() => this.addSet()}><i className="fa fa-plus"></i> Add Test Case</Button>
                                                </Col>
                                            </Row> }
                                        <Row className='mb-3'>
                                            <Col className="pb-3 d-flex justify-content-end" md="12">{
                                                action === SAVE_ACTION &&
                                                    <SmartPropertiesButton ref={ this.btnSave } name="Save" fill={ true } 
                                                            onClick={ () => {
                                                                this.saveSmartProperty();
                                                            }}
                                                    />}{
                                                action === UPDATE_ACTION && this.rol !== 'tester' &&
                                                    <SmartPropertiesButton ref={ this.btnUpdate } name="Update" fill={ true } 
                                                            onClick={ () => {
                                                                this.updateSmartProperty();
                                                            }}
                                                    />}
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            />
                        </Col>
                    }
                </Row>
                <SmartPropertiesToast ref={this.toast} duration={ 2500 } ></SmartPropertiesToast>
                <SmartPropertiesDeleteModal ref={this.deleteModal}></SmartPropertiesDeleteModal>
            </Container>
        );
    } 

    initNew() {
        this.setState({ 
            selected: { ...this.initSelectedState },
            ...this.initState,
            action: SAVE_ACTION
        });
    }

    resetState() {
        this.setState({ ...this.initState, selected: { ...this.initSelectedState }} );
    }

    selectKey(key) {
        this.setState({ 
            selected: { ...this.initSelectedState },
            ...this.initState,
            action: UPDATE_ACTION,
            loading: true
        });
        smartPropertiesSmartPropertyByIdentifier(this.tenant, this.workspace, key)
        .then(([status, smartProperty]) => {
            if(status === 200) {
                console.log('SmartProperty: ');
                console.log(smartProperty);
                let sets = [];
                
                if(smartProperty.sets){
                    sets = JSON.parse(smartProperty.sets);
                }
                sets.forEach(set => {
                    if (!set.expected) {
                        set['expected'] = { type: 'none', value: '' }
                    }
                })
                this.setState({
                        ...this.initState,
	                    selected: {
	                        ...smartProperty,
	                        new: false,
                            sets
	                    },
                        action: UPDATE_ACTION
                    }, () => this.smartPropertiesCode.current.contentEditableOnInput()
                )
            } else {
                console.log('Error loading keys: ' + status);
                this.setState({ loading : false, errorMessage : '(An error occurred getting the smart property)'});
            }
        })
        .catch((e) => {
            console.log(e);            
            this.setState({ loading : false, errorMessage : '(An unknown error occurred getting the smart property)'});
        });
    }

    updateSmartProperty() {        
        let smartProperty = this.populateSmartPropertyData();        
        if(smartProperty.error) return;

        this.pauseBtns();
        smartPropertiesSmartPropertyUpdate(this.tenant, this.workspace, smartProperty)
        .then(([status, data]) => {
            if(status === 200){
                console.log("Smart Property Updated");
                this.toast.current.show('Smart Property ' + smartProperty.name + ' updated');
                this.loadSmartPropertiesCodeData();
            } else if (status === 400) {
                this.toast.current.showError(data.errorMessage);
                console.log('Bad request: ' + data.errorMessage);
                this.resetBtns();
            } else {
                this.toast.current.showError('An error occurred updating the smart property');
                console.log('Error updating Smart Property: ' + status); 
            }
            this.resetBtns();
        })
        .catch((e) => {
            this.toast.current.showError('An unknown error occurred updating the smart property');
            console.log(e);
            this.resetBtns();
        });
    }

    saveSmartProperty() {        
        let key = this.state.selected.key;
        let smartProperty = this.populateSmartPropertyData();    
        if(smartProperty.error) return;

        this.pauseBtns();
        smartPropertiesSmartPropertySave(this.tenant, this.workspace, smartProperty)
        .then(([status, data]) => {
            if(status === 201){
                this.toast.current.show('Smart property ' + key + ' created');
                this.resetBtns();
                this.setState({ loading : true, errorMessage : ''});
                this.loadSmartPropertiesCodeData();
                this.smartPropertiesKeys.current.loadKeys(key);
            } else if (status === 409) {
                this.toast.current.showError('Smart property ' + key + ' already exists');
                this.identifierInput.current.focus();
                this.resetBtns();
            } else if (status === 400) {
                this.toast.current.showError(data.errorMessage);
                console.log('Bad request: ' + data.errorMessage);
                this.resetBtns();
            } else {
                this.toast.current.showError('An error occurred saving the smart property');
                console.log('Error saving Smart Property: ' + status);
                this.resetBtns();
            }
        })
        .catch((e) => {
            this.toast.current.showError('An unknown error occurred saving the smart property');
            console.log(e);
            this.resetBtns();
        });
    }
    
    populateSmartPropertyData() {
        const { selected } = this.state;
        let program = this.smartPropertiesApi.executeSemanticAnalyzer(selected.code);
		
		if(program instanceof SmartPropertiesException){
            this.setState({ run : {error : program.getMessage()}, loading: false });
			return {error: program.getMessage()}
		} else {
            if(selected.defaultValueType !== 'none'){
                program.setDefaultValue(this.getValue(selected.defaultValueType, selected.defaultValue));
            }       
            
	        let translatedCode = this.smartPropertiesApi.getJSONString(program);
            let sets = []
            
            selected.sets.forEach(set => {
                let setData = {
                    name: set.name,
                    variables: set.variables,
                    skipDefault: set.skipDefault,
                }
                if (set.expected.type !== 'none') {
                    setData['expected'] = set.expected
                }
                sets.push(setData)
            })

			let propertyData = {
	            ...selected,
	            translatedCode,
                sets: JSON.stringify(sets)
			}

            console.log("propertyData: ")
            console.log(propertyData)
						
			return propertyData;
		}
	}

    loadSmartPropertiesCodeData() {
        smartPropertiesCodeAll(this.tenant, this.workspace)
        .then(([status, data]) => {
            if(status === 200) {
                this.smartPropertiesApi.setSmartPropertiesCodeData(data);
            }else{
                this.toast.current.showError('An error occurred getting all codes');
                console.log(status + ': ' + JSON.stringify(data));
            }
        })
        .catch((e) => {
            this.toast.current.showError('An unknown error occurred getting all codes');
            console.log(e);
        });
    }
    
    compileCode(smartBtn, setIndex) {
        let selected = { ...this.state.selected };

        this.pauseBtns();
        selected.sets[setIndex].run = {}
        this.setState({ selected : selected }, () => {
            setTimeout(() => { this.runCompileCode(smartBtn, setIndex) } , 120);            
        });
    }

    runCompileCode(smartBtn, setIndex) {
        let selected = { ...this.state.selected };
        let program = this.smartPropertiesApi.executeSemanticAnalyzer(selected.code);
		
		if(program instanceof SmartPropertiesException){
            selected.sets[setIndex].run = { error : program.getMessage() }
            this.setState({ selected: selected});
		} else {			
	        let variables = [];
            let set = selected.sets[setIndex];
	        
	        for(let v of set.variables){
				let variable = new Variable(v.name);
				
				variable.setValue(this.getValue(v.type, v.value));
				variables.push(variable);
			}
            if(selected.defaultValueType !== 'none'){
                program.setDefaultValue(this.getValue(selected.defaultValueType, selected.defaultValue));
            }
			
			let smartPropertiesCompiler = new SmartPropertiesCompiler(this.smartPropertiesApi);
	        let result = smartPropertiesCompiler.compile(program, variables, set.skipDefault);
	        let run = {};
	        
            run.console = this.encondeConsole(smartPropertiesCompiler.getConsole());
            run.variables = variables;
	        if(result === null){        	
				console.log('(none)');
                if (set.expected.type === 'none') {
				    run.result = '(none)';
                } else {
                    run.error = this.unexpectedError(set.expected.value, '(none)', set.expected.type, 'none')
                }
	        }if(result instanceof Value){
				console.log('Result: ' + result.toString());
                if (set.expected.type === result.getType() ) {
                    if ( result.getType() !== 'float' ) {
                        if ( set.expected.value === result.toString() ) {
                            run.result = result.toString();
                        } else {
                            run.error = this.unexpectedError(set.expected.value, result.toString(), set.expected.type, result.getType())
                        }
                    } else {
                        let expValue = parseFloat(set.expected.value);
                        let resultValue = parseFloat(result.toString());
                        
                        if ( Math.abs(expValue - resultValue) < Number.EPSILON ) {
                            run.result = result.toString();
                        } else {
                            run.error = this.unexpectedError(set.expected.value, result.toString(), set.expected.type, result.getType())
                        }
                    }
                } else {
                    run.error = this.unexpectedError(set.expected.value, result.toString(), set.expected.type, result.getType())
                }
			}else if(result instanceof SmartPropertiesException){
                run.error = result.getMessage();
			}
            selected.sets[setIndex].run = run;

            this.setState({ selected : selected });
		}
        smartBtn.reset();
        this.resetBtns();
    }

    unexpectedError(expected, value, expectedType, valueType) {
        return (<>
                    <span>An unexpected value was returned:
                        { expectedType !== 'none' &&
                            <><br/><strong>Expected ({expectedType}):</strong> {expected}</>
                        }
                        { expectedType === 'none' &&
                            <><br/><strong>Expected:</strong> none</>
                        }
                        { valueType !== 'none' &&
                            <><br/><strong>Returned ({valueType}):</strong> {value}</>
                        }
                        { valueType === 'none' &&
                            <><br/><strong>Returned:</strong> none</>
                        }
                    </span>
                </>)
    }

    handleChangeInput(event) {
        let inputName = event.target.attributes.name.value;
        let inputValue = event.target.value;
        let selected = { ...this.state.selected };
        
        selected[inputName] = inputValue;
        if(inputName === 'defaultValueType'){
            selected.defaultValue = inputValue === 'boolean' ? 'true' : '';
        }
        this.setState({ selected: selected });
    }

    handleChangeVariablesInput(setIndex, index, event) {
        let inputName = event.target.attributes.name.value;
        let inputValue = event.target.value;
		let variables = [];
        let selected = { ...this.state.selected };

		variables = variables.concat(selected.sets[setIndex].variables);
		variables[index][inputName] = String(inputValue);

        if (inputName === 'type') {
            variables[index].value = inputValue === 'boolean' ? 'true' : '';
        }
		
        this.resetError(setIndex);
		this.updateStateVariable(setIndex, variables);
	}

    handleChangeSetInputs(setIndex, event) {
        let selected = { ...this.state.selected };

		selected.sets[setIndex][event.target.attributes.name.value] = event.target.value;
		this.setState({ selected : selected });
	}

    handleChangeSetExpectedInputs(setIndex, event) {
        let inputName = event.target.attributes.name.value;
        let inputValue = String(event.target.value);
        let selected = { ...this.state.selected };

		selected.sets[setIndex].expected[inputName] = inputValue;
        if (inputName === 'type' && inputValue === 'none') {
            selected.sets[setIndex].expected.value = ''
        }
		this.setState({ selected : selected });
	}

    handleChangeSelectInputs(name, event) {
        let map = {};
        map[name] = event.target.value;
		this.setState({ ...map });
	}

    handleChangeCode(code, callback) {
        let selected = { ...this.state.selected, code };                  
        this.setState({selected: selected}, () => {
            callback();
        });
    }
	
	addNewVariable(setIndex) {
		let variables = [];
        let selected = { ...this.state.selected };

		variables = variables.concat(selected.sets[setIndex].variables);
		variables.push({name: '', type: 'string', value: ''});
		this.updateStateVariable(setIndex, variables);
	}

    addSet() {
        let selected = { ...this.state.selected };
        
        selected.sets.push({
            name : '',
            variables: [],
            skipDefault: false,
            edit: true,
            expected: { type: 'none', value: '' }
        })
		this.setState({ selected : selected });
    }

	removeVariable(setIndex, index) {
		let variables = [];
        let selected = { ...this.state.selected };

		variables = variables.concat(selected.sets[setIndex].variables);
		variables.splice(index, 1);
		this.updateStateVariable(setIndex, variables);
	}
	
	updateStateVariable(setIndex, variables){
        let selected = { ...this.state.selected };

        selected.sets[setIndex].variables = variables
		this.setState({ selected : selected });
	}
	
	resetError(setIndex){
        let selected = { ...this.state.selected };

        selected.sets[setIndex].error = null
		this.setState({ selected : selected });
	}

	encondeConsole(text){
        return text.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
            return '&#'+i.charCodeAt(0)+';';
        }).replace(/ /g, '\u00a0').replace(/(?:\r\n|\r|\n)/g, '<br>');
    }
    
    getValue(type, value){
        let val = new Value();
        if(type === 'string'){
            val.setValueString(value);
        } else if(type === 'int'){
            val.setValueInt(parseInt(value));
        } else if(type === 'float'){
            val.setValueFloat(parseFloat(value));
        } else if(type === 'boolean'){
            val.setValueBoolean(value === 'true');
        }
        return val;
    }

    pauseBtns() {
        this.btns.forEach( (btn) => {
            if(btn.current) btn.current.pause();
        })
    }

    resetBtns() {
        this.btns.forEach( (btn) => {
            if(btn.current) btn.current.reset();
        })
    }

    aiExplainCode() {
        const selected = { ...this.state.selected }
        const code = selected.code

        this.setState({ aiExplainCodeText : '', aiExplainCodeTitle : '', aiGenerateCodeShow : false, aiUpdateCodeShow : false },
            () => {
                this.pauseBtns()
                smartPropertiesAiExplainCode(this.tenant, code)
                .then(([status, result]) => {
                    if(status === 200) {
                        console.log(result)
                        this.setState({ aiExplainCodeText : result.fullDescription, aiExplainCodeTitle : result.description })
                    } else {
                        this.setState({ aiExplainCodeText : null, aiExplainCodeTitle : null })

                        console.log('Error AI explain code: ' + status);
                        this.toast.current.showError('An error occurred on ia explain code');
                    }
                    this.resetBtns()
                })
                .catch((e) => {
                    this.setState({ aiExplainCodeText : null, aiExplainCodeTitle : null})

                    this.toast.current.showError('An unknown error occurred on ia explain code');
                    console.log(e);
                    this.resetBtns()
                });
            }
        )
    }

    aiGenerateTestCases() {
        const selected = { ...this.state.selected }
        const originalSets = selected.sets
        const code = selected.code

        selected.sets = null
        this.setState({ selected : selected },
            () => {
                this.pauseBtns()
                smartPropertiesAiGenerateTestCases(this.tenant, code)
                .then(([status, result]) => {
                    if(status === 200) {
                        console.log(result)
                        let newSets = []
                        result.testCases.forEach(testCase => {
                            let set = { 
                                ...testCase, 
                                skipDefault: false,
                                edit: false
                            }
                            newSets.push(set)
                        })
                        selected.sets = newSets
                    } else {
                        selected.sets = originalSets

                        console.log('Error AI explain code: ' + status);
                        this.toast.current.showError('An error occurred on ia explain code');
                    }
                    this.setState({ selected : selected})
                    this.resetBtns()
                })
                .catch((e) => {
                    selected.sets = originalSets
                    this.setState({ selected : selected})

                    this.toast.current.showError('An unknown error occurred on ia explain code');
                    console.log(e)
                    this.resetBtns()
                });
            }
        )
    }

    aiGenerateCode() {
        const { aiGenerateCodeText } = this.state
        const selected = { ...this.state.selected }
        const actualCode = selected.code

        selected.code = `
//     █████╗ ███████╗██╗   ██╗██████╗ ███████╗
//    ██╔══██╗╚══███╔╝██║   ██║██╔══██╗██╔════╝
//    ███████║  ███╔╝ ██║   ██║██████╔╝█████╗  
//    ██╔══██║ ███╔╝  ██║   ██║██╔══██╗██╔══╝  
//    ██║  ██║███████╗╚██████╔╝██║  ██║███████╗
//    ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝ - Generating code using Azure AI Agent ...
        `
        this.smartPropertiesCode.current.shine()
        this.setState({ selected : selected, aiExplainCodeText : '', aiExplainCodeTitle : null },
            () => {
                this.smartPropertiesCode.current.contentEditableOnInput()
                this.pauseBtns()
                smartPropertiesAiGenerateCode(this.tenant, aiGenerateCodeText)
                .then(([status, result]) => {
                    if(status === 200) {
                        console.log(result)
                        selected.code = "// Generated code using Azure AI Agent\n" + result.code
                        this.setState({ selected : selected, aiExplainCodeText : result.fullDescription, aiExplainCodeTitle : result.description }, 
                            () => this.smartPropertiesCode.current.contentEditableOnInput())
                    } else {
                        selected.code = actualCode

                        console.log('Error AI generate code: ' + status);
                        this.toast.current.showError('An error occurred on ia generate code');
                        this.setState({ selected : selected, aiExplainCodeText : null, aiExplainCodeTitle : null }, 
                            () => this.smartPropertiesCode.current.contentEditableOnInput())
                    }
                    this.resetBtns()
                    this.smartPropertiesCode.current.stopShine()
                })
                .catch((e) => {
                    selected.code = actualCode
                    this.setState({ selected : selected, aiExplainCodeText : null, aiExplainCodeTitle : null }, 
                        () => this.smartPropertiesCode.current.contentEditableOnInput())

                    this.toast.current.showError('An unknown error occurred on ia generate code');
                    console.log(e);
                    this.resetBtns()
                    this.smartPropertiesCode.current.stopShine()
                });
            }
        )
    }

    aiGenerateCodeAction() {
        this.setState({ aiExplainCodeText : null, aiExplainCodeTitle : null, aiGenerateCodeShow : true, aiUpdateCodeShow : false })
    }

    aiUpdateCode() {
        const { aiUpdateCodeText } = this.state
        const selected = { ...this.state.selected }
        const actualCode = selected.code

        selected.code = "// Updating code using Azure AI Agent ...\n" + actualCode
        this.smartPropertiesCode.current.shine()
        this.setState({ selected : selected, aiExplainCodeText : '', aiExplainCodeTitle : null },
            () => {
                this.smartPropertiesCode.current.contentEditableOnInput()
                this.pauseBtns()
                smartPropertiesAiUpdateCode(this.tenant, actualCode, aiUpdateCodeText)
                .then(([status, result]) => {
                    if(status === 200) {
                        console.log(result)
                        selected.code = "// Updated code using Azure AI Agent\n" + result.code
                        this.setState({ selected : selected, aiExplainCodeText : result.fullDescription, aiExplainCodeTitle : result.description }, 
                            () => this.smartPropertiesCode.current.contentEditableOnInput())
                    } else {
                        selected.code = actualCode

                        console.log('Error AI generate code: ' + status);
                        this.toast.current.showError('An error occurred on ia generate code');
                        this.setState({ selected : selected, aiExplainCodeText : null, aiExplainCodeTitle : null }, 
                            () => this.smartPropertiesCode.current.contentEditableOnInput())
                    }
                    this.resetBtns()
                    this.smartPropertiesCode.current.stopShine()
                })
                .catch((e) => {
                    selected.code = actualCode
                    this.setState({ selected : selected, aiExplainCodeText : null, aiExplainCodeTitle : null }, 
                        () => this.smartPropertiesCode.current.contentEditableOnInput())

                    this.toast.current.showError('An unknown error occurred on ia generate code');
                    console.log(e);
                    this.resetBtns()
                    this.smartPropertiesCode.current.stopShine()
                });
            }
        )
    }

    aiUpdateCodeAction() {
        this.setState({ aiExplainCodeText : null, aiExplainCodeTitle : null, aiGenerateCodeShow : false, aiUpdateCodeShow : true })
    }

}

export default customWithRouter(SmartPropertiesManagement);
