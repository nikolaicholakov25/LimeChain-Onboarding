// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StringsLib.sol";

contract Quiz {
    string public question;
    bytes32 internal answer;
    string[] internal answers;
    string internal salt;
    address public winner;

    event EthDeposited(uint indexed);
    event QuizQuessed(address indexed,uint indexed);
    event QuizNotQuessed(address indexed);

    modifier minEthDeposit () {
        require(msg.value > 0.01 ether ,"The Eth sent must be at least 0.01");
        _;
    }

    constructor(string memory _question, string memory _answer, string[] memory _answers, string memory _salt) minEthDeposit payable   {
        question = _question;
        answer = StringsLib.hashString(_answer,_salt);
        answers = _answers;
        salt = _salt;
    }

    receive() minEthDeposit external payable {
        emit EthDeposited(msg.value);
    }

    function guess(string calldata _guess) public payable {
        require(winner == address(0) , "The quiz has already been guessed!");

        if(StringsLib.hashString(_guess,salt) == answer) {
            emit QuizQuessed(msg.sender,getCurrentQuizBalance());
            winner = msg.sender;
        } else {
            emit QuizNotQuessed(msg.sender);
        }

    }

    function getCurrentQuizBalance() public view returns(uint) {
        return address(this).balance;
    }

    function claimPrize() external payable {
        require(msg.sender == winner , "You are not the winner");
        require(getCurrentQuizBalance() > 0, "The quiz reward pool is empty");

        (bool success,) = winner.call{value:getCurrentQuizBalance()}("");
        assert(success);
    }


    function getAnswers() view public returns(string[] memory) {
        return answers;
    }

}