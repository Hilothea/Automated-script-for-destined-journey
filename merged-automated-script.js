// ======================== [配置模块] ========================
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
        0: 0, 1: 104, 2: 320, 3: 656, 4: 1120, 5: 1720, 6: 2464, 7: 3360, 8: 4416, 9: 5640,
        10: 7040, 11: 8624, 12: 10400, 13: 12376, 14: 14560, 15: 16960, 16: 19584, 17: 22440, 18: 25536, 19: 28880,
        20: 32480, 21: 38276, 22: 44480, 23: 51104, 24: 58160, 25: 65660, 26: 1145141919810
    };

    // 核心游戏配置
    const GAME_CONFIG = {
        PP_TO_CP: 10000,            // 铂到铜
        GP_TO_CP: 100,              // 金到铜
        SP_TO_CP: 10,               // 银到铜
        AP_Acquisition_Level: 1,    // 每X级获得属性点
    };

    // 将配置暴露给全局范围
    window.MILESTONE_LEVELS = MILESTONE_LEVELS;
    window.JOB_LEVEL_XP_TABLE = JOB_LEVEL_XP_TABLE;
    window.GAME_CONFIG = GAME_CONFIG;
})();

// ======================== [工具函数模块] ========================
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
            'property_error',
            'Location',
            'Time',
            'LV+'
        ];
        uninjectPrompts(idsToRemove);
    }

    // 将工具函数暴露给全局范围
    window.safeParseFloat = safeParseFloat;
    window.uninject = uninject;
})();

// ======================== [经验等级处理模块] ========================
(function() {
    'use strict';
    
    /**
     * 经验与等级处理模块
     * @param {Object} user - 用户对象
     */
    function experiencegrowth(user) {
        // 校准升级所需经验
        user.状态.升级所需经验[0] = window.JOB_LEVEL_XP_TABLE[user.状态.等级[0]];
        
        const currentLevel = user.状态.等级[0];
        
        // 确保累计经验值不低于前一级的要求
        if (currentLevel > 0) {
            const requiredXpForPreviousLevel = window.JOB_LEVEL_XP_TABLE[currentLevel - 1];
            if (window.safeParseFloat(user.状态.累计经验值[0]) < requiredXpForPreviousLevel) {
                user.状态.累计经验值[0] = requiredXpForPreviousLevel;
            }
        }
        
        let hasLeveledUp = false;
        
        // 升级处理循环
        while (window.safeParseFloat(user.状态.累计经验值[0]) >= window.safeParseFloat(user.状态.升级所需经验[0])) {
            if (!window.JOB_LEVEL_XP_TABLE[user.状态.等级[0]]) { 
                break; 
            }
            
            user.状态.等级[0] = window.safeParseFloat(user.状态.等级[0]) + 1;
            hasLeveledUp = true;
            user.状态.升级所需经验[0] = window.JOB_LEVEL_XP_TABLE[user.状态.等级[0]];
            
            // 检查是否获得属性点
            if (user.状态.等级[0] % window.GAME_CONFIG.AP_Acquisition_Level === 0) {
                user.属性.属性点[0] = window.safeParseFloat(user.属性.属性点[0]) + 1;
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
            const milestone = window.MILESTONE_LEVELS[user.状态.等级[0]];
            if (milestone) {
                user.属性.力量[0] = window.safeParseFloat(user.属性.力量[0]) + milestone.strength;
                user.属性.敏捷[0] = window.safeParseFloat(user.属性.敏捷[0]) + milestone.agility;
                user.属性.体质[0] = window.safeParseFloat(user.属性.体质[0]) + milestone.constitution;
                user.属性.智力[0] = window.safeParseFloat(user.属性.智力[0]) + milestone.intelligence;
                user.属性.精神[0] = window.safeParseFloat(user.属性.精神[0]) + milestone.spirit;
                user.状态.战力层级[0] = milestone.tier;
            }
        }
        
        // 如果升级了，注入升级提示
        if (hasLeveledUp) {
            injectPrompts([{
                id: 'LV+',
                position: 'in_chat',
                role: 'system',
                depth: 0,
                content: `core_system: The {{user}} level increased from ${currentLevel} to ${user.状态.等级[0]}`,
                should_scan: true
            }]);
        }
    }

    // 将函数暴露给全局范围
    window.experiencegrowth = experiencegrowth;
})();

// ======================== [货币系统模块] ========================
(function() {
    'use strict';
    
    /**
     * 货币系统模块 - 处理货币换算
     * @param {Object} property - 财产对象
     */
    function CurrencySystem(property) {
        let PP = window.safeParseFloat(property.货币.白金币[0]); 
        let GP = window.safeParseFloat(property.货币.金币[0]);   
        let SP = window.safeParseFloat(property.货币.银币[0]);   
        let CP = window.safeParseFloat(property.货币.铜币[0]);   
        
        // 计算总铜币数
        let totalCopper = PP * window.GAME_CONFIG.PP_TO_CP + GP * window.GAME_CONFIG.GP_TO_CP + SP * window.GAME_CONFIG.SP_TO_CP + CP;
        
        // 处理负数情况
        if (totalCopper < 0) {
            totalCopper = 0;
            alert('牢希提醒您,您破产拉!'); 
            injectPrompts([{
                id: 'property_error',
                content: `core_system:warning {{user}}Currency variable abnormal, now reset to zero`,
                position: 'in_chat',
                depth: 0,
                role: 'system',
                should_scan: true,
            }]);
        }
        
        // 将总铜币转换为各种货币
        PP = Math.floor(totalCopper / window.GAME_CONFIG.PP_TO_CP);
        totalCopper = totalCopper % window.GAME_CONFIG.PP_TO_CP;
        
        GP = Math.floor(totalCopper / window.GAME_CONFIG.GP_TO_CP);
        totalCopper = totalCopper % window.GAME_CONFIG.GP_TO_CP;
        
        SP = Math.floor(totalCopper / window.GAME_CONFIG.SP_TO_CP);
        CP = Math.floor(totalCopper % window.GAME_CONFIG.SP_TO_CP);
        
        // 更新货币值
        property.货币.白金币[0] = PP;
        property.货币.金币[0] = GP;
        property.货币.银币[0] = SP;
        property.货币.铜币[0] = CP;
    }

    // 将函数暴露给全局范围
    window.CurrencySystem = CurrencySystem;
})();

// ======================== [信息注入模块] ========================
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
            content: world.地点[0],
            position: 'none',
            depth: 0,
            role: 'system',
            should_scan: true,
        }]);
        
        // 注入时间信息
        injectPrompts([{
            id: 'Time',
            content: world.时间[0],
            position: 'none',
            depth: 0,
            role: 'system',
            should_scan: true,
        }]);
    }

    // 将函数暴露给全局范围
    window.inforead = inforead;
})();

