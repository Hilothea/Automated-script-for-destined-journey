(function() {
    'use strict';
    
    // 里程碑等级配置
    const MILESTONE_LEVELS = {
        5: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第二层级/中坚' },
        9: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第三层级/精英' },
        13: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第四层级/史诗' },
        17: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第五层级/传说' },
        21: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第六层级/神话' },
        25: { strength: 1, agility: 1, constitution: 1, intelligence: 1, spirit: 1, tier: '第七层级/神祗' }
    };
    
    // 职业等级经验表
    const JOB_LEVEL_XP_TABLE = {
        0: 0, 1: 1276, 2: 5052, 3: 11623, 4: 21299, 5: 34395, 6: 51228, 7: 72116, 8: 97377, 9: 127331,
        10: 162306, 11: 202642, 12: 248680, 13: 300761, 14: 359228, 15: 424423, 16: 496690, 17: 576373, 18: 663816, 19: 759362,
        20: 863357, 21: 1004144, 22: 1332608, 23: 4427488, 24: 6666666, 25: 1145141919810
    };

    // 核心游戏配置
    const GAME_CONFIG = {
        PP_TO_GP: 100,              // 铂到金
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
