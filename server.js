const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const qs = require('qs');
const tunnel = require('tunnel');
const dotenv = require('dotenv');
dotenv.config();
console.log(`Outbound route certificate is stored at this path: ${process.env['NODE_EXTRA_CA_CERTS']}`);

const VGS_VAULT_ID=process.env.VGS_VAULT_ID;
const VGS_USERNAME=process.env.VGS_USERNAME;
const VGS_PASSWORD=process.env.VGS_PASSWORD;
const STRIPE_KEY=process.env.STRIPE_KEY;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))

app.post('/post', async (req, res) => {
    const creditCardInfo = req.body;
    console.log("Received Tokenized Card Info:");
    console.log(creditCardInfo);
    let response = req.body;
    response.message = "Credit card information received on server. Echoing back request body.";
    
    // let agent = getProxyAgent();
    // response = await postStripePayment(creditCardInfo, agent)

    res.send({"response": response});
});

app.get('/get_vault_id', async (req, res) => {
    res.setHeader('content-type', 'application/json')
    res.send({
        "vault_id": VGS_VAULT_ID,
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

function getProxyAgent() {
    const vgs_outbound_url = `${VGS_VAULT_ID}.sandbox.verygoodproxy.com`
    console.log(`Sending request through outbund Route: ${vgs_outbound_url}`);
    return tunnel.httpsOverHttps({
        proxy: {
            servername: vgs_outbound_url,
            host: vgs_outbound_url,
            port: 8443,
            proxyAuth: `${VGS_USERNAME}:${VGS_PASSWORD}`
        },
    });
}

async function postStripePayment(creditCardInfo, agent) {
    let expiry = creditCardInfo['card-expiration-date'].split('/')

    let buff = new Buffer(STRIPE_KEY+":");
    let base64Auth = buff.toString('base64');

    const instance = axios.create({
        baseURL: 'https://api.stripe.com',
        headers: {
            'authorization': `Basic ${base64Auth}`,
        },
        httpsAgent: agent,
    });
    
    try {
        let response = await instance.post('/v1/charges', qs.stringify({
            amount: '100',
            currency: 'usd',
            description: 'Example Stripe Charge',
            card: {
                number: creditCardInfo['card-number'],
                cvc: creditCardInfo['card-security-code'],
                exp_month: expiry[0].trim(),
                exp_year: expiry[1].trim(),
                name: creditCardInfo['cardholder-name']
            }
        }));
        console.log(response.data)
        return {
            id: response.data.id,
            status: response.data.status,
            psp: 'stripe'
        }
    }
    catch(error) {
        console.log('FAILURE!');
        console.log(error);
        return {
            status: 'failure',
            error: error.message
        }
    }
}
