// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

contract GameLifecycleNative is ReentrancyGuard {
    struct GameSession {
        address payable player; // Адрес игрока теперь должен быть payable
        bytes32 dataHash;
        uint256 stakeAmount;
        uint256 startTime;
        bool isActive;
    }

    address public owner;
    mapping(bytes32 => GameSession) public activeGames;

    event GameStarted(
        bytes32 indexed gameId,
        address indexed player,
        uint256 stakeAmount
    );
    event GameEnded(
        bytes32 indexed gameId,
        bool playerWon,
        uint256 rewardAmount
    );
    event FundsWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, 'Only owner can call this function');
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Игрок начинает игру, отправляя нативный токен (STT) и хеш данных.
     * @param _gameId Уникальный ID игры.
     * @param _dataHash Хеш данных игры.
     */
    function startGame(
        bytes32 _gameId,
        bytes32 _dataHash
    ) external payable nonReentrant {
        require(msg.value > 0, 'Stake must be positive');
        require(
            !activeGames[_gameId].isActive,
            'Game with this ID already exists'
        );

        // Ставка теперь берется из msg.value, а не переводится через transferFrom

        activeGames[_gameId] = GameSession({
            player: payable(msg.sender), // Сохраняем игрока как payable
            dataHash: _dataHash,
            stakeAmount: msg.value,
            startTime: block.timestamp,
            isActive: true
        });

        emit GameStarted(_gameId, msg.sender, msg.value);
    }

    /**
     * @notice Игрок завершает игру, раскрывая данные.
     */
    function endGame(
        bytes32 _gameId,
        string calldata _question,
        string calldata _answer,
        bool _playerWasCorrect
    ) external nonReentrant {
        GameSession storage game = activeGames[_gameId];

        require(game.isActive, 'Game not active or does not exist');
        require(
            game.player == msg.sender,
            'Only the player who started the game can end it'
        );

        bytes32 verificationHash = keccak256(
            abi.encodePacked(_gameId, _question, _answer)
        );
        require(
            verificationHash == game.dataHash,
            'Data mismatch. Commitment failed.'
        );

        uint256 rewardAmount = 0;
        if (_playerWasCorrect) {
            rewardAmount = game.stakeAmount * 2;

            // Проверка баланса перед переводом
            require(
                address(this).balance >= rewardAmount,
                'Insufficient funds for reward'
            );

            // Прямой перевод нативного токена
            game.player.transfer(rewardAmount);
        }

        delete activeGames[_gameId];
        emit GameEnded(_gameId, _playerWasCorrect, rewardAmount);
    }

    /**
     * @notice Владелец выводит все накопленные нативные токены с контракта.
     */
    function withdrawStakes(address payable _to) external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, 'No funds to withdraw');

        (bool success, ) = _to.call{value: balance}('');
        require(success, 'Transfer failed.');

        emit FundsWithdrawn(_to, balance);
    }
}
