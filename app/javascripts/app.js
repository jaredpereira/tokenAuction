// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import tokenAuction_artifacts from '../../build/contracts/TokenAuction.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var tokenAuction = contract(tokenAuction_artifacts);
var auction = tokenAuction.at('0x5005afae33180adc18d379fe5d0158ab5e97257d')

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    tokenAuction.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshHighestBid();
      self.watchBids();
      self.getRemainingTime()
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshHighestBid: function() {
    var self = this;
    auction.highestBid.call().then(function(value) {
      var highestBid_element = document.getElementById("highestBid");
      highestBid_element.innerHTML = web3.fromWei(value.valueOf(), 'ether');
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  bid: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);

    this.setStatus("Initiating transaction... (please wait)");

    auction.bid({from: account, value: web3.toWei(amount, 'ether')}).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshHighestBid();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  watchBids: function() {
      var bidEvent
      var bidsElement = document.getElementById("bids")
      bidEvent = auction.Bid({_from:web3.eth.coinbase},{fromBlock: 0, toBlock: 'latest'})
      bidEvent.watch(function(err,res){
              var bid = document.createElement('div')
              let bidder = res.args.bidder
              let bidValue = web3.fromWei(res.args.bidValue.toNumber(), 'ether')
              bid.textContent = bidder + " bid: " + bidValue + " ETH" 
              bidsElement.appendChild(bid)
      })
  },

  endAuction: function() {
      var auction;
  },

  getRemainingTime: function(){
      var timeElement = document.getElementById('remainingTime')

      web3.eth.getBlock('latest', function(err, latestBlock){
          auction.endTime.call().then(function(result){
              var timeLeft = (result - latestBlock.timestamp)/60
              console.log(timeLeft)
              timeElement.textContent = timeLeft.toString()
          })
      })
  }

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
