//SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

/*
    Claim ownership of the contract below to complete this level.
    Note: as of solidity ^0.4.0, the constructor method was allowed to be named after the contract's name.
    Therefore, if the contract was named VestingScheme, the constructor could be named VestingScheme().
    This was deprecated from 0.5.0 onwards.
*/

import "../base/openzeppelin-06/SafeMath.sol";

contract Fallout {
  
  using SafeMath for uint256;
  mapping (address => uint) allocations;
  address payable public owner;

  /* constructor */
  function Fal1out() public payable {
    owner = msg.sender;
    allocations[owner] = msg.value;
  }

  modifier onlyOwner {
	        require(
	            msg.sender == owner,
	            "caller is not the owner"
	        );
	        _;
	    }

  function allocate() public payable {
    allocations[msg.sender] = allocations[msg.sender].add(msg.value);
  }

  function sendAllocation(address payable allocator) public {
    require(allocations[allocator] > 0);
    allocator.transfer(allocations[allocator]);
  }

  function collectAllocations() public onlyOwner {
    msg.sender.transfer(address(this).balance);
  }

  function allocatorBalance(address allocator) public view returns (uint) {
    return allocations[allocator];
  }
}