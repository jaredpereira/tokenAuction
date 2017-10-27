ragma solidity ^0.4.8;
import './StandardToken.sol';

contract TokenAuction is StandardToken {
    address public highestBidder;

    mapping (address => uint) public bids;
    bool ended;
    uint public endTime;
    event Bid(address bidder, string message);

    function TokenAuction(uint auctionDuration) public {
        endTime = now + (auctionDuration * 1 minutes);
    }

    function bid(string _message) payable public {
        require(endTime > now && msg.value > 0);
        if(bids[msg.sender] == 0){
            Bid(msg.sender, _message);
        }
        bids[msg.sender] += msg.value;
        if(bids[msg.sender] > bids[highestBidder]){
            highestBidder = msg.sender;
        }
    }

    function() public { bid(""); }

    function endAuction() public {
        require(now > endTime && !ended);
        balances[highestBidder] = 1;
        ended = true;
    }
}
