// Sources flattened with hardhat v2.24.3 https://hardhat.org

// SPDX-License-Identifier: MIT

// File @openzeppelin/contracts/utils/ReentrancyGuard.sol@v5.3.0

// Original license: SPDX_License_Identifier: MIT
// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

pragma solidity ^0.8.20;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}


// File contracts/GameLifecycle.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.22;

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
