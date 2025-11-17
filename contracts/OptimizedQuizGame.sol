// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract OptimizedQuizGame is ReentrancyGuard {
    address public owner;
    uint private constant TIME_TO_END_GAME = 1200; // Используем константу для читаемости

    struct Game {
        address player;
        uint cost; // В wei нативного токена (STT в сети Somnia)
        uint timestamp;
    }

    mapping(uint => Game) public games;
    uint[] public activeGames;

    event GameStarted(uint indexed gameID, address indexed player, uint cost);
    event GameEnded(
        uint indexed gameID,
        address indexed player,
        uint cost,
        uint winnings
    );
    event Deposited(address indexed sender, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'Not owner');
        _;
    }

    function startGame(uint gameID, uint cost) public payable {
        require(games[gameID].player == address(0), 'Game already exists');
        require(msg.value == cost, 'Sent amount does not match cost');
        games[gameID] = Game(msg.sender, cost, block.timestamp);
        activeGames.push(gameID);
        emit GameStarted(gameID, msg.sender, cost);
    }

    function endGame(uint gameID, uint winnings) public nonReentrant {
        require(games[gameID].player == msg.sender, 'Not your game');
        require(
            block.timestamp - games[gameID].timestamp <= TIME_TO_END_GAME,
            'Game expired'
        );
        require(games[gameID].player != address(0), 'Game does not exist');
        uint cost = games[gameID].cost;
        require(((3 * cost) / 2) >= winnings, 'Winnings too high');
        require(address(this).balance >= winnings, 'Insufficient balance');

        for (uint i = 0; i < activeGames.length; i++) {
            if (activeGames[i] == gameID) {
                activeGames[i] = activeGames[activeGames.length - 1];
                activeGames.pop();
                break;
            }
        }

        delete games[gameID];

        (bool success, ) = payable(msg.sender).call{value: winnings}('');
        require(success, 'Failed to send STT winnings');

        emit GameEnded(gameID, msg.sender, cost, winnings);
    }

    function endExpiredGames() public onlyOwner {
        uint currentTime = block.timestamp;
        uint i = 0;
        while (i < activeGames.length) {
            uint gameID = activeGames[i];
            if (currentTime - games[gameID].timestamp > TIME_TO_END_GAME) {
                activeGames[i] = activeGames[activeGames.length - 1];
                activeGames.pop();
                delete games[gameID];
            } else {
                i++;
            }
        }
    }

    function deposit() public payable {
        require(msg.value > 0, 'Deposit amount must be greater than 0');
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint amount) public onlyOwner nonReentrant {
        require(address(this).balance >= amount, 'Insufficient balance');

        (bool success, ) = payable(msg.sender).call{value: amount}('');
        require(success, 'Failed to withdraw');
    }
}
