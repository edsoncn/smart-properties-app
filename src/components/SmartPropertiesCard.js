import React from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";

export const LIST_ACTION = 0;
export const SAVE_ACTION = 1;
export const UPDATE_ACTION = 2;

function SmartPropertiesCard({ action, listTitle, saveTitle, updateTitle, 
        listSubTitle, saveSubTitle, updateSubTitle, list, saveOrUpdate, loading, errorMessage, onlyCard, plain, className, lg }) {
    let card = (
        <Card className={ (!plain ? 'strpied-tabled-with-hover ' : 'card-plain table-plain-bg ') + (className ?? '') } >
            <Card.Header>
                <Card.Title as="h4" className="text-center mt-3">
                    { action === LIST_ACTION && listTitle }
                    { action === SAVE_ACTION && saveTitle }
                    { action === UPDATE_ACTION && updateTitle }
                </Card.Title>{
                (listSubTitle || saveSubTitle || updateSubTitle) &&
                    <p className="card-category mt-3">
                        { action === LIST_ACTION && listSubTitle }
                        { action === SAVE_ACTION && saveSubTitle }
                        { action === UPDATE_ACTION && updateSubTitle }
                    </p>
                }
            </Card.Header>{
            loading ? <Card.Body className="text-center"><Spinner animation="border" variant="primary" className="mb-2"/></Card.Body> : 
            errorMessage ? <Card.Body className="text-center"><Alert variant="danger" className="diplay-inline-block mb-2"><b>{ errorMessage }</b></Alert></Card.Body> :
            action === LIST_ACTION ? <Card.Body>{ list }</Card.Body> :
            action === SAVE_ACTION || action === UPDATE_ACTION ? <Card.Body>{ saveOrUpdate }</Card.Body> :
            null}
        </Card>
    )
    if(!onlyCard){
        return (
            <Container>
                <Row className="justify-content-center">
                    <Col lg={lg ?? 6}>
                        {card}
                    </Col>
                </Row>
            </Container>
        )
    }else return card;
}

export default SmartPropertiesCard;