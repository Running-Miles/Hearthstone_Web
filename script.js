// 初始化粒子效果
particlesJS('particles-container', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ffffff' },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: true,
            out_mode: 'out'
        }
    }
});

class Card {
    constructor(name, cost, attack, health, image, description, abilities = [], type = 'minion', battlecry = null, gender = 'male') {
        this.name = name;
        this.cost = cost;
        this.attack = attack;
        this.health = health;
        this.image = image;
        this.description = description;
        this.abilities = abilities;
        this.type = type;
        this.battlecry = battlecry;
        this.gender = gender;
        this.canAttack = false;
        this.hasAttacked = false;
        this.isSelected = false;
        this.element = this.createCardElement();
        this.arrow = null;
        this.originalPosition = null;
    }

    createCardElement() {
        const card = document.createElement('div');
        card.className = `card ${this.type}`;
        if (this.abilities.includes('taunt')) {
            card.classList.add('taunt');
        }
        if (this.gender === 'female') {
            card.classList.add('female-character');
        }
        if (this.canAttack) {
            card.classList.add('can-attack');
        }
        
        // 添加点击事件
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.game) {
                window.game.handleCardClick(this);
            }
        });
        
        // 添加鼠标进入事件
        card.addEventListener('mouseenter', () => {
            if (this.canAttack && !this.hasAttacked && window.game && window.game.isPlayerTurn) {
                card.classList.add('can-attack-hover');
            }
        });
        
        // 添加鼠标离开事件
        card.addEventListener('mouseleave', () => {
            card.classList.remove('can-attack-hover');
        });
        
        const cost = document.createElement('div');
        cost.className = 'card-cost';
        cost.textContent = this.cost;
        
        const image = document.createElement('div');
        image.className = 'card-image';
        image.style.backgroundImage = `url(${this.image})`;
        
        const name = document.createElement('div');
        name.className = 'card-name';
        name.textContent = this.name;
        
        const description = document.createElement('div');
        description.className = 'card-description';
        description.textContent = this.description;
        
        if (this.type === 'minion') {
            const attack = document.createElement('div');
            attack.className = 'card-attack';
            attack.textContent = this.attack;
            
            const health = document.createElement('div');
            health.className = 'card-health';
            health.textContent = this.health;
            
            card.appendChild(attack);
            card.appendChild(health);
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = this.description;
        
        card.appendChild(cost);
        card.appendChild(image);
        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(tooltip);
        
        return card;
    }

    updateHealth() {
        if (this.type === 'minion') {
            const healthElement = this.element.querySelector('.card-health');
            if (healthElement) {
                healthElement.textContent = this.health;
                // 添加受伤效果
                if (this.health < parseInt(healthElement.getAttribute('data-original-health') || this.health)) {
                    this.element.classList.add('damaged');
                }
            }
        }
    }

    showDamageNumber(damage) {
        const number = document.createElement('div');
        number.className = 'damage-number';
        number.textContent = `-${damage}`;
        
        const rect = this.element.getBoundingClientRect();
        number.style.left = `${rect.left + rect.width/2}px`;
        number.style.top = `${rect.top + rect.height/2}px`;
        
        document.body.appendChild(number);
        
        setTimeout(() => {
            document.body.removeChild(number);
        }, 1000);
    }

    showBattlecryEffect() {
        const effect = document.createElement('div');
        effect.className = `battlecry-effect ${this.gender}`;
        this.element.appendChild(effect);
        
        if (this.gender === 'female') {
            this.addSparkles();
        }
        
        setTimeout(() => {
            this.element.removeChild(effect);
        }, 1500);
    }

    addSparkles() {
        const sparkles = document.createElement('div');
        sparkles.className = 'sparkles';
        
        for (let i = 0; i < 10; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.animationDelay = `${Math.random() * 1.5}s`;
            sparkles.appendChild(sparkle);
        }
        
        this.element.appendChild(sparkles);
        setTimeout(() => {
            this.element.removeChild(sparkles);
        }, 1500);
    }

    showAura() {
        const aura = document.createElement('div');
        aura.className = 'card-aura';
        this.element.appendChild(aura);
    }

    showDamageSplash() {
        const splash = document.createElement('div');
        splash.className = 'damage-splash';
        this.element.appendChild(splash);
        
        setTimeout(() => {
            this.element.removeChild(splash);
        }, 500);
    }

    createAttackArrow(startX, startY) {
        this.removeAttackArrow();
        
        const arrow = document.createElement('div');
        arrow.className = 'attack-arrow';
        document.body.appendChild(arrow);
        
        const arrowHead = document.createElement('div');
        arrowHead.className = 'attack-arrow-head';
        arrow.appendChild(arrowHead);
        
        this.arrow = arrow;
        this.updateAttackArrow(startX, startY, startX, startY);
        
        // 添加发光动画
        arrow.style.animation = 'arrow-glow 1.5s infinite';
        const glowStyle = document.createElement('style');
        glowStyle.textContent = `
            @keyframes arrow-glow {
                0% { filter: drop-shadow(0 0 10px #ff4444); }
                50% { filter: drop-shadow(0 0 20px #ff4444); }
                100% { filter: drop-shadow(0 0 10px #ff4444); }
            }
        `;
        document.head.appendChild(glowStyle);
    }

    updateAttackArrow(startX, startY, endX, endY) {
        if (!this.arrow) return;
        
        const angle = Math.atan2(endY - startY, endX - startX);
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        
        this.arrow.style.left = `${startX}px`;
        this.arrow.style.top = `${startY}px`;
        this.arrow.style.width = `${length}px`;
        this.arrow.style.transform = `rotate(${angle}rad)`;
    }

    removeAttackArrow() {
        if (this.arrow && this.arrow.parentNode) {
            this.arrow.parentNode.removeChild(this.arrow);
        }
        this.arrow = null;
    }

    moveToPosition(x, y) {
        if (!this.originalPosition) {
            const rect = this.element.getBoundingClientRect();
            this.originalPosition = { x: rect.left, y: rect.top };
        }
        
        this.element.style.transform = `translate(${x - this.originalPosition.x}px, ${y - this.originalPosition.y}px)`;
    }

    resetPosition() {
        this.element.style.transform = '';
        this.originalPosition = null;
    }

    performAttackAnimation(targetElement) {
        return new Promise(resolve => {
            const rect = this.element.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            
            // 计算移动距离
            const translateX = targetRect.left - rect.left;
            const translateY = targetRect.top - rect.top;
            
            // 保存原始位置样式
            const originalTransform = this.element.style.transform;
            const originalTransition = this.element.style.transition;
            
            // 设置动画
            this.element.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
            
            // 添加撞击效果
            setTimeout(() => {
                targetElement.classList.add('hit');
                
                // 重置位置
                setTimeout(() => {
                    this.element.style.transition = originalTransition;
                    this.element.style.transform = originalTransform;
                    targetElement.classList.remove('hit');
                    
                    // 确保动画完成后解决Promise
                    setTimeout(resolve, 300);
                }, 200);
            }, 500);
        });
    }

    resetForNewTurn() {
        this.hasAttacked = false;
        this.canAttack = true;
        this.isSelected = false;
        if (this.element) {
            this.element.classList.remove('attacked', 'selected');
            this.element.classList.add('can-attack');
        }
    }
}