// ======================== [事件链系统模块] ========================
(function() {
    'use strict';
    
    /**
     * 事件链处理模块
     * @param {Object} eventchain - 事件链对象
     */
    function event_chain(eventchain) {
        if (eventchain.开启[0] === 'true') {
            // 清除之前的事件链注入
            uninjectPrompts(['event_chain']);
            uninjectPrompts(['event_chain_tips']);
            
            const title = eventchain.标题[0];
            const step = eventchain.大狗叫[0];
            
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
                content: `core_system:事件链${title}已激活,注意<event_chain>`,
                position: 'in_chat',
                depth: 0,
                role: 'system',
                should_scan: true,
            }]);
            
            // 检查是否结束事件链
            if (eventchain.结束[0] === 'true') {
                uninjectPrompts(['event_chain']);
                uninjectPrompts(['event_chain_tips']);
                eventchain.标题[0] = 'null';
                eventchain.大狗叫[0] = 'null';
                eventchain.开启[0] = 'false';
                eventchain.结束[0] = 'false';
            }
        }
    }
    // 将函数暴露给全局范围
    window.event_chain = event_chain;
})();

// ======================== [主流程控制模块] ========================
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
        
        if (!user || !property || !world || !eventchain) {
            console.error("Core data missing, script terminated");
            return;
        }
        
        // 按照顺序执行模块
        window.uninject();                           // 1. 解除注入
        window.experiencegrowth(user);               // 2. 经验与等级处理
        window.CurrencySystem(property);                 // 3. 货币换算
        window.inforead(world);                      // 4. 信息读取与注入
        window.event_chain(eventchain);              // 6. 事件链处理
    }

    // 将主函数暴露给全局范围
    window.Main_processes = Main_processes;

    // ============================ [事件监听] ============================
    // 监听变量更新完成事件
    eventOn('mag_variable_update_ended', Main_processes);
    
    // 监听按钮事件
    eventOnButton('重新处理变量', Main_processes);
})();