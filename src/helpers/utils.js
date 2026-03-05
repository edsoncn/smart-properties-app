import { useNavigate, useLocation, useParams } from 'react-router-dom';

const customWithRouter = (Component) => {
    const ComponentWithRouterProp = (props) => {
        let location = useLocation();
        let navigate = useNavigate();
        let params = useParams();

        return (<Component {...props} router={{ location, navigate, params }} />);
    }
    return ComponentWithRouterProp;
}

export {
    customWithRouter
}