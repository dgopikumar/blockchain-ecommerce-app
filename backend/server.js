const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const ethers = require('ethers');
const paymentProcessor = require('../build/contracts/PaymentProcessor.json');
const {payment} = require('./db.js');

const app = new Koa();
const router = new Router();

const items = {
    '1': {id:1, url:'http://urlToDownloadItem1'},
    '2': {id:2, url:'http://urlToDownloadItem2'}
};

router.get('/api/getPaymentId/:itemId', async ctx => {
    const paymentId = (Math.random()*10000).toFixed(0);
    await payment.create({
        id:paymentId,
        itemId: ctx.params.itemId,
        paid: false
    });
    ctx.body = {paymentId};
});

router.get('/api/getItemUrl/:paymentId', async ctx => {
    const payment = await payment.findOne({id: ctx.params.paymentId});
    if(payment && payment.paid === true){
        ctx.body = {
            url: items[payment.itemId].url
        };
    }else{
        ctx.body = {url:''};
    }
});

app
.use(cors())
.use(router.routes())
.use(router.allowedMethods());

app.listen(4000, () => {
    console.log('server running on port 4000');
});

const listenToEvents = () => {
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:9545');
    const networkId = '5777';

    const paymentProc = new ethers.Contract(
        paymentProcessor.networks[networkId].address,
        paymentProcessor.abi,
        provider
    );

    paymentProc.on('PaymentDone', async (payer, amount, paymentId, date) => {
        console.log(`
        from ${payer}
        amount ${amount}
        paymentId ${paymentId}
        date ${(new Date(date.toNumber() * 1000)).toLocaleString()}
        `);

        const payment = await payment.findOne({id: paymentId});
        if(payment){
            payment.paid = true;
            await payment.save();
        }
    });
}

listenToEvents();
