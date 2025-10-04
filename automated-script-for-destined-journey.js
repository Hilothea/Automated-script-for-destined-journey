// ================================================================
// 命定之诗与黄昏之歌自动化脚本 - 自动合并版本
// 构建时间: 2025-10-04 20:43:26 UTC
// 包含模块: config.js utils.js experience-level.js currency-system.js info-injection.js event-chain-system.js Key_level.js lock_HS.js main-controller.js
// ================================================================

// ======================== [Module: config.js] ========================
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


// ======================== [Module: utils.js] ========================
(function() {
    'use strict';
    
    /**
     * 安全的浮点数解析函数
     * @param {*} value - 要解析的值
     * @returns {number} - 解析后的数值，如果解析失败则返回0
     */
    function safeParseFloat(value) {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }

    /**
     * 解除注入的提示信息
     * @param {Array<string>} idsToRemove - 要移除的ID数组
     */
    function uninject() {
        const idsToRemove = [
            'AP+',
            'Location',
            'Time',
            'LV+',
            'Key_level'
        ];
        uninjectPrompts(idsToRemove);
    }

    // 将工具函数暴露给全局范围
    window.safeParseFloat = safeParseFloat;
    window.uninject = uninject;
})();


// ======================== [Module: experience-level.js] ========================
(function() {
    'use strict';
    
    /**
     * 经验与等级处理模块
     * @param {Object} user - 用户对象
     */
    function experiencegrowth(user) {
        // 校准升级所需经验
        user.状态.升级所需经验 = window.JOB_LEVEL_XP_TABLE[user.状态.等级];
        
        const currentLevel = user.状态.等级;
        
        // 确保累计经验值不低于前一级的要求
        if (currentLevel > 0) {
            const requiredXpForPreviousLevel = window.JOB_LEVEL_XP_TABLE[currentLevel - 1];
            if (window.safeParseFloat(user.状态.累计经验值) < requiredXpForPreviousLevel) {
                user.状态.累计经验值 = requiredXpForPreviousLevel;
            }
        }
        
        let hasLeveledUp = false;
        
        // 升级处理循环
        while (window.safeParseFloat(user.状态.累计经验值) >= window.safeParseFloat(user.状态.升级所需经验)) {
            if (!window.JOB_LEVEL_XP_TABLE[user.状态.等级]) { 
                break; 
            }
            
            user.状态.等级 = window.safeParseFloat(user.状态.等级) + 1;
            hasLeveledUp = true;
            user.状态.升级所需经验 = window.JOB_LEVEL_XP_TABLE[user.状态.等级];
            
            // 检查是否获得属性点
            if (user.状态.等级 % window.GAME_CONFIG.AP_Acquisition_Level === 0) {
                user.属性.属性点 = window.safeParseFloat(user.属性.属性点) + 1;
                injectPrompts([{
                    id: 'AP+',
                    position: 'in_chat',
                    role: 'system',
                    depth: 0,
                    content: 'core_system: The {{user}} has reached a specific level and obtained attribute points. Guide the {{user}} to use attribute points',
                    should_scan: true
                }]);
            }
            
            // 检查里程碑等级
            const milestone = window.MILESTONE_LEVELS[user.状态.等级];
            if (milestone) {
                user.属性.力量 = window.safeParseFloat(user.属性.力量) + milestone.strength;
                user.属性.敏捷 = window.safeParseFloat(user.属性.敏捷) + milestone.agility;
                user.属性.体质 = window.safeParseFloat(user.属性.体质) + milestone.constitution;
                user.属性.智力 = window.safeParseFloat(user.属性.智力) + milestone.intelligence;
                user.属性.精神 = window.safeParseFloat(user.属性.精神) + milestone.spirit;
                user.状态.生命层级 = milestone.tier;
            }
        }
        
        // 如果升级了，注入升级提示
        if (hasLeveledUp) {
            injectPrompts([{
                id: 'LV+',
                position: 'in_chat',
                role: 'system',
                depth: 0,
                content: `core_system: The {{user}} level increased from ${currentLevel} to ${user.状态.等级}`,
                should_scan: true
            }]);
        }
    }

    // 将函数暴露给全局范围
    window.experiencegrowth = experiencegrowth;
})();


