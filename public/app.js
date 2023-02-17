
async function setUpApp() {

  const APP_CONFIG = (await axios.get('/get_vault_id')).data;
  console.log("Vault ID:", APP_CONFIG.vault_id)
  let CARD_DATA = {}

  // Show.js initialization
  const show = VGSShow.create(APP_CONFIG.vault_id, function (state) {
    console.log(state);
  }).setEnvironment('sandbox');
  $('#issue-card-btn').on('click', async function () {
    CARD_DATA = (await axios.get('/issue_card')).data;
    let last4 = CARD_DATA.card_number.substr(-4);
    $('#redacted-card-number').removeClass('transparent');
    $('#redacted-card-number-last-4').html(last4);
    $('#show-card-btn');
    $('#card-wrapper').removeClass('d-none');
    $('#server-results').removeClass('d-none')
    $('#issue-card-btn').hide();
    $('#card-tokens').html(JSON.stringify(CARD_DATA, null, 4));
    $('#good-thru-value').html(CARD_DATA.expiry)
    $('.name h3').html(CARD_DATA.name)
  });

  $('#show-card-btn').on('click', function () {
    $('#show-card-btn').addClass('transparent')
    let cardNumber = securelyRenderCard();
    let cvc = securelyRenderCvc();

    cardNumber.on('revealSuccess', function() {
      renderCopyBtn(cardNumber);
      $('#secret-card-number').removeClass('transparent')
      $('#secret-cvc').removeClass('transparent')
    })
  })

  function securelyRenderCard() {
    const cardNumber = show.request({
      name: 'secret-card-number',
      method: 'POST',
      path: '/reveal_card_number',
      payload: { 'card_number': CARD_DATA.card_number },
      htmlWrapper: 'text',
      jsonPathSelector: 'card_number',
      serializers: [show.SERIALIZERS.replace('(\\d{4})(\\d{4})(\\d{4})(\\d{4})', '$1 $2 $3 $4')],
    });
    $('#redacted-card-number').addClass('transparent');
    cardNumber.render('#secret-card-number', {
      fontSize: '1.8em',
      color: '#fff',
      whiteSpace: 'nowrap',
      fontFamily: 'sofia,sofiaFallback,arial,sans-serif'
    });
    return cardNumber;
  }

  function securelyRenderCvc() {
    const cvc = show.request({
      name: 'secret-cvc',
      method: 'POST',
      path: '/reveal_card_cvc',
      payload: { 'cvc': CARD_DATA.cvc },
      htmlWrapper: 'text',
      jsonPathSelector: 'cvc',
    });
    $('#redacted-cvc').addClass('transparent');
    cvc.render('#secret-cvc', {
      fontSize: '21px',
      color: '#fff',
      textAlign: 'right',
      fontFamily: 'sofia,sofiaFallback,arial,sans-serif'
    });
  }
  function renderCopyBtn(cardNumber) {
    const copyBtn = show.copyFrom(cardNumber,
      {
        text: 'Copy Card #',
        serializers: [show.SERIALIZERS.replace(' ', '')],
      },
      function (status) {
        if (status === 'success') {
          alert('Copied!');
        }
      });
    copyBtn.render('#copy', {
      padding: '10px',
      backgroundColor: '#35c2a1',
      fontSize: '12px',
      color: 'white',
      boxShadow: '0 7px 14px 0 rgba(49, 49, 93, 0.10), 0 3px 6px 0 rgba(0, 0, 0, 0.08)',
      fontFamily: '"Helvetica Neue", Helvetica',
      borderRadius: '4px',
      height: '37px',
      outline: 'none',
    });
    $('#copy').removeClass('transparent')
  }

}
setUpApp()