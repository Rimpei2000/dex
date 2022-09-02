let buyMode = true;
let token = undefined;
let web3, user, dexInst, tokenInst;
let priceData;
let finalInput, finalOutput;

const linkAddr = "0x11295d5a4FD3D59E054f5da80D6dC240ef4B7D7F";
const daiAddr = "0x95DcDA841cAE9Bf1144B1E7DF3BB9e5f2D908E2E";
const compAddr = "0x375C75AB46737B5e3735896f58CC8d59d779d284";
const dexAddr = "0x8064Ef22aA3fc8d7F466665E6Ca425Ff6353B67f";

$(document).on("click", ".dropdown-menu li a", function () {
  let element = $(this);
  let img = element[0].firstElementChild.outerHTML;
  let text = $(this).text();
  token = text.replace(/\s/g, "");
  if (user) {
    switch (token) {
      case "DAI":
        tokenInst = new web3.eth.Contract(abi.token, daiAddr, { from: user });
        break;
      case "LINK":
        tokenInst = new web3.eth.Contract(abi.token, linkAddr, { from: user });
        break;
      case "COMP":
        tokenInst = new web3.eth.Contract(abi.token, compAddr, { from: user });
        break;
    }
  }
  $(".input-group .btn").html(img + text);
  $(".input-group .btn").css("color", "#fff");
  $(".input-group .btn").css("font-size", "large");
});

$(document).ready(async () => {
  if (window.ethereum) {
    web3 = new Web3(Web3.givenProvider);
  }
  priceData = await getPrice();
});

$(".btn.login").click(async () => {
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log(accounts);
    user = accounts[0];
    dexInst = new web3.eth.Contract(abi.dex, dexAddr, { from: user });
    $(".btn.login").html("Connected");
    $(".btn.swap").html("Enter an amount");
    $("#username").html(user);
  } catch (error) {
    alert(error.message);
  }
});

$("#swap-box").submit(async (e) => {
  e.preventDefault();

  try {
    buyMode ? await buyToken() : await sellToken();
  } catch (err) {
    alert(err.message);
  }
});

$("#arrow-box h2").click(() => {
  if (buyMode) {
    buyMode = false;
    sellTokenDisplay();
  } else {
    buyMode = true;
    buyTokenDisplay();
  }
});

$("#input").on("input", async function () {
  if (token === undefined) {
    return;
  }
  const input = parseFloat($(this).val());
  await updateOutput(input);
});

async function getPrice() {
  const daiData = await (
    await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=dai&vs_currencies=eth"
    )
  ).json();

  const compData = await (
    await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=compound-governance-token&vs_currencies=eth"
    )
  ).json();

  const linkData = await (
    await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=chainlink&vs_currencies=eth"
    )
  ).json();

  return {
    daiEth: daiData.dai.eth,
    linkEth: linkData.chainlink.eth,
    compEth: compData["compound-governance-token"].eth,
  };
}

async function updateOutput(input) {
  let output;
  switch (token) {
    case "COMP":
      output = buyMode ? input / priceData.compEth : input * priceData.compEth;
      break;
    case "LINK":
      output = buyMode ? input / priceData.linkEth : input * priceData.linkEth;
      break;
    case "DAI":
      output = buyMode ? input / priceData.daiEth : input * priceData.daiEth;
      break;
  }
  const exchangeRate = output / input;
  if (output === 0 || isNaN(output)) {
    $("#output").val("");
    $(".rate.value").css("display", "none");
    $(".btn.swap").html("Enter an amount");
    $(".btn.swap").addClass("disabled");
  } else {
    $("#output").val(output.toFixed(7));
    $(".rate.value").css("display", "block");
    if (buyMode) {
      $("#top-text").html("ETH");
      $("#bottom-text").html(" " + token);
      $("#rate-value").html(exchangeRate.toFixed(5));
    } else {
      $("#top-text").html(token);
      $("#bottom-text").html(" ETH");
      $("#rate-value").html(exchangeRate.toFixed(5));
    }
    await checkBalance(input);
    finalInput = web3.utils.toWei(input.toString(), "ether");
    finalOutput = web3.utils.toWei(output.toString(), "ether");
  }
}

async function checkBalance(input) {
  const balanceRaw = buyMode
    ? await web3.eth.getBalance(user)
    : await tokenInst.methods.balanceOf(user).call();
  const balance = parseFloat(web3.utils.fromWei(balanceRaw, "ether"));

  if (balance >= input) {
    $(".btn.swap").removeClass("disabled");
    $(".btn.swap").html("Swap");
  } else {
    $(".btn.swap").addClass("disabled");
    $(".btn.swap").html(`Insufficient ${buyMode ? "ETH" : token} balance`);
  }
}

function buyToken() {
  const tokenAddr = tokenInst._address;
  return new Promise((resolve, reject) => {
    dexInst.methods
      .buyToken(tokenAddr, finalInput, finalOutput)
      .send({ value: finalInput })
      .then((receipt) => {
        const eventData = receipt.events.buy.returnValues;
        const amountDisplay = parseFloat(
          web3.utils.fromWei(eventData._amount, "ether")
        );
        const costDisplay = parseFloat(
          web3.utils.fromWei(eventData._cost, "ether")
        );
        const tokenAddr = eventData._tokenAddr;
        alert(`
          Swap successful! \n
          Token address: ${tokenAddr} \n
          Amount: ${amountDisplay.toFixed(7)} ${token} \n
          Cost: ${costDisplay.toFixed(7)} ETH
        `);
        resolve();
      })
      .catch((err) => reject(err));
  });
}

async function sellToken() {
  const allowance = await tokenInst.methods.allowance(user, dexAddr).call();
  if (parseInt(finalInput) > parseInt(allowance)) {
    try {
      await tokenInst.methods.approve(dexAddr, finalInput).send();
    } catch (err) {
      throw err;
    }
  }

  try {
    const tokenAddr = tokenInst._address;
    const sellTx = await dexInst.methods
      .sellToken(tokenAddr, finalInput, finalOutput)
      .send()
      .then(receipt => console.log(receipt));
    // const eventData = sellTx.events.sell.returnValues;
    // const amountDisplay = parseFloat(
    //   web3.utils.fromWei(eventData._amount, "ether")
    // );
    // const costDisplay = parseFloat(web3.utils.fromWei(eventData._cost, "ether"));
    // const _tokenAddr = eventData._tokenAddr;
    // alert(`
    //     Swap successful!\n
    //     Token Address: ${_tokenAddr} \n
    //     Amount: ${amountDisplay.toFixed(7)} ETH\n
    //     Price: ${costDisplay.toFixed(7)} ${token}
    //   `);
  } catch (err) {
    throw err;
  }
}