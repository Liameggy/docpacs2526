/*:
 * @plugindesc Snake game plugin
 * @author Hayden.Frobenius
 *
 * @help This plugin adds snake game functionality to RPG Maker MV.
 */

Game_Player.prototype.canMove = () => false;
Game_Party.prototype.maxBattleMembers = () => 1000;
Game_Player.prototype.updateScroll = function () {
    // override default scroll behavior — camera stays put
};

Game_Party.prototype.addActor = function (actorId) {
    this._actors.push(actorId);
    $gamePlayer.refresh();
    $gameMap.requestRefresh();
    $gameTemp.requestBattleRefresh();
    if (this.inBattle()) {
        const actor = $gameActors.actor(actorId);
        if (this.battleMembers().includes(actor)) {
            actor.onBattleStart();
        }
    }
};

(() => {

    const scoreDiv = document.createElement("div");
    scoreDiv.style.position = "absolute";
    scoreDiv.style.top = "10px";
    scoreDiv.style.left = "10px";
    scoreDiv.style.color = "white";
    scoreDiv.style.fontSize = "24px";
    scoreDiv.style.zIndex = "1000";
    document.body.appendChild(scoreDiv);

    Scene_Map.prototype.start = function () {
        Scene_Base.prototype.start.call(this);

        $gameSystem.disableMenu();

        const moveIncrease = 5; // milliseconds decrease per apple
        const minMoveRate = 50; // minimum milliseconds between moves
        const wallGraceTime = 500; // milliseconds of grace period after wall collision

        let moveRate = 250; // milliseconds between moves
        let score = 0;

        updateScore(score);

        const appleId = 1;
        const apple = $gameMap.event(appleId);

        apple._priorityType = 1; // Same as characters
        apple._trigger = 1;      // Player Touch
        apple._through = false;  // Player must collide with it

        $gameParty.members().forEach(actor => {
            if (actor.actorId() !== $gameParty.leader().actorId()) {
                $gameParty.removeActor(actor.actorId());
            }
        });

        let nextDir = 0;

        Game_Player.prototype.moveByInput = function () {
            const dir = Input.dir4;
            let oppositeDir = 0;

            switch (this.direction()) {
                case 2: oppositeDir = 8; break;
                case 4: oppositeDir = 6; break;
                case 6: oppositeDir = 4; break;
                case 8: oppositeDir = 2; break;
            }

            if (dir > 0 && dir !== oppositeDir) nextDir = dir;
        };

        const moveLoop = setInterval(onMove, moveRate);

        apple.start = onAppleCollision
        setRandomApplePosition();

        function updateScore(newScore) {
            score = newScore;
            scoreDiv.textContent = `Score: ${score}`;
        }

        function onMove() {
            $gamePlayer.setDirection(nextDir);
            $gamePlayer.moveForward();

            for (let i = 0; i < $gameParty.members().length; i++) {
                const follower = $gamePlayer.followers().follower(i);
                if ($gamePlayer.x === follower.x && $gamePlayer.y === follower.y) {
                    gameOver();
                    return;
                }
            }
        }

        function setRandomApplePosition() {
            apple.setPosition(Math.floor(Math.random() * $gameMap.width()), Math.floor(Math.random() * $gameMap.height()));
        }

        function onAppleCollision() {
            setRandomApplePosition();
            updateScore(score + 1);
            $gameParty.addActor(1); // Add a new segment to the snake
        }

        function gameOver() {
            clearInterval(moveLoop);
            SceneManager.push(Scene_Gameover);
        }

    };
})();