class Game {
    constructor() {
        this.VERSION = 'v1.0.0';  // 添加版本号
        this.playerHand = [];
        this.playerField = [];
        this.opponentHand = [];
        this.opponentField = [];
        this.playerMana = 0;
        this.playerMaxMana = 0;
        this.opponentMana = 0;
        this.opponentMaxMana = 0;
        this.isPlayerTurn = true;
        this.selectedCard = null;
        this.playerHealth = 30;
        this.opponentHealth = 30;
        this.playerHeroPowerUsed = false;
        this.opponentHeroPowerUsed = false;
        
        this.cardDatabase = {
            '宋林浩': {
                cost: 3,
                attack: 2,
                health: 5,
                image: 'https://picsum.photos/id/1005/80/60',
                description: '嘲讽：其他随从必须先攻击该随从',
                abilities: ['taunt'],
                type: 'minion'
            },
            '战士': {
                cost: 2,
                attack: 3,
                health: 2,
                image: 'https://picsum.photos/id/1006/80/61',
                description: '冲锋：可以在放置回合立即攻击',
                abilities: ['charge'],
                type: 'minion'
            },
            '法师': {
                cost: 4,
                attack: 4,
                health: 3,
                image: 'https://picsum.photos/id/1007/80/62',
                description: '法术伤害+1',
                abilities: ['spellpower'],
                type: 'minion'
            },
            '火球术': {
                cost: 4,
                attack: 6,
                health: 0,
                image: 'https://picsum.photos/80/63',
                description: '对一个目标造成6点伤害',
                type: 'spell'
            },
            '治疗术': {
                cost: 3,
                attack: 0,
                health: 4,
                image: 'https://picsum.photos/80/64',
                description: '恢复4点生命值',
                type: 'spell'
            },
            '小眼镜妹妹': {
                cost: 5,
                attack: 4,
                health: 4,
                image: 'https://picsum.photos/id/1027/80/60',
                description: '战吼：对所有敌方随从造成1点伤害',
                abilities: [],
                type: 'minion',
                gender: 'female',
                battlecry: (game) => {
                    game.playSound('battlecry');
                    const promises = game.opponentField.map(target => {
                        target.element.classList.add('hit');
                        game.dealDamage(target, 1);
                        return new Promise(resolve => {
                            setTimeout(() => {
                                target.element.classList.remove('hit');
                                resolve();
                            }, 300);
                        });
                    });
                    return Promise.all(promises);
                }
            },
            '咕咕bird': {
                cost: 3,
                attack: 2,
                health: 3,
                image: 'https://avatars.githubusercontent.com/u/2?v=4',
                description: '战吼：对敌方英雄造成3点伤害',
                abilities: [],
                type: 'minion',
                battlecry: (game) => {
                    game.playSound('battlecry');
                    game.opponentHealth -= 3;
                    game.updateHealth();
                }
            },
            '督卡撑': {
                cost: 4,
                attack: 3,
                health: 3,
                image: 'https://avatars.githubusercontent.com/u/3?v=4',
                description: '战吼：消灭一个敌方嘲讽随从',
                abilities: [],
                type: 'minion',
                battlecry: (game) => {
                    const tauntMinion = game.opponentField.find(card => 
                        card.abilities.includes('taunt'));
                    if (tauntMinion) {
                        game.playSound('battlecry');
                        game.removeFromField(tauntMinion);
                    }
                }
            },
        };
        
        this.initializeGame();
        this.setupEventListeners();
        this.createVersionDisplay();
        this.playSound('game-start');
        
        // 添加音效
        this.addAudio('battlecry', 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
        this.addAudio('attack-sound', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        
        this.createTurnIndicator();
        window.game = this; // 使Game实例全局可访问
    }
    
    playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }
    
    initializeGame() {
        document.querySelector('.player-hero').style.backgroundImage = 'url(https://picsum.photos/id/1009/100/100)';
        document.querySelector('.opponent-hero').style.backgroundImage = 'url(https://picsum.photos/id/1010/100/100)';
        
        const initialCards = [
            this.createCardFromDatabase('宋林浩'),
            this.createCardFromDatabase('战士'),
            this.createCardFromDatabase('火球术')
        ];
        
        initialCards.forEach(card => {
            this.addCardToHand(card, true);
        });
        
        for (let i = 0; i < 3; i++) {
            this.opponentHand.push(this.createCardFromDatabase('战士'));
            document.getElementById('opponent-hand').appendChild(document.createElement('div')).className = 'card';
        }
        
        this.updateHealth();
        this.updateMana();
        
        // 设置英雄技能
        document.querySelectorAll('.hero-power').forEach(power => {
            power.addEventListener('click', (e) => {
                const isPlayer = e.target.closest('.player-stats') !== null;
                this.useHeroPower(isPlayer);
            });
        });

        // 开始第一个回合
        this.startPlayerTurn();
    }
    
    useHeroPower(isPlayer) {
        if (!this.isPlayerTurn || !isPlayer) return;
        if (this.playerHeroPowerUsed) return;
        if (this.playerMana < 2) return;
        
        this.playerMana -= 2;
        this.playerHeroPowerUsed = true;
        this.playSound('hero-power');
        
        // 英雄技能效果：造成1点伤害
        const target = this.opponentField[Math.floor(Math.random() * this.opponentField.length)];
        if (target) {
            this.dealDamage(target, 1);
        } else {
            this.opponentHealth -= 1;
        }
        
        this.updateMana();
        this.updateHealth();
    }
    
    createCardFromDatabase(name) {
        const data = this.cardDatabase[name];
        return new Card(
            name,
            data.cost,
            data.attack,
            data.health,
            data.image,
            data.description,
            data.abilities || [],
            data.type,
            data.battlecry,
            data.gender
        );
    }
    
    setupEventListeners() {
        const endTurnButton = document.getElementById('end-turn');
        endTurnButton.addEventListener('click', () => {
            if (this.isPlayerTurn) {
                this.endTurn();
            }
        });
        
        // 对手英雄的点击事件
        const opponentHero = document.querySelector('.opponent-hero');
        opponentHero.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!this.isPlayerTurn) return;
            
            if (this.selectedCard) {
                if (this.selectedCard.type === 'spell') {
                    await this.castSpell(this.selectedCard, { isHero: true, isOpponent: true });
                } else if (this.selectedCard.canAttack && !this.selectedCard.hasAttacked) {
                    if (this.canAttackTarget(this.selectedCard, null)) {
                        await this.attackHero(this.selectedCard, false);
                    }
                }
            }
        });
        
        // 玩家英雄的点击事件
        document.querySelector('.player-hero').addEventListener('click', async () => {
            if (!this.isPlayerTurn) return;
            
            if (this.selectedCard && this.selectedCard.type === 'spell') {
                await this.castSpell(this.selectedCard, { isHero: true, isOpponent: false });
            }
        });
        
        // 对手场地的点击事件
        const opponentField = document.getElementById('opponent-field');
        opponentField.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!this.isPlayerTurn) return;
            
            const cardElement = e.target.closest('.card');
            if (!cardElement) return;
            
            const targetCard = this.opponentField.find(c => c.element === cardElement);
            if (!targetCard) return;
            
            if (this.selectedCard && this.selectedCard.canAttack && !this.selectedCard.hasAttacked) {
                if (this.canAttackTarget(this.selectedCard, targetCard)) {
                    await this.attackWithCard(this.selectedCard, targetCard);
                }
            }
        });
        
        // 玩家场地的点击事件
        const playerField = document.getElementById('player-field');
        playerField.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.isPlayerTurn) return;
            
            const cardElement = e.target.closest('.card');
            if (!cardElement) return;
            
            const card = this.playerField.find(c => c.element === cardElement);
            if (!card) return;
            
            this.selectCard(card);
        });

        // 添加全局点击事件来处理取消选择
        document.addEventListener('click', (e) => {
            if (this.selectedCard && !e.target.closest('.card') && !e.target.closest('.hero')) {
                this.selectedCard.isSelected = false;
                this.selectedCard.element.classList.remove('selected');
                this.selectedCard.removeAttackArrow();
                this.removeHighlightTargets();
                this.selectedCard = null;
            }
        });
    }
    
    castSpell(spell, target) {
        if (!this.isPlayerTurn) return;
        if (this.playerMana < spell.cost) return;
        
        this.playSound('card-play');
        
        const spellAnimation = document.createElement('div');
        spellAnimation.className = 'spell-animation';
        
        if (target.isHero) {
            const heroElement = target.isOpponent ? 
                document.querySelector('.opponent-hero') : 
                document.querySelector('.player-hero');
            heroElement.appendChild(spellAnimation);
        } else {
            target.element.appendChild(spellAnimation);
        }
        
        setTimeout(() => {
            if (spell.name === '火球术') {
                if (target.isHero) {
                    if (target.isOpponent) {
                        this.opponentHealth -= spell.attack;
                    } else {
                        this.playerHealth -= spell.attack;
                    }
                } else {
                    this.dealDamage(target, spell.attack);
                }
            } else if (spell.name === '治疗术') {
                if (target.isHero) {
                    if (target.isOpponent) {
                        this.opponentHealth = Math.min(30, this.opponentHealth + spell.health);
                    } else {
                        this.playerHealth = Math.min(30, this.playerHealth + spell.health);
                    }
                } else {
                    target.health = Math.min(target.health + spell.health, 
                        this.cardDatabase[target.name].health);
                    target.updateHealth();
                }
            }
            
            this.updateHealth();
            
            const index = this.playerHand.indexOf(spell);
            if (index > -1) {
                this.playerHand.splice(index, 1);
                document.getElementById('player-hand').removeChild(spell.element);
            }
            
            this.playerMana -= spell.cost;
            this.updateMana();
            this.selectedCard = null;
            
            if (this.playerHealth <= 0) {
                this.playSound('defeat');
                setTimeout(() => {
                    alert('游戏结束，对手获胜！');
                    this.resetGame();
                }, 500);
            } else if (this.opponentHealth <= 0) {
                this.playSound('victory');
                setTimeout(() => {
                    alert('恭喜你获胜！');
                    this.resetGame();
                }, 500);
            }
        }, 1000);
    }
    
    dealDamage(target, amount) {
        target.health -= amount;
        target.showDamageNumber(amount);
        target.updateHealth();
        
        if (target.health <= 0) {
            target.health = 0;
            this.removeFromField(target);
        }
    }
    
    addCardToHand(card, isPlayer) {
        if (isPlayer) {
            this.playerHand.push(card);
            card.element.addEventListener('click', () => this.playCard(card));
            document.getElementById('player-hand').appendChild(card.element);
        }
    }
    
    playCard(card) {
        if (!this.isPlayerTurn) return;
        if (this.playerMana < card.cost) return;
        if (card.type === 'minion' && this.playerField.length >= 7) return;
        
        console.log('Playing card:', card); // 调试日志
        this.playSound('card-play');
        
        if (card.type === 'spell') {
            this.selectedCard = card;
            return;
        }
        
        const index = this.playerHand.indexOf(card);
        if (index > -1) {
            this.playerHand.splice(index, 1);
            this.playerField.push(card);
            document.getElementById('player-hand').removeChild(card.element);
            document.getElementById('player-field').appendChild(card.element);
            
            this.playerMana -= card.cost;
            this.updateMana();
            
            // 执行战吼效果
            if (card.battlecry) {
                card.showBattlecryEffect();
                card.battlecry(this);
            }
            
            // 如果是冲锋随从，立即可以攻击
            if (card.abilities.includes('charge')) {
                card.canAttack = true;
                card.hasAttacked = false;
                card.element.classList.add('can-attack');
            } else {
                card.canAttack = false;
                card.hasAttacked = true;
            }
        }
    }
    
    selectCard(card) {
        if (!this.isPlayerTurn) return;
        console.log('Selecting card:', card); // 调试日志

        // 取消之前选中的卡牌
        if (this.selectedCard) {
            this.selectedCard.isSelected = false;
            this.selectedCard.element.classList.remove('selected');
            this.selectedCard.removeAttackArrow();
            this.removeHighlightTargets();
        }

        // 如果点击的是已选中的卡牌，取消选择
        if (this.selectedCard === card) {
            this.selectedCard = null;
            return;
        }

        // 选中新卡牌
        if (card.canAttack && !card.hasAttacked) {
            this.selectedCard = card;
            card.isSelected = true;
            card.element.classList.add('selected');
            
            // 高亮显示可攻击目标
            this.highlightValidTargets(card);
            
            // 创建并更新攻击箭头
            const rect = card.element.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            card.createAttackArrow(startX, startY);
            
            // 添加鼠标移动事件
            const moveHandler = (e) => {
                if (card.isSelected) {
                    card.updateAttackArrow(startX, startY, e.clientX, e.clientY);
                }
            };
            
            document.addEventListener('mousemove', moveHandler);
            
            // 清理事件监听器
            const cleanup = () => {
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', cleanup);
            };
            
            document.addEventListener('mouseup', cleanup);
        }
    }
    
    highlightValidTargets(attacker) {
        // 检查是否有嘲讽随从
        const hasTaunt = this.opponentField.some(card => card.abilities.includes('taunt'));
        
        // 高亮显示可攻击的随从
        this.opponentField.forEach(card => {
            if (!hasTaunt || card.abilities.includes('taunt')) {
                card.element.classList.add('valid-target');
            }
        });
        
        // 如果没有嘲讽随从，高亮显示敌方英雄
        if (!hasTaunt) {
            const opponentHero = document.querySelector('.opponent-hero');
            opponentHero.classList.add('valid-target');
        }
    }

    removeHighlightTargets() {
        // 移除所有目标高亮
        this.opponentField.forEach(card => {
            card.element.classList.remove('valid-target');
        });
        const opponentHero = document.querySelector('.opponent-hero');
        if (opponentHero) {
            opponentHero.classList.remove('valid-target');
        }
    }

    async attackWithCard(attacker, target) {
        if (!attacker || !target) return;
        console.log('Attacking with card:', attacker, 'target:', target); // 调试日志

        try {
            this.playSound('attack-sound');
            attacker.element.classList.add('attacking');

            // 执行攻击动画
            const attackerRect = attacker.element.getBoundingClientRect();
            const targetRect = target.element.getBoundingClientRect();
            
            // 保存原始位置
            const originalTransform = attacker.element.style.transform;
            
            // 计算移动距离
            const dx = targetRect.left - attackerRect.left;
            const dy = targetRect.top - attackerRect.top;
            
            // 执行攻击动画
            attacker.element.style.transition = 'transform 0.3s ease-in-out';
            attacker.element.style.transform = `translate(${dx}px, ${dy}px)`;
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 处理伤害
            target.showDamageSplash();
            target.showDamageNumber(attacker.attack);
            attacker.showDamageNumber(target.attack);
            
            target.health -= attacker.attack;
            attacker.health -= target.attack;
            
            // 返回原位
            attacker.element.style.transition = 'transform 0.3s ease-in-out';
            attacker.element.style.transform = originalTransform;
            
            target.updateHealth();
            attacker.updateHealth();
            
            // 标记随从已攻击
            attacker.hasAttacked = true;
            attacker.canAttack = false;
            attacker.isSelected = false;
            attacker.element.classList.remove('can-attack', 'selected', 'attacking');
            attacker.element.classList.add('attacked');
            
            // 清除选中状态
            this.selectedCard = null;
            this.removeHighlightTargets();
            attacker.removeAttackArrow();
            
            // 检查死亡
            if (target.health <= 0) {
                this.removeFromField(target);
            }
            if (attacker.health <= 0) {
                this.removeFromField(attacker);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Attack error:', error);
            // 确保即使出错也能重置状态
            attacker.element.style.transform = '';
            attacker.element.classList.remove('attacking', 'selected');
            this.selectedCard = null;
            this.removeHighlightTargets();
            attacker.removeAttackArrow();
        }
    }
    
    async attackHero(attacker, isOpponent) {
        try {
            console.log('Attacking hero:', {attacker, isOpponent}); // 调试日志
            this.playSound('attack-sound');
            attacker.element.classList.add('attacking');
            
            const damage = attacker.attack;
            const heroElement = isOpponent ? 
                document.querySelector('.player-hero') : 
                document.querySelector('.opponent-hero');
            
            // 执行攻击动画
            const attackerRect = attacker.element.getBoundingClientRect();
            const heroRect = heroElement.getBoundingClientRect();
            
            // 保存原始位置
            const originalTransform = attacker.element.style.transform;
            
            // 计算移动距离
            const dx = heroRect.left - attackerRect.left;
            const dy = heroRect.top - attackerRect.top;
            
            // 执行攻击动画
            attacker.element.style.transition = 'transform 0.3s ease-in-out';
            attacker.element.style.transform = `translate(${dx}px, ${dy}px)`;
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 显示伤害效果
            const damageNumber = document.createElement('div');
            damageNumber.className = 'damage-number';
            damageNumber.textContent = `-${damage}`;
            damageNumber.style.left = `${heroRect.left + heroRect.width/2}px`;
            damageNumber.style.top = `${heroRect.top + heroRect.height/2}px`;
            document.body.appendChild(damageNumber);
            
            if (isOpponent) {
                this.playerHealth = Math.max(0, this.playerHealth - damage);
            } else {
                this.opponentHealth = Math.max(0, this.opponentHealth - damage);
            }
            
            // 返回原位
            attacker.element.style.transition = 'transform 0.3s ease-in-out';
            attacker.element.style.transform = originalTransform;
            
            // 标记随从已攻击
            attacker.hasAttacked = true;
            attacker.canAttack = false;
            attacker.isSelected = false;
            attacker.element.classList.remove('can-attack', 'selected', 'attacking');
            attacker.element.classList.add('attacked');
            
            // 清除选中状态
            this.selectedCard = null;
            this.removeHighlightTargets();
            attacker.removeAttackArrow();
            
            this.updateHealth();
            
            // 移除伤害数字
            setTimeout(() => {
                document.body.removeChild(damageNumber);
            }, 1000);
            
            // 检查游戏结束
            if (this.playerHealth <= 0) {
                this.playSound('defeat');
                this.endGame(false);
            } else if (this.opponentHealth <= 0) {
                this.playSound('victory');
                this.endGame(true);
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Attack hero error:', error);
            // 确保即使出错也能重置状态
            attacker.element.style.transform = '';
            attacker.element.classList.remove('attacking', 'selected');
            this.selectedCard = null;
            this.removeHighlightTargets();
            attacker.removeAttackArrow();
        }
    }
    
    removeFromField(card) {
        const field = card.element.parentElement;
        field.removeChild(card.element);
        
        if (field.id === 'player-field') {
            const index = this.playerField.indexOf(card);
            if (index > -1) this.playerField.splice(index, 1);
        } else {
            const index = this.opponentField.indexOf(card);
            if (index > -1) this.opponentField.splice(index, 1);
        }
    }
    
    canAttackTarget(attacker, target) {
        if (!attacker || !attacker.canAttack || attacker.hasAttacked) {
            console.log('Basic attack conditions not met:', {
                hasAttacker: !!attacker,
                canAttack: attacker ? attacker.canAttack : false,
                hasAttacked: attacker ? attacker.hasAttacked : true
            });
            return false;
        }

        // 检查是否有嘲讽随从
        const hasTaunt = this.opponentField.some(card => card.abilities.includes('taunt'));
        console.log('Has taunt minions:', hasTaunt); // 调试日志

        // 如果目标是英雄（target为null）且场上有嘲讽随从，则不能攻击英雄
        if (!target && hasTaunt) {
            console.log('Cannot attack hero due to taunt'); // 调试日志
            return false;
        }

        // 如果有嘲讽随从，只能攻击嘲讽随从
        if (hasTaunt && target && !target.abilities.includes('taunt')) {
            console.log('Must attack taunt minion first'); // 调试日志
            return false;
        }

        return true;
    }
    
    endTurn() {
        // 只有在玩家回合时才能结束回合
        if (!this.isPlayerTurn) return;
        
        // 禁用结束回合按钮，防止重复点击
        const endTurnButton = document.getElementById('end-turn');
        endTurnButton.disabled = true;
        
        this.isPlayerTurn = false;
        this.showTurnIndicator(false);
        
        // AI回合
        setTimeout(() => {
            this.opponentMaxMana = Math.min(10, this.opponentMaxMana + 1);
            this.opponentMana = this.opponentMaxMana;
            this.opponentHeroPowerUsed = false;
            
            // AI行动
            this.playAITurn();
        }, 1000);
    }

    async playAITurn() {
        try {
            // AI决策逻辑
            const playableCards = this.opponentHand.filter(card => 
                card.cost <= this.opponentMana &&
                (card.type !== 'minion' || this.opponentField.length < 7)
            );
            
            // 按照优先级排序：嘲讽 > 高攻击力 > 低费用
            playableCards.sort((a, b) => {
                if (a.abilities.includes('taunt') && !b.abilities.includes('taunt')) return -1;
                if (!a.abilities.includes('taunt') && b.abilities.includes('taunt')) return 1;
                if (a.attack !== b.attack) return b.attack - a.attack;
                return a.cost - b.cost;
            });
            
            // 打出卡牌
            for (const card of playableCards) {
                if (card.cost <= this.opponentMana) {
                    this.opponentMana -= card.cost;
                    
                    if (card.type === 'spell') {
                        const targets = this.playerField.sort((a, b) => b.attack - a.attack);
                        if (targets.length > 0) {
                            await this.castSpell(card, targets[0]);
                        } else {
                            await this.castSpell(card, { isHero: true, isOpponent: false });
                        }
                    } else {
                        const index = this.opponentHand.indexOf(card);
                        if (index > -1) {
                            this.opponentHand.splice(index, 1);
                            this.opponentField.push(card);
                            document.getElementById('opponent-field').appendChild(card.element);
                            
                            if (card.battlecry) {
                                card.showBattlecryEffect();
                                await card.battlecry(this);
                            }
                        }
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
            
            // AI攻击逻辑
            const attackingCards = this.opponentField.slice();
            for (const card of attackingCards) {
                if (card.hasAttacked) continue;
                
                // 检查是否有嘲讽随从
                const tauntTargets = this.playerField.filter(target => target.abilities.includes('taunt'));
                const validTargets = tauntTargets.length > 0 ? tauntTargets : this.playerField;
                
                if (validTargets.length > 0) {
                    // 优先攻击可以击杀且不会死亡的目标
                    const bestTarget = validTargets.find(target => 
                        target.health <= card.attack && target.attack < card.health
                    ) || validTargets[0];
                    
                    await this.attackWithCard(card, bestTarget);
                } else {
                    await this.attackHero(card, true);
                }
                
                card.hasAttacked = true;
                // 减少AI攻击间隔
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // 结束AI回合
            await this.startPlayerTurn();
            
        } catch (error) {
            console.error('AI回合出错:', error);
            await this.startPlayerTurn();
        }
    }

    async startPlayerTurn() {
        console.log('Starting player turn'); // 调试日志
        // 开始玩家的回合
        this.isPlayerTurn = true;
        this.showTurnIndicator(true);
        
        // 重置所有随从的攻击状态
        this.playerField.forEach(card => {
            console.log('Resetting card:', card.name); // 调试日志
            card.hasAttacked = false;
            card.canAttack = true;
            card.element.classList.add('can-attack');
            card.element.classList.remove('attacked');
        });
        
        // 增加玩家的法力水晶
        this.playerMaxMana = Math.min(10, this.playerMaxMana + 1);
        this.playerMana = this.playerMaxMana;
        this.playerHeroPowerUsed = false;
        
        // 抽一张牌
        const newCard = this.createCardFromDatabase(
            Object.keys(this.cardDatabase)[
                Math.floor(Math.random() * Object.keys(this.cardDatabase).length)
            ]
        );
        this.addCardToHand(newCard, true);
        
        // 更新显示
        this.updateMana();
        
        // 启用结束回合按钮
        const endTurnButton = document.getElementById('end-turn');
        endTurnButton.disabled = false;
    }
    
    updateMana() {
        document.querySelector('.player-hero .hero-mana').textContent = 
            `${this.playerMana}/${this.playerMaxMana}`;
        document.querySelector('.opponent-hero .hero-mana').textContent = 
            `${this.opponentMana}/${this.opponentMaxMana}`;
    }
    
    updateHealth() {
        document.querySelector('.player-hero .hero-health').textContent = 
            Math.max(0, this.playerHealth);
        document.querySelector('.opponent-hero .hero-health').textContent = 
            Math.max(0, this.opponentHealth);
    }
    
    resetGame() {
        location.reload();
    }

    addAudio(id, src) {
        if (!document.getElementById(id)) {
            const audio = document.createElement('audio');
            audio.id = id;
            audio.src = src;
            audio.preload = 'auto';
            document.body.appendChild(audio);
        }
    }

    createTurnIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'turn-indicator';
        document.querySelector('.game-container').appendChild(indicator);
    }

    showTurnIndicator(isPlayerTurn) {
        const indicator = document.querySelector('.turn-indicator');
        indicator.textContent = isPlayerTurn ? '你的回合！' : '对手回合！';
        indicator.classList.remove('show');
        void indicator.offsetWidth; // 触发重绘
        indicator.classList.add('show');
    }

    updateManaDisplay(manaElement, current, max) {
        manaElement.innerHTML = '';
        for (let i = 0; i < max; i++) {
            const crystal = document.createElement('div');
            crystal.className = `mana-crystal ${i < current ? '' : 'empty'}`;
            manaElement.appendChild(crystal);
        }
    }

    endGame(playerWon) {
        // 禁用所有交互
        this.isPlayerTurn = false;
        document.getElementById('end-turn').disabled = true;
        
        // 显示游戏结束消息
        setTimeout(() => {
            alert(playerWon ? '恭喜你获胜！' : '游戏结束，对手获胜！');
            this.resetGame();
        }, 500);
    }

    async handleCardClick(card) {
        if (!this.isPlayerTurn) return;

        console.log('Card clicked:', card); // 调试日志

        // 如果点击的是玩家手牌
        if (this.playerHand.includes(card)) {
            if (card.cost <= this.playerMana) {
                this.playCard(card);
            }
            return;
        }

        // 如果点击的是玩家场上的随从
        if (this.playerField.includes(card)) {
            console.log('Player field card clicked, canAttack:', card.canAttack, 'hasAttacked:', card.hasAttacked); // 调试日志
            if (card.canAttack && !card.hasAttacked) {
                this.selectCard(card);
            }
            return;
        }

        // 如果点击的是对手场上的随从，且已经选中了我方随从
        if (this.opponentField.includes(card) && this.selectedCard) {
            console.log('Opponent field card clicked, selectedCard:', this.selectedCard); // 调试日志
            if (this.selectedCard.canAttack && !this.selectedCard.hasAttacked) {
                if (this.canAttackTarget(this.selectedCard, card)) {
                    this.attackWithCard(this.selectedCard, card);
                }
            }
        }
    }

    createVersionDisplay() {
        const versionDisplay = document.createElement('div');
        versionDisplay.className = 'version-display';
        versionDisplay.textContent = this.VERSION;
        document.querySelector('.game-container').appendChild(versionDisplay);
        
        // 添加版本号样式
        const style = document.createElement('style');
        style.textContent = `
            .version-display {
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 5px 10px;
                border-radius: 5px;
                font-size: 12px;
                z-index: 1000;
            }
        `;
        document.head.appendChild(style);
    }
}

// 启动游戏
const game = new Game();

// 添加到CSS样式
const style = document.createElement('style');
style.textContent = `
.game-container {
    position: relative;
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%);
    overflow: hidden;
}

.card {
    position: relative;
    width: 80px;
    height: 120px;
    background: white;
    border-radius: 5px;
    margin: 5px;
    transition: all 0.3s ease;
    cursor: pointer;
    user-select: none;
}

.card.selected {
    transform: scale(1.2) !important;
    box-shadow: 0 0 30px #f1c40f !important;
    z-index: 1000 !important;
}

.card.can-attack {
    box-shadow: 0 0 20px #4CAF50 !important;
    animation: attack-pulse 1.5s infinite !important;
    cursor: pointer !important;
    z-index: 10;
}

.valid-target {
    box-shadow: 0 0 25px #ffeb3b !important;
    animation: target-pulse 1.5s infinite !important;
    cursor: crosshair !important;
    z-index: 20 !important;
    transform: scale(1.1) !important;
}

.attack-arrow {
    position: fixed;
    height: 6px;
    background: linear-gradient(90deg, rgba(255,68,68,1) 0%, rgba(255,68,68,0.8) 100%);
    transform-origin: left center;
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 0 15px #ff4444;
    border-radius: 3px;
}

.attack-arrow-head {
    position: absolute;
    right: -12px;
    top: -8px;
    width: 0;
    height: 0;
    border-left: 16px solid #ff4444;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    filter: drop-shadow(0 0 5px #ff4444);
}

@keyframes attack-pulse {
    0% { box-shadow: 0 0 20px #4CAF50; }
    50% { box-shadow: 0 0 35px #4CAF50; }
    100% { box-shadow: 0 0 20px #4CAF50; }
}

@keyframes target-pulse {
    0% { box-shadow: 0 0 25px #ffeb3b; }
    50% { box-shadow: 0 0 40px #ffeb3b; }
    100% { box-shadow: 0 0 25px #ffeb3b; }
}

.hero-power {
    position: absolute !important;
    bottom: 50% !important;
    left: -50px !important;
    transform: translateY(50%) !important;
    background: linear-gradient(135deg, #f1c40f, #f39c12) !important;
    padding: 8px 16px !important;
    border-radius: 20px !important;
    color: white !important;
    font-size: 14px !important;
    cursor: pointer !important;
    transition: all 0.3s !important;
    box-shadow: 0 0 15px rgba(241,196,15,0.5) !important;
    z-index: 100 !important;
}

.hero-power:hover {
    transform: translateY(50%) scale(1.1) !important;
    box-shadow: 0 0 25px rgba(241,196,15,0.8) !important;
}

.hero {
    position: relative !important;
}
`;
document.head.appendChild(style);

// 添加新的CSS样式
const additionalStyle = document.createElement('style');
additionalStyle.textContent = `
.card.can-attack-hover {
    transform: scale(1.1) translateY(-10px);
    box-shadow: 0 0 25px #4CAF50;
    cursor: pointer;
    z-index: 100;
}

.card.damaged {
    animation: damage-shake 0.5s ease-in-out;
}

@keyframes damage-shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.card.can-attack {
    box-shadow: 0 0 20px #4CAF50;
    animation: attack-ready 1.5s infinite;
    cursor: pointer;
}

@keyframes attack-ready {
    0% { box-shadow: 0 0 20px #4CAF50; }
    50% { box-shadow: 0 0 35px #4CAF50; }
    100% { box-shadow: 0 0 20px #4CAF50; }
}

.card.selected {
    transform: scale(1.15);
    box-shadow: 0 0 30px #f1c40f;
    z-index: 1000;
}

.valid-target {
    box-shadow: 0 0 25px #ffeb3b !important;
    animation: target-pulse 1.5s infinite !important;
    cursor: crosshair !important;
    z-index: 20 !important;
    transform: scale(1.1) !important;
}
`;
document.head.appendChild(additionalStyle); 