// ======================== [Module: currency-system.js] ========================
(function() {
    'use strict';
    
    /**
     * 货币系统模块 - 处理货币按需换算
     * @param {Object} property - 财产对象
     */
    function CurrencySystem(property) {
        let PP = window.safeParseFloat(property.货币.白金币); 
        let GP = window.safeParseFloat(property.货币.金币);   
        let SP = window.safeParseFloat(property.货币.银币);   
        let CP = window.safeParseFloat(property.货币.铜币);   
        
        // 按需换算函数
        function handleCurrencyExchange() {
            let deficit = 0;
            let currencyCleared = false;
            
            // PP购买处理：PP被扣成负时的换算逻辑
            if (PP < 0) {
                let ppDeficit = Math.abs(PP);
                
                // 优先用GP抵扣 (1PP = 100GP)
                if (GP >= ppDeficit * window.GAME_CONFIG.PP_TO_GP) {
                    GP -= ppDeficit * window.GAME_CONFIG.PP_TO_GP;
                    PP = 0;
                } else {
                    // GP不足，用完所有GP，剩余用SP换GP
                    let remainingDeficit = ppDeficit * window.GAME_CONFIG.PP_TO_GP - GP;
                    GP = 0;
                    
                    // 尝试用SP换GP (1GP = 10SP)
                    if (SP >= remainingDeficit * window.GAME_CONFIG.GP_TO_SP) {
                        SP -= remainingDeficit * window.GAME_CONFIG.GP_TO_SP;
                        PP = 0;
                    } else {
                        // SP不足，用完所有SP，剩余用CP换SP
                        remainingDeficit = remainingDeficit * window.GAME_CONFIG.GP_TO_SP - SP;
                        SP = 0;
                        
                        // 尝试用CP换SP (1SP = 10CP)
                        if (CP >= remainingDeficit * window.GAME_CONFIG.SP_TO_CP) {
                            CP -= remainingDeficit * window.GAME_CONFIG.SP_TO_CP;
                            PP = 0;
                        } else {
                            // 无法完全覆盖，清零PP、GP、SP，差值转换为CP并记录
                            deficit = remainingDeficit * window.GAME_CONFIG.SP_TO_CP - CP;
                            PP = GP = SP = 0;
                            CP = -deficit; // 负CP表示欠债
                            currencyCleared = true;
                        }
                    }
                }
            }
            
            // GP购买处理：GP被扣成负时的换算逻辑
            if (GP < 0 && !currencyCleared) {
                let gpDeficit = Math.abs(GP);
                
                // 优先用PP抵扣 (1PP = 100GP)
                if (PP >= Math.ceil(gpDeficit / window.GAME_CONFIG.PP_TO_GP)) {
                    let ppNeeded = Math.ceil(gpDeficit / window.GAME_CONFIG.PP_TO_GP);
                    PP -= ppNeeded;
                    GP = ppNeeded * window.GAME_CONFIG.PP_TO_GP - gpDeficit;
                } else {
                    // PP不足，用完所有PP，剩余用SP换GP
                    let remainingDeficit = gpDeficit - PP * window.GAME_CONFIG.PP_TO_GP;
                    PP = 0;
                    
                    // 尝试用SP换GP (1GP = 10SP)
                    if (SP >= remainingDeficit * window.GAME_CONFIG.GP_TO_SP) {
                        SP -= remainingDeficit * window.GAME_CONFIG.GP_TO_SP;
                        GP = 0;
                    } else {
                        // SP不足，用完所有SP，剩余用CP换SP
                        remainingDeficit = remainingDeficit * window.GAME_CONFIG.GP_TO_SP - SP;
                        SP = 0;
                        
                        // 尝试用CP换SP (1SP = 10CP)
                        if (CP >= remainingDeficit * window.GAME_CONFIG.SP_TO_CP) {
                            CP -= remainingDeficit * window.GAME_CONFIG.SP_TO_CP;
                            GP = 0;
                        } else {
                            // 无法完全覆盖，清零PP、GP、SP，差值转换为CP并记录
                            deficit = remainingDeficit * window.GAME_CONFIG.SP_TO_CP - CP;
                            PP = GP = SP = 0;
                            CP = -deficit; // 负CP表示欠债
                            currencyCleared = true;
                        }
                    }
                }
            }
            
            // SP购买处理：SP被扣成负时的换算逻辑
            if (SP < 0 && !currencyCleared) {
                let spDeficit = Math.abs(SP);
                
                // 优先用PP抵扣 (1PP = 1000SP)
                if (PP >= Math.ceil(spDeficit / (window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP))) {
                    let ppNeeded = Math.ceil(spDeficit / (window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP));
                    PP -= ppNeeded;
                    SP = ppNeeded * window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP - spDeficit;
                } else {
                    // PP不足，用完所有PP，剩余用GP换SP
                    let remainingDeficit = spDeficit - PP * window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP;
                    PP = 0;
                    
                    // 尝试用GP换SP (1GP = 10SP)
                    if (GP >= Math.ceil(remainingDeficit / window.GAME_CONFIG.GP_TO_SP)) {
                        let gpNeeded = Math.ceil(remainingDeficit / window.GAME_CONFIG.GP_TO_SP);
                        GP -= gpNeeded;
                        SP = gpNeeded * window.GAME_CONFIG.GP_TO_SP - remainingDeficit;
                    } else {
                        // GP不足，用完所有GP，剩余用CP换SP
                        remainingDeficit = remainingDeficit - GP * window.GAME_CONFIG.GP_TO_SP;
                        GP = 0;
                        
                        // 尝试用CP换SP (1SP = 10CP)
                        if (CP >= remainingDeficit * window.GAME_CONFIG.SP_TO_CP) {
                            CP -= remainingDeficit * window.GAME_CONFIG.SP_TO_CP;
                            SP = 0;
                        } else {
                            // 无法完全覆盖，清零PP、GP、SP，差值转换为CP并记录
                            deficit = remainingDeficit * window.GAME_CONFIG.SP_TO_CP - CP;
                            PP = GP = SP = 0;
                            CP = -deficit; // 负CP表示欠债
                            currencyCleared = true;
                        }
                    }
                }
            }
            
            // CP购买处理：CP被扣成负时的换算逻辑
            if (CP < 0 && !currencyCleared) {
                let cpDeficit = Math.abs(CP);
                
                // 优先用PP抵扣 (1PP = 10000CP)
                if (PP >= Math.ceil(cpDeficit / (window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP))) {
                    let ppNeeded = Math.ceil(cpDeficit / (window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP));
                    PP -= ppNeeded;
                    CP = ppNeeded * window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP - cpDeficit;
                } else {
                    // PP不足，用完所有PP，剩余用GP换CP
                    let remainingDeficit = cpDeficit - PP * window.GAME_CONFIG.PP_TO_GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP;
                    PP = 0;
                    
                    // 尝试用GP换CP (1GP = 100CP)
                    if (GP >= Math.ceil(remainingDeficit / (window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP))) {
                        let gpNeeded = Math.ceil(remainingDeficit / (window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP));
                        GP -= gpNeeded;
                        CP = gpNeeded * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP - remainingDeficit;
                    } else {
                        // GP不足，用完所有GP，剩余用SP换CP
                        remainingDeficit = remainingDeficit - GP * window.GAME_CONFIG.GP_TO_SP * window.GAME_CONFIG.SP_TO_CP;
                        GP = 0;
                        
                        // 尝试用SP换CP (1SP = 10CP)
                        if (SP >= Math.ceil(remainingDeficit / window.GAME_CONFIG.SP_TO_CP)) {
                            let spNeeded = Math.ceil(remainingDeficit / window.GAME_CONFIG.SP_TO_CP);
                            SP -= spNeeded;
                            CP = spNeeded * window.GAME_CONFIG.SP_TO_CP - remainingDeficit;
                        } else {
                            // 无法完全覆盖，清零PP、GP、SP，差值转换为CP并记录
                            deficit = remainingDeficit - SP * window.GAME_CONFIG.SP_TO_CP;
                            PP = GP = SP = 0;
                            CP = -deficit; // 负CP表示欠债
                            currencyCleared = true;
                        }
                    }
                }
            }
            
        }
        
        // 执行按需换算
        handleCurrencyExchange();
        
        // 更新货币值
        property.货币.白金币 = Math.max(0, Math.floor(PP));
        property.货币.金币 = Math.max(0, Math.floor(GP));
        property.货币.银币 = Math.max(0, Math.floor(SP));
        property.货币.铜币 = Math.floor(CP); // CP可以为负数，表示欠债
    }

    // 将函数暴露给全局范围
    window.CurrencySystem = CurrencySystem;
})();


