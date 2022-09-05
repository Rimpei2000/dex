# Uniswap-like Dex Application

## Project Description
This is a web application that users can connect their wallet through metamask and exchange their cryptos. 

## Tech/framework used
- [Solidity](https://docs.soliditylang.org/en/v0.8.16/) - To create smart contracts
- [Web3.js](https://web3js.readthedocs.io/en/v1.7.5/) - To build a client side of the app that talks to smart contracts
- [chai](https://www.chaijs.com/) - To conduct tests

## Features
After users connect their wallet to the app, they can swap their tokens(DAI, COMP, LINK) to ETH. Exchange rate between the tokens are calculated by obtaining real time price data from Coingecko API.

## API Reference
- [Coingecko](https://www.coingecko.com/en/api) - Used to get coins current price to calculate an exchange rate for ETH

## Tests
Tests for dex contract and ERC20 token contracts were held by chai framework

