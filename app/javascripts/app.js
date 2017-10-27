// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import tokenAuction_artifacts from '../../build/contracts/TokenAuction.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var tokenAuction = contract(tokenAuction_artifacts);
var auction = tokenAuction.at('0xbc059208ae1a774a2c5c2703329fb26dd0678e97')

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

var bids = []

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

      document.getElementById("address").textContent = auction.address

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
    auction.highestBidder.call().then(function(bidder) {
        var highestBidder_element = document.getElementById("highestBidder")
        highestBidder_element.textContent = bidder
        return auction.bids(bidder)
        }).then(function(bid){
            var highestBid_element = document.getElementById("highestBid");
            highestBid_element.textContent= web3.fromWei(bid.toNumber(), 'ether');
        }).catch(function(e) {
            console.log(e);
            self.setStatus("Error getting balance; see log.");
        });
  },

  bid: function() {
    var self = this;

    var amount = parseFloat(document.getElementById("amount").value);
    var message = document.getElementById("message").value

    this.setStatus("Initiating transaction... (please wait)");
      console.log(account)

    auction.bid(message, {from: account, value: web3.toWei(amount, 'ether')}).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshHighestBid();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending bid; see log.");
    });
  },

  watchBids: function() {
      var bidEvent
      var bidsElement = document.getElementById("bids")
      bidEvent = auction.Bid({_from:web3.eth.coinbase},{fromBlock: 0, toBlock: 'latest'})
      console.log(bidEvent)
      bidEvent.watch(function(err,res){
          var bid = document.createElement('div')
          let bidder = res.args.bidder
          let bidMessage = res.args.message;
          auction.bids(bidder).then(function(bidAmount){
              bid.innerHTML= "<i>" + bidder + "</i> " + "bid: <b>" + web3.fromWei(bidAmount, 'ether') + " ETH</b> with the message \"" + bidMessage + "\""
              bidsElement.appendChild(bid)
          }).catch(function(e){
              console.log(e)
          })
      })
  },

  getRemainingTime: function(){
      var timeElement = document.getElementById('remainingTime')

      web3.eth.getBlock('latest', function(err, latestBlock){
          auction.endTime.call().then(function(result){
              var timeLeft = (result - latestBlock.timestamp)/60
              timeElement.textContent = timeLeft.toString()
          })
      })
  },

  endAuction: function(){
      this.setStatus("Initiating transaction... (please wait)");
      auction.endAuction().then(function(res){
          self.setStatus("Transaction complete!");
      }).catch(function(e){
          console.log(e)
          self.setStatus("Error sending transaction; see log.")
      })
  }

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
