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


// File contracts/OptimizedQuizGame.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.22;

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
