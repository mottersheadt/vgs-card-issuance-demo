
async function setUpApp() {

  const APP_CONFIG = (await axios.get('/get_vault_id')).data;
  console.log("Vault ID:", APP_CONFIG.vault_id)
  let CARD_DATA = {}
  let SEC_EL_CARD_NUMBER = null;
  let SEC_EL_CARD_CVC = null;

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
    securelyLoadCardNumber()
    securelyLoadCvc()
  });

  $('#show-card-btn').on('click', function () {
    $('#show-card-btn').addClass('transparent')
    showCardNumber();
    showCardCvc();
  })

  function securelyLoadCvc() {
    SEC_EL_CARD_CVC = show.request({
      name: 'secret-cvc',
      method: 'POST',
      path: '/reveal_card_cvc',
      payload: { 'cvc': CARD_DATA.cvc },
      htmlWrapper: 'text',
      jsonPathSelector: 'cvc',
    });
    SEC_EL_CARD_CVC.render('#secret-cvc', {
      fontSize: '21px',
      color: '#fff',
      textAlign: 'right',
      fontFamily: 'sofia,sofiaFallback,arial,sans-serif'
    });
  }

  function securelyLoadCardNumber() {
    SEC_EL_CARD_NUMBER = show.request({
      name: 'secret-card-number',
      method: 'POST',
      path: '/reveal_card_number',
      payload: { 'card_number': CARD_DATA.card_number },
      htmlWrapper: 'text',
      jsonPathSelector: 'card_number',
      serializers: [show.SERIALIZERS.replace('(\\d{4})(\\d{4})(\\d{4})(\\d{4})', '$1 $2 $3 $4')],
    });
    SEC_EL_CARD_NUMBER.render('#secret-card-number', {
      fontSize: '1.8em',
      color: '#fff',
      whiteSpace: 'nowrap',
      fontFamily: 'sofia,sofiaFallback,arial,sans-serif'
    });
    SEC_EL_CARD_NUMBER.on('revealSuccess', function() {
      renderCopyBtn(SEC_EL_CARD_NUMBER);
    })
  }

  function showCardNumber() {
    $('#redacted-card-number').addClass('transparent');
    $('#secret-card-number').removeClass('transparent');
    $('#copy').removeClass('transparent')
  }

  function showCardCvc() {
    $('#redacted-cvc').addClass('transparent');
    $('#secret-cvc').removeClass('transparent');
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
  }

}
setUpApp()