// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LotteryContract {
    address internal immutable lotteryManager;
    uint internal randomNonce;

    mapping(address => uint) internal playerPool;
    mapping(address => bool) internal playersJoined;
    address[] public players;

    event WinnerSelected(address);

    constructor() {
        lotteryManager = msg.sender;
    }

    receive() external payable {
        require(
            msg.value > 10000000000000000,
            "Minimum lottery ticket cost: 0.01 ETH"
        );

        if (!playersJoined[msg.sender]) {
            players.push(msg.sender);
        }

        playersJoined[msg.sender] = true;
        playerPool[msg.sender] += msg.value;
    }

    function getPricePool() external view returns (uint) {
        return address(this).balance;
    }

    function getPlayerInfo(address _address) public view returns (uint) {
        require(
            playerPool[_address] != 0,
            "This address has not joined the lottery"
        );

        return playerPool[_address];
    }

    function getRandomNumber(uint max) public returns (uint) {
        randomNonce += 1;
        return
            uint(
                keccak256(
                    abi.encodePacked(block.timestamp, msg.sender, randomNonce)
                )
            ) % max;
    }

    function getWinner() external {
        require(
            msg.sender == lotteryManager,
            "Only the manager can stop the lottery"
        );
        require(players.length > 1, "The lottery needs at least 2 players");
        require(this.getPricePool() > 1, "The price pool is empty");

        address winner = players[getRandomNumber(players.length)];

        (bool sent, bytes memory data) = winner.call{
            value: address(this).balance
        }("");
        require(sent, "Failed to send Ether to the Winner");

        if (sent) {
            for (uint i = 0; i < players.length; i++) {
                delete playersJoined[players[i]];
                delete playerPool[players[i]];
            }

            delete randomNonce;
            delete players;

            emit WinnerSelected(winner);
        }
    }
}
