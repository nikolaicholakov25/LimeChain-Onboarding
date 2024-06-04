// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Quiz.sol";


contract QuizFactory {
    Quiz[] internal quizes;

    event QuizCreated(Quiz indexed);

    function createQuiz(string memory _question, string memory _answer, string[] memory _answers, string memory _salt) public payable  {
        Quiz quiz = new Quiz{value:msg.value}(_question,_answer,_answers,_salt);
        quizes.push(quiz);
        emit QuizCreated(quiz);
    }

    function getAllQuizes() view external returns(Quiz[] memory){
        return quizes;
    }
}