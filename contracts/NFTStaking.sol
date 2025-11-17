// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

contract NFTStaking is ERC721Holder, ReentrancyGuard, Ownable {
    using EnumerableSet for EnumerableSet.UintSet;

    // --- State Variables ---
    IERC721 public nftCollection; // Адрес коллекции NFT для стейкинга
    IERC20 public rewardToken; // Адрес токена награды

    uint256 public constant REWARD_INTERVAL = 10 seconds; // Интервал распределения (10 секунд)
    uint256 public rewardsRate = 1 * 10 ** 18; // Количество токенов награды, распределяемых за интервал (1 токен/10 сек)
    uint256 public lastUpdateTime; // Время последнего обновления глобального аккумулятора наград
    uint256 public rewardsPerTokenStored; // Накопленные награды на одну застейканную NFT
    uint256 public totalStaked; // Общее количество застейканных NFT

    // Информация о стейке для каждого пользователя
    struct UserStakeInfo {
        EnumerableSet.UintSet stakedTokenIds; // Список ID застейканных NFT пользователя
        uint256 userRewardPerTokenPaid; // Последнее значение rewardsPerToken на момент обновления наград пользователя
        uint256 rewards; // Накопленные, но не снятые награды пользователя
    }

    // ОШИБКА ИСПРАВЛЕНА: Убран 'public'
    mapping(address => UserStakeInfo) userInfo;

    // --- Events ---
    event Staked(address indexed user, uint256 indexed tokenId);
    event Unstaked(address indexed user, uint256 indexed tokenId);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(uint256 amount);
    event RewardsRateUpdated(uint256 newRate);

    // --- Modifiers ---
    modifier updateReward(address user) {
        // Обновляем глобальный аккумулятор наград
        _updateGlobalRewards();

        // Обновляем награды для конкретного пользователя
        if (user != address(0)) {
            UserStakeInfo storage userStake = userInfo[user];
            userStake.rewards = earned(user);
            userStake.userRewardPerTokenPaid = rewardsPerTokenStored;
        }
        _;
    }

    // --- Constructor ---
    constructor(
        address _nftCollection,
        address _rewardToken
    ) Ownable(msg.sender) {
        require(
            _nftCollection != address(0),
            'NFT collection address cannot be zero'
        );
        require(
            _rewardToken != address(0),
            'Reward token address cannot be zero'
        );
        nftCollection = IERC721(_nftCollection);
        rewardToken = IERC20(_rewardToken);
        lastUpdateTime = block.timestamp;
    }

    // --- Internal Functions ---

    // Обновляет глобальный аккумулятор наград на основе времени и скорости
    function _updateGlobalRewards() internal {
        if (block.timestamp <= lastUpdateTime) {
            return; // Ничего не изменилось во времени
        }

        if (totalStaked == 0) {
            lastUpdateTime = block.timestamp;
            return;
        }

        // Рассчитываем количество интервалов, прошедших с последнего обновления
        uint256 timeElapsed = block.timestamp - lastUpdateTime;
        uint256 intervalsPassed = timeElapsed / REWARD_INTERVAL;

        if (intervalsPassed > 0) {
            // Рассчитываем общее количество наград, которые должны быть распределены
            // за прошедшие интервалы
            uint256 rewardAmount = intervalsPassed * rewardsRate;

            // Обновляем аккумулятор наград на одну NFT
            // rewardsPerTokenStored = rewardsPerTokenStored + (rewardAmount * 1e18) / totalStaked
            // Умножение на 1e18 для повышения точности при делении
            rewardsPerTokenStored =
                rewardsPerTokenStored +
                ((rewardAmount * 1e18) / totalStaked);

            lastUpdateTime =
                lastUpdateTime +
                (intervalsPassed * REWARD_INTERVAL);
        } else {
            // Если не прошел полный интервал, просто обновляем время
            lastUpdateTime = block.timestamp;
        }
    }

    // --- Public/External View Functions ---

    // Возвращает количество застейканных NFT для пользователя
    // НОВАЯ ФУНКЦИЯ: Заменяет автоматический геттер
    function stakedBalance(address user) public view returns (uint256) {
        return userInfo[user].stakedTokenIds.length();
    }

    // Возвращает список ID застейканных NFT для пользователя
    // НОВАЯ ФУНКЦИЯ: Заменяет автоматический геттер (частично)
    function stakedTokens(address user) public view returns (uint256[] memory) {
        UserStakeInfo storage userStake = userInfo[user];
        uint256 length = userStake.stakedTokenIds.length();
        uint256[] memory tokenIds = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            tokenIds[i] = userStake.stakedTokenIds.at(i);
        }
        return tokenIds;
    }

    // НОВАЯ ФУНКЦИЯ: Получить накопленные награды пользователя
    function getUserRewards(address user) public view returns (uint256) {
        return userInfo[user].rewards;
    }

    // НОВАЯ ФУНКЦИЯ: Получить userRewardPerTokenPaid пользователя
    function getUserRewardPerTokenPaid(
        address user
    ) public view returns (uint256) {
        return userInfo[user].userRewardPerTokenPaid;
    }

    // Рассчитывает накопленные награды для пользователя
    function earned(address user) public view returns (uint256) {
        UserStakeInfo storage userStake = userInfo[user];
        // (rewardsPerTokenStored - userRewardPerTokenPaid) * userStakedBalance
        // Делим на 1e18, чтобы компенсировать умножение в _updateGlobalRewards
        uint256 totalRewards = ((rewardsPerTokenStored -
            userStake.userRewardPerTokenPaid) *
            userStake.stakedTokenIds.length()) / 1e18;
        return userStake.rewards + totalRewards;
    }

    // --- Public/External Functions ---

    // Стейкинг NFT
    function stake(
        uint256 tokenId
    ) external nonReentrant updateReward(msg.sender) {
        require(
            nftCollection.ownerOf(tokenId) == msg.sender,
            'Not the owner of the NFT'
        );
        nftCollection.transferFrom(msg.sender, address(this), tokenId);
        userInfo[msg.sender].stakedTokenIds.add(tokenId);
        totalStaked += 1;
        emit Staked(msg.sender, tokenId);
    }

    // Анстейкинг NFT
    function unstake(
        uint256 tokenId
    ) external nonReentrant updateReward(msg.sender) {
        require(
            userInfo[msg.sender].stakedTokenIds.contains(tokenId),
            'NFT not staked by user'
        );
        // Перед анстейкингом автоматически накапливаем награды
        _claimRewardInternal(msg.sender);

        nftCollection.transferFrom(address(this), msg.sender, tokenId);
        userInfo[msg.sender].stakedTokenIds.remove(tokenId);
        totalStaked -= 1;
        emit Unstaked(msg.sender, tokenId);
    }

    // Вывод наград
    function claimRewards() external nonReentrant updateReward(msg.sender) {
        _claimRewardInternal(msg.sender);
    }

    // Внутренняя функция для фактического перевода наград
    function _claimRewardInternal(address user) internal {
        uint256 rewardAmount = userInfo[user].rewards;
        if (rewardAmount > 0) {
            userInfo[user].rewards = 0;
            require(
                rewardToken.transfer(user, rewardAmount),
                'Transfer failed'
            );
            emit RewardClaimed(user, rewardAmount);
        }
    }

    // --- Owner Functions ---

    // Пополнение баланса токенов награды на контракте
    // Это действие "включает" награды, так как теперь есть что распределять
    function fundRewards(uint256 amount) external onlyOwner {
        require(amount > 0, 'Amount must be greater than 0');
        // Предполагается, что владелец заранее одобрил перевод токенов на этот контракт
        require(
            rewardToken.transferFrom(msg.sender, address(this), amount),
            'Transfer failed'
        );
        // Обновляем время последнего обновления, чтобы начать отсчет наград с момента пополнения
        // Это не обязательно, но логично
        _updateGlobalRewards();
        emit RewardsDistributed(amount);
    }

    // Установка новой скорости эмиссии наград (токенов за интервал)
    function setRewardsRate(
        uint256 _newRate
    ) external onlyOwner updateReward(address(0)) {
        // Обновляем награды для всех перед изменением скорости
        // updateReward(address(0)) обновляет только глобальные данные
        rewardsRate = _newRate;
        emit RewardsRateUpdated(_newRate);
    }

    // Функция для ручного обновления наград (например, если нужно принудительно обновить до анстейкинга)
    function updateRewards() external updateReward(address(0)) {
        // Логика обновления уже выполнена в модификаторе
    }
}
