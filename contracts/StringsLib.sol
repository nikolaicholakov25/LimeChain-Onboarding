// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library StringsLib {
    function hashString(string memory _string, string memory _salt) pure internal returns(bytes32 ) {
        return keccak256(abi.encodePacked(_salt,_string));
    }
}