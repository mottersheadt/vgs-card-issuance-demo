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

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'))

app.get('/get_vault_id', async (req, res) => {
    res.setHeader('content-type', 'application/json')
    res.send({
        "vault_id": VGS_VAULT_ID,
    });
});

app.get('/issue_card', async (req, res) => {
    let agent = getProxyAgent();
    let cardDataTokens = await issueNewCard(agent);

    res.setHeader('content-type', 'application/json')
    res.send(cardDataTokens);
});

// Return the card cvc that was passed in.
// In a real environment, we will also perform
// validation on the user session to ensure they
// are allowed to reveal this value. This validation
// will be owned by the same authentication system
// that the rest of the customer's app employs.
app.post('/reveal_card_number', async (req, res) => {
    console.log(req.body);
    res.setHeader('content-type', 'application/json');
    res.send(req.body);
});

// Return the card cvc that was passed in.
// In a real environment, we will also perform
// validation on the user session to ensure they
// are allowed to reveal this value. This validation
// will be owned by the same authentication system
// that the rest of the customer's app employs.
app.post('/reveal_card_cvc', async (req, res) => {
    console.log(req.body);
    res.setHeader('content-type', 'application/json');
    res.send(req.body);
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

// This function simulates a request to a card issuer.
// The request will be tunneled through a VGS Outbound Route
// to tokenize the data during the response phase.
// Response format:
//   {
//     card_number: 'tok_sandbox_pzR4KsYmCJkcyfXTPw8TrA'
//   }
async function issueNewCard(agent) {
    const instance = axios.create({
        // For this example we use the VGS echo server so that
        // we can consistently get a card number without relying
        // on a third-party integration.
        // In a real card issuance environment, this request will
        // go to the API of the service who is managing creating the
        // card number.
        baseURL: 'https://echo.secure.verygood.systems',
        httpsAgent: agent,
    });
    
    try {
        // For testing purposes, we provide the card_number and cvc in the request
        // so that we can tokenize the values it in response from the echo server.
        // Sending encrypted data value so that we can decrypt and tokenize the values in-transit
        let response = await instance.post('/issue_card', "c1zraTnOB6aXO5MW6jCGYhcb3LXVT34SOAc9TFHtYhIkiIzmN1ZWiwwGDwCCfHkxezmFDnAySKVboxIZhymSp+393s4BOmyZFdwNXKLrGLlQl/9Qy8xN/g+1+N2M/+9pLeXdR9RdHo7HFcRyy+H/SUoxDWcH9rpaH0HTlUy8bYYXFwqgGcCWw6y4VMwXzId03KaUVLXzPO7YzAuG91nCe8cP3RkVFLgafupUhsUPFbFDtBIdmDraUjUbsX6BmO3/GFO26m+WzwJp8jhCau0LjfrKIYoatcHUPCIpQXIgodRZDovlgG/A+TeaQlqJeV2ENx6Zb44Y/b5xLe20Bhv0lh86GFzL/RR1dKpP1eU7gb1RrSKm732DtUtIoa+LYPFUkjGQekb6BlCelPV+RSTvMzaNxDbjZ0o8J2D+367XmSYIS8fQC6h0lQWZVudw6sFJ6z56zrc93tHepLstfl2a+utO/nPUp+vTiCiHJy85ejWP6IayHp8gRDiumOBgsENZ6PhKx3bORskBdaeaj8FNqF9ztdvffQp1rAK0+I5HP/6gyVw3adNuvNxXEl4Mkqw+cI6YVUWJDiM1wyyljIJa4WLwq1DXUKgJtK6VeiU+8n6iXZQN1pc/burUyJYsKaZ+2dLTK0cQ0FdDCqJJsx3vFN4ZumvRuLKYmOPUoYhRv9E=");
        console.log(response.data)
        return response.data
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
