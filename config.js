(function() {
    'use strict';
    
    // 里程碑等级配置
    const MILESTONE_LEVELS = {
        5: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第二层级/中坚' },
        9: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第三层级/精英' },
        13: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第四层级/史诗' },
        17: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第五层级/传说' },
        21: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第六层级/神话' },
        25: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第七层级/登神' }
    };
    
    // 职业等级经验表
    const JOB_LEVEL_XP_TABLE = {
        0: 0, 1: 15, 2: 55, 3: 130, 4: 290, 5: 640, 6: 1120, 7: 1750, 8: 2710, 9: 3385,
        10: 4225, 11: 5215, 12: 6475, 13: 7515, 14: 8747, 15: 10187, 16: 11979, 17: 12574, 18: 13294, 19: 14149,
        20: 15349, 21: 15601, 22: 15865, 23: 16279, 24: 17500, 25: 1145141919810
    };

    // 核心游戏配置
    const GAME_CONFIG = {
        PP_TO_GP: 10,              // 铂到金
        GP_TO_SP: 10,               // 金到银
        SP_TO_CP: 10,               // 银到铜
        AP_Acquisition_Level: 1,    // 每X级获得属性点
        Key_level: 13               //关键等级13
    };

    // 将配置暴露给全局范围
    window.MILESTONE_LEVELS = MILESTONE_LEVELS;
    window.JOB_LEVEL_XP_TABLE = JOB_LEVEL_XP_TABLE;
    window.GAME_CONFIG = GAME_CONFIG;
})();
