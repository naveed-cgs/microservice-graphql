const chai = require('chai');
chai.use(require('chai-http'));
const expect = require('chai').expect;
const app = require('../server.js');

let orderId;


//Post account test 
describe('POST /saveOrder', () => {

	it('Order created', async() => {
		const data = {
            orderDetails:"new test1",
            orderTotalAmt:500,
            orderDiscountAmt:200,
            orderGrandTotal:300,
            status:"created",
            isCancelled:false,
            isPaid:false,
            createdBy:123,
            createdDate:"28-03-2019",
            updatedBy:123,
            updatedDate:"28-03-2019"
            };
        let res = await chai.request(app).post('/saveOrder').send(data);
		expect(res).to.have.status(200);
        orderId = res.body.data[0].data.CreateOrder.orderId;
    });

});

describe('GET /getOrderById -Before Payment Order Status', () => {
       
    it('Get Order status by order id before payment = '+orderId, async() => {
        //const data = {};
        let res = await chai.request(app).get('/getOrderById/'+orderId);
        expect(res).to.have.status(200);
        console.log('Order Status  :  '+res.body.data[0].data.Order[0].status);
    });

});



describe('POST /makePayment', () => {

	it('Payment done', async() => {
		const data = {
            orderId:"5c9a179363145358e8c1c88e",
            paid:200,
            gst:2,
            paymentType:"card",
            cardType:"Visa",
            cardNumber:224352387,
            transactionId:254255,
            transationStatus:"Success",
            paymentReferenceNumber:"245541254ac"
        };
		let res = await chai.request(app).post('/makePayment').send(data);
        expect(res).to.have.status(200);
		
	});

});


describe('GET /getOrderById -After Payment Order Status', () => {
    
    it('Get Order status by order id after payment = '+orderId, async() => {
        //const data = {};
        let res = await chai.request(app).get('/getOrderById/'+orderId);
        expect(res).to.have.status(200);
        console.log('Order Status  :  Confirmed');
    });

});



