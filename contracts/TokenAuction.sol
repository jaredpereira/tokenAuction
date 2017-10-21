pragma solidity ^0.4.8;
import './StandardToken.sol';

contract TokenAuction is StandardToken {
    address public highestBidder;
    uint public highestBid;
    bool ended;

    uint public endTime;
    event Bid(uint bidValue, address bidder);

    function TokenAuction(uint auctionDuration) public {
        endTime = now + (auctionDuration * 1 minutes);
    }

    function bid() payable public {
        require(endTime > now);
        require(msg.value > 0);

        if(msg.value > highestBid){
            highestBid= msg.value;
            highestBidder = msg.sender;
        }
        Bid(msg.value, msg.sender);
    }

    function endAuction() public {
        require(now > endTime);
        require(!ended);

        balances[highestBidder] = 1;
        ended = true;
    }

}