// ======================== [Module: info-injection.js] ========================
(function() {
    'use strict';
    
    /**
     * 信息读取与注入模块
     * @param {Object} world - 世界对象
     */
    function inforead(world) {
        // 注入地点信息
        injectPrompts([{
            id: 'Location',
            content: world.地点,
            position: 'none',
            depth: 0,
            role: 'system',
            should_scan: true,
        }]);
        
        // 注入时间信息
        injectPrompts([{
            id: 'Time',
            content: world.时间,
            position: 'none',
            depth: 0,
            role: 'system',
            should_scan: true,
        }]);
    }

    // 将函数暴露给全局范围
    window.inforead = inforead;
})();


// ======================== [Module: event-chain-system.js] ========================
(function() {
    'use strict';
    
    /**
     * 事件链处理模块
     * @param {Object} eventchain - 事件链对象
     */
    function event_chain(eventchain) {
        uninjectPrompts(['event_chain_end']);
        injectPrompts([{
            id: 'event_chain_end',
            content: eventchain.已完成事件,
            position: 'none',
            depth: 0,
            role: 'system',
            should_scan: true,
        }]);
        if (eventchain.开启 === 'true') {
            eventchain.开启 = true;
        }
        if (eventchain.开启 === 'false') {
            eventchain.开启 = false;
        }
        if (eventchain.结束 === 'true') {
            eventchain.结束 = true;
        }
        if (eventchain.结束 === 'false') {
            eventchain.结束 = false;
        }
        if (eventchain.开启 === true) {
            // 清除之前的事件链注入
            uninjectPrompts(['event_chain']);
            uninjectPrompts(['event_chain_tips']);
            
            const title = eventchain.标题;
            const step = eventchain.阶段;
            
            // 注入当前事件链状态
            injectPrompts([{
                id: 'event_chain',
                content: `当前事件为${title}，当前步骤为${step}`,
                position: 'none',
                depth: 0,
                role: 'system',
                should_scan: true,
            }]);
            
            // 注入事件链激活提示
            injectPrompts([{
                id: 'event_chain_tips',
                content: `core_system:事件链已激活,注意<event_chain>`,
                position: 'in_chat',
                depth: 0,
                role: 'system',
                should_scan: true,
            }]);

            
            // 检查是否结束事件链
            if (eventchain.结束 === true) {
                uninjectPrompts(['event_chain']);
                uninjectPrompts(['event_chain_tips']);
                eventchain.标题 = 'null';
                eventchain.阶段 = 'null';
                eventchain.结束 = false;
                eventchain.开启 = false;
            }
        }
    }
    function event_chain_end(variables) {
        const eventchain = variables.stat_data?.事件链;
        uninjectPrompts(['event_chain']);
        uninjectPrompts(['event_chain_tips']);
        const title = eventchain.标题;
        eventchain.已完成事件.push(`已完成事件${title}`);
        eventchain.标题 = 'null';
        eventchain.阶段 = 'null';
        eventchain.结束 = false;
        eventchain.开启 = false;
    }
    // 将函数暴露给全局范围
    window.event_chain = event_chain;
    window.event_chain_end = event_chain_end;
})();


