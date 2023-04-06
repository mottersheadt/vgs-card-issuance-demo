# VGS Card Issuance Demo

## How to use this repo:
1. Create a new Github codespace in this repo
1. Create `.env` file in root of repo by copying `.env-example`
1. Populate `.env` file with Vault ID
1. Start app: `npm start`
1. [Ensure your codespace has port 3000 open to the public so that it can accept the requests from VGS](https://docs.github.com/en/codespaces/developing-in-codespaces/forwarding-ports-in-your-codespace#sharing-a-port)
1. Open app in browser
1. Configure the filters in your vault (or import the `vgs-route-config.yaml` file in this repository)
1. Update your VGS Inbound Route's Upstream URL to the same URL that is in your browser.
1. Press the "Issue Card" button to get a new card from the mock issuance service.
1. Press the "eye" icon to reveal the original card value using VGS Show.

### Acknowledgements
- The beautiful card graphic in this demo was created by Ryan Mcguinn. The code was taken and modifed from this codepen: https://codepen.io/rmcguinn/pen/JpVwBp, which is referenced on this article: https://freefrontend.com/css-credit-cards/.
