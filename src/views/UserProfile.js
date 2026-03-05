import React, { Component } from "react";
import SmartPropertiesCard, { LIST_ACTION, SAVE_ACTION, UPDATE_ACTION } from "../components/SmartPropertiesCard"
import SmartPropertiesToast from "../components/SmartPropertiesToast"
import { Form, Button } from "react-bootstrap";
import { ROLES } from "../helpers/constants";

const Cookies = require('js-cookie');

const { 
  smartPropertiesUserUpdate,
  smartPropertiesUserGetByIdentifier
} = require("../configs/apisConfig")

class UserProfile extends Component {

  initState = {
    email: '',
    name: '',
    rol: '',
    icon: '',
    action: LIST_ACTION,
    loading: true,
    errorMessage: '',
    nameAux: '',
    iconAux: ''
  }

  constructor(props) {
      super(props);

      this.state = {
          ...this.initState
      };
      this.toast = React.createRef();
      this.emailInput = React.createRef();
      
      this.tenant = props.tenant;
  }

  componentDidMount() {
      this.getUser();
  }

  render() {
    const { action } = this.state;
    const { loading } = this.state;
    const { errorMessage } = this.state;
    const { email } = this.state;
    const { name } = this.state;
    const { rol } = this.state;
    const { icon } = this.state;
    const { nameAux } = this.state;
    const { iconAux } = this.state;

    return (
        <>
            <SmartPropertiesCard action={ action } listTitle={ name } updateTitle="Update my information"
                    loading={ loading } errorMessage={ errorMessage }
                list={(
                    <>
                      <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Text>{ email }</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicRol">
                            <Form.Label>Rol</Form.Label>
                            <Form.Text>{ ROLES[rol] }</Form.Text>
                        </Form.Group>{
                        icon && 
                          <Form.Group className="mb-3" controlId="formBasicIcon">
                            <Form.Label>Icon</Form.Label>
                            <Form.Text>{ icon }</Form.Text>
                          </Form.Group> }
                        <Form.Group className="mb-3 text-right" controlId="formBasicSubmit">
                          <Button variant="primary" className="btn-fill pull-right"  
                              onClick={() => {
                                  this.setState({nameAux: name, iconAux: icon, action: UPDATE_ACTION});
                              }} >
                                Edit
                          </Button>
                        </Form.Group>
                      </Form>
                    </>
                )}
                saveOrUpdate={(
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter name" value={nameAux} 
                                    onChange={(event) => {
                                      this.setState({nameAux: event.target.value})
                                    }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicIcon">
                            <Form.Label>Icon</Form.Label>
                            <Form.Control type="text" placeholder="Enter icon url" value={iconAux} 
                                    onChange={(event) => {
                                      this.setState({iconAux: event.target.value})
                                    }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 d-flex align-items-center justify-content-between" controlId="formBasicSubmit">
                            <Button variant="secondary" className="btn-fill"  
                                    onClick={() => {
                                        this.setState({nameAux: '', iconAux: '', action: LIST_ACTION});
                                    }} >
                                Cancel
                            </Button>
                            <Button variant="primary" className="btn-fill pull-right"  
                                    onClick={() => {
                                        this.setState({loading : true});
                                        this.update();
                                    }} >
                                Update
                            </Button>
                        </Form.Group>
                    </Form>                    
                )}>
            </SmartPropertiesCard>
            <SmartPropertiesToast ref={this.toast} duration={ 2500 } ></SmartPropertiesToast>
        </>
    );
  }

  update() {
    const {email} = this.state;
    const {rol} = this.state;

    let name = this.state.nameAux;
    let icon = this.state.iconAux;

    smartPropertiesUserUpdate(this.tenant, email, name, rol, icon)
    .then(([status, data]) => {
        if(status === 200){
            console.log("User Updated");
            this.toast.current.show('User information updated');
        } else {
            this.toast.current.showError('An error occurred updating user');
            console.log(status + ': ' + JSON.stringify(data));
        }
        this.setState({...this.initState});
        this.getUser();
    })
    .catch((e) => {
        this.toast.current.showError('An error occurred updating user');
        console.log(e);
        this.setState({...this.initState});
        this.getUser();
    });
  }

  getUser() {
    let identifier = Cookies.get("userId");

    smartPropertiesUserGetByIdentifier(this.tenant, identifier)
    .then(([status, data]) => {
        if(status === 200){
            console.log(data);
            let email = data.email;
            let name = data.name;
            let rol = data.rol;
            let icon = data.icon;

            this.setState({email, name, rol, icon, loading : false, errorMessage : '', nameAux: '', iconAux: ''});
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

}

export default UserProfile;