// ======================== [Module: Key_level.js] ========================
(function() {
    'use strict';
    function Key_level(user) {
        if(user.状态.等级 >= window.GAME_CONFIG.Key_level){
        injectPrompts([{
            id: 'Key_level',
            position: 'none',
            role: 'system',
            depth: 0,
            content: 'user_lv>=13',
            should_scan: true
        }]);
        }
    }
    window.Key_level = Key_level;
})();


// ======================== [Module: lock_HS.js] ========================
(function() {
    'use strict';
    
    function Lock_favorability(fatesystem) {
        if (!fatesystem.红线对象.希洛西娅 || 
            typeof fatesystem.红线对象.希洛西娅.好感度 === 'undefined') {
        } else {
            // 希洛西娅好感度存在，执行锁定逻辑
            let favorability_H = fatesystem.红线对象.希洛西娅.好感度;
            if (favorability_H >= 40) {
                favorability_H = 39;
                fatesystem.红线对象.希洛西娅.好感度 = favorability_H;
            }
        }
        if (!fatesystem.红线对象.希尔薇娅 || 
            typeof fatesystem.红线对象.希尔薇娅.好感度 === 'undefined') {
        } else {
            // 希尔薇娅好感度存在，执行锁定逻辑
            let favorability_S = fatesystem.红线对象.希尔薇娅.好感度;
            if (favorability_S >= 40) {
                favorability_S = 39;
                fatesystem.红线对象.希尔薇娅.好感度 = favorability_S;
            }
        }
    }

window.Lock_favorability = Lock_favorability;

})();


// ======================== [Module: main-controller.js] ========================
(function() {
    'use strict';
    
    /**
     * 主流程控制函数
     * @param {Object} variables - 包含所有游戏数据的变量对象
     */
    function Main_processes(variables) {
        // 获取变量
        const user = variables.stat_data?.角色; 
        const property = variables?.stat_data?.财产; 
        const world = variables?.stat_data?.世界; 
        const eventchain = variables.stat_data?.事件链;
        const fatesystem = variables.stat_data?.命运系统;
        
        if (!user || !property || !world || !eventchain || !fatesystem) {
            console.error("Core data missing, script terminated");
            return;
        }
        
        // 按照顺序执行模块
        window.Lock_favorability(fatesystem);
        window.uninject();                           // 1. 解除注入
        window.experiencegrowth(user);               // 2. 经验与等级处理
        window.CurrencySystem(property);             // 3. 货币换算
        window.inforead(world);                      // 4. 信息读取与注入
        window.event_chain(eventchain);              // 6. 事件链处理
        window.Key_level(user);                      //7.关键等级检测
    }

    // 将主函数暴露给全局范围
    window.Main_processes = Main_processes;

    // ============================ [事件监听] ============================
    // 监听变量更新完成事件
    eventOn('mag_variable_update_ended', Main_processes);
    
    // 监听按钮事件
    eventOnButton('重新处理变量', Main_processes);
    eventOnButton('退出当前事件链', window.event_chain_end);
})();


