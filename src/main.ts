import { system, world, TicksPerSecond, EntityHealthComponent, Player, Entity } from "@minecraft/server";

// レベルがあがった分だけ強くなっていく
system.runInterval(() => {
    const players = world.getAllPlayers();
    for (const player of players) {
        const level = player.level;
        if (level < 1) continue;

        // LVに応じてハートを増やす
        player.addEffect("health_boost", 999 * TicksPerSecond, { amplifier: (level - 1) / 2, showParticles: false });

        // LV5ずつ攻撃力と防御力を増やす
        if (level >= 20) {
            player.addEffect("strength", 999 * TicksPerSecond, { amplifier: 3, showParticles: false });
            player.addEffect("resistance", 999 * TicksPerSecond, { amplifier: 3, showParticles: false });    
        } else if (level >= 15) {
            player.addEffect("strength", 999 * TicksPerSecond, { amplifier: 2, showParticles: false });
            player.addEffect("resistance", 999 * TicksPerSecond, { amplifier: 2, showParticles: false });    
        } else if (level >= 10) {
            player.addEffect("strength", 999 * TicksPerSecond, { amplifier: 1, showParticles: false });
            player.addEffect("resistance", 999 * TicksPerSecond, { amplifier: 1, showParticles: false });    
        } else if (level >= 5) {
            player.addEffect("strength", 999 * TicksPerSecond, { amplifier: 0, showParticles: false });
            player.addEffect("resistance", 999 * TicksPerSecond, { amplifier: 0, showParticles: false });    
        }

        // LVに応じてステータス効果を増やす
        if (level >= 20) {
            player.addEffect("night_vision", 999 * TicksPerSecond, { showParticles: false }); // 暗視効果
        }
        if (level >= 25) {
            player.addEffect("fire_resistance", 999 * TicksPerSecond, { showParticles: false }); // 耐火効果
        }
        if (level >= 30) {
            player.addEffect("water_breathing", 999 * TicksPerSecond, { showParticles: false }); // 水中呼吸
        }
    }
}, TicksPerSecond / 5);

// エンティティが死んだとき
world.afterEvents.entityDie.subscribe(event => {
    // debug メッセージ
//    world.sendMessage(event.deadEntity.typeId + " was killed.");

    // プレーヤーがモブを殺したのなら
    if (event.damageSource.damagingEntity === undefined ||
        event.damageSource.damagingEntity.typeId !== "minecraft:player") {
        return;
    }
    if (event.deadEntity.typeId === "minecraft:player") {
        return;
    }

    // 10秒再生効果
    const player = event.damageSource.damagingEntity;
    player.addEffect("regeneration", 10 * TicksPerSecond, { showParticles: false });
});

// プレーヤーがスポーンしたとき
world.afterEvents.playerSpawn.subscribe(event => {
    if (event.initialSpawn) {
        // 死亡時にアイテムと経験値を保持する
        event.player.runCommandAsync("gamerule keepInventory true");
    } else {
        const healthComponent = event.player.getComponent(EntityHealthComponent.componentId) as EntityHealthComponent;
        // 死んでリスポーンしたときには、ブースト分も体力を回復する
        system.runTimeout(() => healthComponent.resetToMaxValue(), TicksPerSecond / 4);
    }
});